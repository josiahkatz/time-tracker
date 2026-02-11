<script lang="ts">
  import TabBar from './components/TabBar.svelte';
  import QuickEntry from './components/QuickEntry.svelte';
  import Timer from './components/Timer.svelte';
  import EntryList from './components/EntryList.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Settings from './components/Settings.svelte';
  import CalendarSuggestions from './components/CalendarSuggestions.svelte';
  import { api } from './lib/api';
  import { colorMap } from './lib/constants';
  import type { TimeEntry, CategoryItem } from './lib/types';

  let activeTab = $state<'track' | 'log' | 'dashboard' | 'settings'>('track');
  let entries = $state<TimeEntry[]>([]);
  let teams = $state<CategoryItem[]>([]);
  let activities = $state<CategoryItem[]>([]);
  let prefill = $state({ duration: '', notes: '', team: '', activity: '' });

  let recentEntries = $derived(entries.slice(0, 3));
  let teamColors = $derived(colorMap(teams));

  async function loadEntries() {
    entries = await api.getEntries();
  }

  async function loadCategories() {
    teams = await api.getTeams();
    activities = await api.getActivities();
  }

  async function handleEntryAdded() {
    await loadEntries();
  }

  async function handleEntryDeleted() {
    await loadEntries();
  }

  function handleCalendarSelect(data: { duration: string; notes: string }) {
    prefill = { ...data, team: '', activity: '' };
  }

  $effect(() => {
    loadEntries();
    loadCategories();
  });

  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }
</script>

<div class="app">
  <TabBar bind:activeTab />
  <div class="content">
    {#if activeTab === 'track'}
      <div class="track-view">
        <QuickEntry {teams} {activities} onEntryAdded={handleEntryAdded} bind:prefill />
        <CalendarSuggestions onSelect={handleCalendarSelect} />
        <Timer {teams} {activities} onComplete={handleEntryAdded} />
        {#if recentEntries.length > 0}
          <div class="recent">
            <h3 class="section-label">Recent</h3>
            {#each recentEntries as entry (entry.id)}
              <div class="recent-entry">
                <span class="recent-team" style="color: {teamColors[entry.team] || '#6b7280'}">{entry.team}</span>
                <span class="recent-activity">{entry.activity}</span>
                <span class="recent-duration">{formatDuration(entry.durationMinutes)}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else if activeTab === 'log'}
      <EntryList {entries} {teams} {activities} onDelete={handleEntryDeleted} />
    {:else if activeTab === 'dashboard'}
      <Dashboard {entries} {teams} {activities} />
    {:else if activeTab === 'settings'}
      <Settings {teams} {activities} onClose={() => (activeTab = 'track')} onUpdated={loadCategories} />
    {/if}
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .track-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recent {
    margin-top: 4px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .recent-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    font-size: 12px;
    border-bottom: 1px solid var(--border);
  }

  .recent-entry:last-child {
    border-bottom: none;
  }

  .recent-team {
    font-weight: 600;
    flex-shrink: 0;
  }

  .recent-activity {
    color: var(--text-secondary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-duration {
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
    flex-shrink: 0;
  }
</style>
