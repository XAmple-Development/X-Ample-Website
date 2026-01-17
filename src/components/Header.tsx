import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WidgetBot from "@/components/WidgetBot";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Store", href: "/store" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Bots", href: "/bots" },
    { name: "Vacancies", href: "/vacancies" },
    { name: "Contact", href: "/contact" },
    { name: "Licenses", href: "/licenses" },
    { name: "Status", href: "/status" },
    { name: "Discord", href: "https://discord.gg/bGhguE93Xp" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
    };

  useEffect(() => {
    const readCart = () => {
      try {
        const stored = window.localStorage.getItem("storeCart");
        if (!stored) return setCartCount(0);
        const items = JSON.parse(stored);
        if (!Array.isArray(items)) return setCartCount(0);
        const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    readCart();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "storeCart") readCart();
    };
    const onCustom = () => readCart();
    window.addEventListener("storage", onStorage);
    window.addEventListener("store-cart-updated", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("store-cart-updated", onCustom as EventListener);
    };
  }, []);


  return (
    <header className="fixed top-0 left-0 right-0 z-50 /95 backdrop-blur-sm border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold text-white-900">X-Ample Studios</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`transition-colors duration-300 ${
                  isActive(item.href)
                    ? "text-cyan-500 font-semibold"
                    : "text-gray-600 hover:text-cyan-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link to="/store" className="relative hidden md:inline-flex">
              <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-cyan-500 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            {/* Auth Button */}
            {user && profile ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-cyan-500"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 transition-colors duration-300 ${
                  isActive(item.href)
                    ? "text-cyan-500 font-semibold"
                    : "text-gray-600 hover:text-cyan-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
              )}
              <WidgetBot />
      </div>
    </header>
  );
};

export default Header;
