'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import GlowButton from "./GlowButton";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Tracking", href: "#tracking" },
  { label: "Chat", href: "/chat" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:shadow-neon transition-all">
              <span className="font-display text-sm font-bold text-primary">AI</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground hidden sm:block">
              AI Collective Arena
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              
                <Link key={link.label} href={link.href} className="text-xl text-muted-foreground hover:text-primary transition-colors text-sm font-medium relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              href="/auth/register"
              className="relative px-6 py-3 text-sm font-semibold uppercase tracking-wide rounded-lg bg-primary text-primary-foreground border border-primary/50 transition-all duration-300 hover:shadow-[0_0_12px_var(--tw-shadow-color)] hover:shadow-primary/60 inline-block"
            >
              Sign up now
            </Link>
          </div>

          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden glass mt-4 rounded-lg p-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                
                  <Link key={link.label} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors font-medium py-2">
                  {link.label}
                </Link>
              ))}
              <GlowButton size="sm" href="#cta">
                Sign up now
              </GlowButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;