import type { TimeEntry, Settings, CategoryItem, CalendarResult } from './types';

declare global {
  interface Window {
    api: {
      getEntries: (startDate?: string, endDate?: string) => Promise<TimeEntry[]>;
      addEntry: (entry: {
        team: string;
        activity: string;
        durationMinutes: number;
        notes: string;
        date: string;
      }) => Promise<TimeEntry>;
      deleteEntry: (id: string) => Promise<boolean>;
      getSettings: () => Promise<Settings>;
      updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
      getTeams: () => Promise<CategoryItem[]>;
      updateTeams: (teams: CategoryItem[]) => Promise<CategoryItem[]>;
      getActivities: () => Promise<CategoryItem[]>;
      updateActivities: (activities: CategoryItem[]) => Promise<CategoryItem[]>;
      getCalendarEvents: (date: string) => Promise<CalendarResult>;
    };
  }
}

export const api = {
  getEntries(startDate?: string, endDate?: string): Promise<TimeEntry[]> {
    return window.api.getEntries(startDate, endDate);
  },
  addEntry(entry: {
    team: string;
    activity: string;
    durationMinutes: number;
    notes: string;
    date: string;
  }): Promise<TimeEntry> {
    return window.api.addEntry(entry);
  },
  deleteEntry(id: string): Promise<boolean> {
    return window.api.deleteEntry(id);
  },
  getSettings(): Promise<Settings> {
    return window.api.getSettings();
  },
  updateSettings(settings: Partial<Settings>): Promise<Settings> {
    return window.api.updateSettings(settings);
  },
  getTeams(): Promise<CategoryItem[]> {
    return window.api.getTeams();
  },
  updateTeams(teams: CategoryItem[]): Promise<CategoryItem[]> {
    return window.api.updateTeams(teams);
  },
  getActivities(): Promise<CategoryItem[]> {
    return window.api.getActivities();
  },
  updateActivities(activities: CategoryItem[]): Promise<CategoryItem[]> {
    return window.api.updateActivities(activities);
  },
  getCalendarEvents(date: string): Promise<CalendarResult> {
    return window.api.getCalendarEvents(date);
  },
};
