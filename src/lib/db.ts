import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src', 'lib', 'db.json');

// Interface definitions
export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  telegram: string;
  notes: string;
  createdAt: string;
}

export interface RentalObject {
  id: string;
  name: string;
  district: string;
  address: string;
  price: number; // monthly rent in USD
  rooms: number;
  area: number; // m²
  floor: string; // e.g. "8/12"
  repair: string; // e.g. "Euro", "Lux", "Yangi ta'mir"
  status: "bo'sh" | "band" | "bo'shaydi" | "arxiv";
  image: string;
  images?: string[]; // added array of image URLs
  description: string;
  ownerId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  type: string; // "ijara", "sotib_olish"
  budget: number;
  rooms: number;
  status: "yangi" | "jarayonda" | "qiziqish_bor" | "kutishda" | "arxiv";
  agent: string;
  date: string;
}

export interface CallLog {
  id: string;
  leadId?: string;
  ownerId?: string;
  operator: string;
  managerId?: number; // Optional reference to Android Agent ID
  duration: number; // in seconds
  status: "javob_berildi" | "javobsiz" | "band" | "xato";
  notes: string;
  date: string;
  audioUrl?: string; // Link to the recorded audio file
}

export interface AgentQueue {
  id: string;
  managerId: number;
  phone: string;
  type: "call";
  status: "pending" | "processing" | "completed";
  targetId?: string; // ID of lead/owner to link it back
  targetModel?: "lead" | "owner"; // Whether it's a lead or owner
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: "kutilmoqda" | "bajarilmoqda" | "bajarildi" | "arxiv";
  operator: string;
  date: string;
}

interface DatabaseSchema {
  owners: Owner[];
  objects: RentalObject[];
  leads: Lead[];
  calls: CallLog[];
  tasks: Task[];
  agentQueue: AgentQueue[];
}

const initialData: DatabaseSchema = {
  owners: [
    {
      id: "1",
      name: "Abdulla Inomov",
      phone: "+998 90 123 45 67",
      email: "abdulla@gmail.com",
      telegram: "@abdulla_inomov",
      notes: "Premium klassdagi ko'chmas mulklar egasi.",
      createdAt: "2026-05-15T12:00:00.000Z"
    },
    {
      id: "2",
      name: "Malika Azimova",
      phone: "+998 91 111 22 33",
      email: "malika.azimova@mail.ru",
      telegram: "@malika_azimova",
      notes: "Yunusoboddagi kvartiralar egasi, kelishuvchan ayol.",
      createdAt: "2026-05-16T09:30:00.000Z"
    },
    {
      id: "3",
      name: "Olim Toshkentov",
      phone: "+998 93 999 88 77",
      email: "olim.tosh@gmail.com",
      telegram: "@olim_tosh",
      notes: "Yakkasaraydagi ofis va turar-joylar egasi.",
      createdAt: "2026-05-18T15:45:00.000Z"
    }
  ],
  objects: [
    {
      id: "1",
      name: "Mirabad Avenue Premium",
      district: "Mirabad",
      address: "Mirabad ko'chasi, 12",
      price: 2500,
      rooms: 3,
      area: 120,
      floor: "8/12",
      repair: "Yangi ta'mir",
      status: "bo'sh",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
      images: [],
      description: "Premium klassdagi turar-joy majmuasi. Mirabad Avenue - bu poytaxt markazidagi eng nufuzli manzillardan biri. Xonadon yuqori sifatli materiallar bilan ta'mirlangan, panoramik derazalar va keng balkon mavjud. Barcha sharoitlari bor.",
      ownerId: "1",
      createdAt: "2026-05-15T12:30:00.000Z"
    },
    {
      id: "2",
      name: "City Palace Apartment",
      district: "Tashkent City",
      address: "Tashkent City, 4-blok",
      price: 1500,
      rooms: 2,
      area: 85,
      floor: "12/16",
      repair: "Dizaynerlik",
      status: "band",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop",
      images: [],
      description: "Tashkent City markazida zamonaviy xonadon. Ajoyib shahar manzarasi, rivojlangan infratuzilma, 24/7 qo'riqlash xizmati va yuqori darajadagi xavfsizlik.",
      ownerId: "2",
      createdAt: "2026-05-20T10:00:00.000Z"
    },
    {
      id: "3",
      name: "Premium Residence Hovli",
      district: "Yakkasaray",
      address: "Shota Rustaveli ko'chasi, 45",
      price: 2800,
      rooms: 4,
      area: 160,
      floor: "3/5",
      repair: "Lux",
      status: "bo'shaydi",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000&auto=format&fit=crop",
      images: [],
      description: "Yakkasaray tumanidagi hashamatli yevro uslubidagi xonadon. Barcha qulay sharoitlarga ega, yangi import qilingan mebel va maishiy texnikalar bilan jihozlangan. Oila uchun juda mos.",
      ownerId: "3",
      createdAt: "2026-05-20T11:15:00.000Z"
    },
    {
      id: "4",
      name: "Yunusobod Shunam Studio",
      district: "Yunusabad",
      address: "Yunusobod 19-kvartal, 12-uy",
      price: 600,
      rooms: 1,
      area: 45,
      floor: "2/9",
      repair: "Euro",
      status: "arxiv",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
      images: [],
      description: "Yunusobod tumanida shinamgina 1 xonali studio kvartira. Metroga yaqin, talabalar yoki yosh oila uchun juda qulay va arzon variant.",
      ownerId: "2",
      createdAt: "2026-05-22T14:40:00.000Z"
    }
  ],
  leads: [
    {
      id: "1",
      name: "Aliyor Bekov",
      phone: "+998 90 123 45 67",
      source: "Telegram",
      type: "ijara",
      budget: 1500,
      rooms: 2,
      status: "yangi",
      agent: "Asilbek",
      date: "2026-05-23"
    },
    {
      id: "2",
      name: "Feruza G'ulomova",
      phone: "+998 91 222 33 44",
      source: "Instagram",
      type: "ijara",
      budget: 2500,
      rooms: 3,
      status: "jarayonda",
      agent: "Madina",
      date: "2026-05-22"
    },
    {
      id: "3",
      name: "Javlon Sodiqov",
      phone: "+998 93 444 55 66",
      source: "AI Agent",
      type: "ijara",
      budget: 3500,
      rooms: 4,
      status: "qiziqish_bor",
      agent: "Javlon",
      date: "2026-05-22"
    },
    {
      id: "4",
      name: "Nilufar Orifova",
      phone: "+998 94 777 88 99",
      source: "WhatsApp",
      type: "ijara",
      budget: 800,
      rooms: 1,
      status: "yangi",
      agent: "Sevinch",
      date: "2026-05-21"
    }
  ],
  calls: [
    {
      id: "1",
      leadId: "1",
      operator: "Asilbek",
      duration: 120,
      status: "javob_berildi",
      notes: "Kvartira narxi bo'yicha gaplashildi, Premium Residenceni ko'rmoqchi.",
      date: "2026-05-23T10:15:00.000Z"
    },
    {
      id: "2",
      leadId: "2",
      operator: "Madina",
      duration: 45,
      status: "javobsiz",
      notes: "Mijoz telefonni ko'tarmadi, qayta qo'ng'iroq rejalashtirildi.",
      date: "2026-05-23T11:30:00.000Z"
    },
    {
      id: "3",
      ownerId: "1",
      operator: "Asilbek",
      duration: 320,
      status: "javob_berildi",
      notes: "Mulkdor bilan yangi obyekt (Mirabad Avenue) shartlarini kelishdik.",
      date: "2026-05-22T14:00:00.000Z"
    }
  ],
  tasks: [
    {
      id: "1",
      title: "Mirabad Avenue obyektini tekshirish",
      description: "Abdulla aka bilan ko'rishib, uyning kalitlarini olish va rasmlarni tekshirish.",
      deadline: "2026-05-26",
      status: "kutilmoqda",
      operator: "Asilbek",
      date: "2026-05-25"
    },
    {
      id: "2",
      title: "Aliyor Bekovga Premium Residenceni ko'rsatish",
      description: "Mijoz bilan Premium Residence uyida ko'rishib, uyni ko'rsatish.",
      deadline: "2026-05-25",
      status: "bajarilmoqda",
      operator: "Madina",
      date: "2026-05-25"
    },
    {
      id: "3",
      title: "Yangi kelgan lidlarni qayta ishlash",
      description: "Barcha yangi lidlarga telefon qilib chiqish va ehtiyojlarini aniqlash.",
      deadline: "2026-05-25",
      status: "bajarildi",
      operator: "Sevinch",
      date: "2026-05-24"
    }
  ],
  agentQueue: []
};

// Initialize DB if not exists
export function initDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Read database
export function readDB(): DatabaseSchema {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("DB reading error, using initialData:", error);
    return initialData;
  }
}

// Write database
export function writeDB(data: DatabaseSchema) {
  initDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Auto init on import
initDB();
