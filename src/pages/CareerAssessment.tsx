import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, ArrowRight, CheckCircle2, Loader2, Brain, TrendingUp,
  Sparkles, RefreshCw, DollarSign, Shield, Globe, MessageSquare,
  Zap, BarChart3, Clock, BookOpen, AlertTriangle, Briefcase,
  ChevronRight, Send, Users, Award, Flame, ArrowUpRight,
  Upload, FileText, Heart, Route, Gauge, GraduationCap, X
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, Cell
} from "recharts";

// ─── Constants ───
const questions = [
  { q: "What type of work excites you the most?", options: ["Building systems & products", "Analyzing data & finding insights", "Creative design & user experience", "Leading teams & strategy"] },
  { q: "Which best describes your preferred work style?", options: ["Deep focus on technical problems", "Collaborating with diverse teams", "Experimenting with new ideas", "Structured & process-oriented"] },
  { q: "What subject were you best at in school?", options: ["Mathematics & Science", "Computer Science & Programming", "Art, Design & Communication", "Business & Economics"] },
  { q: "Which skill comes most naturally to you?", options: ["Logical reasoning & coding", "Statistical analysis & research", "Visual design & storytelling", "Communication & leadership"] },
  { q: "Where do you see yourself in 5 years?", options: ["Building AI/ML products", "Leading a data science team", "Running my own startup", "Consulting at a top firm"] },
];

const ALL_INTERESTS = [
  "Data Analysis", "Artificial Intelligence", "Programming", "Cybersecurity",
  "Cloud Computing", "Business Strategy", "UI/UX Design", "Product Management",
  "Software Development", "Research", "Machine Learning", "Web Development",
  "Mobile Development", "DevOps", "Blockchain", "Game Development",
];

// ─── Types ───
interface CareerMatch { title: string; match: number; description: string; avgSalary: string; growth: string; demandLevel: string; }
interface CareerProb { career: string; probability: number; factors: string[]; }
interface SkillImpactItem { skill: string; careerImpact: string; salaryBoost: string; timeToLearn: string; }
interface RiskItem { risk: string; severity: string; alternative: string; timeframe: string; }
interface OpportunityItem { type: string; title: string; description: string; matchScore: number; }
interface TimelineStep { year: number; role: string; salary: string; skills: string[]; }
interface ScenarioItem { scenario: string; outcome: string; probability: number; }
interface GlobalOp { country: string; demand: string; avgSalary: string; topCities: string[]; }
interface MentorRec { type: string; name: string; description: string; url: string; }
interface ChatMsg { role: "user" | "assistant"; content: string; }
interface SkillEntry { skill: string; level: number; evidence?: string; }
interface CareerRoute { name: string; duration: string; skills: string[]; intensity: string; }

interface AnalysisData {
  careerScore: { overall: number; factors: Record<string, number> };
  topCareers: CareerMatch[];
  careerProbabilities: CareerProb[];
  marketIntelligence: {
    trendingCareers: Array<{ title: string; growth: string; demand: string }>;
    topDemandedSkills: Array<{ skill: string; demand: number; salaryImpact: string }>;
    salaryRanges: Array<{ role: string; entry: string; mid: string; senior: string }>;
    industryGrowth: Array<{ industry: string; rate: string; outlook: string }>;
  };
  skillImpact: SkillImpactItem[];
  careerRisks: RiskItem[];
  opportunities: OpportunityItem[];
  digitalTwin: { timeline: TimelineStep[] };
  weeklyReport: { summary: string; recommendations: string[]; focusArea: string };
  scenarioSimulations: ScenarioItem[];
  globalOpportunities: GlobalOp[];
  mentorRecommendations: MentorRec[];
  skillStrength?: { strong: SkillEntry[]; developing: SkillEntry[]; missing: SkillEntry[] };
  resumeInsights?: { extractedSkills: string[]; strengthAreas: string[]; improvementAreas: string[]; atsScore: number };
  learningEfficiency?: { estimatedLearningSpeed: string; recommendedStrategy: string; weeklyHoursNeeded: number };
  careerRoutes?: CareerRoute[];
}

type Phase = "discovery" | "quiz" | "loading" | "results";
type DiscoveryStep = "resume" | "interests" | "confirm";

export default function CareerAssessment() {
  // Phase state
  const [phase, setPhase] = useState<Phase>("discovery");
  const [discoveryStep, setDiscoveryStep] = useState<DiscoveryStep>("resume");

  // Discovery state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  // Analysis state
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "discovery" | "market" | "twin" | "risks" | "chat">("overview");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scenario state
  const [scenarioInput, setScenarioInput] = useState("");
  const [scenarioResult, setScenarioResult] = useState<any>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safely convert any value (string, object, array) to a displayable string
  const toDisplayString = (val: any): string => {
    if (val == null) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.map(toDisplayString).join(", ");
    if (typeof val === "object") return Object.values(val).filter(Boolean).map(toDisplayString).join(", ");
    return String(val);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // ─── Resume Upload ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);

    let text = "";
    if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      text = await file.text();
    } else if (file.type === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: any) => item.str).join(" "));
        }
        text = pages.join("\n");
      } catch { toast.error("Could not parse PDF"); return; }
    } else {
      text = await file.text();
    }

    setResumeText(text);
    if (text.length > 50) {
      setResumeParsing(true);
      try {
        const { data, error } = await supabase.functions.invoke("career-advisor", {
          body: { action: "extract_resume", resumeText: text.slice(0, 8000) },
        });
        if (error) throw error;
        if (data && !data.error) {
          // Normalize: flatten skills if AI returned categorized object
          const flattenSkills = (val: any): string[] => {
            if (Array.isArray(val)) return val.map(v => typeof v === "string" ? v : toDisplayString(v));
            if (val && typeof val === "object") {
              return Object.values(val).flat().map((v: any) => typeof v === "string" ? v : toDisplayString(v));
            }
            return [];
          };
          const normalized = {
            ...data,
            skills: flattenSkills(data.skills),
            education: toDisplayString(data.education),
            experience: toDisplayString(data.experience),
            projects: Array.isArray(data.projects) ? data.projects.map((p: any) => toDisplayString(p)) : [],
            summary: toDisplayString(data.summary),
          };
          setResumeData(normalized);
          toast.success("Resume analyzed successfully!");
        }
      } catch { toast.error("Resume parsing failed"); }
      finally { setResumeParsing(false); }
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // ─── Quiz ───
  const handleAnswer = (optIdx: number) => {
    const newAnswers = [...answers, optIdx];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      runFullAnalysis(newAnswers);
    }
  };

  // ─── Skip quiz and go straight to analysis ───
  const skipToAnalysis = () => {
    runFullAnalysis([]);
  };

  // ─── Analysis ───
  const runFullAnalysis = async (assessmentAnswers: number[]) => {
    setPhase("loading");
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-advisor", {
        body: {
          action: "full_analysis",
          assessmentAnswers,
          interests: selectedInterests,
          resumeSkills: resumeData?.skills || [],
          resumeSummary: resumeText.slice(0, 3000),
          education: resumeData?.education || "",
          experience: resumeData?.experience || "",
          projects: resumeData?.projects?.join(", ") || "",
        },
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); setPhase("discovery"); return; }
      setAnalysis(data);
      setPhase("results");
      toast.success("Career analysis complete!");
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Please try again.");
      setPhase("discovery");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Chat ───
  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: chatInput.trim() };
    const allMessages = [...chatMessages, userMsg];
    setChatMessages(allMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-advisor`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          action: "chat", messages: allMessages,
          userContext: { careerScore: analysis?.careerScore?.overall, targetCareer: analysis?.topCareers?.[0]?.title, skills: resumeData?.skills || [], interests: selectedInterests },
        }),
      });
      if (!resp.ok || !resp.body) throw new Error("Stream failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", assistantText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const delta = JSON.parse(json).choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
                return [...prev, { role: "assistant", content: assistantText }];
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch { toast.error("Chat failed"); }
    finally { setChatLoading(false); }
  };

  // ─── Scenario ───
  const handleScenario = async () => {
    if (!scenarioInput.trim()) return;
    setScenarioLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-advisor", {
        body: { action: "simulate_scenario", scenario: scenarioInput, currentProfile: { topCareer: analysis?.topCareers?.[0]?.title, score: analysis?.careerScore?.overall, interests: selectedInterests } },
      });
      if (error) throw error;
      setScenarioResult(data);
    } catch { toast.error("Simulation failed"); }
    finally { setScenarioLoading(false); }
  };

  const reset = () => {
    setPhase("discovery"); setDiscoveryStep("resume");
    setCurrentQ(0); setAnswers([]);
    setAnalysis(null); setChatMessages([]); setActiveTab("overview");
    setScenarioResult(null); setResumeFile(null); setResumeText("");
    setResumeData(null); setSelectedInterests([]);
  };

  const TABS = [
    { id: "overview" as const, label: "Overview", icon: Sparkles },
    { id: "discovery" as const, label: "Discovery", icon: Route },
    { id: "market" as const, label: "Market Intel", icon: TrendingUp },
    { id: "twin" as const, label: "Digital Twin", icon: Brain },
    { id: "risks" as const, label: "Risks & Ops", icon: Shield },
    { id: "chat" as const, label: "AI Chat", icon: MessageSquare },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" /> Career AI – Smart Career Discovery
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {phase === "discovery" ? "Upload your resume & select interests to discover your ideal career" :
               phase === "quiz" ? `Quick assessment – Question ${currentQ + 1}/${questions.length}` :
               phase === "loading" ? "AI is analyzing your profile…" :
               `Career Score: ${analysis?.careerScore?.overall || 0}/100`}
            </p>
          </div>
          {phase !== "discovery" && (
            <Button size="sm" variant="outline" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" /> Start Over</Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── DISCOVERY PHASE ─── */}
          {phase === "discovery" && (
            <motion.div key="discovery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-6">

              {/* Step indicators */}
              <div className="flex items-center gap-3 justify-center">
                {(["resume", "interests", "confirm"] as DiscoveryStep[]).map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <button onClick={() => setDiscoveryStep(step)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        discoveryStep === step ? "bg-primary text-primary-foreground" :
                        (step === "interests" && (discoveryStep === "confirm")) || (step === "resume" && discoveryStep !== "resume")
                          ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                      {i + 1}
                    </button>
                    {i < 2 && <div className="w-12 h-0.5 bg-border" />}
                  </div>
                ))}
              </div>

              {/* STEP 1: Resume Upload */}
              {discoveryStep === "resume" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">Upload Your Resume</h2>
                      <p className="text-xs text-muted-foreground">We'll extract your skills, experience, and education automatically</p>
                    </div>
                  </div>

                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.doc,.docx" onChange={handleFileUpload} className="hidden" />

                  {!resumeFile ? (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-10 text-center transition-all group">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                      <p className="text-sm text-foreground font-medium">Click to upload resume</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, TXT, MD supported</p>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-neon-green/20 bg-neon-green/5">
                        <CheckCircle2 className="w-5 h-5 text-neon-green" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground font-medium">{resumeFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => { setResumeFile(null); setResumeText(""); setResumeData(null); }}>
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>

                      {resumeParsing && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Extracting skills from resume…
                        </div>
                      )}

                      {resumeData && (
                        <div className="space-y-3">
                          {resumeData.skills?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-foreground mb-2">Extracted Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {resumeData.skills.map((s: string, i: number) => (
                                  <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] border border-primary/30">{toDisplayString(s)}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {resumeData.education && (
                            <div className="flex items-start gap-2 text-xs">
                              <GraduationCap className="w-4 h-4 text-neon-purple mt-0.5" />
                              <div>
                                <span className="text-muted-foreground">Education: </span>
                                <span className="text-foreground">{toDisplayString(resumeData.education)}</span>
                              </div>
                            </div>
                          )}
                          {resumeData.experience && (
                            <div className="flex items-start gap-2 text-xs">
                              <Briefcase className="w-4 h-4 text-neon-green mt-0.5" />
                              <div>
                                <span className="text-muted-foreground">Experience: </span>
                                <span className="text-foreground">{toDisplayString(resumeData.experience)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setDiscoveryStep("interests")} className="text-muted-foreground">
                      Skip this step <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                    <Button size="sm" onClick={() => setDiscoveryStep("interests")} disabled={resumeParsing}>
                      Continue <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Interest Selection */}
              {discoveryStep === "interests" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">Select Your Interests</h2>
                      <p className="text-xs text-muted-foreground">Choose areas that excite you – this helps us find the best career matches</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ALL_INTERESTS.map(interest => (
                      <button key={interest} onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-lg border text-xs font-medium text-left transition-all ${
                          selectedInterests.includes(interest)
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "border-border bg-muted/20 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                        }`}>
                        <span className="flex items-center gap-1.5">
                          {selectedInterests.includes(interest) && <CheckCircle2 className="w-3 h-3" />}
                          {interest}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedInterests.length > 0 && (
                    <p className="text-xs text-neon-green">{selectedInterests.length} interests selected</p>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setDiscoveryStep("resume")}>
                      ← Back
                    </Button>
                    <Button size="sm" onClick={() => setDiscoveryStep("confirm")}>
                      Continue <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Confirm & Launch */}
              {discoveryStep === "confirm" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-neon-green" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">Ready to Discover Your Career</h2>
                      <p className="text-xs text-muted-foreground">Review your profile and choose how to proceed</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-border bg-muted/20 text-center">
                      <FileText className="w-5 h-5 mx-auto text-primary mb-1" />
                      <div className="text-xs font-medium text-foreground">{resumeFile ? "Resume Uploaded" : "No Resume"}</div>
                      <div className="text-[10px] text-muted-foreground">{resumeData?.skills?.length || 0} skills extracted</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-muted/20 text-center">
                      <Heart className="w-5 h-5 mx-auto text-neon-purple mb-1" />
                      <div className="text-xs font-medium text-foreground">{selectedInterests.length} Interests</div>
                      <div className="text-[10px] text-muted-foreground">{selectedInterests.slice(0, 3).join(", ")}{selectedInterests.length > 3 ? "…" : ""}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-muted/20 text-center">
                      <Gauge className="w-5 h-5 mx-auto text-neon-green mb-1" />
                      <div className="text-xs font-medium text-foreground">AI Analysis</div>
                      <div className="text-[10px] text-muted-foreground">Score, matches & insights</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setDiscoveryStep("interests")}>← Back</Button>
                    <Button className="flex-1" onClick={() => { setPhase("quiz"); }}>
                      <Brain className="w-4 h-4 mr-2" /> Take Quick Quiz + AI Analysis
                    </Button>
                    <Button className="flex-1" variant="secondary" onClick={skipToAnalysis}>
                      <Zap className="w-4 h-4 mr-2" /> Skip Quiz → AI Analysis Now
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── QUIZ PHASE ─── */}
          {phase === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto">
              <div className="glass-card p-8">
                <div className="flex items-center gap-2 mb-6">
                  {questions.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentQ ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {questions.length}</div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-6">{questions[currentQ].q}</h2>
                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(i)}
                      className="w-full text-left glass-card-hover p-4 text-sm text-foreground flex items-center justify-between group">
                      {opt}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── LOADING ─── */}
          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-20 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full animate-pulse-glow border-2 border-primary/30" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="font-display text-lg font-bold text-foreground">Analyzing Your Career Profile</h2>
                <p className="text-sm text-muted-foreground">AI is processing your resume, interests, market data, and career trajectories…</p>
              </div>
            </motion.div>
          )}

          {/* ─── RESULTS DASHBOARD ─── */}
          {phase === "results" && analysis && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Score + Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="glass-card p-4 text-center sm:col-span-1">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className={`font-display text-2xl font-bold ${(analysis.careerScore?.overall || 0) >= 70 ? "text-neon-green" : (analysis.careerScore?.overall || 0) >= 40 ? "text-neon-orange" : "text-destructive"}`}>
                    {analysis.careerScore?.overall || 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Career Score</div>
                </div>
                {Object.entries(analysis.careerScore?.factors || {}).map(([key, val]) => (
                  <div key={key} className="glass-card p-4 text-center">
                    <div className="text-lg mb-1">{key === "skills" ? "💡" : key === "projects" ? "📋" : key === "experience" ? "💼" : "📈"}</div>
                    <div className="font-display text-lg font-bold text-primary">{val as number}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{key}</div>
                  </div>
                ))}
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
                  <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-6">
                    {/* Top Careers */}
                    <div className="lg:col-span-2 glass-card p-5">
                      <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                        <Award className="w-4 h-4 text-neon-purple" /> Top Career Matches
                      </h3>
                      <div className="space-y-3">
                        {(analysis.topCareers || []).map((c, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/20">
                            <div className={`font-display text-2xl font-bold w-16 text-center ${c.match >= 80 ? "text-neon-green" : c.match >= 60 ? "text-neon-orange" : "text-primary"}`}>
                              {c.match}%
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{c.title}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${c.demandLevel === "high" ? "bg-neon-green/10 border-neon-green/30 text-neon-green" : "bg-primary/10 border-primary/30 text-primary"}`}>
                                  {c.demandLevel} demand
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">{c.description}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="text-xs text-neon-green font-mono">{c.avgSalary}</div>
                              <div className="text-[9px] text-muted-foreground">{c.growth} growth</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground">Career Probability</h3>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={(analysis.careerProbabilities || []).slice(0, 5)} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} />
                            <YAxis type="category" dataKey="career" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} width={80} />
                            <Bar dataKey="probability" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4 text-neon-orange" /> Skill Impact
                        </h3>
                        <div className="space-y-2">
                          {(analysis.skillImpact || []).slice(0, 4).map((s, i) => (
                            <div key={i} className="p-2 rounded-lg border border-border bg-muted/20 text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-foreground font-medium">{s.skill}</span>
                                <span className="text-neon-green">{s.salaryBoost}</span>
                              </div>
                              <p className="text-muted-foreground mt-0.5">{s.careerImpact}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {analysis.weeklyReport && (
                        <div className="glass-card p-5">
                          <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" /> Weekly Focus
                          </h3>
                          <p className="text-[10px] text-muted-foreground mb-2">{analysis.weeklyReport.summary}</p>
                          <div className="space-y-1">
                            {(analysis.weeklyReport.recommendations || []).map((r, i) => (
                              <div key={i} className="text-[10px] text-foreground flex items-start gap-1.5">
                                <ArrowUpRight className="w-3 h-3 text-primary mt-0.5 shrink-0" /> {r}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scenario Simulator */}
                    <div className="lg:col-span-3 glass-card p-5">
                      <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                        <Brain className="w-4 h-4 text-neon-purple" /> Career Scenario Simulator
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex gap-2 mb-3">
                            <input value={scenarioInput} onChange={e => setScenarioInput(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && handleScenario()}
                              placeholder="e.g. Learn Machine Learning, Get AWS certified..."
                              className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                            <Button size="sm" onClick={handleScenario} disabled={scenarioLoading}>
                              {scenarioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simulate"}
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(analysis.scenarioSimulations || []).map((s, i) => (
                              <button key={i} onClick={() => setScenarioInput(s.scenario)}
                                className="px-2 py-1 rounded-full border border-border bg-muted/50 text-[10px] text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all">
                                {s.scenario}
                              </button>
                            ))}
                          </div>
                        </div>
                        {scenarioResult?.impact && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg border border-neon-purple/20 bg-neon-purple/5 space-y-2">
                            <div className="text-xs font-medium text-foreground">{scenarioResult.scenario}</div>
                            <p className="text-[10px] text-muted-foreground">{scenarioResult.impact.careerShift}</p>
                            <div className="flex gap-3 text-[10px]">
                              <span className="text-neon-green">Salary: {scenarioResult.impact.salaryChange}</span>
                              <span className="text-muted-foreground">Time: {scenarioResult.impact.timeframe}</span>
                              <span className={scenarioResult.impact.riskLevel === "low" ? "text-neon-green" : "text-neon-orange"}>Risk: {scenarioResult.impact.riskLevel}</span>
                            </div>
                            <p className="text-[10px] text-primary">{scenarioResult.impact.recommendation}</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── DISCOVERY TAB ── */}
                {activeTab === "discovery" && (
                  <motion.div key="disc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Skill Strength Analysis */}
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-neon-green" /> Skill Strength Analysis
                        </h3>
                        {analysis.skillStrength ? (
                          <div className="space-y-4">
                            {[
                              { label: "Strong Skills", items: analysis.skillStrength.strong, color: "neon-green", icon: "💪" },
                              { label: "Developing Skills", items: analysis.skillStrength.developing, color: "neon-orange", icon: "📈" },
                              { label: "Missing Skills", items: analysis.skillStrength.missing, color: "destructive", icon: "🔍" },
                            ].map(cat => (
                              <div key={cat.label}>
                                <p className="text-xs font-medium text-foreground mb-2">{cat.icon} {cat.label}</p>
                                <div className="space-y-1.5">
                                  {(cat.items || []).map((s, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <span className="text-[10px] text-foreground w-20 truncate">{s.skill}</span>
                                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full bg-${cat.color}`} style={{ width: `${Math.max(s.level, 5)}%` }} />
                                      </div>
                                      <span className={`text-[9px] font-mono text-${cat.color}`}>{s.level}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(analysis.skillImpact || []).map((s, i) => (
                              <div key={i} className="p-2 rounded-lg border border-border bg-muted/20 text-[10px]">
                                <span className="text-foreground font-medium">{s.skill}</span>
                                <span className="text-muted-foreground ml-2">{s.careerImpact}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Skill Radar */}
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" /> Skill Radar
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <RadarChart data={(analysis.skillImpact || []).slice(0, 6).map(s => ({
                            skill: s.skill,
                            impact: parseInt(s.salaryBoost.replace(/[^0-9]/g, "")) || 50,
                            time: parseInt(s.timeToLearn) || 4,
                          }))}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                            <PolarRadiusAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} />
                            <Radar name="Impact" dataKey="impact" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Career Routes / GPS */}
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Route className="w-4 h-4 text-neon-cyan" /> Career GPS – Routes
                        </h3>
                        <div className="space-y-3">
                          {(analysis.careerRoutes || [
                            { name: "Fast Track", duration: "12 months", skills: ["Core skills"], intensity: "high" },
                            { name: "Balanced", duration: "18 months", skills: ["Core + extras"], intensity: "medium" },
                            { name: "Expert", duration: "24 months", skills: ["Full mastery"], intensity: "low" },
                          ]).map((route, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${i === 0 ? "border-neon-green/30 bg-neon-green/5" : i === 1 ? "border-primary/30 bg-primary/5" : "border-neon-purple/30 bg-neon-purple/5"}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground">{route.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${route.intensity === "high" ? "border-neon-orange/30 text-neon-orange" : route.intensity === "medium" ? "border-primary/30 text-primary" : "border-neon-green/30 text-neon-green"}`}>
                                  {route.intensity} intensity
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mb-1">⏱ {route.duration}</div>
                              <div className="flex flex-wrap gap-1">
                                {route.skills.map((sk, j) => (
                                  <span key={j} className="px-1.5 py-0.5 rounded-full bg-muted text-[9px] text-foreground">{sk}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resume Insights */}
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-neon-orange" /> Resume Insights
                        </h3>
                        {analysis.resumeInsights ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div className={`font-display text-2xl font-bold ${(analysis.resumeInsights.atsScore || 0) >= 70 ? "text-neon-green" : "text-neon-orange"}`}>
                                  {analysis.resumeInsights.atsScore}
                                </div>
                                <div className="text-[9px] text-muted-foreground">ATS Score</div>
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] text-muted-foreground mb-1">Strengths</p>
                                <div className="flex flex-wrap gap-1">
                                  {(analysis.resumeInsights.strengthAreas || []).map((a, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-[9px]">{a}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Improvements</p>
                              {(analysis.resumeInsights.improvementAreas || []).map((a, i) => (
                                <div key={i} className="text-[10px] text-foreground flex items-start gap-1.5 mb-0.5">
                                  <ArrowUpRight className="w-3 h-3 text-neon-orange mt-0.5 shrink-0" /> {a}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Upload a resume to get AI-powered resume insights.</p>
                        )}
                      </div>

                      {/* Learning Efficiency */}
                      {analysis.learningEfficiency && (
                        <div className="lg:col-span-2 glass-card p-5">
                          <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> Learning Efficiency Analysis
                          </h3>
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg border border-border bg-muted/20 text-center">
                              <div className="text-lg mb-1">⚡</div>
                              <div className="text-xs font-medium text-foreground capitalize">{analysis.learningEfficiency.estimatedLearningSpeed}</div>
                              <div className="text-[9px] text-muted-foreground">Learning Speed</div>
                            </div>
                            <div className="p-3 rounded-lg border border-border bg-muted/20 text-center">
                              <div className="text-lg mb-1">🕐</div>
                              <div className="text-xs font-medium text-foreground">{analysis.learningEfficiency.weeklyHoursNeeded}h/week</div>
                              <div className="text-[9px] text-muted-foreground">Recommended</div>
                            </div>
                            <div className="p-3 rounded-lg border border-border bg-muted/20">
                              <div className="text-lg mb-1">📋</div>
                              <div className="text-[10px] text-foreground">{analysis.learningEfficiency.recommendedStrategy}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── MARKET INTEL TAB ── */}
                {activeTab === "market" && (
                  <motion.div key="mkt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Flame className="w-4 h-4 text-neon-orange" /> Trending Careers
                        </h3>
                        <div className="space-y-2">
                          {(analysis.marketIntelligence?.trendingCareers || []).map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                              <span className="text-xs text-foreground">{c.title}</span>
                              <div className="flex gap-3 text-[10px]">
                                <span className="text-neon-green">{c.growth}</span>
                                <span className={c.demand === "very high" ? "text-neon-green" : "text-neon-orange"}>{c.demand}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" /> Most Demanded Skills
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={(analysis.marketIntelligence?.topDemandedSkills || []).slice(0, 6)}>
                            <XAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                            <Bar dataKey="demand" fill="hsl(var(--neon-green))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-neon-green" /> Salary Ranges
                        </h3>
                        <div className="space-y-3">
                          {(analysis.marketIntelligence?.salaryRanges || []).map((s, i) => (
                            <div key={i} className="space-y-1">
                              <div className="text-xs text-foreground font-medium">{s.role}</div>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground w-14">{s.entry}</span>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                                  <div className="h-full bg-gradient-to-r from-primary/50 via-neon-green/60 to-neon-green rounded-full" style={{ width: "100%" }} />
                                </div>
                                <span className="text-neon-green w-14 text-right">{s.senior}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-neon-purple" /> Industry Growth
                        </h3>
                        <div className="space-y-2">
                          {(analysis.marketIntelligence?.industryGrowth || []).map((g, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                              <div>
                                <span className="text-xs text-foreground font-medium">{g.industry}</span>
                                <span className={`text-[9px] ml-2 px-1.5 py-0.5 rounded-full border ${g.outlook === "Excellent" ? "bg-neon-green/10 border-neon-green/30 text-neon-green" : "bg-primary/10 border-primary/30 text-primary"}`}>{g.outlook}</span>
                              </div>
                              <span className="text-xs text-neon-green font-mono">{g.rate}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-2 glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" /> Global Career Opportunities
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {(analysis.globalOpportunities || []).map((g, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-muted/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground">{g.country}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${g.demand === "very high" ? "bg-neon-green/10 border-neon-green/30 text-neon-green" : "bg-neon-orange/10 border-neon-orange/30 text-neon-orange"}`}>{g.demand}</span>
                              </div>
                              <div className="text-[10px] text-neon-green font-mono mb-1">{g.avgSalary}</div>
                              <div className="text-[9px] text-muted-foreground">{g.topCities.join(", ")}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── DIGITAL TWIN TAB ── */}
                {activeTab === "twin" && (
                  <motion.div key="twin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="glass-card p-5">
                      <h3 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                        <Brain className="w-4 h-4 text-neon-purple" /> Career Digital Twin – Your Future Timeline
                      </h3>
                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                        <div className="space-y-6">
                          {(analysis.digitalTwin?.timeline || []).map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                              className="relative pl-14">
                              <div className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${i === 0 ? "border-primary bg-primary/20 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                                {step.year}
                              </div>
                              <div className="glass-card p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-foreground">{step.role}</span>
                                  <span className="text-xs text-neon-green font-mono">{step.salary}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {(step.skills || []).map((sk, j) => (
                                    <span key={j} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] border border-primary/30">{sk}</span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-5">
                      <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-neon-green" /> Projected Salary Growth
                      </h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={(analysis.digitalTwin?.timeline || []).map(t => ({
                          year: `Year ${t.year}`,
                          salary: parseInt(t.salary.replace(/[^0-9]/g, "")) || 0,
                        }))}>
                          <defs>
                            <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--neon-green))" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(var(--neon-green))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                          <Area type="monotone" dataKey="salary" stroke="hsl(var(--neon-green))" fill="url(#salaryGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="glass-card p-5">
                      <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-neon-cyan" /> Recommended Communities & Mentors
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(analysis.mentorRecommendations || []).map((m, i) => (
                          <a key={i} href={m.url} target="_blank" rel="noopener noreferrer"
                            className="p-3 rounded-lg border border-border bg-muted/20 hover:border-primary/30 transition-all block">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] uppercase text-primary font-medium">{m.type}</span>
                            </div>
                            <div className="text-xs font-medium text-foreground">{m.name}</div>
                            <div className="text-[10px] text-muted-foreground">{m.description}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── RISKS & OPPORTUNITIES TAB ── */}
                {activeTab === "risks" && (
                  <motion.div key="risks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-neon-orange" /> Career Risks
                        </h3>
                        <div className="space-y-3">
                          {(analysis.careerRisks || []).map((r, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-muted/20">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-foreground">{r.risk}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${r.severity === "high" ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-neon-orange/10 border-neon-orange/30 text-neon-orange"}`}>{r.severity}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">⏱ {r.timeframe}</p>
                              <p className="text-[10px] text-neon-green mt-1">✅ {r.alternative}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-card p-5">
                        <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-neon-green" /> Career Opportunities
                        </h3>
                        <div className="space-y-3">
                          {(analysis.opportunities || []).map((o, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-muted/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] uppercase font-medium text-primary">{o.type}</span>
                                <span className="text-[10px] text-neon-green">{o.matchScore}% match</span>
                              </div>
                              <div className="text-xs font-medium text-foreground">{o.title}</div>
                              <p className="text-[10px] text-muted-foreground">{o.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── AI CHAT TAB ── */}
                {activeTab === "chat" && (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 flex flex-col" style={{ height: "500px" }}>
                    <h3 className="font-display text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> Career AI Chat Assistant
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-10 space-y-3">
                          <Brain className="w-10 h-10 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">Ask me anything about your career!</p>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {["What skills should I learn next?", "How can I increase my career score?", "What projects should I build?"].map(q => (
                              <button key={q} onClick={() => setChatInput(q)}
                                className="px-2 py-1 rounded-full border border-border bg-muted/50 text-[10px] text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all">
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] p-3 rounded-xl text-xs ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 border border-border text-foreground"}`}>
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                            ) : msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="p-3 rounded-xl bg-muted/60 border border-border">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleChat()}
                        placeholder="Ask about your career..."
                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                      <Button size="sm" onClick={handleChat} disabled={chatLoading}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
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
