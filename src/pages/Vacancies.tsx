import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Users, Search, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import VacancyDetailDialog from '@/components/VacancyDetailDialog';

interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary_range?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  active: boolean;
  created_at: string;
}

const Vacancies = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [filteredVacancies, setFilteredVacancies] = useState<Vacancy[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchVacancies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vacancies, departmentFilter, locationFilter, searchTerm]);

  const fetchVacancies = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('vacancies' as any)
        .select('*')
        .eq('active', true);

      if (error) {
        console.error('Error fetching vacancies:', error);
        return;
      }

      if (data) {
        const mapped = (data as any[]).map((d) => ({
          id: d.id,
          title: d.title,
          department: d.department ?? 'General',
          location: d.location ?? (d.remote ? 'Remote' : 'On-site'),
          type: d.employment_type,
          salary_range:
            d.salary_min != null || d.salary_max != null
              ? `${d.salary_currency || 'GBP'} ${d.salary_min ?? ''}${d.salary_min && d.salary_max ? ' - ' : ''}${d.salary_max ?? ''}`
              : undefined,
          description: d.description ?? '',
          requirements: Array.isArray(d.requirements) ? d.requirements : [],
          responsibilities: [],
          active: d.active,
          created_at: d.created_at,
        }));
        setVacancies(mapped);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...vacancies];

    if (departmentFilter !== 'All') {
      filtered = filtered.filter(vacancy => vacancy.department === departmentFilter);
    }

    if (locationFilter !== 'All') {
      filtered = filtered.filter(vacancy => vacancy.location === locationFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(vacancy =>
        vacancy.title.toLowerCase().includes(lowerSearchTerm) ||
        vacancy.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    setFilteredVacancies(filtered);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
  };

  const uniqueDepartments = ['All', ...Array.from(new Set(vacancies.map(v => v.department)))];
  const uniqueLocations = ['All', ...Array.from(new Set(vacancies.map(v => v.location)))];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Careers & Vacancies | X-Ample Development"
        description="Join our team! Explore current job openings and career opportunities at X-Ample Development."
        keywords="jobs, careers, vacancies, X-Ample Development, hiring"
        url="https://x-ampledevelopment.co.uk/vacancies"
        type="website"
      />
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-cyan-50 to-teal-50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Join Our <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Team</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Explore exciting career opportunities at X-Ample Development.
                We are always looking for talented individuals to join our team.
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search job title or keywords..."
                  className="w-full md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <Select onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDepartments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Vacancies Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {filteredVacancies.length > 0 ? (
                filteredVacancies.map((vacancy) => (
                  <Card key={vacancy.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-cyan-600" /> {vacancy.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {vacancy.description.substring(0, 100)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary"><MapPin className="w-3 h-3 mr-1" /> {vacancy.location}</Badge>
                        <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> {vacancy.type}</Badge>
                        <Badge variant="secondary"><Users className="w-3 h-3 mr-1" /> {vacancy.department}</Badge>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                        onClick={() => {
                          setSelectedVacancy(vacancy);
                          setDialogOpen(true);
                        }}
                      >
                        Learn More & Apply
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center col-span-full">
                  <p className="text-gray-600">No vacancies match your criteria. Please try again with different filters.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <VacancyDetailDialog
        vacancy={selectedVacancy}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Footer />
    </div>
  );
};

export default Vacancies;
