# Incomplete Features & TODOs

## 🚧 Unfinished Features

### File Explorer
- [ ] **Category-based browsing**
  - Location: `file-explorer` feature
  - Status: UI structure exists, MediaStore integration needed
  - Related: `filesystem.service.ts` lines 128-137 (TODO comments)
  
- [ ] **Recent files view**
  - Location: `file-explorer` feature
  - Status: View mode exists, MediaStore query needed
  - Related: `filesystem.service.ts:133`

- [ ] **File operations completion**
  - [x] Delete items (implemented)
  - [x] Copy items (implemented)
  - [x] Move items (implemented)
  - [ ] Paste from clipboard (store exists, UI implementation needed)
  - [ ] Multi-select operations (partial)

- [ ] **Search functionality**
  - Location: Not started
  - Need: Search UI + file name/content search

- [ ] **File details enhancements**
  - Current: Basic file info modal
  - Missing: File preview, extended metadata, permissions

### Dashboard
- [x] Storage statistics display
- [ ] Storage breakdown visualization (charts/graphs)
- [ ] Quick actions/shortcuts
- [ ] Storage alerts/warnings

### Missing Implementations

#### MediaStore Integration
**File**: `src/app/core/services/filesystem.service.ts`
```typescript
// Line 128-129
async loadMediaByCategory(_category: string): Promise<FileItem[]> {
  // TODO: MediaStore query (Audio / Video / Images)
  return [];
}

// Line 133-134
async loadRecentMedia(): Promise<FileItem[]> {
  // TODO: MediaStore sorted by lastModified
  return [];
}
```

**What's needed:**
- Android MediaStore API integration
- Query by media type (audio, video, images, documents)
- Sort by last modified date
- Map MediaStore results to FileItem model

#### Clipboard Operations
**Status**: Store and actions exist, UI integration incomplete

**File**: `file-explorer/store/explorer.state.ts`
```typescript
clipboard?: {
  mode: 'copy' | 'move';
  items: FileItem[];
};
```

**What's needed:**
- Paste button in UI
- Paste action handler
- Visual feedback for clipboard state
- Clear clipboard after paste

### Testing
- [ ] Unit tests for services
- [ ] Component tests
- [ ] E2E tests
- [ ] Integration tests for file operations

Current: Only `app.component.spec.ts` exists

### Documentation
- [x] Project structure documentation
- [x] Feature status tracking
- [ ] API documentation
- [ ] Development guidelines
- [ ] Contribution guide

## 📋 Next Steps Priority

1. **High Priority**
   - Complete MediaStore integration for categories
   - Implement paste functionality
   - Add file search

2. **Medium Priority**
   - Add storage visualizations to dashboard
   - Enhance file details modal
   - Add comprehensive error handling

3. **Low Priority**
   - Add unit tests
   - Create detailed API docs
   - Add file preview feature

## 🔧 Known Issues

1. **TypeScript Configuration**
   - `baseUrl` deprecated warning in tsconfig.json
   - Consider migration to paths configuration

2. **Package Configuration**
   - Package name in Android still shows `com.example.app`
   - Should update to actual package name

3. **Build Output**
   - `www/` folder tracked in workspace
   - Already in .gitignore ✓

## 💡 Suggestions for Improvement

### Code Quality
- Add ESLint rules enforcement
- Implement Prettier for code formatting
- Add Husky for pre-commit hooks
- Increase test coverage

### Architecture
- Consider creating a utils folder for helper functions
- Add interceptors for error handling
- Implement logging service
- Add caching service for file listings

### User Experience
- Add loading states for all async operations
- Implement offline mode
- Add file operation progress indicators
- Add undo/redo functionality
- Implement drag-and-drop

### Performance
- Implement virtual scrolling for large file lists
- Add pagination/infinite scroll
- Optimize image thumbnails
- Cache file metadata

## 📝 Notes

- Custom SAF plugins (`saf-file-ops`, `saf-picker`) are working
- NgRx state management properly configured
- Standalone components pattern used (Angular 18)
- Permission handling implemented and working
