
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Auth Button */}
      <div className="fixed top-4 right-4 z-50">
        {user && profile ? (
          <Link to="/dashboard">
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <User className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        )}
      </div>

      <Hero />
      <Services />
      <About />
      <Portfolio />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
