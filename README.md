# ComicCraft – AI Comic Story Creator Using Gemini Models

An end-to-end full-stack web application designed for a College CSE Capstone Project that transforms natural-language story ideas into multi-panel graphic comic books using Google Gemini models.

---

## Project Description

ComicCraft is an interactive web platform where users can describe a story premise in plain English (e.g., *"A college student who is always late to class"*), select a genre, art style, and panel count, and have Google Gemini automatically generate a coherent story arc, characters with continuity descriptions, structured comic panels, dialogue, captions, and visual comic illustrations.

Unlike simple text-to-image generators, ComicCraft decouples the artwork from the typography: visual panels are rendered with speech bubbles and captions layered dynamically on top via HTML/CSS. This allows users to edit dialogue, reposition speech bubbles, polish text with an AI script doctor, regenerate individual panels, and export the finalized comic as high-resolution PNG or PDF files.

---

## Problem Statement

Traditional comic creation requires combined artistic illustration ability, scriptwriting talent, and significant production time. Creative thinkers, students, and writers who have compelling story ideas often face high barriers to transforming them into visual graphic narratives.

ComicCraft addresses this challenge by harnessing Google Gemini models to automate the story generation, character planning, panel structuring, and visual rendering pipeline through an intuitive web interface.

---

## Proposed Solution

ComicCraft offers a multi-stage AI creation pipeline:

1. **Natural Language Input**: The user inputs a simple story concept, genre (Comedy, Action, Sci-Fi, etc.), art style (Comic Book, Manga, Superhero, etc.), and panel count (4, 6, or 8).
2. **Gemini Narrative Planning**: Gemini 3.8 Flash creates a structured story JSON with a title, summary, character continuity profiles, scene descriptions, dialogue lines, and visual prompts.
3. **Artwork Generation**: Gemini image models generate artwork for each panel according to character descriptions and visual style.
4. **Interactive Comic Layout**: Displays the comic in an authentic comic book responsive grid with styled speech bubbles (speech, shout, thought, whisper) and captions.
5. **Panel Editing & AI Assist**: Users can edit text, regenerate individual panels, or invoke Gemini AI features (*Make Funnier*, *Make More Dramatic*, *Add Plot Twist*, *Change Ending*, *Add Panel*).
6. **Persistence & Export**: Comics are persisted in MongoDB (or local persistent storage) and can be downloaded as print-ready PNG or PDF files.

---

## Features

- **Intuitive Storyboard Creation**: 4, 6, or 8-panel story structures with beginning, middle, and climax/punchline.
- **Genre & Style Customization**: 9 genres (Comedy, Action, Adventure, Fantasy, Horror, Romance, Sci-Fi, Mystery, Drama) and 7 art styles (Comic Book, Manga, Cartoon, Superhero, Anime-inspired, Watercolor, Minimalist).
- **Layered Speech Bubble Engine**: Speech bubbles with speaker tags, comic tails, and four bubble types:
  - `speech`: Classic rounded speech bubble with pointer tail.
  - `shout`: Spiky high-energy border with bold red/yellow emphasis.
  - `thought`: Cloud border with trailing thought circles.
  - `whisper`: Dashed subtle border with italicized script.
- **Multi-Position Bubbles**: Position dialogue across 7 layout coordinates (`top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`, `center`).
- **Single-Panel Regeneration**: Re-rolls artwork for a specific panel without touching or regenerating the rest of the comic.
- **Live Comic Editor**: Edit dialogue, captions, and scene prompts in real time.
- **My Comics Library**: Searchable and filterable comic gallery with panel counts, genre tags, and deletion protection.
- **High-Res Export**: Download full comic sheets as PNG or PDF.
- **Pre-Seeded College Demo Comic**: Includes *"The Late Student"* 6-panel comedy comic ready to read, inspect, and edit.

---

## AI Features

ComicCraft leverages Google Gemini models via `@google/genai`:

- **Structured Story Generation (`gemini-3.8-flash`)**: Generates guaranteed JSON matching strict schemas for story pacing, character appearance consistency, and panel dialogues.
- **Visual Panel Generation (`gemini-3.1-flash-lite-image` / `gemini-3.1-flash-image`)**: Generates visual comic illustrations with stylized artistic fallback synthesis.
- **Make Story Funnier**: Live Gemini rewrite that enhances comedic timing, funny physical reactions, and punchlines.
- **Make Story Dramatic**: Elevates dramatic tension, stakes, and cinematic suspense.
- **Add Plot Twist**: Introduces an unexpected yet logical twist to the climax.
- **Change Ending**: Generates a completely alternative conclusion for the final panel.
- **Improve Dialogue**: AI dialogue editor that tightens and sharpens speech lines for any selected panel.
- **Add Panel**: Expands the comic by generating the next chronological panel.

---

## Technology Stack

### Frontend
- **React 19**
- **Vite 8**
- **TypeScript**
- **Tailwind CSS 4**
- **Lucide Icons**
- **HTML-to-Image & jsPDF** (PNG & PDF export)

### Backend
- **Node.js & Express.js**
- **@google/genai SDK**
- **TSX** (TypeScript execution)

### Database
- **MongoDB & Mongoose**: Primary relational/document schema.
- **Persistent JSON Fallback Store (`.data/comics.json`)**: Automatic zero-config fallback if `MONGODB_URI` is not configured, ensuring seamless operation in any environment.

---

## System Architecture

```
USER BROWSER (React + Tailwind CSS)
      │
      │ HTTP REST Requests (/api/comics/*)
      ▼
EXPRESS BACKEND (server.ts)
      │
      ├── Controllers & Validation (server/controllers/comicController.ts)
      │
      ├── Gemini AI Service (server/services/geminiService.ts)
      │     ├── Story Structure (gemini-3.8-flash with JSON schema)
      │     ├── Artwork Generation (gemini-3.1-flash-lite-image)
      │     └── AI Assist Transformations (Funnier, Dramatic, Twist, Ending)
      │
      └── Database Layer (server/db/database.ts)
            ├── MongoDB Atlas / Local MongoDB (via Mongoose)
            └── Local Persistent File Storage (.data/comics.json)
```

---

## Project Structure

```
├── .data/                          # Local persistent storage when MongoDB is offline
│   └── comics.json
├── server/
│   ├── controllers/
│   │   └── comicController.ts      # API handlers for story generation & assist tools
│   ├── db/
│   │   └── database.ts             # Dual-mode database adapter (MongoDB / local JSON)
│   ├── models/
│   │   └── Comic.ts                # Mongoose schema for Comic, Panel, Character, Dialogue
│   ├── routes/
│   │   └── comicRoutes.ts          # Express REST endpoints
│   └── services/
│       └── geminiService.ts        # @google/genai API integrations
├── src/
│   ├── components/
│   │   ├── AIAssistToolbar.tsx     # AI transform buttons (Funnier, Dramatic, Twist, etc.)
│   │   ├── CharacterCard.tsx       # Character visual continuity profile
│   │   ├── ComicCard.tsx           # Comic card in library view
│   │   ├── ComicPanel.tsx          # Comic panel with speech bubble overlays
│   │   ├── ComicViewer.tsx         # Responsive comic grid reader and editor
│   │   ├── ConfirmDialog.tsx       # Safe confirmation modal
│   │   ├── ExportButton.tsx        # PNG and PDF exporter
│   │   ├── GenerationProgress.tsx  # Multi-step generation stepper
│   │   ├── Navbar.tsx              # Top navigation bar
│   │   ├── PanelEditor.tsx         # Dialogue & scene editor modal
│   │   ├── SpeechBubble.tsx        # Dynamic comic speech bubbles with tails
│   │   └── StoryForm.tsx           # Story input form with genre & style pickers
│   ├── pages/
│   │   ├── ComicViewPage.tsx       # Active comic reading and editing page
│   │   ├── CreateComicPage.tsx     # Comic generator page
│   │   ├── HomePage.tsx            # Landing page with hero & demo preview
│   │   └── MyComicsPage.tsx        # Saved comics library
│   ├── services/
│   │   └── api.ts                  # Typed client HTTP service
│   ├── App.tsx                     # Main application shell
│   ├── index.css                   # Comic typography and Tailwind CSS styles
│   ├── main.tsx                    # React DOM root entry
│   └── types.ts                    # Shared TypeScript interfaces
├── .env.example                    # Environment variable template
├── metadata.json                   # Applet metadata & server-side Gemini capability
├── package.json                    # Project scripts and dependencies
├── server.ts                       # Express server + Vite middleware entry point
└── tsconfig.json                   # TypeScript configuration
```

---


## Testing

The application supports the following test scenarios:

1. **Test 1: College Comedy Comic (4 Panels)**
   - Prompt: `"A college student who is always late."`
   - Genre: `Comedy` | Style: `Comic Book` | Panels: `4`
   - Result: 4 panels tracking late arrival, missed alarms, and comedic conclusion.

2. **Test 2: Sci-Fi College Comic (6 Panels)**
   - Prompt: `"A robot starts studying in a human college."`
   - Genre: `Sci-Fi` | Style: `Cartoon` | Panels: `6`
   - Result: 6 panels exploring humor, battery recharges in the library, and classroom surprises.

3. **Test 3: Mystery Graphic Novel (8 Panels)**
   - Prompt: `"A detective solves a mysterious case."`
   - Genre: `Mystery` | Style: `Comic Book` | Panels: `8`
   - Result: 8 panels with clues, shadows, suspect questioning, and culprit revelation.

4. **Edge Case Tests**:
   - Empty story idea validation prevents blank requests.
   - Offline or invalid MongoDB defaults gracefully to local persistence.
   - Individual panel regeneration does not disrupt adjacent panels.
   - Speech bubble text changes are preserved immediately upon saving.

---

## Future Enhancements

- Multi-page comic books with chapter navigation.
- Speech bubble drag-and-drop coordinate positioning.
- Text-to-speech audio voiceover for comic narration using Gemini 3.8 Flash TTS.
- User authentication and community sharing gallery.

---
## TEAM MEMBERS

 - Dinesh Karthik N
 - Ashwin Jayaseelan A
 - Bharath KS
 - Giridharan S
 - Jaikumaran S

