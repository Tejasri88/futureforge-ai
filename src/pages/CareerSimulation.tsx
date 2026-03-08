import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, DollarSign, MapPin, Calendar, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const salaryProjection = [
  { year: "2026", salary: 5.4 }, { year: "2027", salary: 7.1 },
  { year: "2028", salary: 9.2 }, { year: "2029", salary: 10.8 },
  { year: "2030", salary: 12.9 }, { year: "2031", salary: 14.6 },
  { year: "2032", salary: 16.7 }, { year: "2033", salary: 18.3 },
  { year: "2034", salary: 20.4 }, { year: "2035", salary: 22.5 },
];

const careerRoutes = [
  { name: "Fast Route", duration: "8 months", color: "text-neon-orange", desc: "Intensive bootcamp + daily practice", risk: "High burnout risk" },
  { name: "Balanced Route", duration: "14 months", color: "text-primary", desc: "Part-time learning + projects", risk: "Moderate effort" },
  { name: "Expert Route", duration: "24 months", color: "text-neon-purple", desc: "Deep study + research + contributions", risk: "Highest career ceiling" },
];

const countryDemand = [
  { country: "USA", demand: 95 }, { country: "UK", demand: 78 },
  { country: "Germany", demand: 72 }, { country: "Canada", demand: 70 },
  { country: "Singapore", demand: 65 }, { country: "India", demand: 60 },
];

const milestones = [
  { year: "Year 1", role: "Junior ML Engineer", salary: "₹7.1L", event: "First role" },
  { year: "Year 3", role: "ML Engineer", salary: "₹10.8L", event: "Promotion" },
  { year: "Year 5", role: "Senior ML Engineer", salary: "₹14.6L", event: "Lead projects" },
  { year: "Year 8", role: "Staff / Tech Lead", salary: "₹18.3L", event: "Team leadership" },
  { year: "Year 10", role: "Director / Principal", salary: "₹22.5L+", event: "Strategic impact" },
];

export default function CareerSimulation() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-neon-purple" /> Career Simulation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI Digital Twin · Career GPS · Global Scanner</p>
        </div>

        {/* Salary Projection */}
        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-neon-green" /> 10-Year Salary Projection
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salaryProjection}>
              <defs>
                <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(150, 80%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(150, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip contentStyle={{ background: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 95%)" }} formatter={(v: number) => [`₹${v}L`, "Salary"]} />
              <Area type="monotone" dataKey="salary" stroke="hsl(150, 80%, 50%)" fill="url(#salGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Career GPS Routes */}
        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Career GPS Routes
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {careerRoutes.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`glass-card-hover p-5 ${i === 1 ? "neon-border" : ""}`}
              >
                <div className={`font-display text-sm font-bold ${r.color} mb-1`}>{r.name}</div>
                <div className="font-display text-2xl font-bold text-foreground mb-2">{r.duration}</div>
                <p className="text-xs text-muted-foreground mb-1">{r.desc}</p>
                <p className="text-[10px] text-muted-foreground">{r.risk}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Career Timeline */}
          <div className="glass-card p-6">
            <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neon-orange" /> Career Digital Twin
            </h2>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  {i < milestones.length - 1 && <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-border" />}
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-primary font-semibold">{m.year} · {m.event}</div>
                    <div className="text-sm font-semibold text-foreground">{m.role}</div>
                    <div className="text-xs text-neon-green">{m.salary}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Demand */}
          <div className="glass-card p-6">
            <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-cyan" /> Global AI Job Demand
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={countryDemand} layout="vertical">
                <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="country" type="category" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 95%)" }} />
                <Bar dataKey="demand" fill="hsl(190, 100%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
