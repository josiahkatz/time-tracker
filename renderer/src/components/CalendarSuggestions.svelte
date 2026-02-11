<script lang="ts">
  import type { CalendarEvent } from '../lib/types';
  import { api } from '../lib/api';

  let { onSelect }: {
    onSelect: (prefill: { duration: string; notes: string }) => void;
  } = $props();

  let events = $state<CalendarEvent[]>([]);
  let loading = $state(true);
  let statusMsg = $state('');

  $effect(() => {
    loadEvents();
  });

  function getLocalDateStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async function loadEvents() {
    loading = true;
    statusMsg = '';
    try {
      const today = getLocalDateStr();
      const result = await api.getCalendarEvents(today);
      events = result.events;
      if (result.status === 'not-running') {
        statusMsg = 'Open Calendar.app to see today\'s events.';
      } else if (result.status === 'no-permission') {
        statusMsg = 'Permission needed. Go to System Settings > Privacy & Security > Calendars and allow Time Tracker.';
      } else if (result.status === 'error') {
        statusMsg = result.message || 'Could not access calendar.';
      }
    } catch {
      statusMsg = 'Could not connect to calendar.';
    } finally {
      loading = false;
    }
  }

  function formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  function durationStr(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  function logEvent(event: CalendarEvent) {
    onSelect({
      duration: durationStr(event.durationMinutes),
      notes: event.title,
    });
  }
</script>

{#if loading}
  <div class="calendar-card">
    <span class="loading">Loading calendar...</span>
  </div>
{:else if events.length > 0}
  <div class="calendar-card">
    <h3 class="section-label">Today's Calendar</h3>
    {#each events as event (event.startDate + event.title)}
      <div class="event-row">
        <div class="event-info">
          <span class="event-time">{formatTime(event.startDate)}</span>
          <span class="event-title">{event.title}</span>
          <span class="event-duration">{formatDuration(event.durationMinutes)}</span>
        </div>
        <button class="btn-log" onclick={() => logEvent(event)}>Log</button>
      </div>
    {/each}
  </div>
{:else if statusMsg}
  <div class="calendar-card">
    <h3 class="section-label">Today's Calendar</h3>
    <span class="hint">{statusMsg}</span>
  </div>
{:else if !loading}
  <div class="calendar-card">
    <h3 class="section-label">Today's Calendar</h3>
    <span class="hint">No events today.</span>
  </div>
{/if}

<style>
  .calendar-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    box-shadow: var(--card-shadow);
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .loading {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .hint {
    font-size: 11px;
    color: var(--text-tertiary);
    line-height: 1.4;
  }

  .event-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid var(--border);
  }

  .event-row:last-child {
    border-bottom: none;
  }

  .event-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 12px;
  }

  .event-time {
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    font-size: 11px;
  }

  .event-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-duration {
    color: var(--text-tertiary);
    flex-shrink: 0;
    font-size: 11px;
  }

  .btn-log {
    background: var(--accent);
    color: white;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    flex-shrink: 0;
  }

  .btn-log:hover {
    background: var(--accent-hover);
  }
</style>
