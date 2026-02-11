import { Notification } from 'electron';
import { getSettings } from './store';
import type { Menubar } from 'menubar';

let intervalId: ReturnType<typeof setInterval> | null = null;
let mbRef: Menubar | null = null;

export function startNotificationScheduler(mb: Menubar): void {
  mbRef = mb;
  scheduleNext();
}

function scheduleNext(): void {
  if (intervalId) {
    clearInterval(intervalId);
  }
  const settings = getSettings();
  if (!settings.notificationsEnabled) return;

  const ms = settings.notificationIntervalMinutes * 60 * 1000;
  intervalId = setInterval(() => {
    const current = getSettings();
    if (!current.notificationsEnabled) {
      stopNotificationScheduler();
      return;
    }
    showReminder();
  }, ms);
}

function showReminder(): void {
  const notification = new Notification({
    title: 'Time Tracker',
    body: 'How are you spending your time? Log an entry!',
    silent: false,
  });
  notification.on('click', () => {
    mbRef?.showWindow();
  });
  notification.show();
}

export function stopNotificationScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
