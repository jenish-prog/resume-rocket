import { useState } from "react";
import { Send, Loader2, Mail, Building2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConfirmDialog from "./ConfirmDialog";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ResumeSenderForm = () => {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const sendEmail = async (skipInsert: boolean) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-resume", {
        body: { email, company },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (!skipInsert) {
        const { error: insertError } = await supabase
          .from("sent_emails")
          .insert({ email, company });
        if (insertError) throw insertError;
      }

      toast({
        title: "✅ Resume Sent!",
        description: `Your resume was sent to ${company} (${email}).`,
      });
      setEmail("");
      setCompany("");
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !company.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("sent_emails")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        setLoading(false);
        setShowConfirm(true);
        return;
      }

      await sendEmail(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md shadow-card hover:shadow-card-hover transition-shadow duration-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Resume Auto Sender
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Send your resume to any company in one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Recruiter Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {loading ? "Sending..." : "Send Resume"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          sendEmail(true);
        }}
        email={email}
      />
    </>
  );
};

export default ResumeSenderForm;
