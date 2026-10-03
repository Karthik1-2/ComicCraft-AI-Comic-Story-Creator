import { Request, Response } from 'express';
import * as db from '../db/database.ts';
import * as geminiService from '../services/geminiService.ts';

// Concurrency lock: Prevent duplicate simultaneous Generate Comic requests (Requirement 10 & 11)
let isGenerationInProgress = false;

// In-Memory Request Deduplication & Generation Cache (Requirement 5 & 12)
interface CachedComicEntry {
  comic: any;
  timestamp: number;
}
const requestDeduplicationCache = new Map<string, CachedComicEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getCacheKey(prompt: string, genre: string, artStyle: string, panelCount: number): string {
  return `${prompt.trim().toLowerCase()}||${genre.toLowerCase()}||${artStyle.toLowerCase()}||${panelCount}`;
}

export async function generateComic(req: Request, res: Response) {
  // Prevent duplicate simultaneous requests (Requirement 10)
  if (isGenerationInProgress) {
    return res.status(429).json({
      error: 'A comic generation request is currently in progress. Please wait for it to complete.',
      code: 429,
      retryable: true,
    });
  }

  const { prompt, genre = 'Comedy', artStyle = 'Comic Book', panelCount = 4 } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Please enter a story idea.' });
  }

  const validPanelCount = [4, 6, 8].includes(Number(panelCount)) ? Number(panelCount) : 4;
  const cacheKey = getCacheKey(prompt, genre, artStyle, validPanelCount);

  // Request Deduplication: Serve cached comic if identical request was already generated (Requirement 12)
  const cached = requestDeduplicationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[ComicCraft] Request deduplication cache hit for "${prompt.slice(0, 35)}..." - 0 Gemini calls used.`);
    return res.status(200).json({
      success: true,
      comic: cached.comic,
      cached: true,
    });
  }

  isGenerationInProgress = true;

  try {
    console.log(`[ComicCraft] Generating comic in 1 Gemini structured request: "${prompt.slice(0, 35)}..." [${genre}, ${artStyle}, ${validPanelCount} panels]`);

    // Requirement 2 & 3: Generate story, characters, and all panel planning in ONE Gemini structured-output request!
    const storyPlan = await geminiService.generateComicStory({
      prompt: prompt.trim(),
      genre,
      artStyle,
      panelCount: validPanelCount,
    });

    // Requirement 1 & 2: Synthesize artwork for all panels based on the structured scene prompts & character profiles
    // without making 4-8 separate Gemini calls. This conserves quota to exactly 1 request per comic!
    const panelsWithArtwork = storyPlan.panels.map((panel: any) => ({
      ...panel,
      imageUrl: geminiService.generateStylizedComicArtworkSvg({
        panelNumber: panel.panelNumber,
        totalPanels: validPanelCount,
        artStyle,
        characters: storyPlan.characters,
        sceneDescription: panel.sceneDescription || panel.imagePrompt,
      }),
    }));

    const comicPayload = {
      title: storyPlan.title || 'Untitled Comic',
      originalPrompt: prompt.trim(),
      summary: storyPlan.summary || '',
      genre,
      artStyle,
      panelCount: validPanelCount,
      characters: storyPlan.characters || [],
      panels: panelsWithArtwork,
    };

    // Auto-save generated comic to database (Requirement 5)
    const saved = await db.saveComic(comicPayload);

    // Save to deduplication cache
    requestDeduplicationCache.set(cacheKey, {
      comic: saved,
      timestamp: Date.now(),
    });

    return res.status(200).json({
      success: true,
      comic: saved,
    });
  } catch (err: any) {
    console.error('[ComicCraft] Comic generation error in controller:', err);

    // Requirement 14 & 17: Immediately stop retrying and return daily quota message
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        code: 429,
        isDailyQuota: true,
        retryable: false,
      });
    }

    const isTransient = geminiService.isTransientGeminiError(err) || err.isTransient;
    const statusCode = err.code || err.status || 500;

    if (isTransient || statusCode === 503) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. ComicCraft automatically retried the request, but the service is still unavailable. Please try again in a moment.',
        code: 503,
        retryable: true,
      });
    }

    if (statusCode === 429) {
      return res.status(429).json({
        error: 'Gemini rate limit reached. Please wait a moment before trying again.',
        code: 429,
        retryable: true,
      });
    }

    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: err.message || 'Comic generation failed. Please try again.',
      code: statusCode,
      retryable: false,
    });
  } finally {
    isGenerationInProgress = false;
  }
}

export async function getComics(req: Request, res: Response) {
  try {
    const comics = await db.getAllComics();
    return res.status(200).json({ comics });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve comics.' });
  }
}

export async function getComicById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }
    return res.status(200).json({ comic });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error fetching comic.' });
  }
}

export async function saveNewComic(req: Request, res: Response) {
  try {
    const comicData = req.body;
    if (!comicData.title || !comicData.panels) {
      return res.status(400).json({ error: 'Invalid comic data.' });
    }
    const saved = await db.saveComic(comicData);
    return res.status(201).json({ success: true, comic: saved });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save comic.' });
  }
}

// Requirement 6 & 7: Update comic/panels/dialogue/captions in database WITHOUT calling Gemini
export async function updateComic(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateComic(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Comic not found for update.' });
    }
    return res.status(200).json({ success: true, comic: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update comic.' });
  }
}

export async function deleteComic(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await db.deleteComic(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Comic not found or already deleted.' });
    }
    return res.status(200).json({ success: true, message: 'Comic deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete comic.' });
  }
}

// Requirement 8: Regenerate Panel should ONLY regenerate the selected panel
export async function regeneratePanel(req: Request, res: Response) {
  try {
    const { id, panelNumber } = req.params;
    const pNum = parseInt(panelNumber, 10);
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }

    const panelIndex = comic.panels.findIndex((p: any) => p.panelNumber === pNum);
    if (panelIndex === -1) {
      return res.status(404).json({ error: `Panel ${panelNumber} not found.` });
    }

    const panel = comic.panels[panelIndex];
    let newImageUrl = '';
    let panelError = undefined;

    try {
      newImageUrl = await geminiService.generatePanelArtwork({
        prompt: panel.imagePrompt || panel.sceneDescription,
        artStyle: comic.artStyle,
        characters: comic.characters,
        panelNumber: pNum,
        totalPanels: comic.panels.length,
        sceneDescription: panel.sceneDescription,
      });
    } catch (imgErr: any) {
      if (geminiService.isDailyQuotaExhausted(imgErr) || imgErr.isDailyQuota) {
        return res.status(429).json({
          error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
          isDailyQuota: true,
        });
      }
      console.warn(`[ComicCraft] Panel #${pNum} regeneration notice:`, imgErr.message);
      newImageUrl = geminiService.generateStylizedComicArtworkSvg({
        panelNumber: pNum,
        totalPanels: comic.panels.length,
        artStyle: comic.artStyle,
        characters: comic.characters,
        sceneDescription: panel.sceneDescription || panel.imagePrompt,
      });
    }

    comic.panels[panelIndex].imageUrl = newImageUrl;
    comic.panels[panelIndex].error = panelError;
    const updated = await db.updateComic(id, { panels: comic.panels });

    return res.status(200).json({
      success: true,
      panel: comic.panels[panelIndex],
      comic: updated,
    });
  } catch (err: any) {
    console.error('Error regenerating panel:', err);
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        isDailyQuota: true,
      });
    }
    return res.status(500).json({ error: 'Failed to regenerate panel. Please try again.' });
  }
}

// Requirement 6: ONLY calls Gemini when user explicitly clicks "Improve Dialogue"
export async function improveDialogue(req: Request, res: Response) {
  try {
    const { id, panelNumber } = req.params;
    const pNum = parseInt(panelNumber, 10);
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }

    const panelIndex = comic.panels.findIndex((p: any) => p.panelNumber === pNum);
    if (panelIndex === -1) {
      return res.status(404).json({ error: `Panel ${panelNumber} not found.` });
    }

    const panel = comic.panels[panelIndex];
    const improved = await geminiService.improvePanelDialogue({
      panel,
      storyContext: `${comic.title} (${comic.genre}): ${comic.summary}`,
    });

    if (improved.improvedDialogue && Array.isArray(improved.improvedDialogue)) {
      comic.panels[panelIndex].dialogue = improved.improvedDialogue;
    }
    if (improved.improvedCaption) {
      comic.panels[panelIndex].caption = improved.improvedCaption;
    }

    const updated = await db.updateComic(id, { panels: comic.panels });

    return res.status(200).json({
      success: true,
      panel: comic.panels[panelIndex],
      comic: updated,
    });
  } catch (err: any) {
    console.error('Error improving dialogue:', err);
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        isDailyQuota: true,
      });
    }
    const isTransient = geminiService.isTransientGeminiError(err);
    if (isTransient) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try improving dialogue again in a moment.',
        code: 503,
      });
    }
    return res.status(500).json({ error: 'Dialogue improvement failed. Please try again.' });
  }
}

// Requirement 9: ONLY calls Gemini when user explicitly clicks "Make Funnier"
export async function makeFunnier(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }

    const funnyResult = await geminiService.makeStoryFunnier(comic);

    if (funnyResult.title) comic.title = funnyResult.title;
    if (funnyResult.summary) comic.summary = funnyResult.summary;

    if (funnyResult.panels && Array.isArray(funnyResult.panels)) {
      for (const p of funnyResult.panels) {
        const idx = comic.panels.findIndex((cp: any) => cp.panelNumber === p.panelNumber);
        if (idx >= 0) {
          if (p.dialogue) comic.panels[idx].dialogue = p.dialogue;
          if (p.caption) comic.panels[idx].caption = p.caption;
          if (p.expression) comic.panels[idx].expression = p.expression;
          if (p.actions) comic.panels[idx].actions = p.actions;
        }
      }
    }

    const updated = await db.updateComic(id, comic);
    return res.status(200).json({ success: true, comic: updated });
  } catch (err: any) {
    console.error('Error making funnier:', err);
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        isDailyQuota: true,
      });
    }
    const isTransient = geminiService.isTransientGeminiError(err);
    if (isTransient) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
        code: 503,
      });
    }
    return res.status(500).json({ error: 'Failed to rewrite story humor.' });
  }
}

// Requirement 9: ONLY calls Gemini when user explicitly clicks "Make Dramatic"
export async function makeDramatic(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }

    const dramaticResult = await geminiService.makeStoryDramatic(comic);

    if (dramaticResult.title) comic.title = dramaticResult.title;
    if (dramaticResult.summary) comic.summary = dramaticResult.summary;

    if (dramaticResult.panels && Array.isArray(dramaticResult.panels)) {
      for (const p of dramaticResult.panels) {
        const idx = comic.panels.findIndex((cp: any) => cp.panelNumber === p.panelNumber);
        if (idx >= 0) {
          if (p.dialogue) comic.panels[idx].dialogue = p.dialogue;
          if (p.caption) comic.panels[idx].caption = p.caption;
          if (p.expression) comic.panels[idx].expression = p.expression;
          if (p.actions) comic.panels[idx].actions = p.actions;
        }
      }
    }

    const updated = await db.updateComic(id, comic);
    return res.status(200).json({ success: true, comic: updated });
  } catch (err: any) {
    console.error('Error making dramatic:', err);
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        isDailyQuota: true,
      });
    }
    const isTransient = geminiService.isTransientGeminiError(err);
    if (isTransient) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
        code: 503,
      });
    }
    return res.status(500).json({ error: 'Failed to elevate drama.' });
  }
}

// Requirement 9: ONLY calls Gemini when user explicitly clicks "Add Plot Twist"
export async function addPlotTwist(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }

    const twistResult = await geminiService.addPlotTwist(comic);

    if (twistResult.summary) comic.summary = twistResult.summary;

    if (twistResult.updatedPanels && Array.isArray(twistResult.updatedPanels)) {
      for (const p of twistResult.updatedPanels) {
        const idx = comic.panels.findIndex((cp: any) => cp.panelNumber === p.panelNumber);
        if (idx >= 0) {
          if (p.dialogue) comic.panels[idx].dialogue = p.dialogue;
          if (p.caption) comic.panels[idx].caption = p.caption;
          if (p.sceneDescription) comic.panels[idx].sceneDescription = p.sceneDescription;
          if (p.expression) comic.panels[idx].expression = p.expression;
          if (p.actions) comic.panels[idx].actions = p.actions;
        }
      }
    }

    const updated = await db.updateComic(id, comic);
    return res.status(200).json({ success: true, twist: twistResult.twistDescription, comic: updated });
  } catch (err: any) {
    console.error('Error adding plot twist:', err);
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        isDailyQuota: true,
      });
    }
    const isTransient = geminiService.isTransientGeminiError(err);
    if (isTransient) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
        code: 503,
      });
    }
    return res.status(500).json({ error: 'Failed to add plot twist.' });
  }
}

// Requirement 9: ONLY calls Gemini when user explicitly clicks "Change Ending"
export async function changeEnding(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }

    const endingResult = await geminiService.changeEnding(comic);
    if (endingResult.newEndingPanel) {
      const lastIndex = comic.panels.length - 1;
      const newPanel = endingResult.newEndingPanel;

      const newImageUrl = geminiService.generateStylizedComicArtworkSvg({
        panelNumber: lastIndex + 1,
        totalPanels: comic.panels.length,
        artStyle: comic.artStyle,
        characters: comic.characters,
        sceneDescription: newPanel.sceneDescription || newPanel.imagePrompt,
      });

      comic.panels[lastIndex] = {
        ...newPanel,
        panelNumber: lastIndex + 1,
        imageUrl: newImageUrl,
      };
    }

    const updated = await db.updateComic(id, comic);
    return res.status(200).json({ success: true, comic: updated });
  } catch (err: any) {
    console.error('Error changing ending:', err);
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        isDailyQuota: true,
      });
    }
    const isTransient = geminiService.isTransientGeminiError(err);
    if (isTransient) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
        code: 503,
      });
    }
    return res.status(500).json({ error: 'Failed to change ending.' });
  }
}

// Requirement 9: ONLY calls Gemini when user explicitly clicks "Add Panel"
export async function addPanel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const comic = await db.getComicById(id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found.' });
    }

    const addResult = await geminiService.addStoryPanel(comic);
    if (addResult.newPanel) {
      const newPNum = comic.panels.length + 1;
      const newPanel = addResult.newPanel;

      const newImageUrl = geminiService.generateStylizedComicArtworkSvg({
        panelNumber: newPNum,
        totalPanels: newPNum,
        artStyle: comic.artStyle,
        characters: comic.characters,
        sceneDescription: newPanel.sceneDescription || newPanel.imagePrompt,
      });

      comic.panels.push({
        ...newPanel,
        panelNumber: newPNum,
        imageUrl: newImageUrl,
      });
      comic.panelCount = comic.panels.length;
    }

    const updated = await db.updateComic(id, comic);
    return res.status(200).json({ success: true, comic: updated });
  } catch (err: any) {
    console.error('Error adding panel:', err);
    if (geminiService.isDailyQuotaExhausted(err) || err.isDailyQuota) {
      return res.status(429).json({
        error: 'Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.',
        isDailyQuota: true,
      });
    }
    const isTransient = geminiService.isTransientGeminiError(err);
    if (isTransient) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
        code: 503,
      });
    }
    return res.status(500).json({ error: 'Failed to add new panel.' });
  }
}
