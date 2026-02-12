# Time Tracker

macOS menu bar app for tracking time spent across teams and activities.

## Tech Stack

- **Electron 34.x** + `menubar` package (menu bar app)
- **Svelte 5** + **Vite 6** for renderer
- **Chart.js** (direct canvas usage, not svelte-chartjs which requires Svelte 4)
- **TypeScript** throughout
- **JSON file** persistence via Node `fs` (stored at `~/Library/Application Support/time-tracker/time-tracker-data.json`)
- **Swift** helper for calendar access (`electron/calendar-helper.swift`)

## Project Structure

```
electron/           Main process
  main.ts           App entry, menubar setup
  preload.ts        Context bridge (exposes window.api)
  ipc-handlers.ts   IPC channel handlers
  store.ts          JSON file read/write, data operations
  notifications.ts  Notification scheduler
  calendar.ts       Calendar event fetching
  calendar-helper.swift  Native Swift binary for EventKit access

renderer/src/       Svelte UI
  App.svelte        Root component, state management, tab routing
  components/
    QuickEntry.svelte       Manual time entry form
    Timer.svelte            Live timer with start/stop
    EntryList.svelte        Full log view with delete
    Dashboard.svelte        Charts and summaries
    CalendarSuggestions.svelte  Today's calendar events with one-click log
    Settings.svelte         Edit teams/activities
    TabBar.svelte           Navigation tabs
    BarChart.svelte         Chart.js bar chart wrapper
    PieChart.svelte         Chart.js pie chart wrapper
  lib/
    api.ts          Typed wrapper around window.api IPC calls
    types.ts        Shared TypeScript interfaces
    constants.ts    Color map helper
  styles/
    global.css      CSS variables, dark mode, base styles

assets/             Menu bar icons
dist-electron/      Compiled Electron JS (gitignored)
dist-renderer/      Built Svelte app (gitignored)
release/            Packaged .app (gitignored)
```

## Commands

- `npm run dev` - Dev mode (Vite dev server + Electron, hot reload)
- `npm run build` - Compile Electron TS + build Svelte renderer
- `npm run dist` - Build + package as macOS .app
- `npm run dist:open` - Build, package, and open the .app

## Critical: Svelte 5 + Electron IPC

Svelte 5 `$state` wraps arrays/objects in **proxies**. Electron's `ipcRenderer.invoke` uses **structured clone**, which silently fails on proxies.

- ALWAYS use `$state.snapshot()` before passing `$state` arrays/objects through IPC
- Primitive `$state` values (strings, numbers) are safe to pass directly
- Symptoms of proxy issue: data appears to save (no errors) but old values persist
- See `Settings.svelte` for correct pattern with `$state.snapshot()`

## Architecture Notes

- IPC handlers are registered BEFORE menubar creation (`preloadWindow: true` means the window loads immediately)
- Two separate `package.json` files: root (Electron deps) and `renderer/` (Svelte/Vite deps)
- Teams and activities are user-configurable, stored in the JSON data file with sensible defaults
- Calendar integration uses a compiled Swift helper binary for EventKit access, codesigned with entitlements
- Duration input accepts flexible formats: `30m`, `1h`, `1hr`, `1.5hrs`, `1h30m`, `30min`, `30`, etc.
- QuickEntry has error handling that surfaces IPC failures and invalid duration input to the user
