<script lang="ts">
  import type { CategoryItem } from '../lib/types';
  import { api } from '../lib/api';

  let { teams, activities, onClose, onUpdated }: {
    teams: CategoryItem[];
    activities: CategoryItem[];
    onClose: () => void;
    onUpdated: () => void;
  } = $props();

  let initialized = false;
  let editTeams = $state<CategoryItem[]>([]);
  let editActivities = $state<CategoryItem[]>([]);
  let newTeamName = $state('');
  let newActivityName = $state('');

  $effect(() => {
    // Only initialize from props once, so local edits aren't overwritten
    if (!initialized && teams.length > 0) {
      editTeams = teams.map((t) => ({ ...t }));
      editActivities = activities.map((a) => ({ ...a }));
      initialized = true;
    }
  });

  function addTeam() {
    const name = newTeamName.trim();
    if (!name || editTeams.some((t) => t.name === name)) return;
    editTeams = [...editTeams, { name, color: randomColor() }];
    newTeamName = '';
  }

  function removeTeam(idx: number) {
    editTeams = editTeams.filter((_, i) => i !== idx);
  }

  function addActivity() {
    const name = newActivityName.trim();
    if (!name || editActivities.some((a) => a.name === name)) return;
    editActivities = [...editActivities, { name, color: randomColor() }];
    newActivityName = '';
  }

  function removeActivity(idx: number) {
    editActivities = editActivities.filter((_, i) => i !== idx);
  }

  function randomColor(): string {
    const colors = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6','#3b82f6','#f97316','#14b8a6','#ef4444','#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async function save() {
    // $state.snapshot() strips Svelte 5 proxies so IPC structured clone works
    await api.updateTeams($state.snapshot(editTeams));
    await api.updateActivities($state.snapshot(editActivities));
    onUpdated();
    onClose();
  }
</script>

<div class="settings">
  <div class="settings-header">
    <h2>Settings</h2>
    <button class="btn-close" onclick={onClose}>&times;</button>
  </div>

  <div class="settings-body">
    <div class="category-section">
      <h3 class="section-label">Teams</h3>
      {#each editTeams as team, i (i)}
        <div class="category-row">
          <input type="color" bind:value={team.color} class="color-picker" />
          <span class="category-name">{team.name}</span>
          <button class="btn-remove" onclick={() => removeTeam(i)}>&times;</button>
        </div>
      {/each}
      <div class="add-row">
        <input
          type="text"
          placeholder="New team name"
          bind:value={newTeamName}
          onkeydown={(e) => e.key === 'Enter' && addTeam()}
        />
        <button class="btn-add" onclick={addTeam}>+</button>
      </div>
    </div>

    <div class="category-section">
      <h3 class="section-label">Activities</h3>
      {#each editActivities as activity, i (i)}
        <div class="category-row">
          <input type="color" bind:value={activity.color} class="color-picker" />
          <span class="category-name">{activity.name}</span>
          <button class="btn-remove" onclick={() => removeActivity(i)}>&times;</button>
        </div>
      {/each}
      <div class="add-row">
        <input
          type="text"
          placeholder="New activity name"
          bind:value={newActivityName}
          onkeydown={(e) => e.key === 'Enter' && addActivity()}
        />
        <button class="btn-add" onclick={addActivity}>+</button>
      </div>
    </div>
  </div>

  <div class="settings-footer">
    <button class="btn-cancel" onclick={onClose}>Cancel</button>
    <button class="btn-save" onclick={save}>Save</button>
  </div>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid var(--border);
  }

  .settings-header h2 {
    font-size: 15px;
    font-weight: 600;
  }

  .btn-close {
    background: none;
    color: var(--text-secondary);
    font-size: 20px;
    padding: 2px 6px;
    line-height: 1;
  }

  .settings-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .category-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .color-picker {
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    background: none;
  }

  .category-name {
    flex: 1;
    font-size: 13px;
  }

  .btn-remove {
    background: none;
    color: var(--text-tertiary);
    font-size: 16px;
    padding: 2px 6px;
    line-height: 1;
  }

  .btn-remove:hover {
    color: var(--danger);
  }

  .add-row {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }

  .add-row input {
    flex: 1;
    font-size: 12px;
  }

  .btn-add {
    background: var(--accent);
    color: white;
    font-size: 16px;
    font-weight: 600;
    padding: 4px 10px;
    line-height: 1;
  }

  .settings-footer {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid var(--border);
  }

  .btn-cancel {
    flex: 1;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 8px;
  }

  .btn-save {
    flex: 1;
    background: var(--accent);
    color: white;
    font-weight: 500;
    padding: 8px;
  }

  .btn-save:hover {
    background: var(--accent-hover);
  }
</style>
