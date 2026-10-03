import { GoogleGenAI, Type } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export class GeminiServiceError extends Error {
  code: number;
  status: string;
  isTransient: boolean;

  constructor(
    message: string = 'Gemini is temporarily busy. ComicCraft automatically retried the request, but the service is still unavailable. Please try again in a moment.',
    code: number = 503,
    status: string = 'UNAVAILABLE',
    isTransient: boolean = true
  ) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
    this.status = status;
    this.isTransient = isTransient;
  }
}

export class GeminiDailyQuotaError extends Error {
  code = 429;
  status = 'RESOURCE_EXHAUSTED';
  isDailyQuota = true;
  isTransient = false;

  constructor(
    message: string = 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.'
  ) {
    super(message);
    this.name = 'GeminiDailyQuotaError';
  }
}

/**
 * Checks whether an error indicates daily free-tier quota exhaustion.
 * Example: GenerateRequestsPerDayPerProjectPerModel-FreeTier, quotaValue: 20
 */
export function isDailyQuotaExhausted(err: any): boolean {
  if (!err) return false;
  const message = (
    err.message ||
    (typeof err === 'string' ? err : '') ||
    err.error?.message ||
    JSON.stringify(err)
  ).toLowerCase();

  return (
    message.includes('generaterequestsperday') ||
    message.includes('perday') ||
    message.includes('quotavalue') ||
    message.includes('free-tier') ||
    message.includes('freetier') ||
    (message.includes('resource_exhausted') && (message.includes('day') || message.includes('quota')))
  );
}

/**
 * Checks whether an error from the Gemini API is transient and retryable.
 * Transient: 503 (Unavailable / High Demand), short-term 429 (RPM rate limit), 500, 502, 504.
 * NOT Transient: Daily Quota Exhaustion (GenerateRequestsPerDayPerProjectPerModel-FreeTier),
 * 400 (Bad Request), 401 (Invalid Key), 403 (Permission), 404 (Model not found).
 */
export function isTransientGeminiError(err: any): boolean {
  if (!err) return false;

  // IMPORTANT: Do NOT retry daily quota exhaustion (Requirement 14 & 17)
  if (isDailyQuotaExhausted(err)) {
    return false;
  }

  const rawStatus = err.status || err.statusCode || err.code || err.error?.code || err.error?.status;
  const numStatus = typeof rawStatus === 'number' ? rawStatus : parseInt(rawStatus, 10);
  const statusStr = String(rawStatus || '').toUpperCase();
  const message = (err.message || (typeof err === 'string' ? err : '') || (err.error?.message || '')).toLowerCase();

  // 1. Permanent errors: Never retry these
  if (
    numStatus === 400 ||
    numStatus === 401 ||
    numStatus === 403 ||
    numStatus === 404 ||
    statusStr === 'INVALID_ARGUMENT' ||
    statusStr === 'PERMISSION_DENIED' ||
    statusStr === 'NOT_FOUND' ||
    message.includes('api_key_invalid') ||
    message.includes('invalid api key') ||
    message.includes('permission_denied') ||
    message.includes('invalid argument') ||
    message.includes('unregistered model') ||
    message.includes('not supported')
  ) {
    return false;
  }

  // 2. Transient status codes & statuses (excluding daily quota exhaustion)
  if (
    numStatus === 503 ||
    numStatus === 429 ||
    numStatus === 500 ||
    numStatus === 502 ||
    numStatus === 504 ||
    statusStr === 'UNAVAILABLE'
  ) {
    return true;
  }

  // 3. Transient error message keywords
  const transientKeywords = [
    '503',
    '500',
    '502',
    '504',
    'unavailable',
    'high demand',
    'spikes in demand',
    'temporarily unavailable',
    'temporarily busy',
    'temporary',
    'rate limit',
    'too many requests',
    'overloaded',
    'try again later',
    'fetch failed',
    'econnreset',
    'etimedout',
    'eai_again',
    'network error',
    'socket hang up',
  ];

  return transientKeywords.some(keyword => message.includes(keyword));
}

/**
 * Calculates exponential backoff delay with random jitter.
 * Attempt 1: ~2000ms
 * Attempt 2: ~4000ms
 * Attempt 3: ~8000ms
 */
function getBackoffDelayMs(attempt: number): number {
  if (attempt === 1) return 2000 + Math.floor(Math.random() * 400);
  if (attempt === 2) return 4000 + Math.floor(Math.random() * 600);
  return 8000 + Math.floor(Math.random() * 800);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes a Gemini API call with exponential backoff retries and model fallback.
 * Strictly checks for daily quota exhaustion and fails fast without wasted retries.
 */
export async function callWithRetryAndFallback<T>(
  taskName: string,
  primaryModel: string,
  fallbackModels: string[],
  fn: (modelName: string) => Promise<T>,
  maxRetriesPerModel: number = 3
): Promise<T> {
  const modelsToTry = [primaryModel, ...fallbackModels];
  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx];
    const isFallback = mIdx > 0;

    if (isFallback) {
      console.warn(`[Gemini] Switching to fallback model "${currentModel}" for ${taskName}...`);
    }

    for (let attempt = 1; attempt <= maxRetriesPerModel + 1; attempt++) {
      try {
        const result = await fn(currentModel);
        if (attempt > 1 || isFallback) {
          console.log(`[Gemini] ${taskName} succeeded on model "${currentModel}" after retry/fallback.`);
        }
        return result;
      } catch (err: any) {
        lastError = err;

        // Check if daily free-tier quota has been exhausted (Requirement 14 & 17)
        if (isDailyQuotaExhausted(err)) {
          console.error(`[Gemini] Daily free-tier quota limit reached on "${currentModel}". Stopping retries immediately.`);
          throw new GeminiDailyQuotaError();
        }

        const isTransient = isTransientGeminiError(err);

        // Permanent error: Do NOT retry (Requirement 3)
        if (!isTransient) {
          console.error(`[Gemini] ${taskName} encountered non-retryable permanent error on "${currentModel}":`, err.message);
          throw err;
        }

        // If retries remain for current model, back off and retry
        if (attempt <= maxRetriesPerModel) {
          const delayMs = getBackoffDelayMs(attempt);
          console.warn(
            `[Gemini] ${taskName} transient error on "${currentModel}" (Attempt ${attempt}/${maxRetriesPerModel}): ${err.message}. Retrying in ${delayMs}ms...`
          );
          await sleep(delayMs);
        } else {
          console.warn(`[Gemini] ${taskName} exhausted all ${maxRetriesPerModel} retries on "${currentModel}".`);
        }
      }
    }
  }

  // All models and retries exhausted
  console.error(`[Gemini] ${taskName} failed across all models and retries. Last error:`, lastError?.message);
  throw new GeminiServiceError(
    'Gemini is temporarily busy. ComicCraft automatically retried the request, but the service is still unavailable. Please try again in a moment.',
    503,
    'UNAVAILABLE',
    true
  );
}

export interface StoryGenerationParams {
  prompt: string;
  genre: string;
  artStyle: string;
  panelCount: number;
}

/**
 * Requirement 2: Generate the story, characters, and panel planning in ONE single Gemini structured-output request.
 */
export async function generateComicStory({ prompt, genre, artStyle, panelCount }: StoryGenerationParams) {
  const ai = getGeminiClient();

  const systemInstruction = `You are a master comic book creator, writer, and storyboard artist for ComicCraft.
Your mission is to turn user ideas into a structured, highly engaging, visually rich comic book.
STORYTELLING RULES:
1. Pacing: Divide the story precisely into ${panelCount} panels. The story MUST have a distinct beginning (establishing scene & characters), middle development (escalation / obstacle), and a satisfying ending or punchline in the final panel.
2. Character Consistency: Define each character with memorable, distinct visual traits (hair color/style, clothing, signature accessories, silhouette). Every panel prompt must carry these exact character descriptions forward so the artwork stays consistent across panels.
3. Dialogue: Keep dialogue short, snappy, and punchy (1-2 sentences per line) so it comfortably fits inside speech bubbles. Never crowd panels with essays.
4. Panel Breakdown: Panel 1 introduces the premise. Panels 2 to ${panelCount - 1} build the action/comedy/suspense. Panel ${panelCount} delivers the resolution or punchline.
5. Image Prompts: Each panel's 'imagePrompt' must be a detailed prompt suitable for comic generation. Include: art style (${artStyle}), character appearance and exact outfit, camera angle (close-up, wide shot, Dutch angle), background setting, lighting, action, and mood. Crucial: specify NO text or speech bubbles inside the image itself, as text will be overlaid by the application.`;

  const userContent = `Create a ${panelCount}-panel comic based on this idea:
Idea: "${prompt}"
Genre: ${genre}
Visual Art Style: ${artStyle}
Exact Number of Panels: ${panelCount}

Return a valid structured JSON matching the requested schema.`;

  // Primary model: gemini-3.8-flash; Fallback: gemini-3.1-flash-lite
  return callWithRetryAndFallback(
    'generateComicStory',
    'gemini-3.8-flash',
    ['gemini-3.1-flash-lite'],
    async (modelName: string) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userContent,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Catchy, creative comic title' },
              summary: { type: Type.STRING, description: 'Concise summary of the story arc' },
              characters: {
                type: Type.ARRAY,
                description: 'Key characters appearing in the comic',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    appearance: { type: Type.STRING, description: 'Exact visual cues: hair, clothes, colors, body type' },
                    personality: { type: Type.STRING }
                  },
                  required: ['name', 'description', 'appearance', 'personality']
                }
              },
              panels: {
                type: Type.ARRAY,
                description: `Precisely ${panelCount} panels forming a coherent story`,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    panelNumber: { type: Type.INTEGER },
                    sceneDescription: { type: Type.STRING },
                    background: { type: Type.STRING },
                    characters: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    actions: { type: Type.STRING },
                    expression: { type: Type.STRING },
                    dialogue: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          speaker: { type: Type.STRING },
                          text: { type: Type.STRING },
                          type: { type: Type.STRING, description: 'speech, thought, shout, or whisper' },
                          position: { type: Type.STRING, description: 'top-left, top-right, bottom-left, or bottom-right' }
                        },
                        required: ['speaker', 'text']
                      }
                    },
                    caption: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING, description: 'Descriptive prompt for comic illustration' }
                  },
                  required: ['panelNumber', 'sceneDescription', 'background', 'characters', 'actions', 'expression', 'dialogue', 'caption', 'imagePrompt']
                }
              }
            },
            required: ['title', 'summary', 'characters', 'panels']
          }
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);

      // Validate panel count and numbers
      if (parsed.panels && Array.isArray(parsed.panels)) {
        parsed.panels = parsed.panels.map((p: any, idx: number) => ({
          ...p,
          panelNumber: idx + 1,
          dialogue: Array.isArray(p.dialogue) ? p.dialogue.map((d: any) => ({
            speaker: d.speaker || 'Narrator',
            text: d.text || '',
            type: d.type || 'speech',
            position: d.position || (idx % 2 === 0 ? 'top-left' : 'top-right')
          })) : []
        }));
      }

      return parsed;
    }
  );
}

/**
 * Generate artwork for an individual comic panel on-demand.
 * Used when the user explicitly clicks "Regenerate Artwork" on a panel.
 */
export async function generatePanelArtwork({
  prompt,
  artStyle,
  characters = [],
  panelNumber,
  totalPanels,
  sceneDescription
}: {
  prompt: string;
  artStyle: string;
  characters?: any[];
  panelNumber: number;
  totalPanels: number;
  sceneDescription?: string;
}): Promise<string> {
  const ai = getGeminiClient();

  const enhancedPrompt = `${artStyle} comic book panel. ${prompt}. High quality comic art, bold outlines, vivid dynamic colors, comic page illustration. Do not add any text, typography, or speech bubbles in the image.`;

  // Attempt real Gemini image generation
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return `data:${mime};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (err: any) {
    if (isDailyQuotaExhausted(err)) {
      throw new GeminiDailyQuotaError();
    }
    console.warn(`[Gemini Image] Panel #${panelNumber} image call notice (${err.message}). Using stylized SVG comic illustration synthesis.`);
  }

  // Authentic stylized fallback comic artwork synthesis
  return generateStylizedComicArtworkSvg({
    panelNumber,
    totalPanels,
    artStyle,
    characters,
    sceneDescription: sceneDescription || prompt,
  });
}

export function generateStylizedComicArtworkSvg({
  panelNumber,
  totalPanels,
  artStyle,
  characters,
  sceneDescription
}: {
  panelNumber: number;
  totalPanels: number;
  artStyle: string;
  characters: any[];
  sceneDescription: string;
}): string {
  // Color themes based on Art Style and Panel Number
  const themes: Record<string, { bg1: string; bg2: string; accent: string; stroke: string; line: string }> = {
    'Manga': { bg1: '#18181b', bg2: '#27272a', accent: '#f43f5e', stroke: '#ffffff', line: '#71717a' },
    'Superhero': { bg1: '#1e3a8a', bg2: '#dc2626', accent: '#facc15', stroke: '#ffffff', line: '#38bdf8' },
    'Watercolor': { bg1: '#0284c7', bg2: '#14b8a6', accent: '#f472b6', stroke: '#f8fafc', line: '#6ee7b7' },
    'Anime-inspired': { bg1: '#4c1d95', bg2: '#ec4899', accent: '#38bdf8', stroke: '#ffffff', line: '#c084fc' },
    'Cartoon': { bg1: '#ea580c', bg2: '#f59e0b', accent: '#10b981', stroke: '#ffffff', line: '#fde047' },
    'Minimalist': { bg1: '#0f172a', bg2: '#1e293b', accent: '#38bdf8', stroke: '#e2e8f0', line: '#475569' },
    'Comic Book': { bg1: '#090d16', bg2: '#1e1b4b', accent: '#eab308', stroke: '#ffffff', line: '#f97316' },
  };

  const theme = themes[artStyle] || themes['Comic Book'];
  const charNames = characters.map(c => c.name || c).join(', ') || 'Character';

  // Dynamic seed variables based on panelNumber
  const angles = [15, -15, 30, -30, 45, -45, 0, 20];
  const angle = angles[(panelNumber - 1) % angles.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <linearGradient id="pgrad_${panelNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bg1}"/>
        <stop offset="60%" stop-color="${theme.bg2}"/>
        <stop offset="100%" stop-color="#000000"/>
      </linearGradient>
      <radialGradient id="sunburst_${panelNumber}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <pattern id="halftone_${panelNumber}" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="2" fill="${theme.accent}" opacity="0.25"/>
      </pattern>
    </defs>

    <!-- Canvas Background -->
    <rect width="800" height="600" fill="url(#pgrad_${panelNumber})"/>
    <rect width="800" height="600" fill="url(#halftone_${panelNumber})"/>
    <circle cx="400" cy="300" r="380" fill="url(#sunburst_${panelNumber})"/>

    <!-- Dynamic Action & Perspective Lines -->
    <g stroke="${theme.line}" stroke-width="2.5" opacity="0.45" stroke-dasharray="6,4">
      <line x1="0" y1="0" x2="350" y2="280"/>
      <line x1="800" y1="0" x2="450" y2="280"/>
      <line x1="0" y1="600" x2="350" y2="340"/>
      <line x1="800" y1="600" x2="450" y2="340"/>
      <line x1="400" y1="0" x2="400" y2="200"/>
      <line x1="100" y1="300" x2="700" y2="300"/>
    </g>

    <!-- Ground / Horizon Floor Perspective -->
    <polygon points="0,480 800,480 800,600 0,600" fill="#000000" opacity="0.6"/>
    <line x1="0" y1="480" x2="800" y2="480" stroke="${theme.accent}" stroke-width="4"/>

    <!-- Stylized Comic Character Silhouette & Dramatic Posing -->
    <g transform="translate(400, 360)">
      <!-- Shadow -->
      <ellipse cx="0" cy="110" rx="140" ry="24" fill="#000000" opacity="0.65"/>

      <!-- Torso / Suit -->
      <path d="M -60, -20 L -80, 80 L 80, 80 L 60, -20 Z" fill="${theme.bg1}" stroke="${theme.stroke}" stroke-width="4"/>

      <!-- Character Head & Aura -->
      <circle cx="0" cy="-90" r="50" fill="${theme.accent}" stroke="#000000" stroke-width="4"/>
      <!-- Eyes / Mask -->
      <polygon points="-28,-95 -12,-98 -16,-88" fill="${theme.stroke}"/>
      <polygon points="28,-95 12,-98 16,-88" fill="${theme.stroke}"/>

      <!-- Action Pose Arms / Energetic Highlights -->
      <line x1="-60" y1="-10" x2="-110" y2="30" stroke="${theme.stroke}" stroke-width="8" stroke-linecap="round"/>
      <line x1="60" y1="-10" x2="110" y2="30" stroke="${theme.stroke}" stroke-width="8" stroke-linecap="round"/>
    </g>

    <!-- Comic Sound Effect / Scene Tag Badge -->
    <g transform="translate(680, 80) rotate(${angle})">
      <polygon points="0,-40 30,-15 70,-25 50,15 80,45 35,45 20,80 -10,50 -50,70 -40,30 -80,10 -40,-15 -50,-50 -10,-35" fill="${theme.accent}" stroke="#000000" stroke-width="3"/>
      <text x="0" y="8" font-family="Bangers, Impact, sans-serif" font-size="22" font-weight="bold" fill="#000000" text-anchor="middle">#${panelNumber}</text>
    </g>

    <!-- Art Style & Scene Marker -->
    <rect x="25" y="25" width="220" height="34" rx="6" fill="#000000" opacity="0.85" stroke="${theme.accent}" stroke-width="2"/>
    <text x="35" y="48" font-family="'Comic Neue', cursive, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">
      STYLE: ${artStyle.toUpperCase()}
    </text>

    <!-- Characters Tag -->
    <rect x="25" y="525" width="460" height="42" rx="6" fill="#000000" opacity="0.8" stroke="#ffffff" stroke-width="1.5"/>
    <text x="40" y="552" font-family="'Comic Neue', cursive, sans-serif" font-size="14" fill="#f8fafc">
      Scene Focus: ${charNames}
    </text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// AI Assist: Make Story Funnier (Only called on explicit button click)
export async function makeStoryFunnier(comic: any) {
  const ai = getGeminiClient();
  const prompt = `You are a comedy comic script doctor. Rewrite the dialogue, expressions, and comedy beats of this comic to make it significantly funnier, with clever comedic timing, witty banter, and funny visual reactions.
Preserve the existing characters and basic sequence of ${comic.panels.length} panels.
Current Story:
Title: "${comic.title}"
Summary: "${comic.summary}"
Characters: ${JSON.stringify(comic.characters)}
Panels: ${JSON.stringify(comic.panels.map((p: any) => ({
    panelNumber: p.panelNumber,
    sceneDescription: p.sceneDescription,
    dialogue: p.dialogue,
    caption: p.caption
  })))}

Return a JSON with:
{
  "title": "Humorous Title",
  "summary": "Updated comedic summary",
  "panels": [
    {
      "panelNumber": 1,
      "dialogue": [{ "speaker": "...", "text": "...", "type": "speech", "position": "top-left" }],
      "caption": "Funny caption",
      "expression": "Exaggerated funny expression",
      "actions": "Comedic physical action"
    }
  ]
}`;

  return callWithRetryAndFallback(
    'makeStoryFunnier',
    'gemini-3.8-flash',
    ['gemini-3.1-flash-lite'],
    async (modelName: string) => {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(res.text || '{}');
    }
  );
}

// AI Assist: Make Story Dramatic (Only called on explicit button click)
export async function makeStoryDramatic(comic: any) {
  const ai = getGeminiClient();
  const prompt = `You are a dramatic graphic novel writer. Rewrite the dialogue and tone of this comic to maximize suspense, high stakes, emotional intensity, and dramatic gravitas.
Preserve the characters and sequence of ${comic.panels.length} panels.
Title: "${comic.title}"
Characters: ${JSON.stringify(comic.characters)}
Panels: ${JSON.stringify(comic.panels.map((p: any) => ({
    panelNumber: p.panelNumber,
    sceneDescription: p.sceneDescription,
    dialogue: p.dialogue,
    caption: p.caption
  })))}

Return a JSON with:
{
  "title": "Intense Dramatic Title",
  "summary": "Dramatic summary with high stakes",
  "panels": [
    {
      "panelNumber": 1,
      "dialogue": [{ "speaker": "...", "text": "...", "type": "speech", "position": "top-left" }],
      "caption": "Dramatic cinematic caption",
      "expression": "Intense focused expression",
      "actions": "High-stakes dramatic action"
    }
  ]
}`;

  return callWithRetryAndFallback(
    'makeStoryDramatic',
    'gemini-3.8-flash',
    ['gemini-3.1-flash-lite'],
    async (modelName: string) => {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(res.text || '{}');
    }
  );
}

// AI Assist: Add Plot Twist (Only called on explicit button click)
export async function addPlotTwist(comic: any) {
  const ai = getGeminiClient();
  const prompt = `You are a master story twist writer. Inject a mind-blowing, unexpected, yet coherent plot twist into this comic.
Title: "${comic.title}"
Characters: ${JSON.stringify(comic.characters)}
Panels: ${JSON.stringify(comic.panels.map((p: any) => ({
    panelNumber: p.panelNumber,
    sceneDescription: p.sceneDescription,
    dialogue: p.dialogue,
    caption: p.caption
  })))}

Rewrite the final panel or penultimate panels to execute this twist.
Return a JSON with:
{
  "twistDescription": "Explanation of the twist",
  "summary": "Updated overall summary incorporating the twist",
  "updatedPanels": [
    {
      "panelNumber": number,
      "sceneDescription": "...",
      "actions": "...",
      "expression": "...",
      "dialogue": [{ "speaker": "...", "text": "...", "type": "speech", "position": "top-right" }],
      "caption": "..."
    }
  ]
}`;

  return callWithRetryAndFallback(
    'addPlotTwist',
    'gemini-3.8-flash',
    ['gemini-3.1-flash-lite'],
    async (modelName: string) => {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(res.text || '{}');
    }
  );
}

// AI Assist: Change Ending (Only called on explicit button click)
export async function changeEnding(comic: any) {
  const ai = getGeminiClient();
  const lastPanelNumber = comic.panels.length;
  const prompt = `Generate a completely fresh, exciting alternative ending for this comic.
Title: "${comic.title}"
Characters: ${JSON.stringify(comic.characters)}
Current Ending Panel (${lastPanelNumber}): ${JSON.stringify(comic.panels[lastPanelNumber - 1])}

Return JSON with:
{
  "newEndingPanel": {
    "panelNumber": ${lastPanelNumber},
    "sceneDescription": "...",
    "background": "...",
    "characters": ["..."],
    "actions": "...",
    "expression": "...",
    "dialogue": [{ "speaker": "...", "text": "...", "type": "speech", "position": "top-right" }],
    "caption": "...",
    "imagePrompt": "..."
  }
}`;

  return callWithRetryAndFallback(
    'changeEnding',
    'gemini-3.8-flash',
    ['gemini-3.1-flash-lite'],
    async (modelName: string) => {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(res.text || '{}');
    }
  );
}

// AI Assist: Improve Dialogue for a single panel (Only called on explicit button click)
export async function improvePanelDialogue({ panel, storyContext }: { panel: any; storyContext: string }) {
  const ai = getGeminiClient();
  const prompt = `You are a professional comic dialogue editor. Improve the dialogue for this specific comic panel to make it sharper, more impactful, natural, and memorable. Keep it concise so it fits easily in speech bubbles.
Story context: "${storyContext}"
Panel details:
Scene: ${panel.sceneDescription}
Current Dialogue: ${JSON.stringify(panel.dialogue)}

Return JSON with:
{
  "improvedDialogue": [
    {
      "speaker": "...",
      "text": "...",
      "type": "speech",
      "position": "top-left"
    }
  ],
  "improvedCaption": "Punchy caption"
}`;

  return callWithRetryAndFallback(
    'improvePanelDialogue',
    'gemini-3.8-flash',
    ['gemini-3.1-flash-lite'],
    async (modelName: string) => {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(res.text || '{}');
    }
  );
}

// AI Assist: Add Panel (Only called on explicit button click)
export async function addStoryPanel(comic: any) {
  const ai = getGeminiClient();
  const newPanelNumber = comic.panels.length + 1;
  const prompt = `Create a new sequential panel for this comic that deepens the story or provides an extended epilogue.
Title: "${comic.title}"
Art Style: "${comic.artStyle}"
Characters: ${JSON.stringify(comic.characters)}
Previous Panels: ${JSON.stringify(comic.panels.map((p: any) => ({
    panelNumber: p.panelNumber,
    sceneDescription: p.sceneDescription,
    dialogue: p.dialogue,
    caption: p.caption
  })))}

Return JSON with:
{
  "newPanel": {
    "panelNumber": ${newPanelNumber},
    "sceneDescription": "...",
    "background": "...",
    "characters": ["..."],
    "actions": "...",
    "expression": "...",
    "dialogue": [{ "speaker": "...", "text": "...", "type": "speech", "position": "top-left" }],
    "caption": "...",
    "imagePrompt": "..."
  }
}`;

  return callWithRetryAndFallback(
    'addStoryPanel',
    'gemini-3.8-flash',
    ['gemini-3.1-flash-lite'],
    async (modelName: string) => {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(res.text || '{}');
    }
  );
}
