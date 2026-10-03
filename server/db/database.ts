import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { ComicModel } from '../models/Comic.ts';

const DATA_DIR = path.resolve('.data');
const DATA_FILE = path.join(DATA_DIR, 'comics.json');

let isMongoConnected = false;

// Embedded Demo Comic matching Requirement 26
const DEMO_COMIC = {
  id: 'demo-the-late-student',
  title: 'The Late Student',
  originalPrompt: 'A college student who is always late to class tries to sneak in unnoticed.',
  summary: 'Arun oversleeps after an intense coding sprint, dashes across campus in chaotic hurry, and attempts a stealth entry into Professor Sharma\'s Advanced Algorithms lecture.',
  genre: 'Comedy',
  artStyle: 'Comic Book',
  panelCount: 6,
  characters: [
    {
      name: 'Arun',
      description: 'Undergraduate CSE student who stays up coding till 4 AM',
      appearance: 'Messy black hair, askew glasses, oversized yellow hoodie with blue jeans, unzipped backpack',
      personality: 'Panicky, well-meaning, caffeinated, frantic runner'
    },
    {
      name: 'Professor Sharma',
      description: 'Veteran Computer Science Professor with eagle eyes',
      appearance: 'Neat graying mustache, tweed jacket with elbow patches, clipboard, strict silver spectacles',
      personality: 'Disciplined, sarcastic, surprisingly observant'
    }
  ],
  panels: [
    {
      panelNumber: 1,
      sceneDescription: 'Arun in dorm room jolting awake as alarm clock rings violently at 8:54 AM for a 9:00 AM exam.',
      background: 'Messy college dorm with code editor glowing on monitor, textbooks piled high',
      characters: ['Arun'],
      actions: 'Falling out of bed entangled in blanket, wide eyes staring at clock',
      expression: 'Sheer terror, mouth wide open',
      dialogue: [
        { speaker: 'Arun', text: '8:54 AM?! The Algorithms exam started four minutes ago in my nightmare!', type: 'shout', position: 'top-left' }
      ],
      caption: 'Monday morning, Dorm 4B...',
      imagePrompt: 'Comic book art style. A frantic college student with messy black hair and askew glasses jolts out of bed in shock, tangled in blankets, staring at an alarm clock flashing 8:54 AM. Vibrant dramatic comic shadows and speedlines.',
      imageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#312e81"/>
          </linearGradient>
          <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#4338ca" opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="600" height="450" fill="url(#g1)"/>
        <rect width="600" height="450" fill="url(#dots)"/>
        <!-- Speed lines -->
        <path d="M0,0 L200,180 M600,0 L420,160 M0,450 L220,300 M600,450 L400,290" stroke="#facc15" stroke-width="3" stroke-dasharray="8,6" opacity="0.6"/>
        <!-- Dorm Window & Morning Light -->
        <rect x="420" y="40" width="130" height="150" fill="#fef08a" stroke="#000" stroke-width="4"/>
        <line x1="485" y1="40" x2="485" y2="190" stroke="#000" stroke-width="4"/>
        <line x1="420" y1="115" x2="550" y2="115" stroke="#000" stroke-width="4"/>
        <!-- Alarm Clock -->
        <rect x="70" y="270" width="110" height="80" rx="12" fill="#ef4444" stroke="#000" stroke-width="4"/>
        <text x="125" y="318" font-family="monospace" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">8:54</text>
        <text x="125" y="340" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fef08a" text-anchor="middle">!! ALARM !!</text>
        <!-- Arun Character Silhouette & Details -->
        <circle cx="300" cy="210" r="45" fill="#fcd34d" stroke="#000" stroke-width="4"/>
        <!-- Hair messy -->
        <path d="M260,195 Q250,160 280,170 Q300,150 320,165 Q350,155 340,190" fill="#1e293b" stroke="#000" stroke-width="3"/>
        <!-- Glasses -->
        <circle cx="288" cy="210" r="12" fill="#e0f2fe" stroke="#000" stroke-width="3"/>
        <circle cx="314" cy="210" r="12" fill="#e0f2fe" stroke="#000" stroke-width="3"/>
        <line x1="300" y1="210" x2="302" y2="210" stroke="#000" stroke-width="3"/>
        <!-- Panicked mouth -->
        <ellipse cx="300" cy="236" rx="10" ry="14" fill="#991b1b" stroke="#000" stroke-width="2"/>
        <!-- Hoodie body -->
        <path d="M240,310 Q300,260 360,310 L370,400 L230,400 Z" fill="#eab308" stroke="#000" stroke-width="4"/>
        <text x="300" y="380" font-family="Bangers, sans-serif" font-size="42" fill="#ffffff" stroke="#000" stroke-width="1.5" text-anchor="middle">WAKE UP!!</text>
      </svg>`)
    },
    {
      panelNumber: 2,
      sceneDescription: 'Arun sprinting at breakneck speed down the college hallway with shoes half on.',
      background: 'Brick college campus corridor with blurred posters and passing students',
      characters: ['Arun'],
      actions: 'Spriting with toast hanging out of mouth, papers flying out of bag',
      expression: 'Hyper-focused desperate grimace',
      dialogue: [
        { speaker: 'Arun', text: 'If I can sprint at 25 km/h, I might only be 6 minutes late!', type: 'thought', position: 'top-right' }
      ],
      caption: 'Target: Lecture Hall 302',
      imagePrompt: 'Comic book art. Young college student in bright yellow hoodie sprinting desperately down a college corridor, toast in mouth, flying notebook pages, dynamic motion blur and comic dust clouds.',
      imageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <defs>
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#g2)"/>
        <!-- Hallway perspective -->
        <polygon points="0,0 200,160 200,290 0,450" fill="#78350f" opacity="0.4"/>
        <polygon points="600,0 400,160 400,290 600,450" fill="#78350f" opacity="0.4"/>
        <!-- Motion lines -->
        <line x1="80" y1="220" x2="250" y2="220" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
        <line x1="40" y1="260" x2="220" y2="260" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="310" x2="280" y2="310" stroke="#fef08a" stroke-width="5" stroke-linecap="round"/>
        <!-- Flying papers -->
        <polygon points="120,120 150,110 160,135 130,145" fill="#ffffff" stroke="#000" stroke-width="2"/>
        <polygon points="170,90 200,85 205,110 175,115" fill="#ffffff" stroke="#000" stroke-width="2"/>
        <!-- Runner Arun -->
        <circle cx="360" cy="180" r="38" fill="#fcd34d" stroke="#000" stroke-width="4"/>
        <path d="M330,165 Q330,135 360,140 Q385,130 395,160" fill="#1e293b" stroke="#000" stroke-width="3"/>
        <ellipse cx="372" cy="182" rx="10" ry="10" fill="#e0f2fe" stroke="#000" stroke-width="3"/>
        <!-- Toast in mouth -->
        <rect x="375" y="195" width="30" height="18" rx="3" fill="#d97706" stroke="#000" stroke-width="2"/>
        <!-- Flying yellow hoodie -->
        <path d="M320,220 L420,240 L380,330 L310,290 Z" fill="#eab308" stroke="#000" stroke-width="4"/>
        <text x="300" y="410" font-family="Bangers, sans-serif" font-size="48" fill="#ffffff" stroke="#000" stroke-width="2" text-anchor="middle">ZOOM!!</text>
      </svg>`)
    },
    {
      panelNumber: 3,
      sceneDescription: 'Arun arrives outside Lecture Hall 302 door. He peeks through the narrow door window.',
      background: 'Wooden lecture hall door with polished brass handle and warning sign',
      characters: ['Arun'],
      actions: 'Crouching low, one eye peeking through window glass',
      expression: 'Sneaky, calculating, holding breath',
      dialogue: [
        { speaker: 'Arun', text: 'If Professor Sharma is facing the blackboard, I can crawl to row four unseen...', type: 'whisper', position: 'bottom-left' }
      ],
      caption: 'Hall 302: Silence inside',
      imagePrompt: 'Comic panel. A college student sneaking outside a classroom door, peering through the small rectangular glass window with intense caution. Dramatic side lighting, comic suspense shadows.',
      imageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <rect width="600" height="450" fill="#0f172a"/>
        <!-- Wooden Door -->
        <rect x="180" y="30" width="360" height="390" rx="8" fill="#854d0e" stroke="#000" stroke-width="5"/>
        <rect x="230" y="80" width="140" height="180" rx="6" fill="#1e293b" stroke="#000" stroke-width="4"/>
        <!-- View through window: blackboard with chalk equations -->
        <rect x="240" y="90" width="120" height="160" fill="#064e3b"/>
        <line x1="250" y1="120" x2="330" y2="120" stroke="#f1f5f9" stroke-width="2"/>
        <line x1="250" y1="140" x2="310" y2="140" stroke="#f1f5f9" stroke-width="2"/>
        <text x="290" y="180" font-family="sans-serif" font-size="16" fill="#fef08a" text-anchor="middle">O(N log N)</text>
        <!-- Arun crouching sneaking -->
        <circle cx="120" cy="270" r="42" fill="#fcd34d" stroke="#000" stroke-width="4"/>
        <circle cx="135" cy="265" r="11" fill="#e0f2fe" stroke="#000" stroke-width="3"/>
        <path d="M90,320 Q120,290 160,330 L150,420 L70,420 Z" fill="#eab308" stroke="#000" stroke-width="4"/>
        <!-- Door sign -->
        <rect x="400" y="100" width="110" height="45" fill="#f8fafc" stroke="#000" stroke-width="3"/>
        <text x="455" y="128" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">RM 302</text>
        <text x="300" y="420" font-family="Bangers, sans-serif" font-size="34" fill="#facc15" stroke="#000" stroke-width="1.5" text-anchor="middle">TIPTOE... TIPTOE...</text>
      </svg>`)
    },
    {
      panelNumber: 4,
      sceneDescription: 'Arun pushes the door open by 2 inches, only for the rusty hinges to emit an ear-splitting creak.',
      background: 'Close up on metallic brass hinge with sound wave reverberations',
      characters: ['Arun'],
      actions: 'Freezing mid-motion with foot suspended in air',
      expression: 'Eyes popping in sheer horror',
      dialogue: [
        { speaker: 'Door Hinge', text: 'SCREEEEEEECH!', type: 'shout', position: 'top-center' },
        { speaker: 'Arun', text: 'Did someone lubricate these hinges with pure gravel?!', type: 'thought', position: 'bottom-right' }
      ],
      caption: 'The loudest noise in human history.',
      imagePrompt: 'Comic panel with giant sound effect SCREEECH blasting from a metal door hinge. Shocked student with foot frozen in mid air, pupils contracted with horror. Comic explosion graphics.',
      imageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <rect width="600" height="450" fill="#7f1d1d"/>
        <!-- Comic blast burst -->
        <polygon points="300,50 330,130 420,110 370,180 460,210 380,260 450,330 350,320 330,410 270,330 190,390 220,300 130,300 200,240 140,170 230,170 240,70" fill="#fef08a" stroke="#000" stroke-width="4"/>
        <text x="300" y="240" font-family="Bangers, sans-serif" font-size="64" fill="#dc2626" stroke="#000" stroke-width="3" text-anchor="middle">SCREEECH!!</text>
        <!-- Arun frozen in fear in corner -->
        <circle cx="100" cy="350" r="35" fill="#fcd34d" stroke="#000" stroke-width="4"/>
        <circle cx="115" cy="345" r="9" fill="#e0f2fe" stroke="#000" stroke-width="2"/>
        <path d="M70,390 L130,390 L120,440 L60,440 Z" fill="#eab308" stroke="#000" stroke-width="4"/>
      </svg>`)
    },
    {
      panelNumber: 5,
      sceneDescription: 'Inside classroom. The entire lecture hall has turned around. Professor Sharma stands with arms crossed.',
      background: 'Steep tiered lecture hall filled with 80 students staring directly at Arun',
      characters: ['Professor Sharma', 'Arun'],
      actions: 'Professor Sharma lowering glasses on his nose, holding attendance register',
      expression: 'Deadpan unimpressed glare',
      dialogue: [
        { speaker: 'Professor Sharma', text: 'Ah, Mr. Arun! Thank you for gracing us with your presence. We were just calculating the time complexity of waking up on time.', type: 'speech', position: 'top-right' }
      ],
      caption: '80 pairs of eyes lock on.',
      imagePrompt: 'Comic scene inside college lecture hall. Strict professor with spectacles lowered on nose, arms crossed, staring directly at the tardy student. Rows of smiling and smirking classmates looking back.',
      imageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <rect width="600" height="450" fill="#1e293b"/>
        <!-- Classroom rows -->
        <polygon points="50,450 150,220 450,220 550,450" fill="#334155" stroke="#000" stroke-width="3"/>
        <line x1="120" y1="280" x2="480" y2="280" stroke="#64748b" stroke-width="4"/>
        <line x1="90" y1="350" x2="510" y2="350" stroke="#64748b" stroke-width="4"/>
        <!-- Professor Sharma standing at podium -->
        <rect x="230" y="160" width="140" height="80" fill="#78350f" stroke="#000" stroke-width="3"/>
        <!-- Professor Head & Glasses -->
        <circle cx="300" cy="110" r="32" fill="#fed7aa" stroke="#000" stroke-width="3"/>
        <path d="M275,95 Q300,80 325,95" fill="#94a3b8" stroke="#000" stroke-width="2"/>
        <line x1="285" y1="110" x2="315" y2="110" stroke="#000" stroke-width="3"/>
        <!-- Mustache -->
        <path d="M285,125 Q300,120 315,125" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
        <!-- Tweed Jacket -->
        <path d="M255,145 L345,145 L355,220 L245,220 Z" fill="#475569" stroke="#000" stroke-width="3"/>
        <!-- Speech emphasis bubble line -->
        <text x="300" y="390" font-family="Bangers, sans-serif" font-size="34" fill="#f8fafc" stroke="#000" stroke-width="1.5" text-anchor="middle">BUSTED!</text>
      </svg>`)
    },
    {
      panelNumber: 6,
      sceneDescription: 'Arun sitting at the very front row center desk, right under the professor nose, sheepishly opening notebook.',
      background: 'Front row desk right in front of blackboard covered in quiz problems',
      characters: ['Arun', 'Professor Sharma'],
      actions: 'Arun smiling nervously with pen ready, Professor tapping desk with chalk',
      expression: 'Sheepish grin with giant sweatdrop',
      dialogue: [
        { speaker: 'Arun', text: 'On the bright side, best seat in the house for the quiz!', type: 'speech', position: 'top-left' },
        { speaker: 'Professor Sharma', text: 'Ten points deducted for door squeak decibels, Arun.', type: 'speech', position: 'top-right' }
      ],
      caption: 'Never late... just fashionably penalized.',
      imagePrompt: 'Comic finale panel. College student sitting sheepishly in front row with sweatdrop on forehead, smiling awkwardly while the professor taps a piece of chalk on his desk. Humorous comic conclusion.',
      imageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <rect width="600" height="450" fill="#047857"/>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="30" y2="0" stroke="#065f46" stroke-width="2"/>
          <line x1="0" y1="0" x2="0" y2="30" stroke="#065f46" stroke-width="2"/>
        </pattern>
        <rect width="600" height="450" fill="url(#grid)"/>
        <!-- Desk -->
        <rect x="120" y="270" width="360" height="110" rx="8" fill="#92400e" stroke="#000" stroke-width="5"/>
        <!-- Notebook on desk -->
        <rect x="220" y="290" width="160" height="80" fill="#ffffff" stroke="#000" stroke-width="3"/>
        <line x1="240" y1="310" x2="360" y2="310" stroke="#94a3b8" stroke-width="2"/>
        <line x1="240" y1="330" x2="360" y2="330" stroke="#94a3b8" stroke-width="2"/>
        <!-- Arun sitting -->
        <circle cx="250" cy="190" r="38" fill="#fcd34d" stroke="#000" stroke-width="4"/>
        <!-- Giant sweatdrop -->
        <path d="M285,160 C295,160 300,175 295,185 C290,195 280,195 275,185 C270,175 275,160 285,160 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
        <!-- Nervous grin -->
        <path d="M235,205 Q250,225 265,205" fill="none" stroke="#000" stroke-width="3"/>
        <!-- Glasses -->
        <circle cx="240" cy="190" r="10" fill="#e0f2fe" stroke="#000" stroke-width="2"/>
        <circle cx="262" cy="190" r="10" fill="#e0f2fe" stroke="#000" stroke-width="2"/>
        <path d="M210,230 L290,230 L300,270 L200,270 Z" fill="#eab308" stroke="#000" stroke-width="4"/>
        <!-- Professor hand tapping desk -->
        <rect x="390" y="250" width="40" height="25" rx="5" fill="#fed7aa" stroke="#000" stroke-width="2"/>
        <rect x="420" y="260" width="20" height="8" rx="2" fill="#ffffff" stroke="#000" stroke-width="1.5"/>
        <text x="300" y="420" font-family="Bangers, sans-serif" font-size="44" fill="#fef08a" stroke="#000" stroke-width="2" text-anchor="middle">THE END</text>
      </svg>`)
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function readLocalComics(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([DEMO_COMIC], null, 2), 'utf-8');
      return [DEMO_COMIC];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([DEMO_COMIC], null, 2), 'utf-8');
      return [DEMO_COMIC];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local comics file, returning demo fallback:', err);
    return [DEMO_COMIC];
  }
}

function writeLocalComics(comics: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(comics, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local comics file:', err);
  }
}

export async function initDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      isMongoConnected = true;
      console.log('MongoDB successfully connected.');

      // Check if demo comic exists
      const count = await ComicModel.countDocuments();
      if (count === 0) {
        console.log('Seeding MongoDB with demo comic: The Late Student');
        await ComicModel.create(DEMO_COMIC);
      }
      return;
    } catch (err: any) {
      console.warn('MongoDB connection failed or unreachable. Falling back to persistent JSON storage:', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('No MONGODB_URI specified. Operating with persistent JSON storage at .data/comics.json');
  }

  // Ensure local store initialized
  readLocalComics();
}

export async function getAllComics(): Promise<any[]> {
  if (isMongoConnected) {
    try {
      const comics = await ComicModel.find().sort({ createdAt: -1 }).lean();
      return comics.map((c: any) => ({
        ...c,
        id: c._id ? c._id.toString() : c.id,
      }));
    } catch (err) {
      console.error('Error querying MongoDB, falling back to local file:', err);
    }
  }
  const comics = readLocalComics();
  return comics.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export async function getComicById(id: string): Promise<any | null> {
  if (isMongoConnected) {
    try {
      let comic = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        comic = await ComicModel.findById(id).lean();
      }
      if (!comic) {
        comic = await ComicModel.findOne({ id }).lean();
      }
      if (comic) {
        return {
          ...comic,
          id: (comic as any)._id ? (comic as any)._id.toString() : (comic as any).id,
        };
      }
    } catch (err) {
      console.error('Error finding comic in MongoDB, checking local file:', err);
    }
  }
  const comics = readLocalComics();
  const match = comics.find(c => c.id === id || c._id === id);
  return match || null;
}

export async function saveComic(comicData: any): Promise<any> {
  const now = new Date().toISOString();
  const id = comicData.id || comicData._id || 'comic_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const payload = {
    ...comicData,
    id,
    createdAt: comicData.createdAt || now,
    updatedAt: now,
  };

  if (isMongoConnected) {
    try {
      const created = await ComicModel.create(payload);
      return {
        ...created.toObject(),
        id: created._id.toString(),
      };
    } catch (err) {
      console.error('Error saving comic to MongoDB, saving to local store:', err);
    }
  }

  const comics = readLocalComics();
  const index = comics.findIndex(c => c.id === id || c._id === id);
  if (index >= 0) {
    comics[index] = payload;
  } else {
    comics.unshift(payload);
  }
  writeLocalComics(comics);
  return payload;
}

export async function updateComic(id: string, updates: any): Promise<any | null> {
  const now = new Date().toISOString();
  if (isMongoConnected) {
    try {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await ComicModel.findByIdAndUpdate(id, { ...updates, updatedAt: now }, { new: true }).lean();
      }
      if (!updated) {
        updated = await ComicModel.findOneAndUpdate({ id }, { ...updates, updatedAt: now }, { new: true }).lean();
      }
      if (updated) {
        return {
          ...updated,
          id: (updated as any)._id ? (updated as any)._id.toString() : (updated as any).id,
        };
      }
    } catch (err) {
      console.error('Error updating in MongoDB, updating locally:', err);
    }
  }

  const comics = readLocalComics();
  const index = comics.findIndex(c => c.id === id || c._id === id);
  if (index === -1) return null;
  comics[index] = {
    ...comics[index],
    ...updates,
    updatedAt: now,
  };
  writeLocalComics(comics);
  return comics[index];
}

export async function deleteComic(id: string): Promise<boolean> {
  let deleted = false;
  if (isMongoConnected) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const res = await ComicModel.findByIdAndDelete(id);
        if (res) deleted = true;
      }
      if (!deleted) {
        const res = await ComicModel.findOneAndDelete({ id });
        if (res) deleted = true;
      }
    } catch (err) {
      console.error('Error deleting from MongoDB:', err);
    }
  }

  const comics = readLocalComics();
  const filtered = comics.filter(c => c.id !== id && c._id !== id);
  if (filtered.length !== comics.length) {
    writeLocalComics(filtered);
    deleted = true;
  }
  return deleted;
}
