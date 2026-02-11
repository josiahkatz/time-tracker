import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

interface TimeEntry {
  id: string;
  team: string;
  activity: string;
  durationMinutes: number;
  notes: string;
  date: string;
  createdAt: string;
}

interface CategoryItem {
  name: string;
  color: string;
}

interface StoreData {
  entries: TimeEntry[];
  settings: {
    notificationsEnabled: boolean;
    notificationIntervalMinutes: number;
  };
  teams: CategoryItem[];
  activities: CategoryItem[];
}

const DEFAULT_TEAMS: CategoryItem[] = [
  { name: '3D', color: '#6366f1' },
  { name: 'Editing', color: '#ec4899' },
  { name: 'Front-End Development', color: '#f59e0b' },
  { name: 'Graphic Design', color: '#10b981' },
  { name: 'Photography', color: '#8b5cf6' },
  { name: 'Product Design', color: '#3b82f6' },
  { name: 'Social Media', color: '#f97316' },
  { name: 'Styling & Videography', color: '#14b8a6' },
  { name: 'WebstaurantPlus', color: '#ef4444' },
  { name: 'Webstaurant App', color: '#06b6d4' },
  { name: 'Leadership/General', color: '#6b7280' },
];

const DEFAULT_ACTIVITIES: CategoryItem[] = [
  { name: 'Meetings', color: '#6366f1' },
  { name: '1:1s', color: '#ec4899' },
  { name: 'Reviews/Feedback', color: '#f59e0b' },
  { name: 'Strategy/Planning', color: '#10b981' },
  { name: 'Deep Work', color: '#3b82f6' },
  { name: 'Admin', color: '#6b7280' },
  { name: 'Communication', color: '#8b5cf6' },
  { name: 'Presentations', color: '#f97316' },
];

const defaultData: StoreData = {
  entries: [],
  settings: {
    notificationsEnabled: true,
    notificationIntervalMinutes: 60,
  },
  teams: DEFAULT_TEAMS,
  activities: DEFAULT_ACTIVITIES,
};

function getStorePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'time-tracker-data.json');
}

function readStore(): StoreData {
  const filePath = getStorePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw) as StoreData;
      // Migrate old stores that lack teams/activities
      if (!data.teams) data.teams = [...DEFAULT_TEAMS];
      if (!data.activities) data.activities = [...DEFAULT_ACTIVITIES];
      return data;
    }
  } catch (err) {
    console.error('Error reading store:', err);
  }
  return {
    ...defaultData,
    entries: [],
    settings: { ...defaultData.settings },
    teams: [...DEFAULT_TEAMS],
    activities: [...DEFAULT_ACTIVITIES],
  };
}

function writeStore(data: StoreData): void {
  const filePath = getStorePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

export function getAllEntries(startDate?: string, endDate?: string): TimeEntry[] {
  const data = readStore();
  let entries = data.entries;
  if (startDate) {
    entries = entries.filter((e) => e.date >= startDate);
  }
  if (endDate) {
    entries = entries.filter((e) => e.date <= endDate);
  }
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry {
  const data = readStore();
  const newEntry: TimeEntry = {
    ...entry,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  data.entries.push(newEntry);
  writeStore(data);
  return newEntry;
}

export function deleteEntry(id: string): boolean {
  const data = readStore();
  const idx = data.entries.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  data.entries.splice(idx, 1);
  writeStore(data);
  return true;
}

export function getSettings(): StoreData['settings'] {
  return readStore().settings;
}

export function updateSettings(
  partial: Partial<StoreData['settings']>
): StoreData['settings'] {
  const data = readStore();
  data.settings = { ...data.settings, ...partial };
  writeStore(data);
  return data.settings;
}

export function getTeams(): CategoryItem[] {
  return readStore().teams;
}

export function updateTeams(teams: CategoryItem[]): CategoryItem[] {
  const data = readStore();
  data.teams = teams;
  writeStore(data);
  return data.teams;
}

export function getActivities(): CategoryItem[] {
  return readStore().activities;
}

export function updateActivities(activities: CategoryItem[]): CategoryItem[] {
  const data = readStore();
  data.activities = activities;
  writeStore(data);
  return data.activities;
}
