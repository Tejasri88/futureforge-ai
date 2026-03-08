import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, domain, round, difficulty, personality, previousQA, question, answer, interviewHistory, screenshotBase64, screenContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let messages: any[] = [];
    let model = "google/gemini-3-flash-preview";

    const personalityPrompts: Record<string, string> = {
      friendly: "You are a warm, encouraging interviewer who puts candidates at ease. Be supportive but still thorough.",
      strict: "You are a rigorous, no-nonsense interviewer. Be direct, expect precise answers, and challenge weak responses.",
      startup: "You are a casual startup interviewer. Focus on creativity, adaptability, and culture fit alongside technical skills.",
      faang: "You are a FAANG-style interviewer. Focus on algorithmic thinking, system design, and scalable solutions. Be thorough and expect optimal approaches.",
    };

    const personalityDesc = personalityPrompts[personality || "friendly"] || personalityPrompts.friendly;

    if (action === "generate_question") {
      messages = [
        {
          role: "system",
          content: `You are an AI interview simulator for the domain: ${domain}. ${personalityDesc}

Generate exactly ONE interview question for the following round. Return ONLY valid JSON, no markdown.

Round types:
- "HR" = General HR/behavioral questions about motivation, teamwork, career goals
- "Technical" = Domain-specific technical questions for ${domain}
- "Problem Solving" = Case study or problem-solving scenario for ${domain}
- "Behavioral" = Situational behavioral questions (STAR method)

Current round: ${round}
Difficulty level: ${difficulty} (beginner/intermediate/advanced)

${previousQA && previousQA.length > 0 ? `Previous Q&A in this interview (use these to ask intelligent follow-up questions when appropriate):
${previousQA.map((qa: any, i: number) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`).join("\n\n")}` : "This is the first question."}

Return JSON format:
{
  "question": "The interview question text",
  "isFollowUp": true/false,
  "expectedTopics": ["topic1", "topic2", "topic3"]
}`
        },
        { role: "user", content: `Generate a ${difficulty} level ${round} question for a ${domain} interview.` }
      ];
    } else if (action === "evaluate_answer") {
      messages = [
        {
          role: "system",
          content: `You are an expert interview evaluator for ${domain}. ${personalityDesc}

Evaluate the candidate's answer thoroughly. Return ONLY valid JSON, no markdown.

Question: ${question}
Candidate's Answer: ${answer}

Return JSON format:
{
  "technicalAccuracy": <1-10>,
  "communicationClarity": <1-10>,
  "confidenceLevel": <1-10>,
  "problemSolving": <1-10>,
  "depthOfKnowledge": <1-10>,
  "overallScore": <1-10>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestedImprovement": "One paragraph of improvement advice",
  "idealAnswer": "Brief outline of what an ideal answer would cover"
}`
        },
        { role: "user", content: `Evaluate this answer for the ${domain} interview.` }
      ];
    } else if (action === "generate_report") {
      messages = [
        {
          role: "system",
          content: `You are an expert interview performance analyst. Generate a comprehensive final interview report. Return ONLY valid JSON, no markdown.

Domain: ${domain}
Interview History:
${interviewHistory?.map((item: any, i: number) => `
Round: ${item.round}
Q${i+1}: ${item.question}
A${i+1}: ${item.answer}
Score: ${item.score?.overallScore || "N/A"}/10
`).join("\n")}

Return JSON format:
{
  "overallScore": <0-100>,
  "domainKnowledge": <0-100>,
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "problemSolvingScore": <0-100>,
  "technicalScore": <0-100>,
  "summary": "2-3 paragraph overall assessment",
  "topStrengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "resources": [
    {"title": "Resource name", "description": "Why this resource helps", "type": "course/book/tutorial"}
  ],
  "interviewReadiness": "beginner/intermediate/advanced/expert",
  "nextSteps": "Paragraph about what the candidate should do next"
}`
        },
        { role: "user", content: `Generate a final interview report for this ${domain} interview session.` }
      ];
    } else if (action === "screening_observe") {
      // Vision-based: analyze screenshot and generate a question
      model = "google/gemini-2.5-flash";
      const systemContent = `You are an expert screening interviewer for ${domain}. ${personalityDesc}

You are conducting a screening interview where the candidate is sharing their screen and presenting their work. You can see their screen.

Analyze what you see on the screen and generate an intelligent, contextual interview question about it. Focus on:
- Architecture and design decisions
- Technology choices
- Code quality and patterns
- Scalability considerations
- Security implications
- Testing strategies

${screenContext ? `Previous conversation context:\n${screenContext}` : "This is the start of the screening session."}

Return ONLY valid JSON, no markdown:
{
  "question": "Your contextual question based on what you see",
  "observation": "Brief description of what you observed on the screen",
  "category": "architecture/code-quality/design/scalability/security/testing/general"
}`;

      messages = [
        { role: "system", content: systemContent },
        {
          role: "user",
          content: [
            { type: "text", text: "Look at the candidate's screen and ask a relevant screening interview question." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${screenshotBase64}` } }
          ]
        }
      ];
    } else if (action === "screening_evaluate") {
      messages = [
        {
          role: "system",
          content: `You are an expert screening interviewer evaluating a candidate's response during a screen-sharing session for ${domain}. ${personalityDesc}

The candidate was asked: ${question}
Their response: ${answer}

${screenContext ? `Context from the session:\n${screenContext}` : ""}

Evaluate their response. Return ONLY valid JSON, no markdown:
{
  "technicalExplanation": <1-10>,
  "problemSolving": <1-10>,
  "communicationClarity": <1-10>,
  "systemUnderstanding": <1-10>,
  "confidenceLevel": <1-10>,
  "overallScore": <1-10>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "feedback": "Brief constructive feedback paragraph"
}`
        },
        { role: "user", content: `Evaluate this screening interview response.` }
      ];
    } else if (action === "screening_report") {
      messages = [
        {
          role: "system",
          content: `You are an expert screening interview analyst. Generate a detailed screening evaluation report. Return ONLY valid JSON, no markdown.

Domain: ${domain}
Screening Session History:
${interviewHistory?.map((item: any, i: number) => `
Observation: ${item.observation || "N/A"}
Q${i+1}: ${item.question}
A${i+1}: ${item.answer}
Score: ${item.score?.overallScore || "N/A"}/10
`).join("\n")}

Return JSON format:
{
  "overallScore": <0-100>,
  "technicalKnowledge": <0-100>,
  "projectExplanation": <0-100>,
  "systemDesign": <0-100>,
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "summary": "2-3 paragraph overall screening assessment",
  "topStrengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "interviewReadiness": "beginner/intermediate/advanced/expert",
  "nextSteps": "What the candidate should focus on next"
}`
        },
        { role: "user", content: `Generate a final screening interview report for this ${domain} session.` }
      ];
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
