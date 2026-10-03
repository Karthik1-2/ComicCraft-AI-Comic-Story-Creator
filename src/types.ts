export type Genre =
  | 'Comedy'
  | 'Action'
  | 'Adventure'
  | 'Fantasy'
  | 'Horror'
  | 'Romance'
  | 'Sci-Fi'
  | 'Mystery'
  | 'Drama';

export type ArtStyle =
  | 'Cartoon'
  | 'Comic Book'
  | 'Manga'
  | 'Superhero'
  | 'Watercolor'
  | 'Anime-inspired'
  | 'Minimalist';

export type BubbleType = 'speech' | 'thought' | 'shout' | 'whisper';
export type BubblePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center';

export interface DialogueItem {
  id?: string;
  speaker: string;
  text: string;
  type?: BubbleType;
  position?: BubblePosition;
}

export interface ComicCharacter {
  name: string;
  description: string;
  appearance: string;
  personality: string;
  referenceImage?: string;
}

export interface ComicPanelData {
  panelNumber: number;
  sceneDescription: string;
  background: string;
  characters: string[];
  actions: string;
  expression: string;
  dialogue: DialogueItem[];
  caption: string;
  imagePrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
  error?: string;
}

export interface ComicData {
  _id?: string;
  id?: string;
  title: string;
  originalPrompt: string;
  summary: string;
  genre: Genre;
  artStyle: ArtStyle;
  panelCount: number;
  characters: ComicCharacter[];
  panels: ComicPanelData[];
  createdAt?: string;
  updatedAt?: string;
}

export type GenerationStepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

export interface GenerationStep {
  id: string;
  label: string;
  status: GenerationStepStatus;
  detail?: string;
}

export interface GenerateComicRequest {
  prompt: string;
  genre: Genre;
  artStyle: ArtStyle;
  panelCount: number;
}
