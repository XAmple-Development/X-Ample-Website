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
import AdminVacanciesPanel from "@/components/AdminVacanciesPanel";

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

  if (loading || (user && !profile)) {
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

        <AdminVacanciesPanel />
      </div>
    </div>
  );
};

export default AdminVacancies;
