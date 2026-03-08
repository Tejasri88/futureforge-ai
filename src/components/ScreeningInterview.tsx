import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Monitor, MonitorOff, Loader2, ThumbsUp, ThumbsDown,
  CheckCircle2, XCircle, Sparkles, ArrowRight, Award, RotateCcw,
  Eye, Camera, MessageSquare, TrendingUp, Zap
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import VoiceControls from "@/components/VoiceControls";
import type { UseVoiceReturn } from "@/hooks/useVoice";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

const INTERVIEW_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-simulator`;

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

interface ScreeningQA {
  question: string;
  observation: string;
  category: string;
  answer: string;
  score: any | null;
}

interface ScreeningReport {
  overallScore: number;
  technicalKnowledge: number;
  projectExplanation: number;
  systemDesign: number;
  communicationScore: number;
  confidenceScore: number;
  summary: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  interviewReadiness: string;
  nextSteps: string;
}

interface ScreeningInterviewProps {
  domain: string;
  personality: string;
  onReset: () => void;
  voice: UseVoiceReturn;
}

type ScreeningStep = "setup" | "sharing" | "answering" | "evaluating" | "feedback" | "report";

export default function ScreeningInterview({ domain, personality, onReset, voice }: ScreeningInterviewProps) {
  const [step, setStep] = useState<ScreeningStep>("setup");
  const [isSharing, setIsSharing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentObservation, setCurrentObservation] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<ScreeningQA[]>([]);
  const [currentEval, setCurrentEval] = useState<any>(null);
  const [report, setReport] = useState<ScreeningReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_QUESTIONS = 6;

  const captureScreenshot = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.warn("Video or canvas ref not available");
      return null;
    }
    if (!video.videoWidth || !video.videoHeight) {
      console.warn("Video dimensions not ready:", video.videoWidth, video.videoHeight, video.readyState);
      return null;
    }

    canvas.width = Math.min(video.videoWidth, 1024);
    canvas.height = Math.min(video.videoHeight, 576);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
    return dataUrl.split(",")[1];
  }, []);

  const waitForVideoReady = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video) { resolve(); return; }
      if (video.videoWidth > 0 && video.videoHeight > 0) { resolve(); return; }

      const checkReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
        } else {
          requestAnimationFrame(checkReady);
        }
      };

      // Also listen for loadedmetadata
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      // Start polling as backup
      requestAnimationFrame(checkReady);
      // Timeout fallback
      setTimeout(() => resolve(), 5000);
    });
  }, []);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsSharing(true);
      setStep("sharing");

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Wait for video to be actually ready before asking question
      await waitForVideoReady();
      // Extra safety delay
      await new Promise(r => setTimeout(r, 1500));
      askScreenQuestion();
    } catch (e: any) {
      if (e.name !== "NotAllowedError") {
        toast.error("Failed to start screen sharing");
      }
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsSharing(false);
  };

  const buildScreenContext = useCallback(() => {
    if (history.length === 0) return "";
    return history.map((h, i) =>
      `Q${i + 1} [${h.category}]: ${h.question}\nObservation: ${h.observation}\nAnswer: ${h.answer}\nScore: ${h.score?.overallScore || "N/A"}/10`
    ).join("\n\n");
  }, [history]);

  const askScreenQuestion = async () => {
    setIsLoading(true);
    try {
      let screenshot = captureScreenshot();
      
      // Retry capture if first attempt fails
      if (!screenshot) {
        await new Promise(r => setTimeout(r, 1000));
        screenshot = captureScreenshot();
      }

      if (!screenshot) {
        // Fallback: ask a general domain question without screenshot
        toast.info("Screen capture unavailable. Asking a general question instead.");
        const data = await callInterviewAPI({
          action: "generate_question",
          domain,
          round: "Technical",
          difficulty: "intermediate",
          personality,
          previousQA: history.map(h => ({ question: h.question, answer: h.answer })),
        });
        setCurrentQuestion(data.question);
        setCurrentObservation("Screen capture was unavailable for this question.");
        setCurrentCategory("general");
        setQuestionCount(prev => prev + 1);
        setStep("answering");
        voice.speak(data.question);
        setIsLoading(false);
        return;
      }

      const data = await callInterviewAPI({
        action: "screening_observe",
        domain,
        personality,
        screenshotBase64: screenshot,
        screenContext: buildScreenContext(),
      });

      setCurrentQuestion(data.question);
      setCurrentObservation(data.observation);
      setCurrentCategory(data.category);
      setQuestionCount(prev => prev + 1);
      setStep("answering");
      voice.speak(data.question);
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze screen");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync voice transcript to answer
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

  const submitAnswer = async () => {
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
        action: "screening_evaluate",
        domain,
        personality,
        question: currentQuestion,
        answer: answer.trim(),
        screenContext: buildScreenContext(),
      });

      const entry: ScreeningQA = {
        question: currentQuestion,
        observation: currentObservation,
        category: currentCategory,
        answer: answer.trim(),
        score: evalData,
      };
      setHistory(prev => [...prev, entry]);
      setCurrentEval(evalData);
      setStep("feedback");
      // Speak feedback
      if (evalData.feedback) {
        voice.speak(`Score: ${evalData.overallScore} out of 10. ${evalData.feedback}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to evaluate");
      setStep("answering");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextOrFinish = () => {
    setAnswer("");
    setCurrentEval(null);
    if (questionCount >= MAX_QUESTIONS) {
      generateScreeningReport();
    } else {
      askScreenQuestion();
    }
  };

  const generateScreeningReport = async () => {
    stopScreenShare();
    setIsLoading(true);
    setStep("evaluating");
    try {
      const data = await callInterviewAPI({
        action: "screening_report",
        domain,
        interviewHistory: history,
      });
      setReport(data);
      setStep("report");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Hidden canvas for screenshot capture */}
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {/* Setup */}
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <div className="glass-card p-6 neon-border text-center">
              <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">AI Screening Interview</h2>
              <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
                Share your screen to present your projects, code, or designs. The AI interviewer will observe and ask contextual questions in real-time.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg mx-auto mb-6 text-left">
                {[
                  { icon: Eye, text: "AI observes your screen" },
                  { icon: MessageSquare, text: "Asks contextual questions" },
                  { icon: Camera, text: "Analyzes demonstrations" },
                  { icon: Brain, text: "Intelligent follow-ups" },
                  { icon: TrendingUp, text: "Real-time scoring" },
                  { icon: Award, text: "Detailed final report" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <f.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Domain: <span className="text-primary font-semibold">{domain}</span> • {MAX_QUESTIONS} questions • AI-powered evaluation</p>
              <button onClick={startScreenShare} className="neon-button flex items-center gap-2 mx-auto">
                <Monitor className="w-4 h-4" /> Start Screen Share
              </button>
            </div>
          </motion.div>
        )}

        {/* Screen Sharing Active + Question/Answer */}
        {(step === "sharing" || step === "answering" || step === "evaluating" || step === "feedback") && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Progress */}
            <div className="glass-card p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  {isSharing && <span className="w-2 h-2 rounded-full bg-[hsl(var(--neon-green))] animate-pulse" />}
                  Screening Interview
                </span>
                <span>{questionCount}/{MAX_QUESTIONS} questions</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" animate={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }} />
              </div>
            </div>

            {/* Layout: Screen + Interview panel */}
            <div className="grid lg:grid-cols-5 gap-4">
              {/* Screen preview */}
              <div className="lg:col-span-3 glass-card p-3 neon-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <Monitor className="w-3 h-3" /> Screen Preview
                  </span>
                  {isSharing && (
                    <button onClick={stopScreenShare} className="text-[10px] text-destructive flex items-center gap-1 hover:underline">
                      <MonitorOff className="w-3 h-3" /> Stop
                    </button>
                  )}
                </div>
                <div className="relative bg-muted/50 rounded-lg overflow-hidden aspect-video">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                  {!isSharing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Screen share ended</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Interview panel */}
              <div className="lg:col-span-2 space-y-3">
                {/* AI Interviewer */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground">AI Screener</span>
                      {currentCategory && (
                        <span className="block text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary w-fit capitalize">{currentCategory}</span>
                      )}
                    </div>
                  </div>

                  {step === "sharing" && isLoading && (
                    <div className="text-center py-6">
                      <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground">AI is analyzing your screen...</p>
                    </div>
                  )}

                  {step === "sharing" && !isLoading && !currentQuestion && (
                    <div className="text-center py-6">
                      <Eye className="w-6 h-6 text-primary mx-auto mb-2 animate-pulse" />
                      <p className="text-[10px] text-muted-foreground">Present your work on screen. AI will observe and ask questions.</p>
                    </div>
                  )}

                  {(step === "answering" || step === "evaluating") && (
                    <>
                      {currentObservation && (
                        <div className="text-[10px] text-muted-foreground bg-muted/50 rounded p-2 mb-3 flex items-start gap-1.5">
                          <Eye className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                          <span>{currentObservation}</span>
                        </div>
                      )}
                      <p className="text-sm text-foreground leading-relaxed mb-3">{currentQuestion}</p>

                      {step === "evaluating" ? (
                        <div className="text-center py-4">
                          <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mb-1" />
                          <p className="text-[10px] text-muted-foreground">Evaluating...</p>
                        </div>
                      ) : (
                        <>
                          {/* Voice Controls */}
                          <div className="mb-2">
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
                              compact
                            />
                          </div>
                          <textarea
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Type your answer or use the mic to speak..."
                            className="w-full h-28 bg-muted/50 border border-border rounded-lg p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitAnswer(); }}
                          />
                          <button className="neon-button text-xs w-full mt-2" onClick={submitAnswer} disabled={!answer.trim() || isLoading}>
                            Submit Answer
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {step === "feedback" && currentEval && (
                    <div className="space-y-3">
                      {/* Quick scores */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: "Technical", value: currentEval.technicalExplanation },
                          { label: "Communication", value: currentEval.communicationClarity },
                          { label: "Confidence", value: currentEval.confidenceLevel },
                          { label: "Problem Solving", value: currentEval.problemSolving },
                          { label: "System Design", value: currentEval.systemUnderstanding },
                          { label: "Overall", value: currentEval.overallScore },
                        ].map((m, i) => (
                          <div key={i} className="text-center p-1.5 bg-muted/50 rounded">
                            <div className={`text-sm font-bold ${(m.value || 0) >= 7 ? "text-[hsl(var(--neon-green))]" : (m.value || 0) >= 4 ? "text-[hsl(var(--neon-orange))]" : "text-destructive"}`}>
                              {m.value || 0}/10
                            </div>
                            <div className="text-[9px] text-muted-foreground">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Strengths */}
                      {currentEval.strengths && (
                        <div>
                          <div className="text-[10px] font-semibold text-foreground flex items-center gap-1 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-[hsl(var(--neon-green))]" /> Strengths
                          </div>
                          {currentEval.strengths.map((s: string, i: number) => (
                            <div key={i} className="text-[10px] text-muted-foreground ml-4">✓ {s}</div>
                          ))}
                        </div>
                      )}
                      {currentEval.weaknesses && (
                        <div>
                          <div className="text-[10px] font-semibold text-foreground flex items-center gap-1 mb-1">
                            <XCircle className="w-3 h-3 text-[hsl(var(--neon-orange))]" /> Improve
                          </div>
                          {currentEval.weaknesses.map((s: string, i: number) => (
                            <div key={i} className="text-[10px] text-muted-foreground ml-4">→ {s}</div>
                          ))}
                        </div>
                      )}
                      {currentEval.feedback && (
                        <p className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded">{currentEval.feedback}</p>
                      )}

                      <button onClick={handleNextOrFinish} className="neon-button text-xs w-full flex items-center justify-center gap-2">
                        {questionCount < MAX_QUESTIONS ? (
                          <>Next Question <ArrowRight className="w-3 h-3" /></>
                        ) : (
                          <>View Report <Award className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick action: manually request next question */}
                {step === "sharing" && !isLoading && isSharing && (
                  <button onClick={askScreenQuestion} className="neon-button-outline text-xs w-full flex items-center justify-center gap-2">
                    <Camera className="w-3 h-3" /> Capture & Ask Question
                  </button>
                )}

                {/* End interview early */}
                {history.length >= 2 && step !== "feedback" && step !== "evaluating" && (
                  <button onClick={generateScreeningReport} className="text-xs text-muted-foreground hover:text-foreground text-center w-full py-2">
                    End Interview & View Report
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Screening Report */}
        {step === "report" && report && (
          <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="glass-card p-8 neon-border text-center">
              <div className="font-display text-6xl font-bold neon-text mb-1">{report.overallScore}%</div>
              <div className="text-sm text-muted-foreground">Screening Interview Score</div>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold capitalize">
                {report.interviewReadiness} Level
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Technical", value: report.technicalKnowledge },
                { label: "Project Explanation", value: report.projectExplanation },
                { label: "System Design", value: report.systemDesign },
                { label: "Communication", value: report.communicationScore },
                { label: "Confidence", value: report.confidenceScore },
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

            <div className="glass-card p-6">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">Skill Radar</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { skill: "Technical", value: report.technicalKnowledge },
                    { skill: "Project", value: report.projectExplanation },
                    { skill: "System Design", value: report.systemDesign },
                    { skill: "Communication", value: report.communicationScore },
                    { skill: "Confidence", value: report.confidenceScore },
                  ]}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Summary</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{report.summary}</p>
            </div>

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

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Next Steps</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{report.nextSteps}</p>
            </div>

            <button onClick={onReset} className="neon-button-outline text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Start New Interview
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
