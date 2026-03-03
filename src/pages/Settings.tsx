import { useState, useEffect, useRef } from "react";
import { Save, Upload, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Settings = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [resumeName, setResumeName] = useState("resume.pdf");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from("email_template")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTemplateId(data.id);
        setSubject(data.subject);
        setMessage(data.message);
        setResumeName(data.resume_filename || "resume.pdf");
      }
    } catch (err: any) {
      toast({ title: "Error loading template", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Missing fields", description: "Subject and message are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (templateId) {
        const { error } = await supabase
          .from("email_template")
          .update({ subject, message, resume_filename: resumeName, updated_at: new Date().toISOString() })
          .eq("id", templateId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("email_template")
          .insert({ subject, message, resume_filename: resumeName })
          .select()
          .single();
        if (error) throw error;
        setTemplateId(data.id);
      }

      toast({ title: "✅ Saved!", description: "Your email template has been updated." });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Resume must be under 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const filename = `resume_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filename, file, { upsert: true });

      if (uploadError) throw uploadError;

      setResumeName(filename);

      // Auto-save the filename
      if (templateId) {
        await supabase
          .from("email_template")
          .update({ resume_filename: filename, updated_at: new Date().toISOString() })
          .eq("id", templateId);
      }

      toast({ title: "✅ Resume uploaded!", description: file.name });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Sender
        </Link>

        <Card className="shadow-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Email Settings</CardTitle>
            <CardDescription>Customize your resume, subject & message</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Resume Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resume (PDF)</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm truncate">
                  {resumeName}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">Email Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Application for Internship"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">Email Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                placeholder="Dear HR,..."
                className="resize-y"
              />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
