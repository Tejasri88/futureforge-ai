import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Upload, FileText, Target, Brain, Loader2, AlertTriangle,
  CheckCircle2, ArrowUpRight, TrendingUp, Clock, BookOpen, Github,
  ChevronRight, Sparkles, RefreshCw, DollarSign, Flame, GraduationCap,
  Code, Database, LayoutDashboard, Shield, Cloud, Palette, Users, Briefcase,
  X, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile } from "@/lib/resumeAnalyzer";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie
} from "recharts";

const CAREER_DOMAINS = [
  { id: "data-analyst", label: "Data Analyst", icon: BarChart3, color: "neon-cyan" },
  { id: "data-scientist", label: "Data Scientist", icon: Brain, color: "neon-purple" },
  { id: "ai-engineer", label: "AI Engineer", icon: Sparkles, color: "neon-pink" },
  { id: "ml-engineer", label: "ML Engineer", icon: Brain, color: "neon-orange" },
  { id: "software-engineer", label: "Software Engineer", icon: Code, color: "neon-green" },
  { id: "frontend-developer", label: "Frontend Developer", icon: LayoutDashboard, color: "neon-cyan" },
  { id: "backend-developer", label: "Backend Developer", icon: Database, color: "neon-purple" },
  { id: "fullstack-developer", label: "Full Stack Developer", icon: Code, color: "neon-green" },
  { id: "cybersecurity-analyst", label: "Cybersecurity Analyst", icon: Shield, color: "neon-orange" },
  { id: "cloud-engineer", label: "Cloud Engineer", icon: Cloud, color: "neon-cyan" },
  { id: "product-manager", label: "Product Manager", icon: Users, color: "neon-pink" },
  { id: "ui-ux-designer", label: "UI/UX Designer", icon: Palette, color: "neon-purple" },
];

interface SkillEntry {
  name: string;
  level: number;
  note: string;
  priority?: string;
}

interface CareerImpact {
  skill: string;
  impact: string;
  salaryBoost: string;
}

interface LearningResource {
  type: string;
  title: string;
  platform: string;
  url: string;
}

interface LearningPlanItem {
  skill: string;
  weeks: number;
  resources: LearningResource[];
  project: { title: string; description: string };
}

interface HeatmapEntry {
  skill: string;
  category: string;
  strength: number;
}

interface AnalysisData {
  extractedSkills: string[];
  targetCareer: string;
  requiredSkills: Array<{
    name: string;
    category: string;
    importance: string;
    demandLevel: string;
    avgSalaryImpact: string;
    industryUsage: string;
    estimatedLearningWeeks: number;
    description: string;
  }>;
  skillAnalysis: {
    strong: SkillEntry[];
    intermediate: SkillEntry[];
    missing: SkillEntry[];
  };
  overallScore: number;
  readinessLevel: string;
  careerImpact: CareerImpact[];
  salaryPrediction: {
    current: string;
    withMissingSkills: string;
    potential: string;
  };
  learningPlan: LearningPlanItem[];
  resumeSuggestions: string[];
  heatmapData: HeatmapEntry[];
}

type SkillStatus = "completed" | "learning" | "practicing" | "not_started";

export default function SkillGap() {
  const [step, setStep] = useState<"upload" | "domain" | "analyzing" | "results">("upload");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [manualSkills, setManualSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [skillStatuses, setSkillStatuses] = useState<Record<string, SkillStatus>>({});
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "learning" | "impact">("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      setFileName(file.name);
      toast.success(`Resume "${file.name}" uploaded successfully!`);
    } catch (err) {
      toast.error("Failed to parse file. Try a different format.");
    }
  };

  const addManualSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !manualSkills.includes(trimmed)) {
      setManualSkills(prev => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeManualSkill = (skill: string) => {
    setManualSkills(prev => prev.filter(s => s !== skill));
  };

  const handleAnalyze = async () => {
    if (!selectedDomain) return;
    setStep("analyzing");
    setIsLoading(true);

    try {
      const domainLabel = CAREER_DOMAINS.find(d => d.id === selectedDomain)?.label || selectedDomain;
      const { data, error } = await supabase.functions.invoke("skill-gap-analyzer", {
        body: {
          action: "analyze_resume",
          resumeText: resumeText || "No resume provided. Analyze based on manually provided skills only.",
          targetCareer: domainLabel,
          currentSkills: manualSkills,
          githubUsername: githubUsername || undefined,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        setStep("domain");
        return;
      }

      setAnalysisData(data);
      // Initialize skill statuses
      const statuses: Record<string, SkillStatus> = {};
      data.skillAnalysis?.strong?.forEach((s: SkillEntry) => { statuses[s.name] = "completed"; });
      data.skillAnalysis?.intermediate?.forEach((s: SkillEntry) => { statuses[s.name] = "practicing"; });
      data.skillAnalysis?.missing?.forEach((s: SkillEntry) => { statuses[s.name] = "not_started"; });
      setSkillStatuses(statuses);
      setStep("results");
      toast.success("Skill gap analysis complete!");
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Analysis failed. Please try again.");
      setStep("domain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setResumeText("");
    setFileName("");
    setSelectedDomain(null);
    setManualSkills([]);
    setGithubUsername("");
    setAnalysisData(null);
    setSkillStatuses({});
    setActiveTab("overview");
  };

  const updateSkillStatus = (skillName: string, status: SkillStatus) => {
    setSkillStatuses(prev => ({ ...prev, [skillName]: status }));
  };

  const getStatusColor = (status: SkillStatus) => {
    switch (status) {
      case "completed": return "text-neon-green";
      case "learning": return "text-primary";
      case "practicing": return "text-neon-orange";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBg = (status: SkillStatus) => {
    switch (status) {
      case "completed": return "bg-neon-green/10 border-neon-green/30";
      case "learning": return "bg-primary/10 border-primary/30";
      case "practicing": return "bg-neon-orange/10 border-neon-orange/30";
      default: return "bg-muted border-border";
    }
  };

  // Radar chart data
  const getRadarData = () => {
    if (!analysisData) return [];
    const all = [
      ...(analysisData.skillAnalysis.strong || []),
      ...(analysisData.skillAnalysis.intermediate || []),
      ...(analysisData.skillAnalysis.missing || []),
    ];
    return all.slice(0, 8).map(s => ({
      skill: s.name.length > 12 ? s.name.substring(0, 12) + "…" : s.name,
      you: s.level,
      required: 90,
    }));
  };

  // Bar chart for demand
  const getDemandData = () => {
    if (!analysisData) return [];
    return (analysisData.requiredSkills || []).slice(0, 8).map(s => ({
      skill: s.name.length > 10 ? s.name.substring(0, 10) + "…" : s.name,
      demand: s.demandLevel === "high" ? 90 : s.demandLevel === "medium" ? 60 : 30,
    }));
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical": return "text-destructive";
      case "high": return "text-neon-orange";
      case "medium": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const completedCount = Object.values(skillStatuses).filter(s => s === "completed").length;
  const totalSkills = Object.keys(skillStatuses).length;
  const progressPercentage = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-neon-green" />
              AI Skill Gap Analyzer
            </h1>
            {analysisData && (
              <p className="text-sm text-muted-foreground mt-1">
                Target: {analysisData.targetCareer} • Score: {analysisData.overallScore}% • {completedCount}/{totalSkills} skills mastered
              </p>
            )}
          </div>
          {analysisData && (
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-1" /> New Analysis
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Resume Upload */}
          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Card */}
                <div className="glass-card p-6 space-y-4">
                  <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" /> Upload Resume
                  </h2>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.docx" onChange={handleFileUpload} className="hidden" />
                    {fileName ? (
                      <div className="space-y-2">
                        <FileText className="w-10 h-10 text-neon-green mx-auto" />
                        <p className="text-sm text-neon-green font-medium">{fileName}</p>
                        <p className="text-xs text-muted-foreground">Click to change file</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Drop your resume or click to browse</p>
                        <p className="text-xs text-muted-foreground">Supports PDF, TXT, MD</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Skills + GitHub */}
                <div className="space-y-4">
                  <div className="glass-card p-6 space-y-3">
                    <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                      <Code className="w-4 h-4 text-neon-purple" /> Add Skills Manually
                    </h2>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addManualSkill()}
                        placeholder="e.g. Python, SQL, React..."
                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button size="sm" onClick={addManualSkill} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {manualSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {manualSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/30 flex items-center gap-1">
                            {s}
                            <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeManualSkill(s)} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass-card p-6 space-y-3">
                    <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                      <Github className="w-4 h-4 text-foreground" /> GitHub Profile (Optional)
                    </h2>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={e => setGithubUsername(e.target.value)}
                      placeholder="username"
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep("domain")}
                disabled={!resumeText && manualSkills.length === 0}
                className="w-full"
              >
                Continue to Career Selection <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Domain Selection */}
          {step === "domain" && (
            <motion.div key="domain" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-xs">
                  {fileName || `${manualSkills.length} skills`}
                </span>
                <ChevronRight className="w-4 h-4" />
                <span>Select Target Career</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {CAREER_DOMAINS.map(domain => (
                  <motion.button
                    key={domain.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`glass-card p-4 text-left transition-all ${
                      selectedDomain === domain.id
                        ? "neon-border bg-primary/10"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <domain.icon className={`w-5 h-5 text-${domain.color} mb-2`} />
                    <p className="text-xs font-medium text-foreground">{domain.label}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
                <Button onClick={handleAnalyze} disabled={!selectedDomain} className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" /> Analyze Skill Gap
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Analyzing */}
          {step === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full animate-pulse-glow border-2 border-primary/30" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="font-display text-lg font-bold text-foreground">Analyzing Your Skills</h2>
                <p className="text-sm text-muted-foreground">AI is scanning your resume and comparing with industry requirements…</p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results Dashboard */}
          {step === "results" && analysisData && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* Score + Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className={`font-display text-2xl font-bold ${analysisData.overallScore >= 70 ? "text-neon-green" : analysisData.overallScore >= 40 ? "text-neon-orange" : "text-destructive"}`}>
                    {analysisData.overallScore}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">Readiness Score</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="font-display text-2xl font-bold text-neon-green">{analysisData.skillAnalysis?.strong?.length || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Strong Skills</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">⚠️</div>
                  <div className="font-display text-2xl font-bold text-neon-orange">{analysisData.skillAnalysis?.intermediate?.length || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Need Improvement</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">❌</div>
                  <div className="font-display text-2xl font-bold text-destructive">{analysisData.skillAnalysis?.missing?.length || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Missing Skills</div>
                </div>
              </div>

              {/* Progress */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Skill Mastery Progress</span>
                  <span className="font-display font-bold text-primary">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                {(["overview", "skills", "learning", "impact"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "overview" ? "Overview" : tab === "skills" ? "Skills" : tab === "learning" ? "Learning Plan" : "Career Impact"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-6">
                    {/* Radar */}
                    <div className="glass-card p-5 lg:col-span-2">
                      <h3 className="font-display text-sm font-semibold mb-3 text-foreground">Skill Radar</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={getRadarData()}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} />
                          <Radar dataKey="required" fill="hsl(var(--neon-purple))" fillOpacity={0.1} stroke="hsl(var(--neon-purple))" strokeWidth={2} strokeDasharray="4 4" />
                          <Radar dataKey="you" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-6 text-xs mt-2 justify-center">
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Your Skills</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-secondary inline-block" /> Required</span>
                      </div>
                    </div>

                    {/* Sidebar info */}
                    <div className="space-y-4">
                      {/* Salary */}
                      {analysisData.salaryPrediction && (
                        <div className="glass-card p-5">
                          <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-neon-green" /> Salary Prediction
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="text-foreground">{analysisData.salaryPrediction.current}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">With Gap Filled</span><span className="text-neon-orange">{analysisData.salaryPrediction.withMissingSkills}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Full Potential</span><span className="text-neon-green font-bold">{analysisData.salaryPrediction.potential}</span></div>
                          </div>
                        </div>
                      )}

                      {/* Demand Chart */}
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Flame className="w-4 h-4 text-neon-orange" /> Skill Demand
                        </h3>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={getDemandData()} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} />
                            <YAxis type="category" dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} width={75} />
                            <Bar dataKey="demand" fill="hsl(var(--neon-green))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Resume Tips */}
                      {analysisData.resumeSuggestions?.length > 0 && (
                        <div className="glass-card p-5">
                          <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Resume Tips
                          </h3>
                          <ul className="space-y-1.5">
                            {analysisData.resumeSuggestions.slice(0, 5).map((tip, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <ArrowUpRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Heatmap */}
                    {analysisData.heatmapData?.length > 0 && (
                      <div className="glass-card p-5 lg:col-span-3">
                        <h3 className="font-display text-sm font-semibold mb-4 text-foreground">Skill Heatmap</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {analysisData.heatmapData.map((h, i) => {
                            const strength = h.strength;
                            const bg = strength >= 70 ? "bg-neon-green/30 border-neon-green/40" : strength >= 40 ? "bg-neon-orange/30 border-neon-orange/40" : strength > 0 ? "bg-primary/20 border-primary/30" : "bg-destructive/20 border-destructive/30";
                            return (
                              <div key={i} className={`p-2 rounded-lg border text-center ${bg}`}>
                                <div className="text-[9px] font-medium text-foreground truncate">{h.skill}</div>
                                <div className="text-[8px] text-muted-foreground">{h.strength}%</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "skills" && (
                  <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Strong */}
                    {analysisData.skillAnalysis?.strong?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-neon-green" /> Strong Skills ({analysisData.skillAnalysis.strong.length})
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {analysisData.skillAnalysis.strong.map((s, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${getStatusBg(skillStatuses[s.name] || "completed")} flex items-center justify-between`}>
                              <div>
                                <span className="text-xs font-medium text-foreground">{s.name}</span>
                                <p className="text-[10px] text-muted-foreground">{s.note}</p>
                              </div>
                              <span className="text-xs text-neon-green font-bold">{s.level}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Intermediate */}
                    {analysisData.skillAnalysis?.intermediate?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-neon-orange" /> Intermediate Skills ({analysisData.skillAnalysis.intermediate.length})
                        </h3>
                        <div className="space-y-2">
                          {analysisData.skillAnalysis.intermediate.map((s, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-muted/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground">{s.name}</span>
                                <select
                                  value={skillStatuses[s.name] || "practicing"}
                                  onChange={e => updateSkillStatus(s.name, e.target.value as SkillStatus)}
                                  className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-foreground"
                                >
                                  <option value="not_started">Not Started</option>
                                  <option value="learning">Learning</option>
                                  <option value="practicing">Practicing</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-neon-orange rounded-full" style={{ width: `${s.level}%` }} />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">{s.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing */}
                    {analysisData.skillAnalysis?.missing?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-destructive" /> Missing Skills ({analysisData.skillAnalysis.missing.length})
                        </h3>
                        <div className="space-y-2">
                          {analysisData.skillAnalysis.missing.map((s, i) => {
                            const req = analysisData.requiredSkills?.find(r => r.name.toLowerCase() === s.name.toLowerCase());
                            return (
                              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                className="p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:border-primary/30 transition-all"
                                onClick={() => setExpandedSkill(expandedSkill === s.name ? null : s.name)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-foreground">{s.name}</span>
                                    {s.priority && (
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                                        s.priority === "high" ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-neon-orange/10 border-neon-orange/30 text-neon-orange"
                                      }`}>{s.priority} priority</span>
                                    )}
                                  </div>
                                  <select
                                    value={skillStatuses[s.name] || "not_started"}
                                    onChange={e => { e.stopPropagation(); updateSkillStatus(s.name, e.target.value as SkillStatus); }}
                                    className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-foreground"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <option value="not_started">Not Started</option>
                                    <option value="learning">Learning</option>
                                    <option value="practicing">Practicing</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">{s.note}</p>
                                {req && expandedSkill === s.name && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-2 pt-2 border-t border-border space-y-1.5 text-[10px]">
                                    <div className="flex gap-4">
                                      <span className="text-muted-foreground">Demand: <span className={getImportanceColor(req.demandLevel)}>{req.demandLevel}</span></span>
                                      <span className="text-muted-foreground">Salary Impact: <span className="text-neon-green">{req.avgSalaryImpact}</span></span>
                                      <span className="text-muted-foreground">Est. {req.estimatedLearningWeeks} weeks</span>
                                    </div>
                                    <p className="text-muted-foreground">{req.description}</p>
                                  </motion.div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "learning" && (
                  <motion.div key="learning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {(analysisData.learningPlan || []).map((plan, i) => (
                      <div key={i} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" /> {plan.skill}
                          </h3>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {plan.weeks} weeks
                          </span>
                        </div>

                        {/* Resources */}
                        <div className="grid sm:grid-cols-3 gap-2 mb-3">
                          {(plan.resources || []).slice(0, 3).map((res, j) => (
                            <a key={j} href={res.url} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg border border-border bg-muted/30 hover:border-primary/30 transition-all block"
                            >
                              <div className="text-[9px] text-primary uppercase font-medium">{res.type}</div>
                              <div className="text-[10px] text-foreground truncate">{res.title}</div>
                              <div className="text-[9px] text-muted-foreground">{res.platform}</div>
                            </a>
                          ))}
                        </div>

                        {/* Project */}
                        {plan.project && (
                          <div className="p-3 rounded-lg border border-neon-purple/20 bg-neon-purple/5">
                            <div className="text-[9px] text-neon-purple uppercase font-medium mb-1">📋 Suggested Project</div>
                            <div className="text-xs text-foreground font-medium">{plan.project.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{plan.project.description}</div>
                          </div>
                        )}
                      </div>
                    ))}

                    {(!analysisData.learningPlan || analysisData.learningPlan.length === 0) && (
                      <div className="glass-card p-8 text-center text-muted-foreground text-sm">
                        No learning plan data available. Try re-analyzing.
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "impact" && (
                  <motion.div key="impact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Career Impact */}
                    {analysisData.careerImpact?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-neon-green" /> Career Impact Simulation
                        </h3>
                        <div className="space-y-2">
                          {analysisData.careerImpact.map((item, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-medium text-foreground">Learning {item.skill}</span>
                                <p className="text-[10px] text-muted-foreground">{item.impact}</p>
                              </div>
                              <span className="text-xs text-neon-green font-bold">{item.salaryBoost}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Salary */}
                    {analysisData.salaryPrediction && (
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-neon-green" /> Salary Growth Path
                        </h3>
                        <div className="flex items-end gap-4 justify-center h-40">
                          {[
                            { label: "Current", value: analysisData.salaryPrediction.current, h: 30, color: "bg-muted-foreground" },
                            { label: "With Skills", value: analysisData.salaryPrediction.withMissingSkills, h: 60, color: "bg-neon-orange" },
                            { label: "Full Potential", value: analysisData.salaryPrediction.potential, h: 90, color: "bg-neon-green" },
                          ].map((bar, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
                              <span className="text-[10px] font-medium text-foreground">{bar.value}</span>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${bar.h}%` }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                className={`w-full max-w-[60px] rounded-t-lg ${bar.color}`}
                              />
                              <span className="text-[9px] text-muted-foreground text-center">{bar.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mastery Predictor */}
                    {analysisData.learningPlan?.length > 0 && (
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" /> Skill Mastery Timeline
                        </h3>
                        <div className="space-y-2">
                          {analysisData.learningPlan.map((plan, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-foreground w-28 truncate">{plan.skill}</span>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (plan.weeks / 12) * 100)}%` }}
                                  transition={{ delay: i * 0.05 }}
                                  className="h-full bg-primary rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-16 text-right">{plan.weeks} weeks</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
