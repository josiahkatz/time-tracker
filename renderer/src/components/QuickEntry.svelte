<script lang="ts">
  import type { CategoryItem } from '../lib/types';
  import { api } from '../lib/api';

  let { teams, activities, onEntryAdded, prefill = $bindable({ duration: '', notes: '', team: '', activity: '' }) }: {
    teams: CategoryItem[];
    activities: CategoryItem[];
    onEntryAdded: () => void;
    prefill?: { duration: string; notes: string; team: string; activity: string };
  } = $props();

  let team = $state('');
  let activity = $state('');
  let duration = $state('');
  let notes = $state('');
  let saving = $state(false);

  $effect(() => {
    if (teams.length > 0 && !team) team = teams[0].name;
  });

  $effect(() => {
    if (activities.length > 0 && !activity) activity = activities[0].name;
  });

  // Apply prefill values from calendar suggestions
  $effect(() => {
    if (prefill.duration) {
      duration = prefill.duration;
      notes = prefill.notes;
      if (prefill.team) team = prefill.team;
      if (prefill.activity) activity = prefill.activity;
      prefill = { duration: '', notes: '', team: '', activity: '' };
    }
  });

  async function submit() {
    const mins = parseDuration(duration);
    if (!mins || mins <= 0) return;
    saving = true;
    try {
      await api.addEntry({
        team,
        activity,
        durationMinutes: mins,
        notes,
        date: new Date().toISOString().split('T')[0],
      });
      duration = '';
      notes = '';
      onEntryAdded();
    } finally {
      saving = false;
    }
  }

  function parseDuration(input: string): number {
    const trimmed = input.trim();
    // "1h 30m" or "1h30m"
    const hm = trimmed.match(/^(\d+)\s*h\s*(?:(\d+)\s*m?)?$/i);
    if (hm) return parseInt(hm[1]) * 60 + (parseInt(hm[2] || '0'));
    // "90m" or "90"
    const m = trimmed.match(/^(\d+)\s*m?$/i);
    if (m) return parseInt(m[1]);
    // "1.5h"
    const dec = trimmed.match(/^(\d+\.?\d*)\s*h$/i);
    if (dec) return Math.round(parseFloat(dec[1]) * 60);
    return 0;
  }
</script>

<div class="quick-entry">
  <h3 class="section-label">Quick Entry</h3>
  <div class="form-row">
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
  <div class="form-row">
    <input
      type="text"
      placeholder="Duration (e.g. 30m, 1h, 1h30m)"
      bind:value={duration}
      onkeydown={(e) => e.key === 'Enter' && submit()}
    />
  </div>
  <div class="form-row">
    <input
      type="text"
      placeholder="Notes (optional)"
      bind:value={notes}
      onkeydown={(e) => e.key === 'Enter' && submit()}
    />
  </div>
  <button class="btn-submit" onclick={submit} disabled={saving || !duration.trim()}>
    {saving ? 'Saving...' : 'Log Entry'}
  </button>
</div>

<style>
  .quick-entry {
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

  .form-row {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
  }

  .form-row select, .form-row input {
    flex: 1;
    font-size: 12px;
  }

  .btn-submit {
    width: 100%;
    background: var(--accent);
    color: white;
    font-weight: 500;
    padding: 8px;
    margin-top: 4px;
  }

  .btn-submit:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .btn-submit:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
