import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

interface CareerStep {
  role: string;
  salary: string;
  yearsExperience: string;
  active: boolean;
}

interface CareerLadderProps {
  ladder: CareerStep[];
  targetCareer: string;
}

export default function CareerLadder({ ladder, targetCareer }: CareerLadderProps) {
  const activeIndex = ladder.findIndex(step => step.active);

  return (
    <div className="glass-card p-6">
      <h2 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-neon-green" />
        Career Ladder: {targetCareer}
      </h2>

      <div className="space-y-1">
        {ladder.map((step, i) => {
          const isPast = i < activeIndex;
          const isCurrent = step.active;
          const isFuture = i > activeIndex;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* Connection Line */}
              {i < ladder.length - 1 && (
                <div className={`absolute left-[15px] top-10 w-0.5 h-8 ${
                  isPast ? "bg-neon-green" : isCurrent ? "bg-gradient-to-b from-primary to-border" : "bg-border"
                }`} />
              )}

              <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                isCurrent ? "bg-primary/10 neon-border" : isPast ? "bg-neon-green/5" : ""
              }`}>
                {/* Step Number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isPast ? "bg-neon-green text-background" : 
                  isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary/50" : 
                  "bg-muted text-muted-foreground"
                }`}>
                  {isPast ? "✓" : i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${
                    isCurrent ? "text-primary" : isPast ? "text-neon-green" : "text-foreground"
                  }`}>
                    {step.role}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {step.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {step.yearsExperience} yrs
                    </span>
                  </div>
                </div>

                {/* Arrow for future */}
                {isFuture && (
                  <div className="text-xs text-muted-foreground">→</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Salary Growth Visualization */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">Salary Growth Trajectory</h3>
        <div className="flex items-end gap-1 h-24">
          {ladder.map((step, i) => {
            const salaryNum = parseInt(step.salary.replace(/[^0-9]/g, '')) || 0;
            const maxSalary = Math.max(...ladder.map(s => parseInt(s.salary.replace(/[^0-9]/g, '')) || 0));
            const height = maxSalary > 0 ? (salaryNum / maxSalary) * 100 : 20;
            const isPast = i < activeIndex;
            const isCurrent = step.active;

            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`flex-1 rounded-t-sm ${
                  isPast ? "bg-neon-green/60" : isCurrent ? "bg-primary" : "bg-muted"
                }`}
                title={`${step.role}: ${step.salary}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
          <span>Entry</span>
          <span>Senior</span>
          <span>Leadership</span>
        </div>
      </div>
    </div>
  );
}
