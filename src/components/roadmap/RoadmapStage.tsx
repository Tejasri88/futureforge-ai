import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, Flag, Clock } from "lucide-react";
import SkillNode, { Skill } from "./SkillNode";
import { Progress } from "@/components/ui/progress";

interface Stage {
  id: number;
  title: string;
  description: string;
  duration: string;
  skills: Skill[];
  milestone: string;
}

interface RoadmapStageProps {
  stage: Stage;
  index: number;
  isLocked: boolean;
  isActive: boolean;
  isCompleted: boolean;
  onToggleSkillComplete: (skillId: string) => void;
  onUpdateSkillProgress: (skillId: string, progress: number) => void;
}

export default function RoadmapStage({
  stage,
  index,
  isLocked,
  isActive,
  isCompleted,
  onToggleSkillComplete,
  onUpdateSkillProgress,
}: RoadmapStageProps) {
  const completedSkills = stage.skills.filter(s => s.completed).length;
  const totalSkills = stage.skills.length;
  const stageProgress = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className={`relative ${isLocked ? "opacity-50" : ""}`}
    >
      {/* Connection Line */}
      {index > 0 && (
        <div className="absolute -top-6 left-8 w-0.5 h-6 bg-gradient-to-b from-primary/50 to-border" />
      )}

      <div className={`glass-card p-6 ${isActive ? "neon-border" : ""} ${isCompleted ? "border-neon-green/30" : ""}`}>
        {/* Stage Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCompleted ? "bg-neon-green/20" : isActive ? "bg-primary/20" : "bg-muted"
          }`}>
            {isCompleted && <CheckCircle2 className="w-8 h-8 text-neon-green" />}
            {isActive && <Circle className="w-8 h-8 text-primary animate-pulse" />}
            {isLocked && <Lock className="w-8 h-8 text-muted-foreground" />}
            {!isCompleted && !isActive && !isLocked && <span className="font-display text-2xl text-foreground">{index + 1}</span>}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-lg font-bold text-foreground">{stage.title}</h2>
              {isActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 animate-pulse">
                  IN PROGRESS
                </span>
              )}
              {isCompleted && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                  COMPLETED
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {stage.duration}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completedSkills}/{totalSkills} skills
              </span>
            </div>

            {/* Stage Progress */}
            <div className="mt-3">
              <Progress value={stageProgress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {!isLocked && (
          <div className="grid gap-3 mt-4">
            {stage.skills.map((skill, i) => (
              <SkillNode
                key={skill.id}
                skill={skill}
                index={i}
                onToggleComplete={onToggleSkillComplete}
                onUpdateProgress={onUpdateSkillProgress}
              />
            ))}
          </div>
        )}

        {/* Milestone */}
        <div className={`mt-4 p-3 rounded-lg ${isCompleted ? "bg-neon-green/10" : "bg-muted/50"}`}>
          <div className="flex items-center gap-2 text-xs">
            <Flag className={`w-4 h-4 ${isCompleted ? "text-neon-green" : "text-primary"}`} />
            <span className={`font-semibold ${isCompleted ? "text-neon-green" : "text-foreground"}`}>Milestone:</span>
            <span className="text-muted-foreground">{stage.milestone}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
