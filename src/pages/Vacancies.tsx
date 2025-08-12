import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Globe2, Mail, ExternalLink, Filter } from "lucide-react";

interface Vacancy {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string | null;
  requirements: string[] | null;
  application_url: string | null;
  application_email: string | null;
  active: boolean;
  created_at: string;
}

const Vacancies = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");
  const [remote, setRemote] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("vacancies")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (!error && data) setVacancies((data as unknown) as Vacancy[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return vacancies.filter((v) => {
      const matchesQ = q
        ? [v.title, v.department ?? "", v.location ?? "", v.description ?? ""].some((s) => s.toLowerCase().includes(q.toLowerCase()))
        : true;
      const matchesType = type === "all" ? true : v.employment_type === type;
      const matchesRemote = remote === "all" ? true : remote === "remote" ? v.remote : !v.remote;
      return matchesQ && matchesType && matchesRemote;
    });
  }, [vacancies, q, type, remote]);

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "Salary: Competitive";
    const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max as number)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Vacancies | X-Ample Development"
        description="Open roles at X-Ample Development. Join our team working on Discord, web, and game projects."
        keywords="jobs, careers, vacancies, hiring, X-Ample Development"
        url="https://x-ampledevelopment.co.uk/vacancies"
        type="website"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="pt-24 pb-10 bg-gradient-to-br from-cyan-50 to-teal-50">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Careers at X-Ample</h1>
            <p className="text-lg text-gray-600">We’re building great experiences across Discord, web, and gaming. Explore current openings.</p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:flex-1">
                <Input
                  placeholder="Search by title, department, location..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search vacancies"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Type</span>
                </div>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
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
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm text-gray-600">Work</span>
                </div>
                <Select value={remote} onValueChange={setRemote}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Onsite & Remote</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* List */}
        <section className="py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            {loading ? (
              <p className="text-gray-600">Loading vacancies...</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-600">No vacancies available at the moment. Please check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filtered.map((v) => (
                  <Card key={v.id} className="border-0 bg-white hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-2xl text-gray-900">{v.title}</CardTitle>
                          <CardDescription className="text-gray-600">
                            {v.department ? `${v.department} · ` : ""}
                            {v.location ? (
                              <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {v.location}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1"><Globe2 className="w-4 h-4" /> Global</span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-gray-800">
                          <Briefcase className="w-3.5 h-3.5 mr-1" /> {v.employment_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-700 mb-3 line-clamp-3">{v.description ?? ""}</p>
                      <div className="text-sm text-gray-600 mb-4">{formatSalary(v.salary_min, v.salary_max, v.salary_currency)}</div>

                      <div className="flex flex-wrap gap-3">
                        {v.application_url && (
                          <Button
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                            onClick={() => window.open(v.application_url as string, "_blank")}
                            aria-label={`Apply online for ${v.title}`}
                          >
                            Apply Online <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                        {v.application_email && (
                          <Button
                            variant="outline"
                            className="border-gray-300 text-gray-800 hover:bg-gray-50"
                            onClick={() => window.location.assign(`mailto:${v.application_email}`)}
                            aria-label={`Email to apply for ${v.title}`}
                          >
                            Email HR <Mail className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Vacancies;
