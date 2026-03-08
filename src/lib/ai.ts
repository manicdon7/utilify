export type AIProvider = "openai" | "gemini";

interface AIRequestOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  userApiKey?: string;
}

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callAI({ prompt, systemPrompt, maxTokens = 2048, userApiKey }: AIRequestOptions): Promise<string> {
  const apiKey = userApiKey || process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER as AIProvider) || "openai";

  if (!apiKey) {
    throw new Error(
      "AI_API_KEY is not configured. Please set it in your .env.local file to use AI-powered tools.",
    );
  }

  if (userApiKey || provider === "gemini") {
    return callGeminiWithFallback(apiKey, prompt, systemPrompt, maxTokens);
  }

  return callOpenAI(apiKey, prompt, systemPrompt, maxTokens);
}

async function callOpenAI(apiKey: string, prompt: string, systemPrompt?: string, maxTokens = 2048): Promise<string> {
  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    if (res.status === 401) throw new Error("Invalid API key. Please check your AI_API_KEY in .env.local.");
    throw new Error(`OpenAI error: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGeminiWithFallback(apiKey: string, prompt: string, systemPrompt?: string, maxTokens = 2048): Promise<string> {
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      return await callGemini(apiKey, prompt, systemPrompt, maxTokens, model);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isRateLimit = lastError.message.includes("429") || lastError.message.includes("RESOURCE_EXHAUSTED");
      if (!isRateLimit) throw lastError;
    }
  }

  await sleep(5000);
  try {
    return await callGemini(apiKey, prompt, systemPrompt, maxTokens, "gemini-2.5-flash-lite");
  } catch {
    throw new Error(
      "AI quota exceeded. Your free-tier Gemini limits have been reached. " +
      "Please wait a minute and try again, or upgrade your plan at https://ai.google.dev.",
    );
  }
}

async function callGemini(apiKey: string, prompt: string, systemPrompt?: string, maxTokens = 2048, model = "gemini-2.5-flash"): Promise<string> {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) throw new Error(`429: Rate limit exceeded for ${model}`);
    if (res.status === 401 || res.status === 403) throw new Error("Invalid API key. Please check your Gemini API key.");
    throw new Error(`Gemini error (${model}): ${errText}`);
  }

  const data = await res.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("No response generated. The content may have been blocked by safety filters.");
  }
  return data.candidates[0].content.parts[0].text;
}
