import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary" />
            <span className="font-display text-xl font-bold gradient-text">FutureForge AI</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isSignup ? "Start your career journey" : "Continue your career journey"}</p>
        </div>

        <div className="glass-card p-8 neon-border">
          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Full Name</label>
                <input type="text" placeholder="John Doe"
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="you@example.com"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <Link to="/dashboard" className="neon-button w-full flex items-center justify-center gap-2 mt-2">
              {isSignup ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => setIsSignup(!isSignup)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
