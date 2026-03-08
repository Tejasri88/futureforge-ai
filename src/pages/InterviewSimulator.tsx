import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, MessageSquare, ThumbsUp, ThumbsDown, RotateCcw, Loader2,
  Cpu, Globe, Shield, Cloud, Briefcase, Palette, Code2, BarChart3,
  User, Zap, Target, Award, ChevronRight, Sparkles, TrendingUp,
  BookOpen, CheckCircle2, XCircle, ArrowRight, Monitor, PlayCircle
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useVoice } from "@/hooks/useVoice";
import VoiceControls from "@/components/VoiceControls";
import ScreeningInterview from "@/components/ScreeningInterview";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const INTERVIEW_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-simulator`;

const domains = [
  { id: "Artificial Intelligence", icon: Brain, color: "text-[hsl(var(--neon-cyan))]" },
  { id: "Data Science", icon: BarChart3, color: "text-[hsl(var(--neon-purple))]" },
  { id: "Web Development", icon: Globe, color: "text-[hsl(var(--neon-green))]" },
  { id: "Software Engineering", icon: Code2, color: "text-[hsl(var(--neon-orange))]" },
  { id: "Cybersecurity", icon: Shield, color: "text-[hsl(var(--neon-pink))]" },
  { id: "Cloud Computing", icon: Cloud, color: "text-[hsl(var(--neon-cyan))]" },
  { id: "Product Management", icon: Briefcase, color: "text-[hsl(var(--neon-purple))]" },
  { id: "UI/UX Design", icon: Palette, color: "text-[hsl(var(--neon-green))]" },
];

const personalities = [
  { id: "friendly", label: "Friendly", desc: "Warm & encouraging", icon: "😊" },
  { id: "strict", label: "Strict", desc: "Rigorous & direct", icon: "🧐" },
  { id: "startup", label: "Startup", desc: "Casual & creative", icon: "🚀" },
  { id: "faang", label: "FAANG", desc: "Algorithmic & thorough", icon: "💎" },
];

const rounds = [
  { id: "HR", label: "HR Round", icon: User, questions: 2 },
  { id: "Technical", label: "Technical Round", icon: Cpu, questions: 3 },
  { id: "Problem Solving", label: "Problem Solving", icon: Target, questions: 2 },
  { id: "Behavioral", label: "Behavioral Round", icon: MessageSquare, questions: 2 },
];

type InterviewMode = "practice" | "screening";
type Step = "domain" | "personality" | "mode" | "interview" | "evaluating" | "feedback" | "report" | "screening";

interface QAEntry {
  round: string;
  question: string;
  answer: string;
  score: any | null;
}

interface FinalReport {
  overallScore: number;
  domainKnowledge: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  technicalScore: number;
  summary: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  resources: { title: string; description: string; type: string }[];
  interviewReadiness: string;
  nextSteps: string;
}

async function callInterviewAPI(body: any) {
  const resp = await fetch(INTERVIEW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return resp.json();
}

export default function InterviewSimulator() {
  const [step, setStep] = useState<Step>("domain");
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("practice");
  const [domain, setDomain] = useState("");
  const [personality, setPersonality] = useState("friendly");
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentQInRound, setCurrentQInRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QAEntry[]>([]);
  const [currentEval, setCurrentEval] = useState<any>(null);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const voice = useVoice();

  const totalQuestions = rounds.reduce((s, r) => s + r.questions, 0);
  const completedQuestions = history.length;
  const currentRound = rounds[currentRoundIdx];

  // Adapt difficulty based on scores
  const adaptDifficulty = useCallback((scores: any) => {
    const avg = (scores.technicalAccuracy + scores.depthOfKnowledge + scores.problemSolving) / 3;
    if (avg >= 8) return "advanced";
    if (avg >= 5) return "intermediate";
    return "beginner";
  }, []);

  const fetchNextQuestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await callInterviewAPI({
        action: "generate_question",
        domain,
        round: currentRound.id,
        difficulty,
        personality,
        previousQA: history.slice(-4),
      });
      setCurrentQuestion(data.question);
      setStep("interview");
      // Speak the question aloud
      voice.speak(data.question);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate question");
    } finally {
      setIsLoading(false);
    }
  }, [domain, currentRound, difficulty, personality, history, voice]);

  // Sync voice transcript into answer
  useEffect(() => {
    if (voice.transcript && voice.isListening) {
      setAnswer(voice.transcript);
    }
  }, [voice.transcript, voice.isListening]);

  const handleToggleMic = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.clearTranscript();
      setAnswer("");
      voice.startListening();
    }
  }, [voice]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }
    voice.stopListening();
    voice.stopSpeaking();
    setStep("evaluating");
    setIsLoading(true);
    try {
      const evalData = await callInterviewAPI({
        action: "evaluate_answer",
        domain,
        personality,
        question: currentQuestion,
        answer: answer.trim(),
      });
      const entry: QAEntry = { round: currentRound.id, question: currentQuestion, answer: answer.trim(), score: evalData };
      setHistory(prev => [...prev, entry]);
      setCurrentEval(evalData);
      setDifficulty(adaptDifficulty(evalData));
      setStep("feedback");
      // Speak feedback
      if (evalData.suggestedImprovement) {
        voice.speak(`Your score is ${evalData.overallScore} out of 10. ${evalData.suggestedImprovement}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to evaluate answer");
      setStep("interview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    setCurrentEval(null);
    voice.stopSpeaking();
    voice.clearTranscript();
    const nextQ = currentQInRound + 1;
    if (nextQ < currentRound.questions) {
      setCurrentQInRound(nextQ);
      fetchNextQuestion();
    } else {
      const nextRound = currentRoundIdx + 1;
      if (nextRound < rounds.length) {
        setCurrentRoundIdx(nextRound);
        setCurrentQInRound(0);
        fetchNextQuestion();
      } else {
        generateReport();
      }
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    setStep("evaluating");
    voice.stopSpeaking();
    try {
      const data = await callInterviewAPI({
        action: "generate_report",
        domain,
        interviewHistory: history,
      });
      setReport(data);
      setStep("report");
      // Speak summary
      if (data.summary) {
        const spoken = `Your overall interview score is ${data.overallScore} percent. ${data.summary}`;
        voice.speak(spoken);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = () => {
    setStep("interview");
    fetchNextQuestion();
  };

  const resetInterview = () => {
    voice.stopSpeaking();
    voice.stopListening();
    setStep("domain");
    setInterviewMode("practice");
    setDomain("");
    setPersonality("friendly");
    setCurrentRoundIdx(0);
    setCurrentQInRound(0);
    setCurrentQuestion("");
    setAnswer("");
    setHistory([]);
    setCurrentEval(null);
    setReport(null);
    setDifficulty("beginner");
  };

  const progressPercent = Math.round((completedQuestions / totalQuestions) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
            <Brain className="w-6 h-6 text-[hsl(var(--neon-pink))]" /> AI Interview Simulator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time AI-powered mock interviews with intelligent evaluation</p>
        </div>

        {/* Domain Selection */}
        <AnimatePresence mode="wait">
          {step === "domain" && (
            <motion.div key="domain" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="glass-card p-6 neon-border">
                <h2 className="font-display text-lg font-semibold text-foreground mb-1">Select Interview Domain</h2>
                <p className="text-xs text-muted-foreground mb-5">Choose the domain you want to practice for</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {domains.map(d => {
                    const Icon = d.icon;
                    const selected = domain === d.id;
                    return (
                      <button key={d.id} onClick={() => setDomain(d.id)}
                        className={`glass-card p-4 text-center transition-all hover:scale-105 cursor-pointer ${selected ? "neon-border ring-1 ring-primary/50" : "border border-border/50"}`}>
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${d.color}`} />
                        <span className="text-xs font-medium text-foreground">{d.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {domain && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button onClick={() => setStep("personality")} className="neon-button flex items-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Personality Selection */}
          {step === "personality" && (
            <motion.div key="personality" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="glass-card p-6 neon-border">
                <h2 className="font-display text-lg font-semibold text-foreground mb-1">Choose Interviewer Style</h2>
                <p className="text-xs text-muted-foreground mb-5">Select the type of interviewer you'd like to practice with</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {personalities.map(p => {
                    const selected = personality === p.id;
                    return (
                      <button key={p.id} onClick={() => setPersonality(p.id)}
                        className={`glass-card p-4 text-center transition-all hover:scale-105 cursor-pointer ${selected ? "neon-border ring-1 ring-primary/50" : "border border-border/50"}`}>
                        <div className="text-2xl mb-2">{p.icon}</div>
                        <div className="text-sm font-semibold text-foreground">{p.label}</div>
                        <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Interview Structure</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rounds.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <div key={r.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{r.label} ({r.questions}Q)</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">{totalQuestions} questions total • Adaptive difficulty • AI evaluation after each answer</p>
              </div>
              <button onClick={() => setStep("mode")} className="neon-button flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Choose Interview Mode
              </button>
            </motion.div>
          )}

          {/* Mode Selection */}
          {step === "mode" && (
            <motion.div key="mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="glass-card p-6 neon-border">
                <h2 className="font-display text-lg font-semibold text-foreground mb-1">Select Interview Mode</h2>
                <p className="text-xs text-muted-foreground mb-5">Choose the type of interview experience</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button onClick={() => { setInterviewMode("practice"); }}
                    className={`glass-card p-5 text-left transition-all hover:scale-[1.02] cursor-pointer ${interviewMode === "practice" ? "neon-border ring-1 ring-primary/50" : "border border-border/50"}`}>
                    <PlayCircle className="w-8 h-8 text-primary mb-3" />
                    <div className="text-sm font-semibold text-foreground mb-1">Practice Interview</div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Multi-round interview with HR, Technical, Problem Solving & Behavioral questions. Adaptive difficulty with AI evaluation.
                    </p>
                    <div className="flex gap-1.5 mt-3">
                      {["HR", "Technical", "Problem Solving", "Behavioral"].map(r => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{r}</span>
                      ))}
                    </div>
                  </button>
                  <button onClick={() => { setInterviewMode("screening"); }}
                    className={`glass-card p-5 text-left transition-all hover:scale-[1.02] cursor-pointer ${interviewMode === "screening" ? "neon-border ring-1 ring-primary/50" : "border border-border/50"}`}>
                    <Monitor className="w-8 h-8 text-[hsl(var(--neon-green))] mb-3" />
                    <div className="text-sm font-semibold text-foreground mb-1">Screening Interview <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--neon-green))]/20 text-[hsl(var(--neon-green))] ml-1">NEW</span></div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Share your screen and present projects while AI observes and asks contextual questions — just like a real screening round.
                    </p>
                    <div className="flex gap-1.5 mt-3">
                      {["Screen Share", "AI Vision", "Real-time Q&A", "Demo Review"].map(r => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{r}</span>
                      ))}
                    </div>
                  </button>
                </div>
              </div>
              <button onClick={() => interviewMode === "screening" ? setStep("screening") : startInterview()} className="neon-button flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Start {interviewMode === "screening" ? "Screening" : "Practice"} Interview
              </button>
            </motion.div>
          )}

          {/* Screening Interview Mode */}
          {step === "screening" && (
            <motion.div key="screening" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ScreeningInterview domain={domain} personality={personality} onReset={resetInterview} voice={voice} />
            </motion.div>
          )}

          {/* Interview / Evaluating */}
          {(step === "interview" || step === "evaluating") && (
            <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {/* Progress bar */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">{currentRound?.label}</span>
                  <span>{completedQuestions}/{totalQuestions} questions • {difficulty}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="flex gap-1 mt-2">
                  {rounds.map((r, i) => (
                    <div key={r.id} className={`h-1 flex-1 rounded-full ${i < currentRoundIdx ? "bg-primary" : i === currentRoundIdx ? "bg-primary/50" : "bg-muted"}`} />
                  ))}
                </div>
              </div>

              {isLoading && step === "interview" ? (
                <div className="glass-card p-12 text-center neon-border">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">AI is preparing your question...</p>
                </div>
              ) : step === "evaluating" ? (
                <div className="glass-card p-12 text-center neon-border">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">AI is evaluating your answer...</p>
                </div>
              ) : (
                <div className="glass-card p-6 neon-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground">AI Interviewer</span>
                      <div className="flex gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{currentRound?.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4">{currentQuestion}</p>
                  
                  {/* Voice Controls */}
                  <div className="mb-3">
                    <VoiceControls
                      isSpeaking={voice.isSpeaking}
                      isListening={voice.isListening}
                      voiceSettings={voice.voiceSettings}
                      onToggleMic={handleToggleMic}
                      onStopSpeaking={voice.stopSpeaking}
                      onSettingsChange={voice.setVoiceSettings}
                      ttsAvailable={voice.ttsAvailable}
                      sttAvailable={voice.sttAvailable}
                      transcript={voice.transcript}
                    />
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your answer or use the mic to speak..."
                    className="w-full h-36 bg-muted/50 border border-border rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                    onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSubmitAnswer(); }}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-muted-foreground">Ctrl+Enter to submit</span>
                    <button className="neon-button text-sm" onClick={handleSubmitAnswer} disabled={isLoading || !answer.trim()}>
                      Submit Answer
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Feedback */}
          {step === "feedback" && currentEval && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {/* Progress */}
              <div className="glass-card p-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: "Technical", value: currentEval.technicalAccuracy },
                  { label: "Clarity", value: currentEval.communicationClarity },
                  { label: "Confidence", value: currentEval.confidenceLevel },
                  { label: "Problem Solving", value: currentEval.problemSolving },
                  { label: "Depth", value: currentEval.depthOfKnowledge },
                  { label: "Overall", value: currentEval.overallScore },
                ].map((m, i) => (
                  <div key={i} className="glass-card p-3 text-center">
                    <div className={`font-display text-xl font-bold ${m.value >= 7 ? "text-[hsl(var(--neon-green))]" : m.value >= 4 ? "text-[hsl(var(--neon-orange))]" : "text-destructive"}`}>
                      {m.value}/10
                    </div>
                    <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--neon-green))]" /> Strengths
                  </h3>
                  <ul className="space-y-1">
                    {currentEval.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-[hsl(var(--neon-green))]">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-4">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                    <XCircle className="w-3.5 h-3.5 text-[hsl(var(--neon-orange))]" /> Areas to Improve
                  </h3>
                  <ul className="space-y-1">
                    {currentEval.weaknesses?.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-[hsl(var(--neon-orange))]">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvement suggestion */}
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Suggested Improvement
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{currentEval.suggestedImprovement}</p>
              </div>

              <button onClick={handleNext} className="neon-button text-sm flex items-center gap-2">
                {completedQuestions < totalQuestions ? (
                  <>Next Question <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>View Final Report <Award className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          )}

          {/* Final Report */}
          {step === "report" && report && (
            <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {/* Overall Score */}
              <div className="glass-card p-8 neon-border text-center">
                <div className="font-display text-6xl font-bold neon-text mb-1">{report.overallScore}%</div>
                <div className="text-sm text-muted-foreground">Overall Interview Score</div>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold capitalize">
                  {report.interviewReadiness} Level
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Domain", value: report.domainKnowledge },
                  { label: "Technical", value: report.technicalScore },
                  { label: "Communication", value: report.communicationScore },
                  { label: "Confidence", value: report.confidenceScore },
                  { label: "Problem Solving", value: report.problemSolvingScore },
                ].map((m, i) => (
                  <div key={i} className="glass-card p-4 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{m.value}%</div>
                    <div className="text-[10px] text-muted-foreground">{m.label}</div>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Radar Chart */}
              <div className="glass-card p-6">
                <h3 className="font-display text-sm font-semibold text-foreground mb-4">Skill Radar</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { skill: "Domain", value: report.domainKnowledge },
                      { skill: "Technical", value: report.technicalScore },
                      { skill: "Communication", value: report.communicationScore },
                      { skill: "Confidence", value: report.confidenceScore },
                      { skill: "Problem Solving", value: report.problemSolvingScore },
                    ]}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Round-by-Round Scores */}
              <div className="glass-card p-6">
                <h3 className="font-display text-sm font-semibold text-foreground mb-4">Round-by-Round Performance</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history.map((h, i) => ({
                      name: `Q${i + 1}`,
                      score: (h.score?.overallScore || 0) * 10,
                      round: h.round,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary */}
              <div className="glass-card p-5">
                <h3 className="font-display text-sm font-semibold text-foreground mb-2">Summary</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.summary}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-4 h-4 text-[hsl(var(--neon-green))]" /> Top Strengths
                  </h3>
                  <ul className="space-y-2">
                    {report.topStrengths?.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-[hsl(var(--neon-green))]">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <ThumbsDown className="w-4 h-4 text-[hsl(var(--neon-orange))]" /> Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {report.areasToImprove?.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-[hsl(var(--neon-orange))]">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" /> Recommendations
                </h3>
                <ul className="space-y-2">
                  {report.recommendations?.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Zap className="w-3 h-3 text-primary mt-0.5 shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              {report.resources && report.resources.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-secondary" /> Recommended Resources
                  </h3>
                  <div className="space-y-3">
                    {report.resources.map((r, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary capitalize shrink-0">{r.type}</span>
                        <div>
                          <div className="text-xs font-medium text-foreground">{r.title}</div>
                          <div className="text-[10px] text-muted-foreground">{r.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">Next Steps</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.nextSteps}</p>
              </div>

              <button onClick={resetInterview} className="neon-button-outline text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Start New Interview
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
