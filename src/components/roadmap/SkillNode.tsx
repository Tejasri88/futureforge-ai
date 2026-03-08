import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, TrendingUp, Building2, BookOpen, Play, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Resource {
  type: string;
  title: string;
  url: string;
  platform: string;
}

interface Project {
  title: string;
  description: string;
  difficulty: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  estimatedHours: number;
  demandLevel: string;
  salaryImpact: string;
  industryUsage: string;
  resources: Resource[];
  projects: Project[];
  completed?: boolean;
  progress?: number;
}

interface SkillNodeProps {
  skill: Skill;
  index: number;
  onToggleComplete: (skillId: string) => void;
  onUpdateProgress: (skillId: string, progress: number) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  code: <span className="text-lg">💻</span>,
  database: <span className="text-lg">🗄️</span>,
  chart: <span className="text-lg">📊</span>,
  brain: <span className="text-lg">🧠</span>,
  shield: <span className="text-lg">🛡️</span>,
  cloud: <span className="text-lg">☁️</span>,
  layout: <span className="text-lg">🎨</span>,
  server: <span className="text-lg">🖥️</span>,
  palette: <span className="text-lg">🎨</span>,
  users: <span className="text-lg">👥</span>,
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-neon-green/20 text-neon-green border-neon-green/30",
  intermediate: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
  advanced: "bg-neon-pink/20 text-neon-pink border-neon-pink/30",
};

const demandColors: Record<string, string> = {
  high: "text-neon-green",
  medium: "text-neon-orange",
  low: "text-muted-foreground",
};

export default function SkillNode({ skill, index, onToggleComplete, onUpdateProgress }: SkillNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card-hover p-4 ${skill.completed ? "border-neon-green/40" : ""}`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            skill.completed ? "bg-neon-green/20" : "bg-primary/20"
          }`}>
            {iconMap[skill.icon] || <span className="text-lg">📚</span>}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-display text-sm font-semibold ${skill.completed ? "text-neon-green" : "text-foreground"}`}>
                {skill.name}
              </h4>
              <Badge variant="outline" className={`text-[10px] ${difficultyColors[skill.difficulty]}`}>
                {skill.difficulty}
              </Badge>
              <Badge variant="outline" className={`text-[10px] ${demandColors[skill.demandLevel]}`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {skill.demandLevel} demand
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{skill.description}</p>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {skill.estimatedHours}h
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-neon-green" />
                {skill.salaryImpact}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {skill.industryUsage}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary">{skill.progress || 0}%</span>
              </div>
              <Progress value={skill.progress || 0} className="h-1.5" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="sm"
              variant={skill.completed ? "default" : "outline"}
              className={`h-7 w-7 p-0 ${skill.completed ? "bg-neon-green hover:bg-neon-green/80" : ""}`}
              onClick={() => onToggleComplete(skill.id)}
            >
              {skill.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </Button>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-border space-y-4"
          >
            {/* Learning Resources */}
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                Learning Resources
              </h5>
              <div className="grid gap-2">
                {skill.resources?.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs"
                  >
                    {resource.type === "course" && <BookOpen className="w-3.5 h-3.5 text-neon-purple" />}
                    {resource.type === "video" && <Play className="w-3.5 h-3.5 text-red-500" />}
                    {resource.type === "docs" && <FileText className="w-3.5 h-3.5 text-neon-cyan" />}
                    <span className="flex-1 truncate">{resource.title}</span>
                    <Badge variant="outline" className="text-[9px]">{resource.platform}</Badge>
                  </a>
                ))}
              </div>
            </div>

            {/* Projects */}
            {skill.projects?.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2">🚀 Suggested Projects</h5>
                <div className="space-y-2">
                  {skill.projects.map((project, i) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/50 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{project.title}</span>
                        <Badge variant="outline" className={`text-[9px] ${difficultyColors[project.difficulty]}`}>
                          {project.difficulty}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2">📝 Personal Notes</h5>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="w-full p-2 rounded-lg bg-muted/50 border border-border text-xs resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Progress Slider */}
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2">📈 Update Progress</h5>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.progress || 0}
                  onChange={(e) => onUpdateProgress(skill.id, parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-xs text-primary w-10 text-right">{skill.progress || 0}%</span>
              </div>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
