import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Download, Loader2, Users, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Contact {
  id: string;
  company_name: string;
  hr_email: string;
  created_at: string;
  updated_at: string;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (err: any) {
      toast({ title: "Error loading contacts", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingContact(null);
    setCompanyName("");
    setHrEmail("");
    setDialogOpen(true);
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setCompanyName(contact.company_name);
    setHrEmail(contact.hr_email);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!companyName.trim() || !hrEmail.trim()) {
      toast({ title: "Missing fields", description: "Both fields are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingContact) {
        const { error } = await supabase
          .from("contacts")
          .update({ company_name: companyName, hr_email: hrEmail, updated_at: new Date().toISOString() })
          .eq("id", editingContact.id);
        if (error) throw error;
        toast({ title: "✅ Updated!" });
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert({ company_name: companyName, hr_email: hrEmail });
        if (error) throw error;
        toast({ title: "✅ Contact added!" });
      }
      setDialogOpen(false);
      fetchContacts();
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "✅ Deleted!" });
      fetchContacts();
    } catch (err: any) {
      toast({ title: "Error deleting", description: err.message, variant: "destructive" });
    }
  };

  const exportCSV = () => {
    if (!contacts.length) return;
    const header = "Company Name,HR Email,Added On\n";
    const rows = contacts.map(c => `"${c.company_name}","${c.hr_email}","${new Date(c.created_at).toLocaleDateString()}"`).join("\n");
    downloadFile(header + rows, "contacts.csv", "text/csv");
  };

  const exportJSON = () => {
    if (!contacts.length) return;
    const data = contacts.map(c => ({ company_name: c.company_name, hr_email: c.hr_email, added_on: c.created_at }));
    downloadFile(JSON.stringify(data, null, 2), "contacts.json", "application/json");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="w-full max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Sender
        </Link>

        <Card className="shadow-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Contacts</CardTitle>
            <CardDescription>Manage your company & HR email contacts</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="mr-1 h-4 w-4" /> Add Contact
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" disabled={!contacts.length}>
                    <Download className="mr-1 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportJSON}>Export as JSON</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No contacts yet. Add your first one!</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>HR Email</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.company_name}</TableCell>
                        <TableCell>{c.hr_email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEditDialog(c)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>HR Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} placeholder="hr@company.com" className="pl-10" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingContact ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Contacts;
