# Current Implementation Status

This document reflects the implementation as it exists in the current codebase, not the original backlog.

## ✅ Implemented

### Dashboard
- [x] Storage statistics screen is implemented in `src/app/dashboard/dashboard.page.ts`
- [x] Permission checks and permission request flow are in place before loading storage stats
- [x] Largest-file list is loaded via the native `StorageStats` plugin
- [x] App resume listener reloads stats after the user returns from Android settings
- [x] Category cards for images, videos, audio, and downloads are rendered in the dashboard UI

### File Explorer / Storage Access
- [x] Category-based browsing is implemented through `FilesystemService.getFilesByCategory()` and `getExplorerFilesByCategory()`
- [x] Explorer state supports `category`, `recent`, and `local` view modes
- [x] Delete, copy, and move operations are implemented in `FilesystemService`
- [x] NgRx clipboard state exists for copy/move operations
- [x] Paste flow exists in the NgRx effect pipeline (`confirmPaste` + `copySafItems` / `moveSafItems`)
- [x] Recent view mode exists in the reducer and is wired to sorting by `lastAccessed`

### Native storage integration
- [x] Android plugin interface is defined in `src/app/plugins/storage-stats.ts`
- [x] The app calls native `StorageStats.getStatistics()`, `getFilesByCategory()`, and `getLargestFiles()`
- [x] The service includes a mock fallback when native results are empty or unavailable

## 🚧 Partially implemented / still incomplete

### File Explorer
- [ ] **Category browsing is only partially complete**
  - Status: native category loading works through the plugin and mock fallback, but real MediaStore behavior still depends on platform/plugin reliability
  - Evidence: `src/app/core/services/filesystem.service.ts` calls `StorageStats.getFilesByCategory()` and falls back to mock data if empty

- [ ] **Recent files view is not fully implemented**
  - Status: view mode exists, but `loadRecentMedia()` remains a stub
  - Evidence: `src/app/core/services/filesystem.service.ts` still contains a TODO in `loadRecentMedia()`

- [ ] **Paste UI is not fully wired in the app**
  - Status: clipboard state, actions, and effect logic exist, but a visible paste button / end-user flow is not clearly implemented in the UI
  - Evidence: `src/app/file-explorer/store/explorer.state.ts`, `explorer.actions.ts`, and `explorer.effects.ts` contain the clipboard logic, but the service/UI does not yet expose a complete user action around it

- [ ] **Search functionality**
  - Status: not implemented yet
  - Need: search UI and file-name/content search flow

- [ ] **File details enhancements**
  - Status: basic metadata handling exists; advanced preview/permissions metadata is still missing

### Dashboard
- [ ] Storage breakdown visualization is still minimal
  - Status: category cards exist, but this is not a full chart-driven analytics view
- [ ] Quick actions / shortcuts are not implemented
- [ ] Storage alerts / warnings are not implemented

## ⚠️ Known gaps from the original TODO

### MediaStore / recent-file integration
- [ ] `loadRecentMedia()` is still unimplemented
- [ ] Real MediaStore sorting by `lastModified` is not fully wired into the service layer
- [ ] The app uses a native plugin contract + mock fallback instead of a fully complete native query implementation

### Clipboard operations
- [ ] Clipboard state exists, but the user-facing paste flow appears incomplete
- [ ] Clear-after-paste behavior is not clearly visible in the UI logic

### Testing
- [ ] Unit tests for services are still missing
- [ ] Component tests are still missing
- [ ] E2E tests are still missing
- [ ] Integration tests for file operations are still missing
- Current state: only a basic app-level spec appears to exist

### Documentation
- [x] Project structure documentation exists
- [x] Feature status tracking exists
- [ ] API documentation is still missing
- [ ] Development guidelines are still missing
- [ ] Contribution guide is still missing

## 📋 Current priority list

1. **High priority**
   - Finish the real recent-files / MediaStore query flow
   - Complete the paste UX for clipboard operations
   - Add search to the file explorer

2. **Medium priority**
   - Improve dashboard visualization and file breakdown graphics
   - Add richer file detail metadata and preview support
   - Strengthen error handling across file operations

3. **Low priority**
   - Add service/component/unit tests
   - Document API usage and project conventions
   - Add file preview feature

## 🔧 Known issues still relevant

1. **TypeScript configuration**
   - `baseUrl` deprecation warning is still a likely config issue in `tsconfig.json`
   - Consider migrating to a `paths`-based configuration in the future

2. **Android package identity**
   - The package name still appears to be set to the default example app value in Android config
   - This likely needs to be changed to the final app identifier

3. **Build output**
   - `www/` is present in the repo but already ignored in Git; this is not an active functional issue

## 📝 Notes

- Custom SAF plugins (`saf-file-ops`, `saf-picker`) are active and used by the app
- NgRx state management is configured and handling selection, copy/move, and category flows
- Standalone Angular components are being used consistently
- Permission handling for Android storage access is implemented and is part of the dashboard and category access flow
- The app has moved beyond the original TODO list in several areas, especially dashboard stats and file-operation infrastructure, but the remaining gaps are still real and worth tracking
