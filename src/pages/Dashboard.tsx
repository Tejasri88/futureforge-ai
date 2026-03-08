import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, BarChart3, Route, TrendingUp, Award, Zap, ArrowUpRight,
  Brain, Globe, Flame, DollarSign, BookOpen, Briefcase, Shield,
  Cpu, Sparkles, Clock, ChevronRight, Layers, Radio, GraduationCap,
  Lightbulb, MapPin, AlertTriangle, Rocket
} from "lucide-react";
import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";

// ─── Static Data ───

const statCards: { icon: any; label: string; value: string; color: string }[] = [];

const skillData = [
  { skill: "Python", level: 85 },
  { skill: "ML", level: 70 },
  { skill: "Statistics", level: 60 },
  { skill: "Deep Learning", level: 45 },
  { skill: "Data Viz", level: 75 },
  { skill: "SQL", level: 80 },
];

const progressData = [
  { month: "Jan", score: 35 }, { month: "Feb", score: 42 },
  { month: "Mar", score: 55 }, { month: "Apr", score: 62 },
  { month: "May", score: 71 }, { month: "Jun", score: 78 },
];

const futureJobs = [
  { title: "AI Engineer", demand: 96, salary: "₹10L–₹16.5L", growth: "+32%", skills: ["Python", "TensorFlow", "LLMs", "MLOps"], icon: Brain },
  { title: "Data Scientist", demand: 91, salary: "₹8.3L–₹14.2L", growth: "+28%", skills: ["Python", "Statistics", "ML", "SQL"], icon: BarChart3 },
  { title: "Cloud Engineer", demand: 89, salary: "₹9.2L–₹15L", growth: "+25%", skills: ["AWS", "Terraform", "Docker", "K8s"], icon: Globe },
  { title: "Cybersecurity Analyst", demand: 87, salary: "₹7.9L–₹13.3L", growth: "+30%", skills: ["Networks", "Pentesting", "SIEM"], icon: Shield },
  { title: "ML Engineer", demand: 93, salary: "₹10.8L–₹17.5L", growth: "+35%", skills: ["PyTorch", "MLOps", "Data Pipelines"], icon: Cpu },
  { title: "DevOps Engineer", demand: 85, salary: "₹8.8L–₹14.6L", growth: "+22%", skills: ["CI/CD", "Docker", "K8s", "Linux"], icon: Layers },
  { title: "Blockchain Developer", demand: 78, salary: "₹8.3L–₹15.4L", growth: "+18%", skills: ["Solidity", "Web3", "Smart Contracts"], icon: Zap },
  { title: "Product Manager", demand: 82, salary: "₹9.2L–₹15.8L", growth: "+20%", skills: ["Strategy", "Analytics", "UX"], icon: Rocket },
];

const topSkills = [
  { skill: "Artificial Intelligence", demand: 97, trend: "🔥", salaryImpact: "+₹2.1L" },
  { skill: "Machine Learning", demand: 94, trend: "🔥", salaryImpact: "+₹1.8L" },
  { skill: "Cloud Computing", demand: 91, trend: "📈", salaryImpact: "+₹1.5L" },
  { skill: "Python", demand: 93, trend: "📈", salaryImpact: "+₹1.25L" },
  { skill: "Data Analysis", demand: 89, trend: "📈", salaryImpact: "+₹1.2L" },
  { skill: "Cybersecurity", demand: 88, trend: "🔥", salaryImpact: "+₹1.7L" },
  { skill: "DevOps", demand: 85, trend: "📈", salaryImpact: "+₹1.3L" },
  { skill: "SQL", demand: 87, trend: "📈", salaryImpact: "+₹1L" },
  { skill: "Prompt Engineering", demand: 82, trend: "🔥", salaryImpact: "+₹1.5L" },
  { skill: "Data Visualization", demand: 80, trend: "📈", salaryImpact: "+₹0.8L" },
];

const heatmapData = [
  { industry: "Technology", skills: [{ name: "AI/ML", heat: 98 }, { name: "Cloud", heat: 92 }, { name: "DevOps", heat: 88 }, { name: "Security", heat: 85 }] },
  { industry: "Finance", skills: [{ name: "Data Analytics", heat: 95 }, { name: "Python", heat: 90 }, { name: "SQL", heat: 93 }, { name: "Blockchain", heat: 75 }] },
  { industry: "Healthcare", skills: [{ name: "AI in Health", heat: 90 }, { name: "Data Science", heat: 87 }, { name: "Cloud", heat: 80 }, { name: "Security", heat: 82 }] },
  { industry: "E-Commerce", skills: [{ name: "Full Stack", heat: 88 }, { name: "Cloud", heat: 85 }, { name: "ML", heat: 82 }, { name: "Analytics", heat: 90 }] },
];

const salaryPredictions = [
  { role: "Data Analyst", entry: 55, mid: 85, senior: 125 },
  { role: "Data Scientist", entry: 80, mid: 120, senior: 180 },
  { role: "AI Engineer", entry: 100, mid: 155, senior: 220 },
  { role: "ML Engineer", entry: 95, mid: 145, senior: 210 },
  { role: "Cloud Engineer", entry: 85, mid: 130, senior: 185 },
];

const emergingTech = [
  { name: "Generative AI", growth: 95, maturity: "Scaling", impact: "Revolutionary", color: "hsl(var(--neon-green))" },
  { name: "Quantum Computing", growth: 72, maturity: "Emerging", impact: "Transformative", color: "hsl(var(--neon-purple))" },
  { name: "Edge Computing", growth: 80, maturity: "Growing", impact: "High", color: "hsl(var(--primary))" },
  { name: "AR/VR", growth: 68, maturity: "Developing", impact: "Significant", color: "hsl(var(--neon-orange))" },
  { name: "Blockchain", growth: 65, maturity: "Maturing", impact: "Moderate", color: "hsl(var(--neon-cyan))" },
];

const globalOpportunities = [
  { country: "India", flag: "🇮🇳", topRole: "Data Analysts", demand: "Very High", avgSalary: "₹12L" },
  { country: "USA", flag: "🇺🇸", topRole: "AI Engineers", demand: "Very High", avgSalary: "₹1.2Cr" },
  { country: "Germany", flag: "🇩🇪", topRole: "Cloud Engineers", demand: "High", avgSalary: "₹87L" },
  { country: "UK", flag: "🇬🇧", topRole: "Cybersecurity", demand: "High", avgSalary: "₹90L" },
  { country: "Canada", flag: "🇨🇦", topRole: "ML Engineers", demand: "High", avgSalary: "₹80L" },
  { country: "Australia", flag: "🇦🇺", topRole: "DevOps", demand: "High", avgSalary: "₹78L" },
];

const careerTimeline = [
  { year: 1, role: "Junior Data Analyst", salary: "₹4.6L", milestone: "Foundation" },
  { year: 3, role: "Data Analyst", salary: "₹6.7L", milestone: "Specialization" },
  { year: 5, role: "Senior Analyst", salary: "₹9.2L", milestone: "Leadership" },
  { year: 8, role: "Data Science Manager", salary: "₹12.5L", milestone: "Management" },
  { year: 10, role: "Director of Analytics", salary: "₹16.7L+", milestone: "Executive" },
];

const opportunities = [
  { type: "Internship", title: "Google STEP Intern", match: 92, icon: Briefcase },
  { type: "Hackathon", title: "MLH Global Hack", match: 88, icon: Zap },
  { type: "Scholarship", title: "AWS AI Scholarship", match: 85, icon: GraduationCap },
  { type: "Entry Job", title: "Jr. Data Analyst", match: 90, icon: Target },
];

const careerNews = [
  { title: "AI Jobs Surge 40% in Q1 2026", category: "Market Trend", time: "2h ago" },
  { title: "Python Remains #1 Language for Data Science", category: "Skills", time: "5h ago" },
  { title: "Cloud Spending to Hit ₹83L Cr by 2027", category: "Industry", time: "1d ago" },
  { title: "New Cybersecurity Regulations Drive Hiring", category: "Policy", time: "1d ago" },
];

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--neon-green))", "hsl(var(--neon-purple))",
  "hsl(var(--neon-orange))", "hsl(var(--neon-cyan))"
];

function getHeatColor(value: number): string {
  if (value >= 90) return "bg-neon-green/40 border-neon-green/50 text-neon-green";
  if (value >= 80) return "bg-primary/30 border-primary/40 text-primary";
  if (value >= 70) return "bg-neon-orange/30 border-neon-orange/40 text-neon-orange";
  return "bg-muted/40 border-border text-muted-foreground";
}

type TabId = "overview" | "jobs" | "skills" | "market" | "global";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const TABS: { id: TabId; label: string; icon: typeof Target }[] = [
    { id: "overview", label: "Overview", icon: Sparkles },
    { id: "jobs", label: "Future Jobs", icon: Briefcase },
    { id: "skills", label: "Skill Demand", icon: Flame },
    { id: "market", label: "Market Intel", icon: TrendingUp },
    { id: "global", label: "Global", icon: Globe },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary animate-pulse" /> AI Career Intelligence Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time career intelligence • Future job market insights • Personalized guidance</p>
        </div>


        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Skill Radar */}
                <div className="glass-card p-6">
                  <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" /> Your Skill Radar
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={skillData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Radar dataKey="level" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress Chart */}
                <div className="glass-card p-6">
                  <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-neon-green" /> Skill Progress
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#areaGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top 4 Future Jobs Quick View */}
              <div className="glass-card p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-neon-orange" /> Hottest Future Careers
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {futureJobs.slice(0, 4).map((job, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="glass-card-hover p-4 group cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <job.icon className="w-5 h-5 text-primary" />
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${job.demand >= 90 ? "bg-neon-green/10 border-neon-green/30 text-neon-green" : "bg-primary/10 border-primary/30 text-primary"}`}>
                          {job.demand}% demand
                        </span>
                      </div>
                      <div className="font-display text-xs font-semibold text-foreground mb-1">{job.title}</div>
                      <div className="text-[10px] text-neon-green font-mono">{job.salary}</div>
                      <div className="text-[10px] text-muted-foreground">{job.growth} growth</div>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${job.demand}%` }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Emerging Tech + Career News */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-neon-purple" /> Emerging Technologies
                  </h3>
                  <div className="space-y-3">
                    {emergingTech.map((tech, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">{tech.name}</span>
                            <span className="text-[9px] text-muted-foreground">{tech.maturity}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${tech.growth}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                              className="h-full rounded-full" style={{ backgroundColor: tech.color }} />
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-neon-green w-8">{tech.growth}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Radio className="w-4 h-4 text-primary" /> Career News Feed
                  </h3>
                  <div className="space-y-3">
                    {careerNews.map((news, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-2 rounded-lg border border-border bg-muted/10 hover:border-primary/20 transition-all cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground font-medium leading-tight">{news.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{news.category}</span>
                            <span className="text-[9px] text-muted-foreground">{news.time}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opportunities */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-neon-green" /> Career Opportunities for You
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {opportunities.map((opp, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-muted/20 hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <opp.icon className="w-4 h-4 text-primary" />
                        <span className="text-[9px] text-neon-green">{opp.match}% match</span>
                      </div>
                      <div className="text-[9px] uppercase font-medium text-muted-foreground">{opp.type}</div>
                      <div className="text-xs font-medium text-foreground">{opp.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── FUTURE JOBS TAB ── */}
          {activeTab === "jobs" && (
            <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Future High-Demand Jobs (2026–2035)
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {futureJobs.map((job, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <job.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{job.title}</div>
                          <div className="text-[9px] text-neon-green">{job.growth} growth</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Demand Index</span>
                          <span className={`font-mono font-bold ${job.demand >= 90 ? "text-neon-green" : "text-primary"}`}>{job.demand}/100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${job.demand}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`h-full rounded-full ${job.demand >= 90 ? "bg-neon-green" : "bg-primary"}`} />
                        </div>
                        <div className="text-[10px] text-neon-green font-mono">{job.salary}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.skills.map((sk, j) => (
                            <span key={j} className="px-1.5 py-0.5 rounded-full bg-muted text-[8px] text-muted-foreground border border-border">{sk}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Salary Prediction */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neon-green" /> Salary Prediction by Career Level ($K)
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salaryPredictions} layout="vertical">
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                    <YAxis type="category" dataKey="role" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} width={100} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="entry" name="Entry" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} stackId="a" />
                    <Bar dataKey="mid" name="Mid" fill="hsl(var(--neon-green))" radius={[0, 2, 2, 0]} stackId="b" />
                    <Bar dataKey="senior" name="Senior" fill="hsl(var(--neon-purple))" radius={[0, 4, 4, 0]} stackId="c" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Entry</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-green" /> Mid</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-purple" /> Senior</span>
                </div>
              </div>

              {/* Career Growth Timeline */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Route className="w-4 h-4 text-neon-cyan" /> Career Growth Forecast
                </h3>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-5">
                    {careerTimeline.map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                        className="relative pl-14">
                        <div className={`absolute left-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${i === 0 ? "border-primary bg-primary/20 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                          Y{step.year}
                        </div>
                        <div className="glass-card p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{step.role}</span>
                            <span className="text-xs text-neon-green font-mono">{step.salary}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{step.milestone}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SKILL DEMAND TAB ── */}
          {activeTab === "skills" && (
            <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Top Skills */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-neon-orange" /> Top Skills for the Future
                </h3>
                <div className="space-y-2.5">
                  {topSkills.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground w-4 text-right">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{s.skill} {s.trend}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-neon-green font-mono">{s.salaryImpact}</span>
                            <span className="text-[9px] font-mono text-primary w-8 text-right">{s.demand}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.demand}%` }} transition={{ delay: i * 0.06, duration: 0.5 }}
                            className={`h-full rounded-full ${s.demand >= 90 ? "bg-neon-green" : s.demand >= 80 ? "bg-primary" : "bg-neon-orange"}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skill Demand Heatmap */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neon-purple" /> Skill Demand Heatmap by Industry
                </h3>
                <div className="overflow-x-auto">
                  <div className="min-w-[500px]">
                    {heatmapData.map((row, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-foreground w-24 shrink-0">{row.industry}</span>
                        <div className="flex gap-2 flex-1">
                          {row.skills.map((sk, j) => (
                            <motion.div key={j} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (i * 4 + j) * 0.04 }}
                              className={`flex-1 p-2 rounded-lg border text-center ${getHeatColor(sk.heat)}`}>
                              <div className="text-[9px] font-medium">{sk.name}</div>
                              <div className="text-[10px] font-mono font-bold">{sk.heat}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-[9px] text-muted-foreground justify-center">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-neon-green/40 border border-neon-green/50" /> 90+ Hot</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/30 border border-primary/40" /> 80+ High</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-neon-orange/30 border border-neon-orange/40" /> 70+ Medium</span>
                </div>
              </div>

              {/* Skill Priority Ranking */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-neon-orange" /> Skill Learning Priority
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { priority: "Critical", skills: ["AI/ML", "Python", "Cloud"], color: "neon-green", icon: "🔴" },
                    { priority: "High", skills: ["SQL", "DevOps", "Cybersecurity"], color: "neon-orange", icon: "🟡" },
                    { priority: "Recommended", skills: ["Blockchain", "AR/VR", "Prompt Eng."], color: "primary", icon: "🟢" },
                  ].map((group, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-muted/20">
                      <div className="text-xs font-medium text-foreground mb-2">{group.icon} {group.priority} Priority</div>
                      <div className="space-y-1.5">
                        {group.skills.map((sk, j) => (
                          <div key={j} className={`text-[10px] px-2 py-1 rounded-full bg-${group.color}/10 border border-${group.color}/20 text-${group.color}`}>{sk}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── MARKET INTEL TAB ── */}
          {activeTab === "market" && (
            <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Industry Demand Radar */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Industry Demand Radar
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={[
                      { industry: "Tech", demand: 97 },
                      { industry: "Finance", demand: 88 },
                      { industry: "Healthcare", demand: 85 },
                      { industry: "E-Commerce", demand: 82 },
                      { industry: "Education", demand: 75 },
                      { industry: "Energy", demand: 78 },
                    ]}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="industry" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                      <PolarRadiusAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} />
                      <Radar dataKey="demand" stroke="hsl(var(--neon-green))" fill="hsl(var(--neon-green))" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Emerging Tech Distribution */}
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-neon-purple" /> Technology Growth Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={emergingTech} dataKey="growth" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                        label={({ name, growth }) => `${name} ${growth}%`}
                        labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                        {emergingTech.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Salary Trends */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neon-green" /> Salary Growth Trends ($K)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[
                    { year: "2024", ai: 130, data: 100, cloud: 110, cyber: 95 },
                    { year: "2025", ai: 145, data: 112, cloud: 120, cyber: 105 },
                    { year: "2026", ai: 165, data: 125, cloud: 135, cyber: 118 },
                    { year: "2027", ai: 185, data: 140, cloud: 148, cyber: 130 },
                    { year: "2028", ai: 210, data: 158, cloud: 165, cyber: 145 },
                  ]}>
                    <defs>
                      <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--neon-green))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--neon-green))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="ai" name="AI Engineer" stroke="hsl(var(--neon-green))" fill="url(#aiGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="data" name="Data Science" stroke="hsl(var(--primary))" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="cloud" name="Cloud" stroke="hsl(var(--neon-purple))" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="cyber" name="Cybersecurity" stroke="hsl(var(--neon-orange))" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Career Trend Predictions */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-cyan" /> AI Career Trend Predictions (2030)
                  </h3>
                  <div className="space-y-2">
                    {[
                      { career: "AI Safety Engineer", probability: 95, reason: "Regulatory demand" },
                      { career: "Prompt Engineer", probability: 88, reason: "Generative AI growth" },
                      { career: "Quantum Developer", probability: 72, reason: "Quantum computing R&D" },
                      { career: "Robotics Engineer", probability: 82, reason: "Automation expansion" },
                      { career: "Climate Tech Analyst", probability: 78, reason: "Green energy transition" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/10">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground font-medium">{item.career}</span>
                            <span className="text-[10px] font-mono text-neon-green">{item.probability}%</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{item.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-neon-orange" /> AI Learning Recommendations
                  </h3>
                  <div className="space-y-2">
                    {[
                      { skill: "Machine Learning", course: "Stanford CS229", platform: "Coursera", time: "12 weeks" },
                      { skill: "Cloud (AWS)", course: "AWS Solutions Architect", platform: "AWS", time: "8 weeks" },
                      { skill: "Python Advanced", course: "Python for Data Science", platform: "DataCamp", time: "6 weeks" },
                      { skill: "SQL Mastery", course: "SQL for Analytics", platform: "Mode", time: "4 weeks" },
                      { skill: "Prompt Engineering", course: "ChatGPT Prompt Eng.", platform: "DeepLearning.AI", time: "2 weeks" },
                    ].map((rec, i) => (
                      <div key={i} className="p-2 rounded-lg border border-border bg-muted/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground font-medium">{rec.skill}</span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.time}</span>
                        </div>
                        <div className="text-[10px] text-primary">{rec.course} • {rec.platform}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── GLOBAL TAB ── */}
          {activeTab === "global" && (
            <motion.div key="global" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Global Career Opportunity Scanner
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {globalOpportunities.map((g, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="p-4 rounded-lg border border-border bg-muted/20 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{g.flag}</span>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{g.country}</div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${g.demand === "Very High" ? "bg-neon-green/10 border-neon-green/30 text-neon-green" : "bg-primary/10 border-primary/30 text-primary"}`}>
                            {g.demand}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3" /> Top Role: <span className="text-foreground font-medium">{g.topRole}</span>
                      </div>
                      <div className="text-xs text-neon-green font-mono">{g.avgSalary}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Fastest Growing Industries */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neon-green" /> Fastest Growing Industries
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { industry: "AI/ML", growth: 35 },
                    { industry: "Cybersecurity", growth: 30 },
                    { industry: "Cloud", growth: 28 },
                    { industry: "HealthTech", growth: 25 },
                    { industry: "FinTech", growth: 22 },
                    { industry: "EdTech", growth: 20 },
                    { industry: "CleanTech", growth: 18 },
                  ]}>
                    <XAxis dataKey="industry" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="growth" name="Growth %" radius={[4, 4, 0, 0]}>
                      {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Skill Gap Alerts + Career Score */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-neon-orange" /> AI Skill Gap Alerts
                  </h3>
                  <div className="space-y-2">
                    {[
                      { skill: "Prompt Engineering", alert: "Demand surged 180% — critical for AI roles", severity: "high" },
                      { skill: "Kubernetes", alert: "Now required by 65% of DevOps positions", severity: "medium" },
                      { skill: "AI Ethics", alert: "Emerging regulation-driven demand", severity: "low" },
                    ].map((a, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${a.severity === "high" ? "border-neon-orange/30 bg-neon-orange/5" : a.severity === "medium" ? "border-primary/30 bg-primary/5" : "border-border bg-muted/10"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">{a.skill}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${a.severity === "high" ? "border-neon-orange/40 text-neon-orange" : a.severity === "medium" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                            {a.severity}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{a.alert}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-neon-green" /> Your Career Score
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--neon-green))" strokeWidth="8" strokeLinecap="round"
                          initial={{ strokeDasharray: "0 264" }}
                          animate={{ strokeDasharray: `${82 * 2.64} 264` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="font-display text-2xl font-bold text-neon-green">82</div>
                          <div className="text-[8px] text-muted-foreground">/100</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      {[
                        { label: "Skills", score: 78 },
                        { label: "Projects", score: 70 },
                        { label: "Experience", score: 85 },
                        { label: "Market Fit", score: 90 },
                      ].map((f, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-muted-foreground">{f.label}</span>
                            <span className="text-foreground font-mono">{f.score}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${f.score}%` }} transition={{ delay: i * 0.15, duration: 0.5 }}
                              className={`h-full rounded-full ${f.score >= 85 ? "bg-neon-green" : f.score >= 70 ? "bg-primary" : "bg-neon-orange"}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 p-2 rounded-lg border border-neon-green/20 bg-neon-green/5">
                    <p className="text-[10px] text-neon-green">💡 Learn SQL and complete 2 more projects to reach 90+</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
