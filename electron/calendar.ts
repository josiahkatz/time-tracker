import { execFile } from 'child_process';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { app } from 'electron';

interface CalendarEvent {
  title: string;
  startDate: string;
  endDate: string;
  calendar: string;
  durationMinutes: number;
}

interface CalendarResult {
  events: CalendarEvent[];
  status: 'ok' | 'not-running' | 'no-permission' | 'error';
  message?: string;
}

function getHelperAppPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'CalendarHelper.app');
  }
  return join(__dirname, '..', 'electron', 'CalendarHelper.app');
}

export function getCalendarEvents(date: string): Promise<CalendarResult> {
  const helperApp = getHelperAppPath();
  const tmpFile = join(app.getPath('temp'), `calendar-${Date.now()}.json`);

  return new Promise((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try { child?.kill(); } catch {}
        cleanup();
        resolve({ events: [], status: 'error', message: 'Calendar helper timed out' });
      }
    }, 15000);

    function cleanup() {
      try { unlinkSync(tmpFile); } catch {}
    }

    // Launch as standalone app so macOS attributes Calendar permission
    // to CalendarHelper.app, not the parent Electron process
    const child = execFile('open', ['-W', '-a', helperApp, '--args', date, tmpFile], { timeout: 15000 }, (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (error) {
        cleanup();
        resolve({ events: [], status: 'error', message: error.message });
        return;
      }

      try {
        const raw = readFileSync(tmpFile, 'utf-8');
        cleanup();
        const result = JSON.parse(raw);
        resolve({
          events: Array.isArray(result.events) ? result.events : [],
          status: result.status || 'error',
          message: result.message,
        });
      } catch {
        cleanup();
        resolve({ events: [], status: 'error', message: 'Failed to read calendar output' });
      }
    });
  });
}
