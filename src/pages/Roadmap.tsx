import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Route, Sparkles, RefreshCw, Download, Share2, ChevronRight, Target, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DomainSelector, { TrackSelector, SkillInput, IndustryInsights } from "@/components/roadmap/DomainSelector";
import RoadmapStage from "@/components/roadmap/RoadmapStage";
import CareerLadder from "@/components/roadmap/CareerLadder";
import { SkillRadarChart, LearningProgressChart, IndustryDemandChart, SkillGapChart } from "@/components/roadmap/RoadmapCharts";
import type { Skill } from "@/components/roadmap/SkillNode";

interface Stage {
  id: number;
  title: string;
  description: string;
  duration: string;
  skills: Skill[];
  milestone: string;
}

interface CareerStep {
  role: string;
  salary: string;
  yearsExperience: string;
  active: boolean;
}

interface RoadmapData {
  targetCareer: string;
  estimatedDuration: string;
  currentLevel: string;
  skillGap: {
    existingSkills: string[];
    missingSkills: string[];
  };
  stages: Stage[];
  careerLadder: CareerStep[];
  industryInsights: {
    demandTrend: string;
    topCompanies: string[];
    emergingTechnologies: string[];
  };
}

export default function Roadmap() {
  const [step, setStep] = useState<"domain" | "skills" | "track" | "roadmap">("domain");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<"fast" | "balanced" | "expert">("balanced");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [skillProgress, setSkillProgress] = useState<Record<string, { completed: boolean; progress: number }>>({});

  // Calculate overall progress
  const calculateProgress = () => {
    if (!roadmapData) return { completed: 0, total: 0, percentage: 0 };
    const allSkills = roadmapData.stages.flatMap(s => s.skills);
    const completed = allSkills.filter(s => skillProgress[s.id]?.completed).length;
    return {
      completed,
      total: allSkills.length,
      percentage: allSkills.length > 0 ? Math.round((completed / allSkills.length) * 100) : 0,
    };
  };

  // Generate roadmap from AI
  const generateRoadmap = async () => {
    if (!selectedDomain) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {
        body: {
          action: "generate_roadmap",
          targetCareer: selectedDomain,
          currentSkills,
          trackSpeed: selectedTrack,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Initialize skill progress - match against both AI-detected existing skills AND user-typed skills
      const initialProgress: Record<string, { completed: boolean; progress: number }> = {};
      const allExisting = [
        ...(data.skillGap?.existingSkills || []),
        ...currentSkills,
      ].map((s: string) => s.toLowerCase().trim());

      data.stages?.forEach((stage: Stage) => {
        stage.skills?.forEach((skill: Skill) => {
          const skillNameLower = skill.name.toLowerCase();
          const isExisting = allExisting.some(
            (s: string) => skillNameLower.includes(s) || s.includes(skillNameLower)
          );
          initialProgress[skill.id] = {
            completed: isExisting || false,
            progress: isExisting ? 100 : 0,
          };
        });
      });
      setSkillProgress(initialProgress);

      setRoadmapData(data);
      setStep("roadmap");
      toast.success("Your personalized roadmap is ready!");
    } catch (err) {
      console.error("Roadmap generation error:", err);
      toast.error("Failed to generate roadmap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSkillComplete = (skillId: string) => {
    setSkillProgress(prev => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        completed: !prev[skillId]?.completed,
        progress: !prev[skillId]?.completed ? 100 : prev[skillId]?.progress || 0,
      },
    }));
  };

  const handleUpdateSkillProgress = (skillId: string, progress: number) => {
    setSkillProgress(prev => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        progress,
        completed: progress === 100,
      },
    }));
  };

  const handleSelectDomain = (domain: string) => {
    setSelectedDomain(domain);
    setStep("skills");
  };

  const handleProceedToTrack = () => {
    setStep("track");
  };

  const handleStartGeneration = () => {
    generateRoadmap();
  };

  const handleReset = () => {
    setStep("domain");
    setSelectedDomain(null);
    setCurrentSkills([]);
    setRoadmapData(null);
    setSkillProgress({});
  };

  // Prepare chart data
  const getRadarData = () => {
    if (!roadmapData) return [];
    const skills = roadmapData.stages.flatMap(s => s.skills).slice(0, 8);
    return skills.map(skill => ({
      name: skill.name,
      current: skillProgress[skill.id]?.progress || 0,
      required: 100,
    }));
  };

  const getDemandData = () => {
    if (!roadmapData) return [];
    const skills = roadmapData.stages.flatMap(s => s.skills);
    return skills.map(skill => ({
      name: skill.name,
      demand: skill.demandLevel === "high" ? 90 : skill.demandLevel === "medium" ? 60 : 30,
    }));
  };

  const getProgressData = () => {
    return [
      { week: "W1", progress: 5 },
      { week: "W2", progress: 12 },
      { week: "W3", progress: 20 },
      { week: "W4", progress: calculateProgress().percentage },
    ];
  };

  // Get stage status
  const getStageStatus = (stageIndex: number) => {
    if (!roadmapData) return { isLocked: true, isActive: false, isCompleted: false };

    const stage = roadmapData.stages[stageIndex];
    const stageSkills = stage.skills;
    const completedInStage = stageSkills.filter(s => skillProgress[s.id]?.completed).length;
    const isCompleted = completedInStage === stageSkills.length && stageSkills.length > 0;

    // Check if previous stage is completed
    let prevCompleted = true;
    if (stageIndex > 0) {
      const prevStage = roadmapData.stages[stageIndex - 1];
      const prevCompleteCount = prevStage.skills.filter(s => skillProgress[s.id]?.completed).length;
      prevCompleted = prevCompleteCount === prevStage.skills.length;
    }

    const isLocked = stageIndex > 0 && !prevCompleted && !isCompleted;
    const isActive = !isLocked && !isCompleted && (stageIndex === 0 || prevCompleted);

    return { isLocked, isActive, isCompleted };
  };

  // Apply skill progress to roadmap data for rendering
  const getEnrichedStages = () => {
    if (!roadmapData) return [];
    return roadmapData.stages.map(stage => ({
      ...stage,
      skills: stage.skills.map(skill => ({
        ...skill,
        completed: skillProgress[skill.id]?.completed || false,
        progress: skillProgress[skill.id]?.progress || 0,
      })),
    }));
  };

  const progress = calculateProgress();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
              <Route className="w-6 h-6 text-neon-purple" />
              AI Career Roadmap
            </h1>
            {roadmapData && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDomain} • {selectedTrack} track • {progress.completed}/{progress.total} skills ({progress.percentage}%)
              </p>
            )}
          </div>

          {roadmapData && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-1" />
                New Roadmap
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar (when roadmap exists) */}
        {roadmapData && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-display font-bold text-primary">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{progress.completed} skills completed</span>
              <span>{progress.total - progress.completed} remaining</span>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Domain Selection */}
          {step === "domain" && (
            <motion.div
              key="domain"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DomainSelector selectedDomain={selectedDomain} onSelectDomain={handleSelectDomain} />
            </motion.div>
          )}

          {/* Step 2: Skills Input */}
          {step === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">{selectedDomain}</span>
                <ChevronRight className="w-4 h-4" />
                <span>Add your current skills</span>
              </div>

              <SkillInput currentSkills={currentSkills} onUpdateSkills={setCurrentSkills} />

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setStep("domain")}>Back</Button>
                <Button onClick={handleProceedToTrack} className="flex-1">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Track Selection */}
          {step === "track" && (
            <motion.div
              key="track"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">{selectedDomain}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{currentSkills.length} skills</span>
                <ChevronRight className="w-4 h-4" />
                <span>Choose pace</span>
              </div>

              <TrackSelector selectedTrack={selectedTrack} onSelectTrack={setSelectedTrack} />

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setStep("skills")}>Back</Button>
                <Button onClick={handleStartGeneration} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Roadmap...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate My Roadmap
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Roadmap Display */}
          {step === "roadmap" && roadmapData && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-display text-lg font-bold text-primary">{roadmapData.stages.length}</div>
                  <div className="text-[10px] text-muted-foreground">Stages</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="font-display text-lg font-bold text-neon-green">{roadmapData.stages.flatMap(s => s.skills).length}</div>
                  <div className="text-[10px] text-muted-foreground">Skills</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="font-display text-lg font-bold text-neon-orange">{roadmapData.estimatedDuration}</div>
                  <div className="text-[10px] text-muted-foreground">Duration</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">📈</div>
                  <div className="font-display text-lg font-bold text-neon-purple">{roadmapData.currentLevel}</div>
                  <div className="text-[10px] text-muted-foreground">Start Level</div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Roadmap Timeline */}
                <div className="lg:col-span-2 space-y-6">
                  {getEnrichedStages().map((stage, i) => {
                    const { isLocked, isActive, isCompleted } = getStageStatus(i);
                    return (
                      <RoadmapStage
                        key={stage.id}
                        stage={stage}
                        index={i}
                        isLocked={isLocked}
                        isActive={isActive}
                        isCompleted={isCompleted}
                        onToggleSkillComplete={handleToggleSkillComplete}
                        onUpdateSkillProgress={handleUpdateSkillProgress}
                      />
                    );
                  })}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Career Ladder */}
                  <CareerLadder ladder={roadmapData.careerLadder} targetCareer={roadmapData.targetCareer} />

                  {/* Skill Gap Chart */}
                  <SkillGapChart
                    existing={roadmapData.skillGap.existingSkills}
                    missing={roadmapData.skillGap.missingSkills}
                  />

                  {/* Industry Insights */}
                  <IndustryInsights insights={roadmapData.industryInsights} />

                  {/* Skill Radar */}
                  <SkillRadarChart skills={getRadarData()} />

                  {/* Learning Progress */}
                  <LearningProgressChart data={getProgressData()} />

                  {/* Industry Demand */}
                  <IndustryDemandChart skills={getDemandData()} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
