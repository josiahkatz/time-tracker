export interface TimeEntry {
  id: string;
  team: string;
  activity: string;
  durationMinutes: number;
  notes: string;
  date: string;
  createdAt: string;
}

export interface CategoryItem {
  name: string;
  color: string;
}

export interface CalendarEvent {
  title: string;
  startDate: string;
  endDate: string;
  calendar: string;
  durationMinutes: number;
}

export interface CalendarResult {
  events: CalendarEvent[];
  status: 'ok' | 'not-running' | 'no-permission' | 'error';
  message?: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  notificationIntervalMinutes: number;
}
