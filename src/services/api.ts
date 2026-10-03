import { ComicData, GenerateComicRequest } from '../types.ts';

const API_BASE = '/api/comics';

export async function generateComic(request: GenerateComicRequest): Promise<ComicData> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate comic with Gemini.');
  }
  return data.comic;
}

export async function fetchComics(): Promise<ComicData[]> {
  const res = await fetch(API_BASE);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch comics.');
  }
  return data.comics || [];
}

export async function fetchComicById(id: string): Promise<ComicData> {
  const res = await fetch(`${API_BASE}/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Comic not found.');
  }
  return data.comic;
}

export async function saveComic(comic: ComicData): Promise<ComicData> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comic),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save comic.');
  }
  return data.comic;
}

export async function updateComic(id: string, updates: Partial<ComicData>): Promise<ComicData> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update comic.');
  }
  return data.comic;
}

export async function deleteComic(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete comic.');
  }
}

export async function regeneratePanel(comicId: string, panelNumber: number): Promise<{ panel: any; comic: ComicData }> {
  const res = await fetch(`${API_BASE}/${comicId}/regenerate-panel/${panelNumber}`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to regenerate panel.');
  }
  return { panel: data.panel, comic: data.comic };
}

export async function improveDialogue(comicId: string, panelNumber: number): Promise<{ panel: any; comic: ComicData }> {
  const res = await fetch(`${API_BASE}/${comicId}/improve-dialogue/${panelNumber}`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to improve dialogue.');
  }
  return { panel: data.panel, comic: data.comic };
}

export async function makeFunnier(comicId: string): Promise<ComicData> {
  const res = await fetch(`${API_BASE}/${comicId}/make-funnier`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to apply humor twist.');
  }
  return data.comic;
}

export async function makeDramatic(comicId: string): Promise<ComicData> {
  const res = await fetch(`${API_BASE}/${comicId}/make-dramatic`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add dramatic flair.');
  }
  return data.comic;
}

export async function addPlotTwist(comicId: string): Promise<{ comic: ComicData; twist?: string }> {
  const res = await fetch(`${API_BASE}/${comicId}/add-plot-twist`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add plot twist.');
  }
  return { comic: data.comic, twist: data.twist };
}

export async function changeEnding(comicId: string): Promise<ComicData> {
  const res = await fetch(`${API_BASE}/${comicId}/change-ending`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate alternate ending.');
  }
  return data.comic;
}

export async function addPanel(comicId: string): Promise<ComicData> {
  const res = await fetch(`${API_BASE}/${comicId}/add-panel`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add new panel.');
  }
  return data.comic;
}
