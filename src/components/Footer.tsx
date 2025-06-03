
import { Code, Github, Twitter, Mail, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/c54aa9aa-58db-4f2f-87df-5637b62b5f99.png" 
                alt="X-Ample Development" 
                className="h-8 w-auto"
              />
              <span className="text-2xl font-bold">X-Ample Development</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Creating exceptional digital experiences across FiveM, Roblox, Web, and Discord platforms. 
              Your vision, our expertise.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <Github className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <Twitter className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">FiveM Development</li>
              <li className="hover:text-white transition-colors cursor-pointer">Roblox Servers</li>
              <li className="hover:text-white transition-colors cursor-pointer">Web Development</li>
              <li className="hover:text-white transition-colors cursor-pointer">Discord Bots</li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
  <a href="/about" className="hover:text-white transition-colors cursor-pointer">
    About Us
  </a>
</li>
<li>
  <a href="/portfolio" className="hover:text-white transition-colors cursor-pointer">
    Portfolio
  </a>
</li>
<li>
  <a href="/contact" className="hover:text-white transition-colors cursor-pointer">
    Contact
  </a>
</li>
<li>
  <a href="/support" className="hover:text-white transition-colors cursor-pointer">
    Support
  </a>
</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 X-Ample Development. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by X-Ample Development</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
