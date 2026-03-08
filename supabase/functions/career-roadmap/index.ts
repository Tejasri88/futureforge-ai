import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RoadmapRequest {
  action: "generate_roadmap" | "get_resources" | "get_project_ideas" | "analyze_skills";
  targetCareer: string;
  currentSkills?: string[];
  trackSpeed?: "fast" | "balanced" | "expert";
  skillName?: string;
  stage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, targetCareer, currentSkills, trackSpeed, skillName, stage } = await req.json() as RoadmapRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate_roadmap") {
      const speedDuration = trackSpeed === "fast" ? "6-8 months" : trackSpeed === "expert" ? "18-24 months" : "12 months";
      
      systemPrompt = `You are an expert career advisor and learning path designer. Generate comprehensive, personalized career roadmaps.
Your roadmaps should be realistic, industry-aligned, and include practical learning resources.
Always provide structured JSON output.`;

      userPrompt = `Generate a complete career roadmap for someone wanting to become a ${targetCareer}.

Current skills they have: ${currentSkills?.length ? currentSkills.join(", ") : "None specified"}
Track speed: ${trackSpeed || "balanced"} (${speedDuration})

Return a JSON object with this exact structure:
{
  "targetCareer": "${targetCareer}",
  "estimatedDuration": "${speedDuration}",
  "currentLevel": "beginner|intermediate|advanced",
  "skillGap": {
    "existingSkills": ["skills they already have"],
    "missingSkills": ["skills they need to learn"]
  },
  "stages": [
    {
      "id": 1,
      "title": "Stage Name",
      "description": "Brief stage description",
      "duration": "X weeks/months",
      "skills": [
        {
          "id": "skill-1",
          "name": "Skill Name",
          "description": "What this skill involves",
          "icon": "code|database|chart|brain|shield|cloud|layout|server|palette|users",
          "difficulty": "beginner|intermediate|advanced",
          "estimatedHours": 40,
          "demandLevel": "high|medium|low",
          "salaryImpact": "+$5K-10K",
          "industryUsage": "85%",
          "resources": [
            {"type": "course", "title": "Course Name", "url": "https://...", "platform": "Coursera/Udemy/etc"},
            {"type": "video", "title": "Video Title", "url": "https://youtube.com/...", "platform": "YouTube"},
            {"type": "docs", "title": "Documentation", "url": "https://...", "platform": "Official Docs"}
          ],
          "projects": [
            {"title": "Project Name", "description": "Build X to practice Y", "difficulty": "beginner|intermediate|advanced"}
          ]
        }
      ],
      "milestone": "What they can do after this stage"
    }
  ],
  "careerLadder": [
    {"role": "Entry Level Role", "salary": "$50K-60K", "yearsExperience": "0-1", "active": true},
    {"role": "Mid Level Role", "salary": "$70K-90K", "yearsExperience": "1-3", "active": false},
    {"role": "Senior Role", "salary": "$100K-130K", "yearsExperience": "3-5", "active": false},
    {"role": "Lead/Principal", "salary": "$140K-180K", "yearsExperience": "5-8", "active": false},
    {"role": "Director/VP", "salary": "$180K+", "yearsExperience": "8+", "active": false}
  ],
  "industryInsights": {
    "demandTrend": "growing|stable|declining",
    "topCompanies": ["Company1", "Company2", "Company3"],
    "emergingTechnologies": ["Tech1", "Tech2"]
  }
}

Generate 4-5 stages with 3-5 skills each. Make resources realistic with actual platform names.
Tailor the roadmap based on their existing skills - skip or accelerate skills they already know.`;
    } else if (action === "get_resources") {
      systemPrompt = `You are a learning resource curator. Provide high-quality learning resources for technical skills.`;
      
      userPrompt = `Provide detailed learning resources for the skill: ${skillName} in the context of ${targetCareer}.

Return JSON:
{
  "skill": "${skillName}",
  "resources": {
    "courses": [{"title": "...", "url": "...", "platform": "...", "duration": "...", "level": "..."}],
    "videos": [{"title": "...", "url": "...", "channel": "...", "duration": "..."}],
    "documentation": [{"title": "...", "url": "...", "description": "..."}],
    "exercises": [{"title": "...", "description": "...", "difficulty": "..."}],
    "books": [{"title": "...", "author": "...", "description": "..."}]
  },
  "learningPath": "Step-by-step approach to master this skill",
  "estimatedTime": "X hours/weeks"
}`;
    } else if (action === "get_project_ideas") {
      systemPrompt = `You are a project mentor. Suggest practical portfolio projects that demonstrate real skills.`;
      
      userPrompt = `Suggest 3-5 portfolio projects for someone learning ${targetCareer} skills, specifically for ${stage}.

Return JSON:
{
  "stage": "${stage}",
  "projects": [
    {
      "title": "Project Name",
      "description": "What to build",
      "skills": ["skill1", "skill2"],
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": 20,
      "steps": ["Step 1", "Step 2", "Step 3"],
      "deliverables": ["What they'll have at the end"]
    }
  ]
}`;
    } else if (action === "analyze_skills") {
      systemPrompt = `You are a skill assessment expert. Analyze skills and identify gaps for career transitions.`;
      
      userPrompt = `Analyze these skills for someone wanting to become a ${targetCareer}:
Current skills: ${currentSkills?.join(", ") || "None"}

Return JSON:
{
  "analysis": {
    "currentLevel": "beginner|intermediate|advanced",
    "readinessScore": 0-100,
    "strengths": ["skill1", "skill2"],
    "gaps": ["missing1", "missing2"],
    "recommendations": ["prioritized list of what to learn first"]
  },
  "timeToGoal": {
    "fast": "X months",
    "balanced": "X months",
    "expert": "X months"
  }
}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e, "Content:", content);
      result = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Career roadmap error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
