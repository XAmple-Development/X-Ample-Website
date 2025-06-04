
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get In <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your next project? Contact us today for a free consultation
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600">info@x-ampledevelopment.com</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600">UNDER CONSTRUCTION</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                <p className="text-gray-600">Remote Team<br />Worldwide</p>
              </CardContent>
            </Card>
          </div>
        
        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h3>
            <p className="text-xl mb-6 opacity-90">
              Let's discuss your ideas and bring them to life with our expertise
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full">
              Get Free Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
