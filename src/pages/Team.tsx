
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Card, CardContent } from "@/components/ui/glass/card";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Team = () => {
  const team = [
    {
      name: "Danny Pilkington",
      role: "Lead Developer & Founder",
      image: "https://cdn.discordapp.com/avatars/1059503129672040458/bc398ae06720419eb3600c565b28ba70?size=1024",
      bio: "Full-stack developer with 8+ years experience in gaming and full stack development. Passionate about creating innovative solutions.",
      skills: ["FiveM Development", "Web Development", "Project Management", "UI/UX Design"],
      social: {
        github: "#",
        twitter: "#",
        linkedin: "#",
        email: "danny@x-ampledevelopment.com"
      }
    },
    {
      name: "zvapor_",
      role: "Assistant Lead Developer",
      image: "https://cdn.discordapp.com/avatars/501700626690998280/a_cbb7036dc635697ffeb9520970dd8f27?size=1024",
      bio: "Creative developer passionate about creating intuitive and beautiful user experiences with modern technologies.",
      skills: ["React Development", "TypeScript", "UI/UX", "Mobile Development"],
      social: {
        github: "#",
        twitter: "#",
        linkedin: "#",
        email: "zvapor@x-ampledevelopment.com"
      }
    },
    {
      name: "DJKnaeckebrot",
      role: "Assistant Lead Developer",
      image: "https://cdn.discordapp.com/avatars/424868316398747648/e9f4962349b1a8e1041060087fc0aac6?size=1024",
      bio: "Specialist in Web development with a focus on immersive experiences and cutting-edge technology implementation.",
      skills: ["Discord Bots", "API Integration", "Database Design", "DevOps"],
      social: {
        github: "#",
        twitter: "#",
        linkedin: "#",
        email: "dj@x-ampledevelopment.com"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <SEO 
        title="Our Team - X-Ample Development"
        description="Meet the talented developers behind X-Ample Development. Expert team specializing in FiveM, Roblox, Web, and Discord development."
        url="https://x-ampledevelopment.com/team"
      />
      
      <ParticlesBackground className="absolute inset-0 z-0" />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 text-center">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Meet Our <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Team</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                The passionate developers and creators behind X-Ample Development's innovative solutions
              </p>
            </motion.div>
          </div>
        </section>

        {/* Team Members */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white h-full hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <motion.img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-cyan-400/50"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                      <p className="text-cyan-400 font-semibold mb-4">{member.role}</p>
                      <p className="text-gray-300 mb-6 leading-relaxed">{member.bio}</p>
                      
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-teal-400 mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {member.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-white/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-center space-x-4">
                        {Object.entries(member.social).map(([platform, url]) => {
                          const Icon = {
                            github: Github,
                            twitter: Twitter,
                            linkedin: Linkedin,
                            email: Mail
                          }[platform];
                          
                          return (
                            <motion.a
                              key={platform}
                              href={platform === 'email' ? `mailto:${url}` : url}
                              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Icon className="w-5 h-5" />
                            </motion.a>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Team Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white p-12">
                <CardContent>
                  <h2 className="text-4xl font-bold mb-6">Want to Join Our Team?</h2>
                  <p className="text-xl text-gray-300 mb-8">
                    We're always looking for talented developers to join our growing team and create amazing projects together.
                  </p>
                  <motion.a
                    href="/contact"
                    className="inline-block bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get In Touch
                  </motion.a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Team;
