
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";

const Portfolio = () => {
  const projects = [
    {
      title: "Advanced FiveM Roleplay Server",
      description: "Complete roleplay server with custom scripts, vehicles, and realistic features.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=300&fit=crop",
      tags: ["FiveM", "Lua", "MySQL", "Roleplay"],
      category: "FiveM"
    },
    {
      title: "Roblox Adventure Game",
      description: "Multiplayer adventure game with custom mechanics and monetization.",
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500&h=300&fit=crop",
      tags: ["Roblox", "Lua", "Game Design", "Multiplayer"],
      category: "Roblox"
    },
    {
      title: "Modern E-commerce Platform",
      description: "Full-stack e-commerce solution with payment integration and admin panel.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      tags: ["React", "Node.js", "Stripe", "MongoDB"],
      category: "Web"
    },
    {
      title: "Discord Management Bot",
      description: "Advanced moderation and community management bot with custom features.",
      image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=500&h=300&fit=crop",
      tags: ["Discord.js", "Node.js", "PostgreSQL", "API"],
      category: "Discord"
    },
    {
      title: "FiveM Racing Script Pack",
      description: "Comprehensive racing system with leaderboards and custom tracks.",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=300&fit=crop",
      tags: ["FiveM", "Racing", "Leaderboards", "Custom UI"],
      category: "FiveM"
    },
    {
      title: "Corporate Website Redesign",
      description: "Modern, responsive website with CMS integration and SEO optimization.",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=300&fit=crop",
      tags: ["React", "CMS", "SEO", "Responsive"],
      category: "Web"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">Portfolio</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore some of our latest projects and see the quality of work we deliver
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white">
              <div className="relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                      <Github className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 border-0">
                    {project.category}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
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
  );
};

export default Portfolio;
