import * as pdfjsLib from "pdfjs-dist";

// Use CDN worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt" || ext === "md") {
    return await file.text();
  }

  if (ext === "pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .filter((item: any) => "str" in item)
        .map((item: any) => item.str);
      fullText += strings.join(" ") + "\n";
    }
    return fullText;
  }

  // Fallback: try reading as text
  return await file.text();
}

// Industry keywords for different career targets
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  general: [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "SQL", "Git", "Docker",
    "Kubernetes", "AWS", "GCP", "Azure", "React", "Node.js", "REST", "API",
    "Agile", "Scrum", "CI/CD", "Linux", "MongoDB", "PostgreSQL", "Redis",
    "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "NLP",
    "Computer Vision", "Data Analysis", "Statistics", "MLOps", "Microservices",
    "GraphQL", "Terraform", "Jenkins", "GitHub Actions", "Pandas", "NumPy",
    "Spark", "Hadoop", "Tableau", "Power BI", "Figma", "Jira", "Confluence",
  ],
};

const SECTION_PATTERNS = {
  contact: /(\bemail\b|\bphone\b|\blinkedin\b|\bgithub\.com\b|\b[\w.-]+@[\w.-]+\.\w+\b|\+?\d[\d\s()-]{7,})/i,
  summary: /(\bsummary\b|\bobjective\b|\babout\s*me\b|\bprofile\b|\bprofessional\s*summary\b)/i,
  experience: /(\bexperience\b|\bwork\s*history\b|\bemployment\b|\bprofessional\s*experience\b)/i,
  education: /(\beducation\b|\bacademic\b|\buniversity\b|\bdegree\b|\bb\.?\s*tech\b|\bm\.?\s*tech\b|\bb\.?\s*s\.?\b|\bm\.?\s*s\.?\b)/i,
  skills: /(\bskills\b|\btechnical\s*skills\b|\bcore\s*competencies\b|\btechnologies\b)/i,
  projects: /(\bprojects\b|\bportfolio\b|\bpersonal\s*projects\b)/i,
  certifications: /(\bcertification\b|\bcertified\b|\blicense\b)/i,
};

const ACTION_VERBS = [
  "achieved", "built", "created", "delivered", "designed", "developed", "enhanced",
  "established", "generated", "implemented", "improved", "increased", "launched",
  "led", "managed", "optimized", "reduced", "resolved", "streamlined", "supervised",
  "architected", "automated", "collaborated", "deployed", "engineered", "executed",
  "integrated", "maintained", "mentored", "orchestrated", "pioneered", "refactored",
  "scaled", "spearheaded", "transformed",
];

const QUANTIFICATION_PATTERN = /\d+\s*(%|percent|users|clients|projects|teams|members|million|thousand|x\b|times|hours|days|months|years|\$|revenue|growth|reduction|improvement)/i;

export interface ResumeAnalysis {
  atsScore: number;
  sections: { name: string; status: "pass" | "warning" | "fail"; note: string }[];
  missingKeywords: string[];
  foundKeywords: string[];
  suggestions: string[];
  wordCount: number;
  pageEstimate: number;
}

export function analyzeResume(text: string): ResumeAnalysis {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const pageEstimate = Math.max(1, Math.ceil(wordCount / 400));

  const sections: ResumeAnalysis["sections"] = [];
  let score = 0;
  const maxScore = 100;
  let totalChecks = 0;
  let passedChecks = 0;

  // 1. Contact Information
  totalChecks++;
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d[\d\s()-]{7,})/.test(text);
  const hasLinkedIn = /linkedin/i.test(text);
  if (hasEmail && hasPhone) {
    sections.push({ name: "Contact Information", status: "pass", note: `Found: ${hasEmail ? "email" : ""}${hasPhone ? ", phone" : ""}${hasLinkedIn ? ", LinkedIn" : ""}. Well-formatted.` });
    passedChecks++;
  } else if (hasEmail || hasPhone) {
    sections.push({ name: "Contact Information", status: "warning", note: `Missing ${!hasEmail ? "email address" : "phone number"}. Include both for completeness.` });
    passedChecks += 0.5;
  } else {
    sections.push({ name: "Contact Information", status: "fail", note: "No email or phone number detected. Add contact details at the top." });
  }

  // 2. Professional Summary
  totalChecks++;
  const hasSummary = SECTION_PATTERNS.summary.test(text);
  if (hasSummary) {
    const summaryMatch = text.match(/(?:summary|objective|about\s*me|profile)[:\s]*([\s\S]{10,300}?)(?:\n\n|\n[A-Z])/i);
    const summaryText = summaryMatch?.[1] || "";
    const hasMetrics = QUANTIFICATION_PATTERN.test(summaryText);
    if (hasMetrics) {
      sections.push({ name: "Professional Summary", status: "pass", note: "Contains quantified achievements. Well-targeted." });
      passedChecks++;
    } else {
      sections.push({ name: "Professional Summary", status: "warning", note: "Summary found but lacks specific metrics. Add quantified achievements (e.g., '5+ years', 'led team of 8')." });
      passedChecks += 0.5;
    }
  } else {
    sections.push({ name: "Professional Summary", status: "fail", note: "No professional summary detected. Add a 2-3 line targeted summary at the top." });
  }

  // 3. Work Experience
  totalChecks++;
  const hasExperience = SECTION_PATTERNS.experience.test(text);
  const actionVerbCount = ACTION_VERBS.filter(v => lower.includes(v)).length;
  const hasQuantifiedResults = (text.match(QUANTIFICATION_PATTERN) || []).length;
  if (hasExperience && actionVerbCount >= 3) {
    sections.push({ name: "Work Experience", status: "pass", note: `Found ${actionVerbCount} action verbs and ${hasQuantifiedResults} quantified results. Strong experience section.` });
    passedChecks++;
  } else if (hasExperience) {
    sections.push({ name: "Work Experience", status: "warning", note: `Only ${actionVerbCount} action verbs found. Use more action verbs like "implemented", "optimized", "led".` });
    passedChecks += 0.5;
  } else {
    sections.push({ name: "Work Experience", status: "fail", note: "No work experience section detected. Add your professional experience." });
  }

  // 4. Skills Section
  totalChecks++;
  const hasSkills = SECTION_PATTERNS.skills.test(text);
  const foundKeywords = INDUSTRY_KEYWORDS.general.filter(k => lower.includes(k.toLowerCase()));
  if (hasSkills && foundKeywords.length >= 8) {
    sections.push({ name: "Skills Section", status: "pass", note: `${foundKeywords.length} relevant technical skills detected. Well-organized.` });
    passedChecks++;
  } else if (hasSkills || foundKeywords.length >= 4) {
    sections.push({ name: "Skills Section", status: "warning", note: `Only ${foundKeywords.length} key skills detected. Add more industry-relevant keywords.` });
    passedChecks += 0.5;
  } else {
    sections.push({ name: "Skills Section", status: "fail", note: "Skills section is weak or missing. Add a dedicated technical skills section." });
  }

  // 5. Education
  totalChecks++;
  const hasEducation = SECTION_PATTERNS.education.test(text);
  if (hasEducation) {
    sections.push({ name: "Education", status: "pass", note: "Education section found and properly structured." });
    passedChecks++;
  } else {
    sections.push({ name: "Education", status: "warning", note: "No formal education section detected. Include your academic background." });
    passedChecks += 0.25;
  }

  // 6. ATS Keywords
  totalChecks++;
  const missingKeywords = INDUSTRY_KEYWORDS.general.filter(k => !lower.includes(k.toLowerCase()));
  const keywordRatio = foundKeywords.length / INDUSTRY_KEYWORDS.general.length;
  if (keywordRatio > 0.3) {
    sections.push({ name: "ATS Keywords", status: "pass", note: `${foundKeywords.length} industry keywords found. Good ATS optimization.` });
    passedChecks++;
  } else if (keywordRatio > 0.15) {
    sections.push({ name: "ATS Keywords", status: "warning", note: `Only ${foundKeywords.length} keywords found. Add more relevant technologies and skills.` });
    passedChecks += 0.5;
  } else {
    sections.push({ name: "ATS Keywords", status: "fail", note: `Only ${foundKeywords.length} keywords detected. Resume may not pass ATS filters.` });
  }

  // 7. Formatting
  totalChecks++;
  const hasBulletPoints = /[•\-\*]\s/.test(text);
  const hasConsistentStructure = (text.match(/\n{2,}/g) || []).length >= 3;
  if (hasBulletPoints && hasConsistentStructure) {
    sections.push({ name: "Formatting", status: "pass", note: "Uses bullet points and clear section breaks. ATS-friendly format." });
    passedChecks++;
  } else {
    sections.push({ name: "Formatting", status: "warning", note: "Consider using bullet points and clear section headers for better ATS parsing." });
    passedChecks += 0.5;
  }

  // 8. Length
  totalChecks++;
  if (pageEstimate >= 1 && pageEstimate <= 2) {
    sections.push({ name: "Length", status: "pass", note: `Approximately ${pageEstimate} page(s) (~${wordCount} words). Ideal length.` });
    passedChecks++;
  } else if (pageEstimate > 2) {
    sections.push({ name: "Length", status: "warning", note: `Approximately ${pageEstimate} pages (~${wordCount} words). Consider trimming to 1-2 pages.` });
    passedChecks += 0.5;
  } else {
    sections.push({ name: "Length", status: "warning", note: `Very short (~${wordCount} words). Add more detail to your experience and skills.` });
    passedChecks += 0.25;
  }

  // Calculate ATS score
  const atsScore = Math.round((passedChecks / totalChecks) * 100);

  // Generate suggestions
  const suggestions: string[] = [];
  sections.forEach(s => {
    if (s.status === "fail") suggestions.push(s.note);
    else if (s.status === "warning") suggestions.push(s.note);
  });
  if (foundKeywords.length < 10) suggestions.push("Add more industry-specific keywords to improve ATS matching.");
  if (actionVerbCount < 5) suggestions.push("Use more action verbs (e.g., 'developed', 'implemented', 'optimized') to strengthen impact.");
  if (hasQuantifiedResults < 3) suggestions.push("Quantify more achievements with numbers, percentages, or dollar amounts.");
  if (!hasLinkedIn) suggestions.push("Add your LinkedIn profile URL to the contact section.");

  // Limit missing keywords to top 12 most common
  const topMissing = missingKeywords.slice(0, 12);

  return {
    atsScore,
    sections,
    missingKeywords: topMissing,
    foundKeywords,
    suggestions: suggestions.slice(0, 8),
    wordCount,
    pageEstimate,
  };
}
