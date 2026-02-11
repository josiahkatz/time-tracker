import { ipcMain } from 'electron';
import { getAllEntries, addEntry, deleteEntry, getSettings, updateSettings, getTeams, updateTeams, getActivities, updateActivities } from './store';
import { getCalendarEvents } from './calendar';

export function registerIpcHandlers(): void {
  ipcMain.handle('entries:getAll', (_event, startDate?: string, endDate?: string) => {
    return getAllEntries(startDate, endDate);
  });

  ipcMain.handle(
    'entries:add',
    (
      _event,
      entry: {
        team: string;
        activity: string;
        durationMinutes: number;
        notes: string;
        date: string;
      }
    ) => {
      return addEntry(entry);
    }
  );

  ipcMain.handle('entries:delete', (_event, id: string) => {
    return deleteEntry(id);
  });

  ipcMain.handle('settings:get', () => {
    return getSettings();
  });

  ipcMain.handle('settings:update', (_event, settings: Record<string, unknown>) => {
    return updateSettings(settings);
  });

  ipcMain.handle('teams:getAll', () => {
    return getTeams();
  });

  ipcMain.handle('teams:update', (_event, teams: { name: string; color: string }[]) => {
    return updateTeams(teams);
  });

  ipcMain.handle('activities:getAll', () => {
    return getActivities();
  });

  ipcMain.handle('activities:update', (_event, activities: { name: string; color: string }[]) => {
    return updateActivities(activities);
  });

  ipcMain.handle('calendar:getToday', (_event, date: string) => {
    return getCalendarEvents(date);
  });
}
