import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Target, BarChart3, Route, FileText, Brain, MessageSquare, Github, ArrowRight, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Target, title: "AI Career Assessment", desc: "Smart questionnaire powered by AI to discover your ideal career path with probability scores.", color: "text-primary" },
  { icon: BarChart3, title: "Skill Gap Analyzer", desc: "Compare your skills with industry requirements and identify what you need to learn.", color: "text-neon-green" },
  { icon: Route, title: "Learning Roadmap", desc: "Get a personalized step-by-step learning roadmap for your target career.", color: "text-neon-purple" },
  { icon: FileText, title: "Resume Analyzer", desc: "AI-powered resume analysis with ATS scoring and improvement suggestions.", color: "text-neon-orange" },
  { icon: Brain, title: "Interview Simulator", desc: "Practice with AI-simulated interviews and get feedback on your answers.", color: "text-neon-pink" },
  { icon: MessageSquare, title: "AI Mentor Chat", desc: "24/7 AI career mentor that answers all your career-related questions.", color: "text-primary" },
  { icon: Github, title: "GitHub Analyzer", desc: "Analyze your GitHub profile to evaluate coding skills and project complexity.", color: "text-neon-green" },
  { icon: Sparkles, title: "Career Digital Twin", desc: "Simulate your career trajectory and predict promotions, salary growth over 5-10 years.", color: "text-neon-purple" },
];

const stats = [
  { value: "50K+", label: "Career Paths Analyzed" },
  { value: "98%", label: "Accuracy Rate" },
  { value: "10K+", label: "Users Guided" },
  { value: "500+", label: "Skills Tracked" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-primary" />
            <span className="font-display text-lg font-bold gradient-text">FutureForge AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
            <a href="#cta" className="hover:text-foreground transition-colors">Get Started</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="neon-button-outline text-sm px-4 py-2">Log In</Link>
            <Link to="/dashboard" className="neon-button text-sm px-4 py-2">Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-primary mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Intelligence Platform
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Navigate Your</span>
              <br />
              <span className="gradient-text">Future Career</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover your ideal career path, identify skill gaps, and get personalized 
              roadmaps powered by advanced AI. Your career operating system starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/career-assessment" className="neon-button text-base px-8 py-4 flex items-center justify-center gap-2">
                Start Career Assessment <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/dashboard" className="neon-button-outline text-base px-8 py-4 flex items-center justify-center gap-2">
                Explore Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="glass-card p-6 text-center"
              >
                <div className="font-display text-3xl font-bold neon-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 gradient-text">Core Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to navigate your career with confidence.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                className="glass-card-hover p-6 group"
              >
                <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
                <h3 className="font-display text-sm font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass-card p-12 neon-border">
            <h2 className="font-display text-3xl font-bold mb-4 gradient-text">Ready to Forge Your Future?</h2>
            <p className="text-muted-foreground mb-8">Start your AI-powered career journey today. No credit card required.</p>
            <Link to="/career-assessment" className="neon-button text-base px-8 py-4 inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-display text-sm gradient-text">FutureForge AI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FutureForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
