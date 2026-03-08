import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CareerAssessment from "./pages/CareerAssessment";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import GitHubAnalyzer from "./pages/GitHubAnalyzer";
import InterviewSimulator from "./pages/InterviewSimulator";
import AIMentor from "./pages/AIMentor";
import CareerSimulation from "./pages/CareerSimulation";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/career-assessment" element={<CareerAssessment />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/github-analyzer" element={<GitHubAnalyzer />} />
          <Route path="/interview-sim" element={<InterviewSimulator />} />
          <Route path="/ai-mentor" element={<AIMentor />} />
          <Route path="/career-simulation" element={<CareerSimulation />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
