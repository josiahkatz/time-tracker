<script lang="ts">
  type Tab = 'track' | 'log' | 'dashboard' | 'settings';

  let { activeTab = $bindable() }: { activeTab: Tab } = $props();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'track', label: 'Track' },
    { id: 'log', label: 'Log' },
    { id: 'dashboard', label: 'Dashboard' },
  ];
</script>

<nav class="tab-bar">
  {#each tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={activeTab === tab.id}
      onclick={() => (activeTab = tab.id)}
    >
      {tab.label}
    </button>
  {/each}
  <button
    class="tab tab-icon"
    class:active={activeTab === 'settings'}
    onclick={() => (activeTab = activeTab === 'settings' ? 'track' : 'settings')}
    title="Settings"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  </button>
</nav>

<style>
  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
    padding: 0 12px;
    background: var(--bg-secondary);
    flex-shrink: 0;
  }

  .tab {
    flex: 1;
    padding: 10px 0;
    background: none;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
    border-radius: 0;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }

  .tab:hover {
    color: var(--text-primary);
  }

  .tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .tab-icon {
    flex: 0 0 auto;
    padding: 10px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
