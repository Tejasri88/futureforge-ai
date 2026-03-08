import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Target, Zap, Clock, Rocket, TrendingUp, Building2 } from "lucide-react";

interface DomainSelectorProps {
  selectedDomain: string | null;
  onSelectDomain: (domain: string) => void;
}

const domains = [
  { id: "data-analyst", name: "Data Analyst", icon: "📊", color: "from-blue-500 to-cyan-500", description: "Transform data into insights" },
  { id: "data-scientist", name: "Data Scientist", icon: "🔬", color: "from-purple-500 to-pink-500", description: "Build predictive models" },
  { id: "ai-engineer", name: "AI Engineer", icon: "🤖", color: "from-cyan-500 to-blue-500", description: "Create intelligent systems" },
  { id: "ml-engineer", name: "ML Engineer", icon: "🧠", color: "from-pink-500 to-purple-500", description: "Deploy ML at scale" },
  { id: "software-engineer", name: "Software Engineer", icon: "💻", color: "from-green-500 to-emerald-500", description: "Build robust applications" },
  { id: "frontend-developer", name: "Frontend Developer", icon: "🎨", color: "from-orange-500 to-yellow-500", description: "Create beautiful interfaces" },
  { id: "backend-developer", name: "Backend Developer", icon: "🖥️", color: "from-indigo-500 to-blue-500", description: "Power server-side logic" },
  { id: "fullstack-developer", name: "Full Stack Developer", icon: "⚡", color: "from-violet-500 to-purple-500", description: "Master both ends" },
  { id: "cybersecurity-analyst", name: "Cybersecurity Analyst", icon: "🛡️", color: "from-red-500 to-orange-500", description: "Protect digital assets" },
  { id: "cloud-engineer", name: "Cloud Engineer", icon: "☁️", color: "from-sky-500 to-blue-500", description: "Architect cloud solutions" },
  { id: "product-manager", name: "Product Manager", icon: "📋", color: "from-teal-500 to-cyan-500", description: "Lead product strategy" },
  { id: "ui-ux-designer", name: "UI/UX Designer", icon: "✨", color: "from-rose-500 to-pink-500", description: "Design user experiences" },
];

export default function DomainSelector({ selectedDomain, onSelectDomain }: DomainSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold gradient-text">Choose Your Dream Career</h2>
        <p className="text-sm text-muted-foreground mt-1">Select your target role to generate a personalized roadmap</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {domains.map((domain, i) => (
          <motion.button
            key={domain.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelectDomain(domain.name)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedDomain === domain.name
                ? "neon-border bg-primary/10"
                : "glass-card-hover"
            }`}
          >
            <div className="text-2xl mb-2">{domain.icon}</div>
            <h3 className={`font-display text-xs font-semibold ${
              selectedDomain === domain.name ? "text-primary" : "text-foreground"
            }`}>
              {domain.name}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">{domain.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface TrackSelectorProps {
  selectedTrack: "fast" | "balanced" | "expert";
  onSelectTrack: (track: "fast" | "balanced" | "expert") => void;
}

const tracks = [
  {
    id: "fast" as const,
    name: "Fast Track",
    duration: "6-8 months",
    icon: <Zap className="w-5 h-5" />,
    description: "Intensive learning, quick career entry",
    features: ["Core skills only", "Daily practice", "Rapid certification"],
  },
  {
    id: "balanced" as const,
    name: "Balanced Track",
    duration: "12 months",
    icon: <Target className="w-5 h-5" />,
    description: "Comprehensive yet manageable pace",
    features: ["Core + intermediate skills", "Regular projects", "Strong portfolio"],
  },
  {
    id: "expert" as const,
    name: "Expert Track",
    duration: "18-24 months",
    icon: <GraduationCap className="w-5 h-5" />,
    description: "Deep expertise and specialization",
    features: ["Full skill mastery", "Advanced projects", "Industry expertise"],
  },
];

export function TrackSelector({ selectedTrack, onSelectTrack }: TrackSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-display text-lg font-bold text-foreground">Choose Your Learning Speed</h2>
        <p className="text-sm text-muted-foreground mt-1">How fast do you want to reach your goal?</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {tracks.map((track, i) => (
          <motion.button
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectTrack(track.id)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedTrack === track.id
                ? "neon-border bg-primary/10"
                : "glass-card-hover"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              selectedTrack === track.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {track.icon}
            </div>
            <h3 className={`font-display text-sm font-semibold ${
              selectedTrack === track.id ? "text-primary" : "text-foreground"
            }`}>
              {track.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {track.duration}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{track.description}</p>
            <ul className="mt-3 space-y-1">
              {track.features.map((feature, j) => (
                <li key={j} className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface SkillInputProps {
  currentSkills: string[];
  onUpdateSkills: (skills: string[]) => void;
}

export function SkillInput({ currentSkills, onUpdateSkills }: SkillInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addSkill = () => {
    const skill = inputValue.trim();
    if (skill && !currentSkills.includes(skill)) {
      onUpdateSkills([...currentSkills, skill]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onUpdateSkills(currentSkills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="glass-card p-4">
      <h3 className="font-display text-sm font-semibold text-foreground mb-3">Your Current Skills</h3>
      <p className="text-xs text-muted-foreground mb-3">Add skills you already know to personalize your roadmap</p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a skill and press Enter or click Add..."
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="button"
          onClick={addSkill}
          disabled={!inputValue.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          Add
        </button>
      </div>

      {currentSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {currentSkills.map((skill, i) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/30 flex items-center gap-1"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
              >
                ×
              </button>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

interface IndustryInsightsProps {
  insights: {
    demandTrend: string;
    topCompanies: string[];
    emergingTechnologies: string[];
  };
}

export function IndustryInsights({ insights }: IndustryInsightsProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-neon-green" />
        Industry Insights
      </h3>

      <div className="space-y-4">
        {/* Demand Trend */}
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            insights.demandTrend === "growing" ? "bg-neon-green/20 text-neon-green" :
            insights.demandTrend === "stable" ? "bg-primary/20 text-primary" :
            "bg-destructive/20 text-destructive"
          }`}>
            {insights.demandTrend === "growing" ? "📈" : insights.demandTrend === "stable" ? "➡️" : "📉"}
            {" "}{insights.demandTrend.charAt(0).toUpperCase() + insights.demandTrend.slice(1)} Demand
          </div>
        </div>

        {/* Top Companies */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" />
            Top Hiring Companies
          </div>
          <div className="flex flex-wrap gap-1">
            {insights.topCompanies.map((company, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-foreground">
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* Emerging Tech */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Rocket className="w-3.5 h-3.5" />
            Emerging Technologies
          </div>
          <div className="flex flex-wrap gap-1">
            {insights.emergingTechnologies.map((tech, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple text-[10px] border border-neon-purple/30">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
