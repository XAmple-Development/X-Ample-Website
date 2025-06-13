
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import { useState } from "react";

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  
  const categories = ["All", "FiveM", "Roblox", "Web", "Discord"];
  
  const projects = [
    {
      title: "Advanced FiveM Roleplay Server",
      description: "Complete roleplay server with custom scripts, realistic economy, and immersive features including custom vehicles, housing system, and job frameworks.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop",
      tags: ["FiveM", "Lua", "MySQL", "Roleplay"],
      category: "FiveM",
      featured: true
    },
    {
      title: "Roblox Adventure MMO",
      description: "Multiplayer adventure game with custom mechanics, quest systems, and monetization featuring over 100 unique items and skills.",
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=400&fit=crop",
      tags: ["Roblox", "Lua", "Game Design", "Multiplayer"],
      category: "Roblox",
      featured: false
    },
    {
      title: "E-commerce Platform",
      description: "Full-stack e-commerce solution with payment integration, inventory management, and comprehensive admin panel built with modern technologies.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      tags: ["React", "Node.js", "Stripe", "MongoDB"],
      category: "Web",
      featured: true
    },
    {
      title: "Discord Community Bot",
      description: "Advanced moderation and community management bot with custom features, economy system, and integration with external APIs.",
      image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&h=400&fit=crop",
      tags: ["Discord.js", "Node.js", "PostgreSQL", "API"],
      category: "Discord",
      featured: true
    },
    {
      title: "Corporate Website Redesign",
      description: "Modern, responsive website redesign with CMS integration, SEO optimization, and performance improvements resulting in 200% increase in conversions.",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop",
      tags: ["React", "CMS", "SEO", "Responsive"],
      category: "Web",
      featured: false
    },
    {
      title: "Multi-Server Discord Network",
      description: "Complex Discord bot network managing multiple servers with shared databases, cross-server communication, and advanced analytics.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
      tags: ["Discord.js", "Microservices", "Analytics", "Network"],
      category: "Discord",
      featured: true
    }
  ];

  const filteredProjects = filter === "All" 
    ? projects 
    : projects.filter(project => project.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Portfolio</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Explore our latest projects and see the quality of work we deliver across gaming and web platforms. 
              Each project represents our commitment to excellence and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                onClick={() => setFilter(category)}
                className={filter === category 
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600" 
                  : "hover:bg-cyan-50 hover:border-cyan-300"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredProjects.map((project, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white relative">
                {project.featured && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <Github className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="border-cyan-300 text-cyan-700">
                      {project.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs bg-gray-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-teal-500">
        <div className="container mx-auto px-6">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Create Something Amazing?</h2>
            <p className="text-xl mb-8 opacity-90">
              Let's work together to bring your vision to life. Whether it's a gaming server, 
              web application, or Discord bot, we have the expertise to deliver exceptional results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-gray-100">
                Start Your Project
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View All Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
