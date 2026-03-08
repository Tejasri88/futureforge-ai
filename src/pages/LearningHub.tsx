import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Play, Search, BookOpen, Clock, Star, Filter, TrendingUp,
  CheckCircle, PlayCircle, Bookmark, BookmarkCheck, List,
  BarChart3, Brain, Zap, ChevronRight, X, Maximize2, Volume2,
  SkipForward, SkipBack, Pause, Monitor, Award, Lightbulb,
  GraduationCap, Target, Globe, FileText
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────

interface Video {
  id: string;
  title: string;
  language: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  durationMin: number;
  thumbnail: string;
  youtubeId: string;
  tags: string[];
  completed: boolean;
  inProgress: boolean;
  bookmarked: boolean;
  channel: string;
  description: string;
  category: string;
}

const languages = [
  "All", "Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust",
  "TypeScript", "Kotlin", "Swift", "PHP", "R", "SQL", "MATLAB"
];

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

const categories = [
  "All", "Programming Languages", "Web Development", "Data Science",
  "Machine Learning", "Artificial Intelligence", "Cloud Computing"
];

const skillTags = [
  "Data Structures", "Algorithms", "Web Development", "Machine Learning",
  "Data Analysis", "API Development", "Automation", "Databases",
  "Cloud Computing", "DevOps", "Cybersecurity", "Mobile Development",
  "Artificial Intelligence"
];

const generateVideos = (): Video[] => [
    // Python
    { id: "py1", title: "Python Tutorial – Full Course for Beginners", language: "Python", topic: "Fundamentals", difficulty: "Beginner", duration: "4:26:52", durationMin: 267, thumbnail: "", youtubeId: "rfscVS0vtbw", tags: ["Data Structures"], completed: true, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Learn Python fundamentals including syntax, variables, and basic operations.", category: "Programming Languages" },
    { id: "py2", title: "Python for Beginners – Learn Python in 1 Hour", language: "Python", topic: "Fundamentals", difficulty: "Beginner", duration: "1:00:06", durationMin: 60, thumbnail: "", youtubeId: "kqtD5dpn9C8", tags: ["Data Structures"], completed: true, inProgress: false, bookmarked: false, channel: "Programming with Mosh", description: "Quick introduction to Python variables, data types, and control flow.", category: "Programming Languages" },
    { id: "py3", title: "Intermediate Python Programming Course", language: "Python", topic: "Control Flow", difficulty: "Intermediate", duration: "5:55:46", durationMin: 356, thumbnail: "", youtubeId: "HGOBQPFzWKo", tags: ["Algorithms"], completed: false, inProgress: true, bookmarked: true, channel: "freeCodeCamp", description: "Master advanced Python concepts: generators, decorators, and more.", category: "Programming Languages" },
    { id: "py4", title: "Python OOP Tutorial – Classes and Objects", language: "Python", topic: "OOP", difficulty: "Intermediate", duration: "1:20:43", durationMin: 81, thumbnail: "", youtubeId: "ZDa-Z5JzLYM", tags: ["Data Structures", "Algorithms"], completed: false, inProgress: false, bookmarked: false, channel: "Corey Schafer", description: "Classes, inheritance, polymorphism, and encapsulation explained.", category: "Programming Languages" },
    { id: "py5", title: "Pandas & Python for Data Analysis", language: "Python", topic: "Data Science", difficulty: "Intermediate", duration: "2:00:25", durationMin: 120, thumbnail: "", youtubeId: "gtjBPey3Oc8", tags: ["Data Analysis", "Machine Learning"], completed: false, inProgress: false, bookmarked: false, channel: "Keith Galli", description: "Data manipulation and analysis with Pandas DataFrames.", category: "Data Science" },
    { id: "py6", title: "Machine Learning for Everybody – Full Course", language: "Python", topic: "ML", difficulty: "Advanced", duration: "3:53:53", durationMin: 234, thumbnail: "", youtubeId: "i_LwzRVP7bg", tags: ["Machine Learning", "Data Analysis"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Complete ML pipeline: data prep, model training, evaluation, and deployment.", category: "Machine Learning" },
    { id: "py7", title: "Flask Course – Python Web Application Development", language: "Python", topic: "Web Dev", difficulty: "Advanced", duration: "6:21:19", durationMin: 381, thumbnail: "", youtubeId: "Qr4QMBUPxWo", tags: ["API Development", "Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Build production-ready REST APIs using Flask and SQLAlchemy.", category: "Web Development" },
    { id: "py8", title: "Automate with Python – Full Course for Beginners", language: "Python", topic: "Automation", difficulty: "Advanced", duration: "2:51:02", durationMin: 171, thumbnail: "", youtubeId: "PXMJ6FS7llk", tags: ["Automation"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Automate real-world tasks: web scraping, file management, and emails.", category: "Programming Languages" },
    // JavaScript
    { id: "js1", title: "JavaScript Tutorial Full Course for Beginners", language: "JavaScript", topic: "Fundamentals", difficulty: "Beginner", duration: "8:01:23", durationMin: 481, thumbnail: "", youtubeId: "EfAl9bwzVZk", tags: ["Web Development"], completed: true, inProgress: false, bookmarked: false, channel: "Bro Code", description: "Core JavaScript concepts: variables, operators, control flow, and functions.", category: "Web Development" },
    { id: "js2", title: "Learn DOM Manipulation In 18 Minutes", language: "JavaScript", topic: "DOM", difficulty: "Beginner", duration: "18:37", durationMin: 19, thumbnail: "", youtubeId: "y17RuWkWdn8", tags: ["Web Development"], completed: false, inProgress: true, bookmarked: false, channel: "Web Dev Simplified", description: "Select, create, and modify HTML elements dynamically with JavaScript.", category: "Web Development" },
    { id: "js3", title: "JavaScript Promises In 10 Minutes", language: "JavaScript", topic: "Async", difficulty: "Intermediate", duration: "11:31", durationMin: 12, thumbnail: "", youtubeId: "DHvZLI7Db8E", tags: ["Web Development", "API Development"], completed: false, inProgress: false, bookmarked: true, channel: "Web Dev Simplified", description: "Understand callbacks, promises, and async/await for asynchronous programming.", category: "Web Development" },
    { id: "js4", title: "React Course – Beginner's Tutorial for React", language: "JavaScript", topic: "React", difficulty: "Intermediate", duration: "11:55:27", durationMin: 715, thumbnail: "", youtubeId: "bMknfKXIFA8", tags: ["Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Build modern UIs with React: components, hooks, state, and routing.", category: "Web Development" },
    { id: "js5", title: "Node.js and Express.js – Full Course", language: "JavaScript", topic: "Backend", difficulty: "Advanced", duration: "8:16:47", durationMin: 497, thumbnail: "", youtubeId: "Oe421EPjeBE", tags: ["API Development", "Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Server-side JavaScript with Node.js, Express, middleware, and REST APIs.", category: "Web Development" },
    // Java
    { id: "ja1", title: "Java Tutorial for Beginners", language: "Java", topic: "Fundamentals", difficulty: "Beginner", duration: "2:30:48", durationMin: 151, thumbnail: "", youtubeId: "eIrMbAQSU34", tags: ["Data Structures"], completed: false, inProgress: false, bookmarked: false, channel: "Programming with Mosh", description: "Java syntax, data types, control structures, and basic I/O.", category: "Programming Languages" },
    { id: "ja2", title: "Java Full Course for Free ☕", language: "Java", topic: "OOP", difficulty: "Intermediate", duration: "12:00:00", durationMin: 720, thumbnail: "", youtubeId: "xk4_1vDrzzo", tags: ["Data Structures", "Algorithms"], completed: false, inProgress: false, bookmarked: false, channel: "Bro Code", description: "Master Java OOP: classes, objects, inheritance, and interfaces.", category: "Programming Languages" },
    { id: "ja3", title: "Spring Boot Tutorial for Beginners", language: "Java", topic: "Spring Boot", difficulty: "Advanced", duration: "2:10:29", durationMin: 130, thumbnail: "", youtubeId: "9SGDpanrc8U", tags: ["API Development", "Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "Amigoscode", description: "Build enterprise-grade REST APIs with Spring Boot and JPA.", category: "Web Development" },
    // C++
    { id: "cp1", title: "C++ Tutorial for Beginners – Full Course", language: "C++", topic: "Fundamentals", difficulty: "Beginner", duration: "4:01:19", durationMin: 241, thumbnail: "", youtubeId: "vLnPwxZdW4Y", tags: ["Data Structures", "Algorithms"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "C++ basics: variables, pointers, arrays, and memory management.", category: "Programming Languages" },
    { id: "cp2", title: "C++ Full Course for Free 🤤", language: "C++", topic: "DSA", difficulty: "Intermediate", duration: "6:00:00", durationMin: 360, thumbnail: "", youtubeId: "-TkoO8Z07hI", tags: ["Data Structures", "Algorithms"], completed: false, inProgress: false, bookmarked: false, channel: "Bro Code", description: "Complete C++ course covering DSA, OOP, and STL.", category: "Programming Languages" },
    // TypeScript
    { id: "ts1", title: "TypeScript Tutorial for Beginners", language: "TypeScript", topic: "Fundamentals", difficulty: "Beginner", duration: "1:04:28", durationMin: 64, thumbnail: "", youtubeId: "d56mG7DezGs", tags: ["Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "Programming with Mosh", description: "TypeScript types, interfaces, generics, and compiler configuration.", category: "Web Development" },
    { id: "ts2", title: "React & TypeScript – Full Course", language: "TypeScript", topic: "Advanced Types", difficulty: "Advanced", duration: "1:42:55", durationMin: 103, thumbnail: "", youtubeId: "FJDVKeh7RJI", tags: ["Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Build React apps with TypeScript: typed props, hooks, and context.", category: "Web Development" },
    // SQL
    { id: "sq1", title: "SQL Tutorial – Full Database Course for Beginners", language: "SQL", topic: "Databases", difficulty: "Beginner", duration: "4:20:37", durationMin: 261, thumbnail: "", youtubeId: "HXV3zeQKqGY", tags: ["Databases", "Data Analysis"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "SELECT, WHERE, GROUP BY, JOINs, and aggregate functions for analysis.", category: "Data Science" },
    { id: "sq2", title: "MySQL Full Course for Free 🐬", language: "SQL", topic: "Advanced SQL", difficulty: "Advanced", duration: "3:02:15", durationMin: 182, thumbnail: "", youtubeId: "5OdVJbNCSso", tags: ["Databases", "Data Analysis"], completed: false, inProgress: false, bookmarked: false, channel: "Bro Code", description: "Advanced MySQL: joins, subqueries, stored procedures, and triggers.", category: "Data Science" },
    // Go
    { id: "go1", title: "Go Programming – Golang Course with Bonus Projects", language: "Go", topic: "Fundamentals", difficulty: "Beginner", duration: "9:31:43", durationMin: 572, thumbnail: "", youtubeId: "un6ZyFkqFKo", tags: ["Cloud Computing", "DevOps"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Go syntax, goroutines, channels, and building real projects.", category: "Cloud Computing" },
    // Rust
    { id: "rs1", title: "Rust Programming Course for Beginners", language: "Rust", topic: "Fundamentals", difficulty: "Beginner", duration: "1:31:55", durationMin: 92, thumbnail: "", youtubeId: "MsocPEZBd-M", tags: ["Data Structures"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Ownership, borrowing, lifetimes, and memory safety in Rust.", category: "Programming Languages" },
    // Kotlin
    { id: "kt1", title: "Kotlin Course – Tutorial for Beginners", language: "Kotlin", topic: "Mobile Dev", difficulty: "Intermediate", duration: "2:38:29", durationMin: 158, thumbnail: "", youtubeId: "F9UC9DY-vIU", tags: ["Mobile Development"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Kotlin fundamentals and Android app development.", category: "Programming Languages" },
    // Swift
    { id: "sw1", title: "Swift Programming Tutorial – Full Course for Beginners", language: "Swift", topic: "Mobile Dev", difficulty: "Beginner", duration: "5:28:08", durationMin: 328, thumbnail: "", youtubeId: "comQ1-x2a1Q", tags: ["Mobile Development"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Swift syntax, SwiftUI basics, and building your first iOS app.", category: "Programming Languages" },
    // Data Science & ML
    { id: "ds1", title: "Data Analysis with Python – Full Course for Beginners", language: "Python", topic: "Data Science", difficulty: "Beginner", duration: "4:22:12", durationMin: 262, thumbnail: "", youtubeId: "r-uOLxNrNk8", tags: ["Data Analysis", "Machine Learning"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "End-to-end data analysis: Numpy, Pandas, Matplotlib, and Seaborn.", category: "Data Science" },
    { id: "ml1", title: "TensorFlow 2.0 Complete Course", language: "Python", topic: "Deep Learning", difficulty: "Advanced", duration: "6:52:08", durationMin: 412, thumbnail: "", youtubeId: "tPYj3fFJGjk", tags: ["Machine Learning", "Artificial Intelligence"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Neural networks, CNNs, RNNs, and NLP with TensorFlow 2.0.", category: "Artificial Intelligence" },
    // Cloud
    { id: "cl1", title: "AWS Certified Cloud Practitioner Training", language: "Go", topic: "Cloud", difficulty: "Beginner", duration: "13:13:16", durationMin: 793, thumbnail: "", youtubeId: "SOTamWNgDKc", tags: ["Cloud Computing", "DevOps"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "Core AWS services, cloud concepts, security, and pricing fundamentals.", category: "Cloud Computing" },
    // C#
    { id: "cs1", title: "C# Tutorial – Full Course for Beginners", language: "C#", topic: "Fundamentals", difficulty: "Beginner", duration: "4:31:08", durationMin: 271, thumbnail: "", youtubeId: "GhQdlMFylQ8", tags: ["Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "C# basics: types, classes, LINQ, and .NET framework overview.", category: "Programming Languages" },
    // PHP
    { id: "ph1", title: "PHP For Beginners – Full Course", language: "PHP", topic: "Fundamentals", difficulty: "Beginner", duration: "3:14:45", durationMin: 195, thumbnail: "", youtubeId: "U2lQWR6uIuo", tags: ["Web Development"], completed: false, inProgress: false, bookmarked: false, channel: "Traversy Media", description: "PHP syntax, forms, MySQL integration, and building dynamic websites.", category: "Web Development" },
    // R
    { id: "r1", title: "R Programming Tutorial – Full Course for Beginners", language: "R", topic: "Data Science", difficulty: "Beginner", duration: "2:10:25", durationMin: 130, thumbnail: "", youtubeId: "_V8eKsto3Ug", tags: ["Data Analysis"], completed: false, inProgress: false, bookmarked: false, channel: "freeCodeCamp", description: "R basics, data frames, ggplot2 visualizations, and statistical analysis.", category: "Data Science" },
  ];

const learningPaths: Record<string, { beginner: string[]; intermediate: string[]; advanced: string[] }> = {
  Python: {
    beginner: ["Python Basics", "Variables & Data Types", "Loops and Functions"],
    intermediate: ["OOP in Python", "File Handling", "NumPy & Pandas"],
    advanced: ["Machine Learning with Python", "API Development", "Automation Projects"],
  },
  JavaScript: {
    beginner: ["JS Fundamentals", "DOM Manipulation", "Events & Forms"],
    intermediate: ["Async JavaScript", "React.js", "State Management"],
    advanced: ["Node.js Backend", "Full-Stack Projects", "Testing & CI/CD"],
  },
  Java: {
    beginner: ["Java Basics", "Control Flow", "Arrays & Strings"],
    intermediate: ["OOP Concepts", "Collections Framework", "Exception Handling"],
    advanced: ["Spring Boot", "Microservices", "System Design"],
  },
  SQL: {
    beginner: ["SQL Basics", "SELECT & WHERE", "JOINs"],
    intermediate: ["Subqueries", "Window Functions", "Indexing"],
    advanced: ["Query Optimization", "Database Design", "Stored Procedures"],
  },
};

const trendingTopics = [
  { name: "Generative AI with Python", growth: 92 },
  { name: "Rust Systems Programming", growth: 78 },
  { name: "TypeScript Full-Stack", growth: 85 },
  { name: "Go Cloud Services", growth: 71 },
  { name: "SQL for Data Engineering", growth: 68 },
];

const careerPaths: Record<string, string[]> = {
  "Data Analyst": ["Excel Tutorials", "SQL for Analysis", "Python for Data", "Power BI / Tableau"],
  "AI Engineer": ["Python Basics", "Linear Algebra", "ML Fundamentals", "Deep Learning", "MLOps"],
  "Web Developer": ["HTML/CSS", "JavaScript", "React.js", "Node.js", "Databases"],
  "DevOps Engineer": ["Linux Basics", "Docker", "Kubernetes", "CI/CD", "Cloud (AWS/GCP)"],
};

const weeklyRecs = [
  { title: "Python List Comprehensions", lang: "Python", reason: "Fills your Data Structures gap" },
  { title: "SQL Window Functions", lang: "SQL", reason: "High demand in Data Analyst roles" },
  { title: "TypeScript Generics", lang: "TypeScript", reason: "Trending in web development" },
];

// ── Component ─────────────────────────────────────────────────────

export default function LearningHub() {
  const [videos, setVideos] = useState<Video[]>(generateVideos);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");
  const [selectedDiff, setSelectedDiff] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("library");
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [playlist, setPlaylist] = useState<Video[]>([]);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (selectedLang !== "All" && v.language !== selectedLang) return false;
      if (selectedDiff !== "All" && v.difficulty !== selectedDiff) return false;
      if (selectedTag !== "All" && !v.tags.includes(selectedTag)) return false;
      if (selectedCategory !== "All" && v.category !== selectedCategory) return false;
      if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.language.toLowerCase().includes(search.toLowerCase()) && !v.topic.toLowerCase().includes(search.toLowerCase()) && !v.channel.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [videos, selectedLang, selectedDiff, selectedTag, selectedCategory, search]);

  const stats = useMemo(() => {
    const completed = videos.filter((v) => v.completed).length;
    const inProg = videos.filter((v) => v.inProgress).length;
    const totalMin = videos.filter((v) => v.completed).reduce((a, v) => a + v.durationMin, 0);
    const uniqueTags = new Set(videos.filter((v) => v.completed).flatMap((v) => v.tags));
    return { completed, inProg, totalMin, skillsGained: uniqueTags.size };
  }, [videos]);

  const toggleBookmark = (id: string) => setVideos((p) => p.map((v) => v.id === id ? { ...v, bookmarked: !v.bookmarked } : v));
  const markComplete = (id: string) => setVideos((p) => p.map((v) => v.id === id ? { ...v, completed: true, inProgress: false } : v));
  const addToPlaylist = (v: Video) => { if (!playlist.find((p) => p.id === v.id)) setPlaylist((p) => [...p, v]); };
  const removeFromPlaylist = (id: string) => setPlaylist((p) => p.filter((v) => v.id !== id));

  const diffColor = (d: string) => d === "Beginner" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : d === "Intermediate" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display gradient-text">AI Learning Hub</h1>
            <p className="text-muted-foreground text-sm mt-1">Programming Video Library – Learn, Build, Grow</p>
          </div>
          <div className="flex gap-2">
            {[
              { icon: Monitor, label: `${stats.completed} Watched`, val: stats.completed },
              { icon: Clock, label: `${Math.round(stats.totalMin / 60)}h Learned`, val: stats.totalMin },
              { icon: Zap, label: `${stats.skillsGained} Skills`, val: stats.skillsGained },
            ].map((s, i) => (
              <div key={i} className="glass-card px-3 py-2 flex items-center gap-2">
                <s.icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 border border-border">
            {[
              { val: "library", label: "Video Library", icon: Play },
              { val: "paths", label: "Learning Paths", icon: BookOpen },
              { val: "trending", label: "Trending", icon: TrendingUp },
              { val: "recommendations", label: "AI Recommendations", icon: Brain },
              { val: "progress", label: "My Progress", icon: BarChart3 },
              { val: "playlist", label: "My Playlist", icon: List },
            ].map((t) => (
              <TabsTrigger key={t.val} value={t.val} className="gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <t.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── Video Library ─── */}
          <TabsContent value="library" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos by title, language, channel, or topic..." className="pl-9 bg-muted/30 border-border" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={selectedDiff} onChange={(e) => setSelectedDiff(e.target.value)} className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="All">All Skills</option>
                  {skillTags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Language pills */}
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {languages.map((l) => (
                  <button key={l} onClick={() => setSelectedLang(l)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${selectedLang === l ? "bg-primary/20 text-primary border-primary/40" : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((v) => (
                  <motion.div key={v.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                    <Card className="glass-card-hover overflow-hidden group cursor-pointer" onClick={() => setPlayingVideo(v)}>
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-muted/30 overflow-hidden">
                        <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-primary drop-shadow-lg" />
                        </div>
                        <Badge className={`absolute top-2 left-2 text-[10px] border ${diffColor(v.difficulty)}`}>{v.difficulty}</Badge>
                        <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-[10px] px-2 py-0.5 rounded font-mono">{v.duration}</div>
                        {v.completed && <div className="absolute top-2 right-2"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>}
                      </div>
                      <CardContent className="p-3 space-y-2">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{v.title}</h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{v.description}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          <span className="font-medium">{v.channel}</span>
                          <span>·</span>
                          <span>{v.category}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{v.language}</Badge>
                          {v.tags.slice(0, 2).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); toggleBookmark(v.id); }} className="p-1 rounded hover:bg-muted/50 transition-colors">
                              {v.bookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); addToPlaylist(v); }} className="p-1 rounded hover:bg-muted/50 transition-colors">
                              <List className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {!v.completed && (
                              <button onClick={(e) => { e.stopPropagation(); markComplete(v.id); }} className="p-1 rounded hover:bg-muted/50 transition-colors">
                                <CheckCircle className="w-4 h-4 text-muted-foreground hover:text-emerald-400" />
                              </button>
                            )}
                          </div>
                          {v.inProgress && <span className="text-[10px] text-amber-400 font-medium">In Progress</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No videos match your filters. Try adjusting your search.</p>
              </div>
            )}
          </TabsContent>

          {/* ─── Learning Paths ─── */}
          <TabsContent value="paths" className="space-y-6 mt-4">
            {Object.entries(learningPaths).map(([lang, stages]) => (
              <Card key={lang} className="glass-card overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg gradient-text">{lang} Learning Path</CardTitle>
                  <CardDescription>Structured progression from beginner to advanced</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                      <div key={level} className="space-y-2">
                        <Badge className={`${diffColor(level.charAt(0).toUpperCase() + level.slice(1))} border text-xs`}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Badge>
                        <div className="space-y-1.5">
                          {stages[level].map((topic, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                              <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                              <span className="text-xs text-foreground">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Career-based paths */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> AI Career-Based Learning Paths</CardTitle>
                <CardDescription>Auto-generated paths based on your target career</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {Object.entries(careerPaths).map(([career, steps]) => (
                  <div key={career} className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-3">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" /> {career}
                    </h4>
                    <div className="flex items-center gap-1 flex-wrap">
                      {steps.map((s, i) => (
                        <span key={i} className="flex items-center text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{s}</span>
                          {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Trending ─── */}
          <TabsContent value="trending" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Trending Programming Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((t, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{t.name}</span>
                        <span className="text-xs text-primary font-mono">+{t.growth}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${t.growth}%` }} transition={{ duration: 1, delay: i * 0.15 }} className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base">🔥 Hot This Week</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {["Prompt Engineering with Python", "Rust for Web Assembly", "Go Microservices", "TypeScript Design Patterns"].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-foreground">{t}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base">📈 Fastest Growing Languages</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[{ l: "Rust", g: "+45%" }, { l: "Go", g: "+38%" }, { l: "TypeScript", g: "+32%" }, { l: "Kotlin", g: "+28%" }].map((x, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/50">
                      <span className="text-xs text-foreground font-medium">{x.l}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">{x.g}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── AI Recommendations ─── */}
          <TabsContent value="recommendations" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> AI Skill Gap Recommendations</CardTitle>
                <CardDescription>Videos recommended based on your skill gaps and career goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { skill: "SQL", video: "SQL Basics for Data Analysis", reason: "Missing skill detected in your profile" },
                  { skill: "Machine Learning", video: "ML with Python – Full Course", reason: "Required for your AI Engineer career path" },
                  { skill: "Cloud Computing", video: "Go Cloud Services", reason: "High demand in your target industry" },
                ].map((r, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/50 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">Missing: {r.skill}</Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground">{r.video}</p>
                      <p className="text-xs text-muted-foreground">{r.reason}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Weekly Learning Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weeklyRecs.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <PlayCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground">{r.lang} · {r.reason}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Progress ─── */}
          <TabsContent value="progress" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Monitor, label: "Videos Watched", value: stats.completed, color: "text-primary" },
                { icon: Clock, label: "Hours Learned", value: `${(stats.totalMin / 60).toFixed(1)}h`, color: "text-emerald-400" },
                { icon: Zap, label: "Skills Gained", value: stats.skillsGained, color: "text-amber-400" },
                { icon: PlayCircle, label: "In Progress", value: stats.inProg, color: "text-secondary" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="glass-card p-4 text-center">
                    <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base">Video Progress</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {videos.filter((v) => v.completed || v.inProgress).map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                    <div className={`w-2 h-2 rounded-full ${v.completed ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span className="text-xs text-foreground flex-1 truncate">{v.title}</span>
                    <Badge className={v.completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"}>
                      {v.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Certification Tracker</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Python Fundamentals", progress: 75 },
                  { name: "JavaScript Essentials", progress: 40 },
                  { name: "SQL for Data Analysis", progress: 10 },
                ].map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Playlist ─── */}
          <TabsContent value="playlist" className="space-y-4 mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><List className="w-5 h-5 text-primary" /> My Learning Playlist</CardTitle>
                <CardDescription>{playlist.length} video{playlist.length !== 1 ? "s" : ""} · {playlist.reduce((a, v) => a + v.durationMin, 0)} min total</CardDescription>
              </CardHeader>
              <CardContent>
                {playlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <List className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Your playlist is empty. Add videos from the library!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playlist.map((v, i) => (
                      <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                        <span className="text-xs text-muted-foreground font-mono w-5">{i + 1}</span>
                        <img src={`https://img.youtube.com/vi/${v.youtubeId}/default.jpg`} alt="" className="w-16 h-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{v.title}</p>
                          <p className="text-[10px] text-muted-foreground">{v.language} · {v.duration}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPlayingVideo(v)}>
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromPlaylist(v.id)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ─── Video Player Modal ─── */}
        <AnimatePresence>
          {playingVideo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPlayingVideo(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-5xl glass-card overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{playingVideo.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" />{playingVideo.channel}</span>
                      <Badge variant="outline" className="text-[10px]">{playingVideo.language}</Badge>
                      <Badge className={`${diffColor(playingVideo.difficulty)} border text-[10px]`}>{playingVideo.difficulty}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{playingVideo.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setPlayingVideo(null)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="aspect-video bg-black">
                  <iframe src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1`} title={playingVideo.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <div className="p-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {playingVideo.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Video Notes</label>
                    <Textarea value={notes[playingVideo.id] || ""} onChange={(e) => setNotes((p) => ({ ...p, [playingVideo.id]: e.target.value }))} placeholder="Take notes while watching..." className="bg-muted/30 border-border text-sm min-h-[60px]" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleBookmark(playingVideo.id)}>
                      {playingVideo.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 mr-1" /> : <Bookmark className="w-3.5 h-3.5 mr-1" />}
                      {playingVideo.bookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addToPlaylist(playingVideo)}>
                      <List className="w-3.5 h-3.5 mr-1" /> Add to Playlist
                    </Button>
                    {!playingVideo.completed && (
                      <Button size="sm" onClick={() => { markComplete(playingVideo.id); setPlayingVideo({ ...playingVideo, completed: true }); }}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
