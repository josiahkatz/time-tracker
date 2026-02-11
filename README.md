# Time Tracker

A macOS menu bar app for tracking how you spend your time. Built with Electron, Svelte 5, and Chart.js.

![macOS](https://img.shields.io/badge/macOS-13%2B-blue) ![Electron](https://img.shields.io/badge/Electron-34-blue) ![Svelte](https://img.shields.io/badge/Svelte-5-orange)

## Features

- **Quick Entry** - Log time with team, activity, duration (supports `30m`, `1h`, `1.5h`, `1h30m`), and notes
- **Timer** - Stopwatch mode that auto-populates an entry when stopped
- **Calendar Integration** - Reads your macOS Calendar to suggest today's events as time entries
- **Dashboard** - Bar and pie charts showing time by team and activity
- **Entry Log** - Browse, filter, and delete entries grouped by date
- **Custom Categories** - Add/edit teams and activities with color coding
- **Notifications** - Configurable reminders to log your time
- **JSON Persistence** - Data stored locally at `~/Library/Application Support/time-tracker/`

## Prerequisites

- Node.js 18+
- macOS 13+ (Ventura or later)
- Xcode Command Line Tools (`xcode-select --install`) for Swift compilation

## Setup

```bash
# Install dependencies
npm install && cd renderer && npm install && cd ..

# Run in development
npm run dev

# Build and package as .app
npm run dist
```

The packaged app is output to `release/mac-arm64/Time Tracker.app`.

## Calendar Integration

The app includes a native Swift helper that reads your calendar via EventKit. On first launch, macOS will prompt you to grant Calendar access. If you need to reset this:

```
System Settings > Privacy & Security > Calendars > CalendarHelper.app
```

## Tech Stack

- **Electron 34** + [menubar](https://github.com/nickvdp/menubar) for the menu bar shell
- **Svelte 5** + Vite 6 for the renderer
- **Chart.js** for dashboard visualizations
- **Swift/EventKit** for native calendar access
- **electron-builder** for packaging

## Project Structure

```
electron/          Main process (TypeScript)
  main.ts          Menubar setup, window config
  store.ts         JSON file persistence
  ipc-handlers.ts  IPC bridge between main/renderer
  calendar.ts      Launches Swift helper for calendar data
  calendar-helper.swift   Native EventKit calendar reader
  CalendarHelper.app/     .app bundle for calendar permissions

renderer/          Renderer process (Svelte)
  src/
    components/    UI components (Timer, QuickEntry, Dashboard, etc.)
    lib/           Types, API wrapper, constants
    styles/        Global CSS

assets/            Menu bar icons
build/             Entitlements for code signing
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server + Electron |
| `npm run build` | Compile Swift, TypeScript, and Svelte |
| `npm run dist` | Build and package as macOS .app |
| `npm run dist:open` | Build, package, and open the app |
