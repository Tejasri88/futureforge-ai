import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface SkillRadarProps {
  skills: Array<{ name: string; current: number; required: number }>;
}

export function SkillRadarChart({ skills }: SkillRadarProps) {
  const data = skills.slice(0, 8).map(skill => ({
    skill: skill.name.length > 12 ? skill.name.substring(0, 12) + "..." : skill.name,
    current: skill.current,
    required: skill.required,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4"
    >
      <h3 className="font-display text-sm font-semibold text-foreground mb-3">🎯 Skill Assessment</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
            />
            <Radar
              name="Required"
              dataKey="required"
              stroke="hsl(var(--neon-purple))"
              fill="hsl(var(--neon-purple))"
              fillOpacity={0.2}
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-primary/40" />
          Current
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-secondary/40" />
          Required
        </span>
      </div>
    </motion.div>
  );
}

interface ProgressChartProps {
  data: Array<{ week: string; progress: number }>;
}

export function LearningProgressChart({ data }: ProgressChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h3 className="font-display text-sm font-semibold text-foreground mb-3">📈 Learning Progress</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="week" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface DemandChartProps {
  skills: Array<{ name: string; demand: number }>;
}

export function IndustryDemandChart({ skills }: DemandChartProps) {
  const data = skills.slice(0, 6).map(skill => ({
    skill: skill.name.length > 10 ? skill.name.substring(0, 10) + "..." : skill.name,
    demand: skill.demand,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h3 className="font-display text-sm font-semibold text-foreground mb-3">🔥 Industry Demand</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis 
              type="category" 
              dataKey="skill"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 11,
              }}
            />
            <Bar 
              dataKey="demand" 
              fill="hsl(var(--neon-green))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface SkillGapChartProps {
  existing: string[];
  missing: string[];
}

export function SkillGapChart({ existing, missing }: SkillGapChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h3 className="font-display text-sm font-semibold text-foreground mb-3">📊 Skill Gap Analysis</h3>
      
      <div className="space-y-4">
        {/* Existing Skills */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            <span className="text-xs font-medium text-neon-green">Skills You Have ({existing.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {existing.map((skill, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green text-[10px] border border-neon-green/30">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-neon-orange" />
            <span className="text-xs font-medium text-neon-orange">Skills to Learn ({missing.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {missing.map((skill, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-neon-orange/10 text-neon-orange text-[10px] border border-neon-orange/30">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Gap Progress */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">Completion</span>
            <span className="text-primary">{Math.round((existing.length / (existing.length + missing.length)) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-green to-primary rounded-full"
              style={{ width: `${(existing.length / (existing.length + missing.length)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
