
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/glass/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Code, Gamepad2, Globe, MessageSquare } from "lucide-react";

const PricingCalculator = () => {
  const [complexity, setComplexity] = useState([3]);
  const [timeline, setTimeline] = useState([2]);
  const [features, setFeatures] = useState([5]);
  const [selectedService, setSelectedService] = useState("fivem");

  const services = {
    fivem: { name: "FiveM Scripts", base: 85, icon: <Gamepad2 className="w-5 h-5" /> },
    roblox: { name: "Roblox Servers", base: 125, icon: <Code className="w-5 h-5" /> },
    web: { name: "Web Development", base: 125, icon: <Globe className="w-5 h-5" /> },
    discord: { name: "Discord Bots", base: 75, icon: <MessageSquare className="w-5 h-5" /> }
  };

  const calculatePrice = () => {
    const service = services[selectedService as keyof typeof services];
    const complexityMultiplier = complexity[0] / 5;
    const timelineMultiplier = timeline[0] > 4 ? 0.8 : timeline[0] < 2 ? 1.5 : 1;
    const featuresMultiplier = features[0] / 5;
    
    return Math.round(service.base * (1 + complexityMultiplier + featuresMultiplier) * timelineMultiplier);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Calculator className="w-8 h-8 inline mr-3" />
            Pricing Calculator
          </h2>
          <p className="text-xl text-gray-300">Get an instant estimate for your project</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <label className="block text-sm font-medium mb-4">Service Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(services).map(([key, service]) => (
                      <Button
                        key={key}
                        variant={selectedService === key ? "default" : "outline"}
                        onClick={() => setSelectedService(key)}
                        className={`p-3 £{
                          selectedService === key
                            ? "bg-gradient-to-r from-cyan-500 to-teal-500"
                            : "border-white/20 text-white hover:bg-white/10"
                        }`}
                      >
                        {service.icon}
                        <span className="ml-2 text-sm">{service.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4">
                    Complexity Level: {complexity[0]}/10
                  </label>
                  <Slider
                    value={complexity}
                    onValueChange={setComplexity}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Simple</span>
                    <span>Complex</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4">
                    Timeline: {timeline[0]} weeks
                  </label>
                  <Slider
                    value={timeline}
                    onValueChange={setTimeline}
                    max={8}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Rush</span>
                    <span>Standard</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4">
                    Features Count: {features[0]}/10
                  </label>
                  <Slider
                    value={features}
                    onValueChange={setFeatures}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Basic</span>
                    <span>Advanced</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white h-full">
              <CardHeader>
                <CardTitle>Estimated Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-cyan-400 mb-2">
                    £{calculatePrice()}
                  </div>
                  <p className="text-gray-300">Starting price estimate</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price ({services[selectedService as keyof typeof services].name}):</span>
                    <span>£{services[selectedService as keyof typeof services].base}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complexity Adjustment:</span>
                    <span>{complexity[0] > 5 ? '+' : ''}
                      {Math.round((complexity[0] / 5 - 1) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline Adjustment:</span>
                    <span>
                      {timeline[0] > 4 ? '-20%' : timeline[0] < 2 ? '+50%' : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Features Adjustment:</span>
                    <span>+{Math.round((features[0] / 5) * 100)}%</span>
                  </div>
                </div>

                              <div className="pt-4 border-t border-white/20">
                                  <p className="text-xs text-gray-400 mb-4">
                                      This is an estimate. Final pricing may vary based on specific requirements.
                                  </p>
                                  <a href="/contact">
                                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
                                          Get Detailed Quote
                                      </Button>
                                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingCalculator;
