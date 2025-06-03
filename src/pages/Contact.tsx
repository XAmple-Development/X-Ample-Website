import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import { useSecureContactForm } from "@/hooks/useSecureContactForm";
import { contactFormSchema, type ContactFormData } from "@/utils/validation";

const Contact = () => {
  const { submitForm, isSubmitting } = useSecureContactForm();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    projectType: "",
    budgetRange: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: keyof ContactFormData, value: string) => {
    const fieldSchema = contactFormSchema.shape[name];
    const result = fieldSchema.safeParse(value);
    
    if (!result.success) {
      setErrors(prev => ({
        ...prev,
        [name]: result.error.errors[0].message
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    validateField(name as keyof ContactFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const validationResult = contactFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach(error => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const result = await submitForm(validationResult.data);
    
    if (result.success) {
      // Reset form on successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        projectType: "",
        budgetRange: "",
        message: "",
      });
      setErrors({});
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-white" />,
      title: "Email Us",
      info: "info@x-ampledevelopment.com",
      description: "Send us an email anytime"
    },
    {
      icon: <Phone className="w-6 h-6 text-white" />,
      title: "Call Us",
      info: "UNDER CONSTRUCTION",
      description: "Mon-Fri from 8am to 5pm"
    },
    {
      icon: <MapPin className="w-6 h-6 text-white" />,
      title: "Visit Us",
      info: "Remote Team",
      description: "Worldwide service"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      title: "Discord",
      info: "https://discord.gg/bGhguE93Xp",
      description: "Join our community"
    }
  ];

  const faqs = [
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary depending on complexity. Simple scripts may take 1-2 weeks, while complete servers or applications can take 2-3 months. We provide detailed timelines during consultation."
    },
    {
      question: "Do you provide ongoing support?",
      answer: "Yes! We offer 24/7 support and maintenance packages for all our projects. This includes bug fixes, updates, and feature additions as needed."
    },
    {
      question: "What platforms do you work with?",
      answer: "We specialize in FiveM servers, Roblox games, web applications (React, Node.js), and Discord bots. We can also work with other platforms based on your needs."
    },
    {
      question: "How do you handle payments?",
      answer: "We typically work with a 50% upfront payment and 50% upon completion. For larger projects, we can arrange milestone-based payments."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-10">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Get In <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Ready to start your next project? Contact us today for a free consultation and let's discuss 
              how we can bring your vision to life.
            </p>
            <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-200">
              <Clock className="w-5 h-5 text-cyan-500" />
              <span className="text-gray-700">Average response time: 24 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {contactInfo.map((contact, index) => (
        <Card
          key={index}
          className="bg-white text-gray-900 text-center border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {contact.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{contact.title}</h3>
            <p className="text-cyan-600 font-semibold mb-1">{contact.info}</p>
            <p className="text-gray-600 text-sm">{contact.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Enhanced Contact Form with Security */}
            <div>
              <Card className="bg-white text-gray-900 border border-gray-200 shadow-xl">
  <CardHeader>
    <CardTitle className="text-3xl font-bold text-gray-900">Send us a message</CardTitle>
    <p className="text-gray-700">Fill out the form below and we'll get back to you within 24 hours.</p>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">First Name *</label>
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Your first name"
            className="bg-white text-gray-900 border border-gray-200 focus:border-cyan-500"
            maxLength={50}
            required
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Last Name *</label>
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Your last name"
            className="bg-white text-gray-900 border border-gray-200 focus:border-cyan-500"
            maxLength={50}
            required
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Email *</label>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="your.email@example.com"
          className="bg-white text-gray-900 border border-gray-200 focus:border-cyan-500"
          maxLength={254}
          required
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Project Type</label>
        <select
          name="projectType"
          value={formData.projectType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:border-cyan-500"
        >
          <option value="">Select a service</option>
          <option value="FiveM Development">FiveM Development</option>
          <option value="Roblox Development">Roblox Development</option>
          <option value="Web Development">Web Development</option>
          <option value="Discord Development">Discord Development</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Budget Range</label>
        <select
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:border-cyan-500"
        >
          <option value="">Select budget range</option>
          <option value="Under £500">Under £500</option>
          <option value="£500 - £1,000">£500 - £1,000</option>
          <option value="£1,000 - £5,000">£1,000 - £5,000</option>
          <option value="£5,000 - £10,000">£5,000 - £10,000</option>
          <option value="£10,000+">£10,000+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Message *</label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your project..."
          rows={6}
          className="bg-white text-gray-900 border border-gray-200 focus:border-cyan-500 resize-none"
          maxLength={2000}
          required
        />
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">{errors.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || Object.keys(errors).length > 0}
        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5 mr-2" />
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
  <div className="space-y-6">
    {faqs.map((faq, index) => (
      <Card
        key={index}
        className="bg-white text-gray-900 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
        </CardContent>
      </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-teal-500">
        <div className="container mx-auto px-6">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of satisfied clients who have trusted us with their digital projects. 
              Let's create something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-gray-100">
                Get Free Quote
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                onClick={() => window.open('https://discord.gg/bGhguE93Xp', '_blank')}
              >
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
