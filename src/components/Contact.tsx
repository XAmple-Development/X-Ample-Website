import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/glass/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
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
                [name]: result.error.errors[0].message,
            }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        validateField(name as keyof ContactFormData, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Get In{" "}
                        <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                            Touch
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Ready to start your next project? Contact us today for a free
                        consultation
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-gray-900 shadow-xl">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                                <p className="text-gray-900">info@x-ampledevelopment.com</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-gray-900 shadow-xl">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                                <p className="text-gray-900">UNDER CONSTRUCTION</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-gray-900 shadow-xl">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                                <p className="text-gray-900">
                                    Remote Team
                                    <br />
                                    Worldwide
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md shadow-xl text-white">
                            <CardHeader>
                                <CardTitle className="text-gray-900 font-bold">Send us a message</CardTitle>
                                <p className="text-gray-900">
                                    Fill out the form below and we&apos;ll get back to you within
                                    24 hours.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                First Name *
                                            </label>
                                            <Input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="Your first name"
                                                className="bg-white text-gray-900 border-gray-200 focus:border-cyan-500"
                                                maxLength={50}
                                                required
                                            />
                                            {errors.firstName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.firstName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Last Name *
                                            </label>
                                            <Input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Your last name"
                                                className="bg-white text-gray-900 border-gray-200 focus:border-cyan-500"
                                                maxLength={50}
                                                required
                                            />
                                            {errors.lastName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.lastName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Email *
                                        </label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="your.email@example.com"
                                            className="bg-white text-gray-900 border-gray-200 focus:border-cyan-500"
                                            maxLength={254}
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Project Type
                                        </label>
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
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Budget Range
                                        </label>
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
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Message *
                                        </label>
                                        <Textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about your project..."
                                            rows={6}
                                            className="bg-white text-gray-900 border-gray-200 focus:border-cyan-500 resize-none"
                                            maxLength={2000}
                                            required
                                        />
                                        {errors.message && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.message}
                                            </p>
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
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16">
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl p-8 text-white max-w-4xl mx-auto">
                        <h3 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h3>
                        <p className="text-xl mb-6 opacity-90">
                            Let's discuss your ideas and bring them to life with our expertise
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full"
                        >
                            Get Free Quote
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
