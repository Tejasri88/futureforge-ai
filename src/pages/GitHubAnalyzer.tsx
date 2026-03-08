import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Github, Star, GitFork, Code, BarChart3, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface GitHubProfile {
  username: string;
  avatarUrl: string;
  name: string;
  bio: string;
  repos: number;
  followers: number;
  following: number;
  topLanguages: { name: string; pct: number }[];
  skillRadar: { skill: string; level: number }[];
  overallScore: number;
  repoDetails: { name: string; stars: number; forks: number; language: string }[];
  totalStars: number;
  totalForks: number;
  profileUrl: string;
}

async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  // Fetch user profile
  const userRes = await fetch(`https://api.github.com/users/${username}`);
  if (!userRes.ok) throw new Error(userRes.status === 404 ? "User not found" : "GitHub API error");
  const user = await userRes.json();

  // Fetch repos (up to 100, sorted by stars)
  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars&direction=desc`);
  const repos = reposRes.ok ? await reposRes.json() : [];

  // Calculate language distribution
  const langBytes: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      langBytes[repo.language] = (langBytes[repo.language] || 0) + (repo.size || 1);
    }
  }
  const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0) || 1;
  const sortedLangs = Object.entries(langBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, bytes]) => ({ name, pct: Math.round((bytes / totalBytes) * 100) }));

  // Calculate stats
  const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum: number, r: any) => sum + (r.forks_count || 0), 0);
  const hasReadme = repos.filter((r: any) => r.description).length;
  const hasTopics = repos.filter((r: any) => r.topics?.length > 0).length;
  const forkedRepos = repos.filter((r: any) => r.fork).length;
  const originalRepos = repos.length - forkedRepos;
  const recentRepos = repos.filter((r: any) => {
    const updated = new Date(r.pushed_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return updated > sixMonthsAgo;
  }).length;

  // Skill radar scores
  const codeQuality = Math.min(100, Math.round((sortedLangs.length / 5) * 40 + (hasReadme / Math.max(repos.length, 1)) * 60));
  const projectComplexity = Math.min(100, Math.round((totalStars / Math.max(repos.length, 1)) * 10 + originalRepos * 2));
  const documentation = Math.min(100, Math.round((hasReadme / Math.max(repos.length, 1)) * 100));
  const consistency = Math.min(100, Math.round((recentRepos / Math.max(repos.length, 1)) * 100));
  const collaboration = Math.min(100, Math.round((totalForks / Math.max(repos.length, 1)) * 30 + Math.min(user.followers, 50) * 1.4));
  const diversity = Math.min(100, sortedLangs.length * 20);

  const overallScore = Math.round((codeQuality + projectComplexity + documentation + consistency + collaboration + diversity) / 6);

  const topRepos = repos.slice(0, 6).map((r: any) => ({
    name: r.name,
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    language: r.language || "N/A",
  }));

  return {
    username: user.login,
    avatarUrl: user.avatar_url,
    name: user.name || user.login,
    bio: user.bio || "",
    repos: user.public_repos,
    followers: user.followers,
    following: user.following,
    topLanguages: sortedLangs,
    skillRadar: [
      { skill: "Code Quality", level: codeQuality },
      { skill: "Complexity", level: projectComplexity },
      { skill: "Documentation", level: documentation },
      { skill: "Consistency", level: consistency },
      { skill: "Collaboration", level: collaboration },
      { skill: "Diversity", level: diversity },
    ],
    overallScore,
    repoDetails: topRepos,
    totalStars,
    totalForks,
    profileUrl: user.html_url,
  };
}

export default function GitHubAnalyzer() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    setError("");
    setProfile(null);
    try {
      const data = await fetchGitHubProfile(username.trim());
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile. Check the username and try again.");
    }
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
            <Github className="w-6 h-6 text-foreground" /> GitHub Profile Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Evaluate coding skills from your real GitHub activity</p>
        </div>

        {/* Input - always visible */}
        <div className="glass-card p-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">GitHub Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="e.g. torvalds"
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <button className="neon-button text-sm flex items-center gap-2 h-[46px]" onClick={handleAnalyze} disabled={isLoading || !username.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error && <p className="text-xs text-destructive mt-3">{error}</p>}
        </div>

        {isLoading && (
          <div className="glass-card p-12 text-center neon-border">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">Fetching GitHub Data...</h2>
            <p className="text-sm text-muted-foreground">Analyzing @{username}</p>
          </div>
        )}

        {profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Profile Header */}
            <div className="glass-card p-6 neon-border flex flex-col sm:flex-row items-center gap-6">
              <img src={profile.avatarUrl} alt={profile.name} className="w-20 h-20 rounded-full border-2 border-primary/30" />
              <div className="text-center sm:text-left flex-1">
                <h2 className="font-display text-lg font-bold text-foreground">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && <p className="text-xs text-muted-foreground mt-1">{profile.bio}</p>}
                <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start text-xs text-muted-foreground">
                  <span>{profile.followers} followers</span>
                  <span>{profile.following} following</span>
                </div>
              </div>
              <div className="text-center">
                <div className={`font-display text-4xl font-bold ${profile.overallScore >= 60 ? "neon-text" : profile.overallScore >= 40 ? "text-neon-orange" : "text-destructive"}`}>
                  {profile.overallScore}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" className="neon-button-outline text-xs px-3 py-2 flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> View Profile
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Code, label: "Repositories", value: profile.repos },
                { icon: Star, label: "Total Stars", value: profile.totalStars },
                { icon: GitFork, label: "Total Forks", value: profile.totalForks },
                { icon: BarChart3, label: "Followers", value: profile.followers },
              ].map((s, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="font-display text-xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Skill Radar */}
              <div className="glass-card p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-foreground">Skill Assessment</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={profile.skillRadar}>
                    <PolarGrid stroke="hsl(222, 30%, 18%)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} />
                    <Radar dataKey="level" fill="hsl(190, 100%, 50%)" fillOpacity={0.2} stroke="hsl(190, 100%, 50%)" strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Languages */}
              <div className="glass-card p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-foreground">Top Languages</h2>
                <div className="space-y-3">
                  {profile.topLanguages.map((l, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground">{l.name}</span>
                        <span className="text-muted-foreground">{l.pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${l.pct}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Repos */}
            {profile.repoDetails.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-foreground">Top Repositories</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.repoDetails.map((r, i) => (
                    <a key={i} href={`https://github.com/${profile.username}/${r.name}`} target="_blank" rel="noopener noreferrer"
                      className="glass-card-hover p-4 group"
                    >
                      <div className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">{r.name}</div>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" />{r.stars}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{r.forks}</span>
                        <span>{r.language}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
