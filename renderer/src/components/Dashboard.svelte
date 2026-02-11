<script lang="ts">
  import type { TimeEntry, CategoryItem } from '../lib/types';
  import { colorMap } from '../lib/constants';
  import BarChart from './BarChart.svelte';
  import PieChart from './PieChart.svelte';

  let { entries, teams, activities }: {
    entries: TimeEntry[];
    teams: CategoryItem[];
    activities: CategoryItem[];
  } = $props();

  let teamColors = $derived(colorMap(teams));
  let activityColors = $derived(colorMap(activities));

  let range = $state<'week' | 'month' | 'all'>('week');

  let rangeEntries = $derived.by(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (range === 'all') return entries;
    const days = range === 'week' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 86400000).toISOString().split('T')[0];
    return entries.filter((e) => e.date >= cutoff && e.date <= today);
  });

  let totalMinutes = $derived(rangeEntries.reduce((sum, e) => sum + e.durationMinutes, 0));
  let totalHours = $derived(totalMinutes / 60);
  let entryCount = $derived(rangeEntries.length);
  let avgPerDay = $derived.by(() => {
    if (rangeEntries.length === 0) return 0;
    const dates = new Set(rangeEntries.map((e) => e.date));
    return totalMinutes / dates.size / 60;
  });

  let teamHours = $derived.by(() => {
    const map: Record<string, number> = {};
    for (const e of rangeEntries) {
      map[e.team] = (map[e.team] || 0) + e.durationMinutes / 60;
    }
    return map;
  });

  let activityHours = $derived.by(() => {
    const map: Record<string, number> = {};
    for (const e of rangeEntries) {
      map[e.activity] = (map[e.activity] || 0) + e.durationMinutes / 60;
    }
    return map;
  });

  function fmt(hours: number): string {
    return hours.toFixed(1) + 'h';
  }
</script>

<div class="dashboard">
  <div class="range-selector">
    <button class:active={range === 'week'} onclick={() => (range = 'week')}>Week</button>
    <button class:active={range === 'month'} onclick={() => (range = 'month')}>Month</button>
    <button class:active={range === 'all'} onclick={() => (range = 'all')}>All</button>
  </div>

  <div class="stats-row">
    <div class="stat">
      <span class="stat-value">{fmt(totalHours)}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat">
      <span class="stat-value">{entryCount}</span>
      <span class="stat-label">Entries</span>
    </div>
    <div class="stat">
      <span class="stat-value">{fmt(avgPerDay)}</span>
      <span class="stat-label">Avg/Day</span>
    </div>
  </div>

  {#if rangeEntries.length > 0}
    <div class="chart-section">
      <h3 class="section-label">Hours by Team</h3>
      <BarChart data={teamHours} colors={teamColors} />
    </div>

    <div class="chart-section">
      <h3 class="section-label">Activity Distribution</h3>
      <PieChart data={activityHours} colors={activityColors} />
    </div>
  {:else}
    <div class="empty">No data for this period.</div>
  {/if}
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .range-selector {
    display: flex;
    gap: 0;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    padding: 2px;
    border: 1px solid var(--border);
  }

  .range-selector button {
    flex: 1;
    padding: 6px;
    font-size: 12px;
    font-weight: 500;
    background: none;
    color: var(--text-secondary);
    border-radius: 4px;
  }

  .range-selector button.active {
    background: var(--accent);
    color: white;
  }

  .stats-row {
    display: flex;
    gap: 8px;
  }

  .stat {
    flex: 1;
    text-align: center;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 4px;
    box-shadow: var(--card-shadow);
  }

  .stat-value {
    display: block;
    font-size: 18px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .stat-label {
    display: block;
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  .chart-section {
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
    margin-bottom: 8px;
  }

  .empty {
    text-align: center;
    color: var(--text-tertiary);
    padding: 40px 0;
  }
</style>
