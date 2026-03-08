import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function safeJoin(val: any): string {
  if (Array.isArray(val)) return val.map(v => typeof v === "string" ? v : JSON.stringify(v)).join(", ");
  if (val && typeof val === "object") return Object.values(val).flat().map((v: any) => typeof v === "string" ? v : JSON.stringify(v)).join(", ");
  if (typeof val === "string") return val;
  return "";
}

function buildFullAnalysisPrompt(body: any): string {
  const { assessmentAnswers, currentSkills, targetCareer, resumeSummary, interests, resumeSkills, education, experience, projects } = body;
  return `Perform a comprehensive career analysis for a user with the following profile:

Assessment answers (indices): ${JSON.stringify(assessmentAnswers || [])}
Current skills: ${safeJoin(currentSkills) || "Not provided"}
Resume extracted skills: ${safeJoin(resumeSkills) || "Not provided"}
User interests: ${safeJoin(interests) || "Not provided"}
Target career: ${targetCareer || "Not specified"}
Resume summary: ${resumeSummary || "Not provided"}
Education: ${safeJoin(education) || "Not provided"}
Work experience: ${safeJoin(experience) || "Not provided"}
Projects: ${safeJoin(projects) || "Not provided"}

Return a JSON object with this EXACT structure:
{
  "careerScore": {
    "overall": 78,
    "factors": {
      "skills": 72,
      "projects": 65,
      "experience": 80,
      "marketDemand": 85
    }
  },
  "topCareers": [
    {"title": "Career Name", "match": 85, "description": "Why this fits", "avgSalary": "₹12L", "growth": "+15%", "demandLevel": "high"}
  ],
  "careerProbabilities": [
    {"career": "Data Analyst", "probability": 85, "factors": ["strong SQL", "analytical mindset"]}
  ],
  "marketIntelligence": {
    "trendingCareers": [{"title": "AI Engineer", "growth": "+32%", "demand": "very high"}],
    "topDemandedSkills": [{"skill": "Python", "demand": 92, "salaryImpact": "+₹2L"}],
    "salaryRanges": [{"role": "Data Analyst", "entry": "₹4.5L", "mid": "₹8L", "senior": "₹15L"}],
    "industryGrowth": [{"industry": "AI/ML", "rate": "+28%", "outlook": "Excellent"}]
  },
  "skillImpact": [
    {"skill": "SQL", "careerImpact": "increases Data Analyst opportunities by 35%", "salaryBoost": "+₹1.5L", "timeToLearn": "4 weeks"}
  ],
  "careerRisks": [
    {"risk": "Automation of manual data entry", "severity": "high", "alternative": "Focus on data analysis and visualization skills", "timeframe": "2-3 years"}
  ],
  "opportunities": [
    {"type": "internship", "title": "Data Analytics Intern", "description": "Great for building portfolio", "matchScore": 85},
    {"type": "hackathon", "title": "MLH Data Hack", "description": "Build data projects with teams", "matchScore": 78}
  ],
  "digitalTwin": {
    "timeline": [
      {"year": 1, "role": "Junior Data Analyst", "salary": "₹4.5L", "skills": ["SQL", "Excel", "Python"]},
      {"year": 3, "role": "Data Analyst", "salary": "₹8L", "skills": ["Tableau", "Statistics"]},
      {"year": 5, "role": "Senior Data Analyst", "salary": "₹15L", "skills": ["ML Basics", "Leadership"]},
      {"year": 8, "role": "Data Science Manager", "salary": "₹25L", "skills": ["Team Management", "Strategy"]}
    ]
  },
  "weeklyReport": {
    "summary": "Brief weekly career progress summary",
    "recommendations": ["Learn SQL this week", "Start a portfolio project"],
    "focusArea": "Core Technical Skills"
  },
  "scenarioSimulations": [
    {"scenario": "Learn Machine Learning", "outcome": "Career shifts toward Data Scientist (+15% salary)", "probability": 72},
    {"scenario": "Get AWS Certification", "outcome": "Opens Cloud Engineer path (+20% salary)", "probability": 68}
  ],
  "globalOpportunities": [
    {"country": "India", "demand": "very high", "avgSalary": "₹12L", "topCities": ["Bangalore", "Hyderabad"]},
    {"country": "USA", "demand": "very high", "avgSalary": "₹50L", "topCities": ["San Francisco", "New York"]}
  ],
  "mentorRecommendations": [
    {"type": "community", "name": "Kaggle", "description": "Data science competitions and learning", "url": "https://kaggle.com"},
    {"type": "platform", "name": "DataCamp", "description": "Interactive data science courses", "url": "https://datacamp.com"}
  ],
  "skillStrength": {
    "strong": [{"skill": "Python", "level": 85, "evidence": "Multiple projects and 3 years experience"}],
    "developing": [{"skill": "Statistics", "level": 55, "evidence": "Basic coursework, needs practical application"}],
    "missing": [{"skill": "Power BI", "level": 0, "evidence": "Not found in resume or skills"}]
  },
  "resumeInsights": {
    "extractedSkills": ["Python", "SQL", "Excel"],
    "strengthAreas": ["Data analysis", "Programming"],
    "improvementAreas": ["Add more project descriptions", "Highlight quantified achievements"],
    "atsScore": 72
  },
  "learningEfficiency": {
    "estimatedLearningSpeed": "moderate",
    "recommendedStrategy": "Focus on project-based learning for fastest skill acquisition",
    "weeklyHoursNeeded": 10
  },
  "careerRoutes": [
    {"name": "Fast Track", "duration": "12 months", "skills": ["SQL", "Tableau"], "intensity": "high"},
    {"name": "Balanced", "duration": "18 months", "skills": ["SQL", "Python", "Tableau"], "intensity": "medium"},
    {"name": "Expert", "duration": "24 months", "skills": ["SQL", "Python", "ML", "Tableau", "Stats"], "intensity": "low"}
  ]
}

IMPORTANT: All salary and monetary values MUST be in Indian Rupees (₹) using the Indian numbering system (Lakhs "L" and Crores "Cr"). For example: ₹4.5L, ₹12L, ₹25L, ₹1.2Cr. Do NOT use USD ($) or any other currency.

Provide 5 top careers, 5 career probabilities, 4-6 skill impacts, 3-4 risks, 5 opportunities, and 3-4 global markets. Make all data realistic and industry-aligned. If resume skills and interests are provided, heavily weight them in the analysis.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "full_analysis") {
      systemPrompt = `You are an elite AI career advisor with deep knowledge of the global job market, skill trends, salary data, and career trajectories. You analyze resumes, skills, interests, and assessment data to provide data-driven, actionable career intelligence. Return only valid JSON.`;
      userPrompt = buildFullAnalysisPrompt(body);

    } else if (action === "chat") {
      const { messages, userContext } = body;
      systemPrompt = `You are Career AI, an intelligent career advisor for FutureForge. You have access to the user's career data:
- Target career: ${userContext?.targetCareer || "Not set"}
- Career score: ${userContext?.careerScore || "Not assessed"}
- Current skills: ${(userContext?.skills || []).join(", ") || "Not provided"}
- Interests: ${(userContext?.interests || []).join(", ") || "Not provided"}

Provide specific, actionable career advice. Be encouraging but realistic. Use data and examples. Keep responses concise (2-4 paragraphs max). Format with markdown.`;

      const aiMessages = [
        { role: "system", content: systemPrompt },
        ...(messages || []).map((m: any) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: aiMessages, stream: true }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });

    } else if (action === "simulate_scenario") {
      const { scenario, currentProfile } = body;
      systemPrompt = `You are a career scenario simulator. Given a career decision, predict its impact on the user's career trajectory. Return JSON only.`;
      userPrompt = `User profile: ${JSON.stringify(currentProfile || {})}
Scenario: "${scenario}"

Return JSON:
{
  "scenario": "${scenario}",
  "impact": {
    "careerShift": "Description of how career path changes",
    "salaryChange": "+15%",
    "newOpportunities": ["Role 1", "Role 2"],
    "timeframe": "6-12 months",
    "riskLevel": "low|medium|high",
    "recommendation": "Should they do this? Why?"
  }
}`;

    } else if (action === "extract_resume") {
      const { resumeText } = body;
      systemPrompt = `You are an expert resume parser. Extract structured information from resumes. Return only valid JSON.`;
      userPrompt = `Extract skills, education, experience, and projects from this resume:

${resumeText}

Return JSON:
{
  "skills": ["Python", "SQL", "Excel"],
  "education": "B.Tech in Computer Science from XYZ University",
  "experience": "2 years as Data Analyst at ABC Corp",
  "projects": ["Customer Segmentation Analysis", "Sales Dashboard"],
  "summary": "Brief 2-line professional summary"
}`;

    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Non-streaming requests
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr);
    } catch {
      console.error("JSON parse failed, content:", content);
      result = { error: "Failed to parse AI response" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Career advisor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
