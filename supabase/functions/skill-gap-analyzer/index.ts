import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, resumeText, targetCareer, currentSkills, githubUsername } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "analyze_resume") {
      systemPrompt = `You are an expert career advisor and skill assessment specialist. Analyze resumes to extract skills and compare them against industry requirements for specific careers. Be thorough and precise.`;

      userPrompt = `Analyze the following resume text for someone targeting a career as a ${targetCareer}.

Resume Text:
"""
${resumeText}
"""

${currentSkills?.length ? `Additional skills they mentioned: ${currentSkills.join(", ")}` : ""}
${githubUsername ? `GitHub profile: ${githubUsername}` : ""}

Return a JSON object with this EXACT structure:
{
  "extractedSkills": ["skill1", "skill2", ...],
  "targetCareer": "${targetCareer}",
  "requiredSkills": [
    {
      "name": "Skill Name",
      "category": "technical|tool|soft|language",
      "importance": "critical|high|medium|low",
      "demandLevel": "high|medium|low",
      "avgSalaryImpact": "+₹1L-2L",
      "industryUsage": "85%",
      "estimatedLearningWeeks": 4,
      "description": "Brief description of the skill"
    }
  ],
  "skillAnalysis": {
    "strong": [
      {"name": "Skill", "level": 85, "note": "Why this is strong"}
    ],
    "intermediate": [
      {"name": "Skill", "level": 55, "note": "What needs improvement"}
    ],
    "missing": [
      {"name": "Skill", "level": 0, "priority": "high|medium|low", "note": "Why this matters"}
    ]
  },
  "overallScore": 45,
  "readinessLevel": "beginner|intermediate|advanced",
  "careerImpact": [
    {"skill": "SQL", "impact": "increases job eligibility by 35%", "salaryBoost": "+₹2 LPA"}
  ],
  "salaryPrediction": {
    "current": "₹6 LPA",
    "withMissingSkills": "₹9 LPA",
    "potential": "₹12 LPA"
  },
  "learningPlan": [
    {
      "skill": "SQL",
      "weeks": 4,
      "resources": [
        {"type": "course", "title": "Course Name", "platform": "Coursera", "url": "https://..."},
        {"type": "video", "title": "Video Title", "platform": "YouTube", "url": "https://youtube.com/..."},
        {"type": "practice", "title": "Practice Platform", "platform": "LeetCode", "url": "https://..."}
      ],
      "project": {"title": "Project Name", "description": "Build X to practice Y"}
    }
  ],
  "resumeSuggestions": [
    "Add projects demonstrating SQL usage",
    "Highlight data analysis experience"
  ],
  "heatmapData": [
    {"skill": "Python", "category": "Programming", "strength": 85},
    {"skill": "SQL", "category": "Database", "strength": 0}
  ]
}

IMPORTANT: All salary and monetary values MUST be in Indian Rupees (₹) using the Indian numbering system (Lakhs "L" for LPA). For example: ₹4L, ₹8L, +₹1.5 LPA. Do NOT use USD ($) or any other currency.

Provide 15-25 required skills. Be realistic with learning time estimates. Include actual platform names for resources.`;
    } else if (action === "analyze_github") {
      systemPrompt = `You are a GitHub profile analyst. Analyze coding patterns and infer skills from repository descriptions.`;
      userPrompt = `Based on a GitHub user "${githubUsername}" who is targeting a career as ${targetCareer}, estimate their likely technical skills from common GitHub activity patterns.

Return JSON:
{
  "inferredSkills": ["skill1", "skill2"],
  "codeLanguages": ["Python", "JavaScript"],
  "projectComplexity": "beginner|intermediate|advanced",
  "suggestions": ["Contribute to open source ML projects", "Build more data pipeline projects"]
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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

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
    console.error("Skill gap analyzer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
