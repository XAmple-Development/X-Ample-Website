
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Clock, Star, Target, Heart, Zap } from "lucide-react";

const About = () => {
  const stats = [
    { icon: <Users className="w-8 h-8" />, number: "500+", label: "Happy Clients" },
    { icon: <Award className="w-8 h-8" />, number: "1000+", label: "Projects Completed" },
    { icon: <Clock className="w-8 h-8" />, number: "8+", label: "Years Experience" },
    { icon: <Star className="w-8 h-8" />, number: "4.9", label: "Average Rating" }
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8 text-cyan-500" />,
      title: "Excellence",
      description: "We strive for perfection in every project, delivering solutions that exceed expectations and set new standards in digital development."
    },
    {
      icon: <Heart className="w-8 h-8 text-teal-500" />,
      title: "Passion",
      description: "Our love for technology and innovation drives us to create exceptional experiences that resonate with users and communities."
    },
    {
      icon: <Zap className="w-8 h-8 text-cyan-600" />,
      title: "Innovation",
      description: "We embrace cutting-edge technologies and creative solutions to build the future of gaming and web experiences."
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
              About <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">X-Ample Development</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We are a passionate team of developers and designers dedicated to creating exceptional digital experiences 
              across gaming and web platforms. Founded on the principles of innovation, quality, and client satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                X-Ample Development was born from a shared passion for gaming and technology. What started as a small group 
                of developers creating custom scripts for their own gaming communities has evolved into a full-service 
                development agency serving clients worldwide.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our expertise spans across multiple platforms - from creating immersive FiveM roleplay servers to building 
                engaging Roblox experiences, modern web applications, and powerful Discord bots. We believe in the power 
                of technology to bring people together and create memorable experiences.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we're proud to have helped over 500 clients bring their visions to life, and we're just getting started.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
                alt="Our team working together"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-xl text-gray-600">Numbers that speak for our commitment to excellence</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card  key={index}className="bg-white text-gray-900 border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300"
>
  <CardContent className="p-6">
    <div className="flex justify-center text-cyan-500 mb-4">
      {stat.icon}
    </div>
    <div className="text-3xl font-bold mb-2">{stat.number}</div>
    <div className="text-gray-600">{stat.label}</div>
  </CardContent>
</Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={index}className="bg-white text-gray-900 border border-gray-200 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
>
  <CardContent className="p-8">
    <div className="flex justify-center mb-6">
      {value.icon}
    </div>
    <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
    <p className="text-gray-700 leading-relaxed">{value.description}</p>
  </CardContent>
</Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
