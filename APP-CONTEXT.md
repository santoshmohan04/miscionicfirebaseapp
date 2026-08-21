# Miscioni App - Current Implementation Context

## 📱 Application Overview

This project is an Android-first file management app built with Ionic and Angular, using Capacitor and Android Storage Access Framework to browse, inspect, and manage files stored on device storage.

The app is not currently a Firebase-backed app in the codebase. There are no Firebase SDK dependencies in the active project manifest, and the implemented functionality centers on local Android storage access, category browsing, permission handling, and file metadata display.

### Current technical profile
- Framework: Ionic 8.7.15 + Angular 18
- Platform: Android via Capacitor 8
- State Management: NgRx
- UI pattern: Standalone Angular components
- Core capability: SAF-based file operations and Android storage permission flows
- Theme: Light/dark toggle support

---

## 🏗️ Current Architecture

The current app structure is smaller and more focused than the original design document suggested.

### Active feature structure

```text
src/app/
├── app.routes.ts                       # App routing
├── app.component.ts                   # Root app component
├── core/
│   └── services/
│       ├── filesystem.service.ts      # SAF + storage category logic
│       ├── local-files.service.ts      # Local file browser logic
│       ├── theme.service.ts            # Theme preference handling
│       └── ...
├── dashboard/
│   └── dashboard.page.ts              # Storage overview and stats screen
├── category-detail/
│   └── category-detail.page.ts        # Category-based file listing page
├── file-explorer/
│   ├── models/
│   ├── store/
│   └── ...                           # NgRx state for explorer behaviors
├── plugins/
│   └── storage-stats.ts              # Capacitor plugin bridge
├── shared/
│   ├── components/
│   ├── constants/
│   └── ...
├── theme/
│   └── variables.scss
└── ...
```

### Routing reality
The app currently exposes these routes in [src/app/app.routes.ts](src/app/app.routes.ts):
- dashboard
- category/:type

There is no active dedicated file explorer page route wired into the app at the moment, even though the explorer state and service scaffolding exist under [src/app/file-explorer](src/app/file-explorer).

---

## ✅ Implemented in the Current Codebase

### Dashboard
The dashboard screen in [src/app/dashboard/dashboard.page.ts](src/app/dashboard/dashboard.page.ts) is implemented and includes:
- storage usage stats
- category cards for images, videos, audio, and downloads
- permission checks before loading stats
- app resume reload behavior
- largest-file listing from the native plugin
- refresh flow and haptic feedback

### Category detail browsing
The category page in [src/app/category-detail/category-detail.page.ts](src/app/category-detail/category-detail.page.ts) includes:
- route-based category loading
- permission checks
- category file loading through the filesystem service
- sorting by size, names, or date
- metadata formatting and file icons
- basic error state handling

### Storage Access Framework integration
The service layer in [src/app/core/services/filesystem.service.ts](src/app/core/services/filesystem.service.ts) implements:
- root picking and persistence
- SAF folder reading
- file/folder type detection
- category-based file fetches
- delete, copy, and move operations
- mock fallback for empty or unavailable native results

### Native storage plugin bridge
The plugin contract in [src/app/plugins/storage-stats.ts](src/app/plugins/storage-stats.ts) includes:
- getStatistics
- checkStoragePermission
- requestStoragePermission
- getFilesByCategory
- getLargestFiles

### NgRx explorer state
The explorer store under [src/app/file-explorer/store](src/app/file-explorer/store) includes:
- view mode support for category, recent, and local
- selection state
- clipboard state for copy/move operations
- copy and move action flows via effects
- confirmed paste effect flow

---

## 🚧 Partially Implemented / Still Incomplete

### File explorer UX
The codebase contains explorer infrastructure, but the complete end-user file explorer experience is not fully exposed as a live route.

Current gaps:
- file explorer page itself is not currently wired as a main app screen
- recent view mode exists in state logic but is not fully backed by a live recent-media implementation
- paste UX is not fully complete from a user-facing perspective
- search functionality is not yet implemented

### Recent media and category querying
In [src/app/core/services/filesystem.service.ts](src/app/core/services/filesystem.service.ts), the method loadRecentMedia is still a stub. The app currently relies on a plugin call and mock fallback for category file loading rather than a complete native recent-files query pipeline.

### Clipboard operations
The clipboard model in [src/app/file-explorer/store/explorer.state.ts](src/app/file-explorer/store/explorer.state.ts) and the effect logic in [src/app/file-explorer/store/explorer.effects.ts](src/app/file-explorer/store/explorer.effects.ts) exist, but the visible paste action flow is not fully completed in the app UI.

### File details and media preview
The app handles basic metadata, but richer file preview, permissions detail, and advanced metadata views are still missing.

### Testing and docs
The repo still lacks broad unit and integration coverage. The documentation remains lighter than a complete product handoff.

---

## 🔌 Current Plugin and Service Model

### Native Android plugin behavior
The app expects the native Android side to provide storage info and category-based file data. The TypeScript layer is designed to call into the plugin and fall back to mock data if the native plugin is unavailable or returns no results.

This is a practical safety layer, but it means the app is still partly dependent on native plugin reliability and not yet a fully production-hardened storage backend.

### SAF operations
The custom local packages in the root workspace are active and used by the app:
- saf-file-ops
- saf-picker

These provide the main file-access layer used by the application.

---

## 📦 Dependencies and Configuration

The current dependency setup is accurate to the repo as seen in [package.json](package.json):
- Angular 18
- Ionic 8.7.15
- Capacitor 8
- NgRx 18
- custom SAF packages
- no Firebase SDK entries

The app is configured for Android, not for Firebase integration.

---

## 🧭 Current functional picture

This app is best understood as a mobile Android storage-management app with:
- dashboard analytics
- category-based browsing
- SAF file access
- permission handling
- file metadata and deletion/copy/move flows

It is not yet a fully complete file manager with all of the original product features fully finished, especially:
- recent view completion
- search
- paste UI flow
- advanced file preview
- full file-explorer route
- comprehensive test coverage

---

## 📚 Related project docs
- [TODO.md](TODO.md)
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- [REORGANIZATION-SUMMARY.md](REORGANIZATION-SUMMARY.md)

---

## 📝 Summary

The current implementation is a functional Android storage utility app with dashboard analytics and category browsing, but it still contains incomplete explorer and recent-media behaviors. The original context document overstates the project as a complete Firebase-enabled app; the repo itself shows a local storage app using SAF and Capacitor, with several feature gaps still open.

**Last updated:** August 21, 2026
