import { contextBridge, ipcRenderer } from 'electron';

const api = {
  getEntries: (startDate?: string, endDate?: string) =>
    ipcRenderer.invoke('entries:getAll', startDate, endDate),
  addEntry: (entry: {
    team: string;
    activity: string;
    durationMinutes: number;
    notes: string;
    date: string;
  }) => ipcRenderer.invoke('entries:add', entry),
  deleteEntry: (id: string) => ipcRenderer.invoke('entries:delete', id),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('settings:update', settings),
  getTeams: () => ipcRenderer.invoke('teams:getAll'),
  updateTeams: (teams: { name: string; color: string }[]) =>
    ipcRenderer.invoke('teams:update', teams),
  getActivities: () => ipcRenderer.invoke('activities:getAll'),
  updateActivities: (activities: { name: string; color: string }[]) =>
    ipcRenderer.invoke('activities:update', activities),
  getCalendarEvents: (date: string) => ipcRenderer.invoke('calendar:getToday', date),
};

contextBridge.exposeInMainWorld('api', api);
