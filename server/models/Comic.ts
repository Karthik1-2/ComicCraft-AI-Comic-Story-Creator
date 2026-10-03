import mongoose, { Schema, Document } from 'mongoose';

export interface IDialogue {
  speaker: string;
  text: string;
  type?: string;
  position?: string;
}

export interface ICharacter {
  name: string;
  description: string;
  appearance: string;
  personality: string;
  referenceImage?: string;
}

export interface IPanel {
  panelNumber: number;
  sceneDescription: string;
  background: string;
  characters: string[];
  actions: string;
  expression: string;
  dialogue: IDialogue[];
  caption: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface IComic extends Document {
  title: string;
  originalPrompt: string;
  summary: string;
  genre: string;
  artStyle: string;
  panelCount: number;
  characters: ICharacter[];
  panels: IPanel[];
  createdAt: Date;
  updatedAt: Date;
}

const DialogueSchema = new Schema({
  speaker: { type: String, default: '' },
  text: { type: String, default: '' },
  type: { type: String, default: 'speech' },
  position: { type: String, default: 'top-left' }
}, { _id: false });

const CharacterSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  appearance: { type: String, default: '' },
  personality: { type: String, default: '' },
  referenceImage: { type: String }
}, { _id: false });

const PanelSchema = new Schema({
  panelNumber: { type: Number, required: true },
  sceneDescription: { type: String, default: '' },
  background: { type: String, default: '' },
  characters: [{ type: String }],
  actions: { type: String, default: '' },
  expression: { type: String, default: '' },
  dialogue: [DialogueSchema],
  caption: { type: String, default: '' },
  imagePrompt: { type: String, default: '' },
  imageUrl: { type: String }
}, { _id: false });

const ComicSchema = new Schema({
  title: { type: String, required: true },
  originalPrompt: { type: String, required: true },
  summary: { type: String, default: '' },
  genre: { type: String, default: 'Comedy' },
  artStyle: { type: String, default: 'Comic Book' },
  panelCount: { type: Number, required: true },
  characters: [CharacterSchema],
  panels: [PanelSchema]
}, {
  timestamps: true
});

export const ComicModel = mongoose.models.Comic || mongoose.model<IComic>('Comic', ComicSchema);
