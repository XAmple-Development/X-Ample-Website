import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AdminHeader from "@/components/AdminHeader";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";

interface VacancyForm {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  remote: boolean;
  salary_min?: string;
  salary_max?: string;
  salary_currency: string;
  description: string;
  requirements?: string; // comma separated
  application_url?: string;
  application_email?: string;
  active: boolean;
}

interface VacancyRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  active: boolean;
  created_at: string;
}

const AdminVacancies = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<VacancyRow[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const [form, setForm] = useState<VacancyForm>({
    title: "",
    department: "",
    location: "",
    employment_type: "full-time",
    remote: true,
    salary_min: "",
    salary_max: "",
    salary_currency: "GBP",
    description: "",
    requirements: "",
    application_url: "",
    application_email: "",
    active: true,
  });

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await (supabase as any)
        .from("vacancies")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setItems((data as unknown) as VacancyRow[]);
    };
    fetchAll();
  }, []);

  const visible = useMemo(() => {
    return items.filter((v) => (filter === "all" ? true : filter === "active" ? v.active : !v.active));
  }, [items, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile || profile.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return toast({ title: "Title required", description: "Please enter a job title." });
    if (!form.application_email && !form.application_url)
      return toast({ title: "Add an application method", description: "Provide email or application URL." });

    setSubmitting(true);
    const payload: any = {
      title: form.title,
      department: form.department || null,
      location: form.location || null,
      employment_type: form.employment_type,
      remote: form.remote,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      salary_currency: form.salary_currency || "GBP",
      description: form.description || null,
      requirements: form.requirements ? form.requirements.split(",").map((s) => s.trim()).filter(Boolean) : null,
      application_url: form.application_url || null,
      application_email: form.application_email || null,
      active: form.active,
    };

    const { error } = await (supabase as any).from("vacancies").insert(payload);
    if (error) {
      toast({ title: "Failed to create vacancy", description: error.message });
    } else {
      toast({ title: "Vacancy created", description: `${form.title} has been posted.` });
      setForm({
        title: "",
        department: "",
        location: "",
        employment_type: "full-time",
        remote: true,
        salary_min: "",
        salary_max: "",
        salary_currency: "GBP",
        description: "",
        requirements: "",
        application_url: "",
        application_email: "",
        active: true,
      });
      const { data } = await (supabase as any).from("vacancies").select("*").order("created_at", { ascending: false });
      if (data) setItems((data as unknown) as VacancyRow[]);
    }
    setSubmitting(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await (supabase as any).from("vacancies").update({ active: !current }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message });
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, active: !current } : it)));
    toast({ title: "Status updated", description: `Vacancy ${!current ? "activated" : "paused"}.` });
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("vacancies").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message });
    setItems((prev) => prev.filter((it) => it.id !== id));
    toast({ title: "Vacancy deleted" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <SEO
        title="Manage Vacancies | X-Ample Development"
        description="Admin panel to create and manage job vacancies."
        keywords="admin vacancies, manage jobs, X-Ample Development"
        url="https://x-ampledevelopment.co.uk/admin/vacancies"
        type="website"
      />
      <div className="max-w-7xl mx-auto">
        <AdminHeader onSignOut={signOut} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="lg:col-span-1 bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Create Vacancy</CardTitle>
              <CardDescription>Publish a new role to the careers page.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Remote, London" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select value={form.employment_type} onValueChange={(val) => setForm((f) => ({ ...f, employment_type: val }))}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <Label htmlFor="remote">Remote</Label>
                      <p className="text-xs text-muted-foreground">Enable if the role can be fully remote.</p>
                    </div>
                    <Switch id="remote" checked={form.remote} onCheckedChange={(val) => setForm((f) => ({ ...f, remote: val }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary_min">Salary Min</Label>
                    <Input id="salary_min" type="number" value={form.salary_min} onChange={(e) => setForm((f) => ({ ...f, salary_min: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_max">Salary Max</Label>
                    <Input id="salary_max" type="number" value={form.salary_max} onChange={(e) => setForm((f) => ({ ...f, salary_max: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" value={form.salary_currency} onChange={(e) => setForm((f) => ({ ...f, salary_currency: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={5} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (comma separated)</Label>
                  <Input id="requirements" value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application_url">Application URL</Label>
                    <Input id="application_url" value={form.application_url} onChange={(e) => setForm((f) => ({ ...f, application_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application_email">Application Email</Label>
                    <Input id="application_email" value={form.application_email} onChange={(e) => setForm((f) => ({ ...f, application_email: e.target.value }))} placeholder="hr@company.com" />
                  </div>
                </div>
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <Label htmlFor="active">Active</Label>
                    <p className="text-xs text-muted-foreground">Inactive roles are hidden from public.</p>
                  </div>
                  <Switch id="active" checked={form.active} onCheckedChange={(val) => setForm((f) => ({ ...f, active: val }))} />
                </div>
                <Button disabled={submitting} className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  {submitting ? "Publishing..." : "Publish Vacancy"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle>Vacancies</CardTitle>
                <CardDescription>All roles including inactive ones.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{v.employment_type}</TableCell>
                        <TableCell className="hidden md:table-cell">{v.location ?? (v.remote ? "Remote" : "-")}</TableCell>
                        <TableCell>
                          {v.active ? (
                            <span className="inline-flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Active</span>
                          ) : (
                            <span className="inline-flex items-center text-gray-500 text-sm"><XCircle className="w-4 h-4 mr-1" /> Inactive</span>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => toggleActive(v.id, v.active)}>
                            {v.active ? "Pause" : "Activate"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => remove(v.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminVacancies;
