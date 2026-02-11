const intentRules = [
  { label: "Pricing inquiry", patterns: [/price/i, /pricing/i, /quote/i, /budget/i], weight: 18 },
  { label: "Support request", patterns: [/issue/i, /error/i, /downtime/i, /help/i], weight: 16 },
  { label: "Security review", patterns: [/security/i, /soc2/i, /compliance/i, /questionnaire/i], weight: 17 },
  { label: "Onboarding", patterns: [/onboarding/i, /migration/i, /setup/i], weight: 12 },
  { label: "Expansion", patterns: [/upgrade/i, /expansion/i, /renewal/i], weight: 14 },
];

const urgencyRules = [
  { label: "High", patterns: [/urgent/i, /asap/i, /today/i, /immediately/i], weight: 20 },
  { label: "Medium", patterns: [/soon/i, /this week/i, /priority/i], weight: 12 },
  { label: "Low", patterns: [/whenever/i, /later/i, /next month/i], weight: 4 },
];

const keywordSignals = [
  "pricing",
  "demo",
  "security",
  "downtime",
  "migration",
  "renewal",
  "urgent",
  "contract",
  "onboarding",
  "integration",
];

const capitalize = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

export const confidenceLevel = (score) => {
  if (score >= 80) {
    return "High";
  }
  if (score >= 60) {
    return "Medium";
  }
  return "Low";
};

const topKeywords = (text) => {
  const normalized = (text || "").toLowerCase();
  const matches = keywordSignals.filter((token) => normalized.includes(token));
  return matches.slice(0, 4);
};

const detectIntent = (text, fallback = "General request") => {
  const normalized = text || "";
  let selected = { label: fallback, weight: 6 };

  intentRules.forEach((rule) => {
    if (rule.patterns.some((pattern) => pattern.test(normalized)) && rule.weight > selected.weight) {
      selected = { label: rule.label, weight: rule.weight };
    }
  });

  return selected;
};

const detectUrgency = (text, priority = "") => {
  const normalized = text || "";
  let selected = { label: "Medium", weight: 10 };

  urgencyRules.forEach((rule) => {
    if (rule.patterns.some((pattern) => pattern.test(normalized)) && rule.weight > selected.weight) {
      selected = { label: rule.label, weight: rule.weight };
    }
  });

  const normalizedPriority = (priority || "").toLowerCase();
  if (normalizedPriority === "high") {
    return { label: "High", weight: 20 };
  }
  if (normalizedPriority === "low") {
    return { label: "Low", weight: 4 };
  }

  return selected;
};

export const buildAIExplanation = ({
  actionType = "AI decision",
  subject = "",
  body = "",
  summary = "",
  category = "",
  priority = "",
  aiSuggestion = "",
  baseScore = 72,
} = {}) => {
  const text = [subject, body, summary, aiSuggestion, category].filter(Boolean).join(" ");
  const keywords = topKeywords(text);
  const intent = detectIntent(text, category ? `${capitalize(category)} request` : "General request");
  const urgency = detectUrgency(text, priority);

  const confidenceScore = Math.min(
    98,
    Math.max(45, baseScore + intent.weight + urgency.weight + Math.min(keywords.length * 3, 12) - 12)
  );

  const level = confidenceLevel(confidenceScore);

  return {
    actionType,
    summary:
      summary ||
      `The model focused on ${intent.label.toLowerCase()} patterns and urgency cues before finalizing this ${actionType.toLowerCase()}.`,
    reason:
      `AI prioritized this because it detected ${intent.label.toLowerCase()} intent and ${urgency.label.toLowerCase()} urgency language in the conversation.`,
    signals: [
      {
        label: "Keywords",
        value: keywords.length ? keywords.join(", ") : "no dominant keywords",
        hint: "Terms in the conversation that strongly correlate with this AI action.",
      },
      {
        label: "Intent",
        value: intent.label,
        hint: "The objective the model inferred from the user message.",
      },
      {
        label: "Urgency",
        value: urgency.label,
        hint: "How time-sensitive the conversation appears.",
      },
      {
        label: "Confidence score",
        value: `${confidenceScore}%`,
        hint: "How certain the model is based on available signals.",
      },
    ],
    confidence: {
      score: confidenceScore,
      level,
    },
  };
};
