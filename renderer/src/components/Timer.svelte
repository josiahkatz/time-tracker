<script lang="ts">
  import type { CategoryItem } from '../lib/types';
  import { api } from '../lib/api';

  let { teams, activities, onComplete }: {
    teams: CategoryItem[];
    activities: CategoryItem[];
    onComplete: () => void;
  } = $props();

  let running = $state(false);
  let elapsed = $state(0);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let team = $state('');
  let activity = $state('');

  $effect(() => {
    if (teams.length > 0 && !team) team = teams[0].name;
  });

  $effect(() => {
    if (activities.length > 0 && !activity) activity = activities[0].name;
  });

  let display = $derived(formatTime(elapsed));

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  function start() {
    running = true;
    intervalId = setInterval(() => {
      elapsed += 1;
    }, 1000);
  }

  function stop() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  async function save() {
    if (elapsed < 60) return;
    const durationMinutes = Math.round(elapsed / 60);
    await api.addEntry({
      team,
      activity,
      durationMinutes,
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    elapsed = 0;
    onComplete();
  }

  function reset() {
    stop();
    elapsed = 0;
  }
</script>

<div class="timer-card">
  <div class="timer-display">{display}</div>
  <div class="timer-selects">
    <select bind:value={team}>
      {#each teams as t (t.name)}
        <option value={t.name}>{t.name}</option>
      {/each}
    </select>
    <select bind:value={activity}>
      {#each activities as a (a.name)}
        <option value={a.name}>{a.name}</option>
      {/each}
    </select>
  </div>
  <div class="timer-actions">
    {#if !running}
      <button class="btn-primary" onclick={start}>Start</button>
    {:else}
      <button class="btn-stop" onclick={stop}>Stop</button>
    {/if}
    {#if elapsed > 0 && !running}
      <button class="btn-save" onclick={save}>Save</button>
      <button class="btn-reset" onclick={reset}>Reset</button>
    {/if}
  </div>
</div>

<style>
  .timer-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    box-shadow: var(--card-shadow);
  }

  .timer-display {
    font-size: 32px;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    text-align: center;
    padding: 8px 0;
    letter-spacing: 1px;
  }

  .timer-selects {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
  }

  .timer-selects select {
    flex: 1;
    font-size: 12px;
  }

  .timer-actions {
    display: flex;
    gap: 6px;
  }

  .btn-primary {
    flex: 1;
    background: var(--accent);
    color: white;
    font-weight: 500;
    padding: 8px 12px;
  }

  .btn-primary:hover {
    background: var(--accent-hover);
  }

  .btn-stop {
    flex: 1;
    background: var(--danger);
    color: white;
    font-weight: 500;
    padding: 8px 12px;
  }

  .btn-stop:hover {
    background: var(--danger-hover);
  }

  .btn-save {
    flex: 1;
    background: var(--success);
    color: white;
    font-weight: 500;
    padding: 8px 12px;
  }

  .btn-reset {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 8px 12px;
  }
</style>
