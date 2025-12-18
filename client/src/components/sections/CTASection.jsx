import { useState } from "react";
import Link from "next/link";
import GlowButton from "@/components/GlowButton";
import GlassCard from "@/components/GlassCard";
import { Rocket, Mail, Check } from "lucide-react";
// import { toast } from "@/hooks/use-toast";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      toast({
        title: "Welcome to the Arena!",
        description: "You've been added to our waitlist. Stay tuned for updates.",
      });
    }
  };

  return (
    <section id="cta" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      
      <div className="relative container mx-auto px-6">
        <GlassCard className="max-w-3xl mx-auto text-center p-8 md:p-12" glow>
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 animate-glow-pulse">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              <span className="gradient-text">Join the AI Collective</span>
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Be among the first to experience the future of multi-agent AI reasoning. 
              Enter your email to join our exclusive waitlist.
            </p>

            {!submitted ? (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <GlowButton size="md" className="w-full">
                    Sign up now
                  </GlowButton>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 text-primary pt-4">
                <Check className="w-6 h-6" />
                <span className="font-display text-lg">You're on the list!</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default CTASection;