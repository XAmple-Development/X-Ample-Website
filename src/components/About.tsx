
import { Users, Award, Clock, Star } from "lucide-react";

const About = () => {
  const stats = [
    { icon: <Users className="w-8 h-8" />, number: "500+", label: "Happy Clients" },
    { icon: <Award className="w-8 h-8" />, number: "1000+", label: "Projects Completed" },
    { icon: <Clock className="w-8 h-8" />, number: "5+", label: "Years Experience" },
    { icon: <Star className="w-8 h-8" />, number: "4.9", label: "Average Rating" }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-slate-900 to-purple-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">X-Ample Development</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We are a passionate team of developers specializing in creating exceptional digital experiences across gaming and web platforms. With years of expertise in FiveM, Roblox, web development, and Discord solutions, we bring your ideas to life with precision and creativity.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Our commitment to quality and innovation has made us a trusted partner for clients worldwide. From small custom scripts to large-scale server deployments, we deliver solutions that exceed expectations.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="text-purple-400 font-semibold">Custom Solutions</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="text-cyan-400 font-semibold">24/7 Support</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="text-pink-400 font-semibold">Fast Delivery</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="flex justify-center text-purple-400 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
