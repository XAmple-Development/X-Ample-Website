
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Gamepad2, Globe, MessageSquare, Zap, Shield } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Gamepad2 className="w-12 h-12 text-cyan-500" />,
      title: "FiveM Scripts & Assets",
      description: "Custom scripts, vehicles, maps, and complete server packages for GTA V FiveM servers.",
      features: ["Custom Scripts", "Vehicle Packs", "Map Development", "Server Optimization"]
    },
    {
      icon: <Code className="w-12 h-12 text-teal-500" />,
      title: "Roblox Server Development",
      description: "Professional Roblox game development and server management solutions.",
      features: ["Game Development", "Server Management", "Custom Features", "Monetization Setup"]
    },
    {
      icon: <Globe className="w-12 h-12 text-cyan-600" />,
      title: "Website Development",
      description: "Modern, responsive websites and web applications built with cutting-edge technology.",
      features: ["Responsive Design", "E-commerce", "CMS Integration", "Performance Optimization"]
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-teal-600" />,
      title: "Discord Development",
      description: "Advanced Discord bots and server management solutions for communities.",
      features: ["Custom Bots", "Server Setup", "Moderation Tools", "Integration Systems"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We specialize in creating high-quality digital solutions across multiple platforms
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Zap className="w-4 h-4 text-cyan-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full px-6 py-3">
            <Shield className="w-5 h-5 text-cyan-600" />
            <span className="text-gray-800 font-semibold">100% Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
