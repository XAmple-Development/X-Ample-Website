
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Gamepad2, Globe, MessageSquare, Zap, Shield, ArrowRight, CheckCircle } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Gamepad2 className="w-12 h-12 text-cyan-500" />,
      title: "FiveM Development",
      description: "Custom scripts, vehicles, maps, and complete server packages for GTA V FiveM servers.",
      features: ["Custom Scripts & Resources", "Vehicle & Weapon Packs", "Map Development", "Server Optimization", "MLO Interiors", "Economy Systems"],
      pricing: "Starting at $299",
      popular: false
    },
    {
      icon: <Code className="w-12 h-12 text-teal-500" />,
      title: "Roblox Development", 
      description: "Professional Roblox game development and server management solutions.",
      features: ["Game Development", "Server Management", "Custom Features", "Monetization Setup", "UI/UX Design", "Performance Optimization"],
      pricing: "Starting at $499",
      popular: true
    },
    {
      icon: <Globe className="w-12 h-12 text-cyan-600" />,
      title: "Web Development",
      description: "Modern, responsive websites and web applications built with cutting-edge technology.",
      features: ["Responsive Design", "E-commerce Solutions", "CMS Integration", "Performance Optimization", "SEO Optimization", "Analytics Setup"],
      pricing: "Starting at $799",
      popular: false
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-teal-600" />,
      title: "Discord Development",
      description: "Advanced Discord bots and server management solutions for communities.",
      features: ["Custom Bots", "Server Setup", "Moderation Tools", "Integration Systems", "Database Management", "Custom Commands"],
      pricing: "Starting at $199",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We specialize in creating high-quality digital solutions across gaming and web platforms. 
              From FiveM servers to Discord bots, we bring your vision to life.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-200">
                <Shield className="w-5 h-5 text-cyan-500" />
                <span className="text-gray-700">100% Quality Guaranteed</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-teal-200">
                <CheckCircle className="w-5 h-5 text-teal-500" />
                <span className="text-gray-700">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white relative overflow-hidden ${service.popular ? 'ring-2 ring-cyan-500' : ''}`}>
                {service.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 py-2 rounded-bl-lg text-sm font-semibold">
                    Most Popular
                  </div>
                )}
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
                  <div className="text-3xl font-bold text-cyan-600 mt-4">
                    {service.pricing}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
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
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 opacity-90">
              Let's discuss your requirements and create something amazing together. 
              Get a free consultation and quote today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-gray-100">
                Get Free Quote
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
