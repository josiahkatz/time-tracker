<script lang="ts">
  import type { TimeEntry, CategoryItem } from '../lib/types';
  import { colorMap } from '../lib/constants';
  import { api } from '../lib/api';

  let { entries, teams, activities, onDelete }: {
    entries: TimeEntry[];
    teams: CategoryItem[];
    activities: CategoryItem[];
    onDelete: () => void;
  } = $props();

  let filterTeam = $state('all');
  let filterActivity = $state('all');

  let teamColors = $derived(colorMap(teams));

  let filtered = $derived.by(() => {
    let result = entries;
    if (filterTeam !== 'all') {
      result = result.filter((e) => e.team === filterTeam);
    }
    if (filterActivity !== 'all') {
      result = result.filter((e) => e.activity === filterActivity);
    }
    return result;
  });

  let grouped = $derived.by(() => {
    const groups: Record<string, TimeEntry[]> = {};
    for (const entry of filtered) {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  });

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  async function handleDelete(id: string) {
    await api.deleteEntry(id);
    onDelete();
  }
</script>

<div class="entry-list">
  <div class="filters">
    <select bind:value={filterTeam}>
      <option value="all">All Teams</option>
      {#each teams as t (t.name)}
        <option value={t.name}>{t.name}</option>
      {/each}
    </select>
    <select bind:value={filterActivity}>
      <option value="all">All Activities</option>
      {#each activities as a (a.name)}
        <option value={a.name}>{a.name}</option>
      {/each}
    </select>
  </div>

  {#if grouped.length === 0}
    <div class="empty">No entries yet. Start tracking!</div>
  {/if}

  {#each grouped as [date, dayEntries] (date)}
    <div class="day-group">
      <div class="day-header">
        <span class="day-label">{formatDate(date)}</span>
        <span class="day-total">{formatDuration(dayEntries.reduce((sum, e) => sum + e.durationMinutes, 0))}</span>
      </div>
      {#each dayEntries as entry (entry.id)}
        <div class="entry-row">
          <span class="team-dot" style="background: {teamColors[entry.team] || '#6b7280'}"></span>
          <div class="entry-info">
            <div class="entry-main">
              <span class="entry-team">{entry.team}</span>
              <span class="entry-sep">&middot;</span>
              <span class="entry-activity">{entry.activity}</span>
            </div>
            {#if entry.notes}
              <div class="entry-notes">{entry.notes}</div>
            {/if}
          </div>
          <span class="entry-duration">{formatDuration(entry.durationMinutes)}</span>
          <button class="btn-delete" onclick={() => handleDelete(entry.id)} title="Delete">&times;</button>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .entry-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filters {
    display: flex;
    gap: 6px;
    margin-bottom: 4px;
  }

  .filters select {
    flex: 1;
    font-size: 12px;
  }

  .empty {
    text-align: center;
    color: var(--text-tertiary);
    padding: 40px 0;
    font-size: 13px;
  }

  .day-group {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--card-shadow);
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
  }

  .day-label {
    font-weight: 600;
    font-size: 12px;
  }

  .day-total {
    font-size: 12px;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .entry-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .entry-row:last-child {
    border-bottom: none;
  }

  .team-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .entry-info {
    flex: 1;
    min-width: 0;
  }

  .entry-main {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }

  .entry-team {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entry-sep {
    color: var(--text-tertiary);
  }

  .entry-activity {
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .entry-notes {
    font-size: 11px;
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .entry-duration {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .btn-delete {
    background: none;
    color: var(--text-tertiary);
    font-size: 16px;
    padding: 2px 4px;
    line-height: 1;
    flex-shrink: 0;
  }

  .btn-delete:hover {
    color: var(--danger);
  }
</style>
