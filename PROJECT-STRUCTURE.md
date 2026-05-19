# File Manager App - Project Structure

## Overview
This is an Ionic + Angular file manager application for Android with proper SAF (Storage Access Framework) integration.

## 📁 Project Structure

```
src/app/
├── core/                           # Core functionality (singletons, app-wide services)
│   └── services/                   # Core services
│       ├── filesystem.service.ts   # SAF filesystem operations
│       ├── local-files.service.ts  # Local file management logic
│       └── storage-permission.service.ts  # Permission handling
│
├── shared/                         # Shared resources across features
│   ├── constants/                  # App-wide constants
│   │   ├── file-categories.ts      # File category definitions
│   │   ├── storage-roots.ts        # Storage root configurations
│   │   └── index.ts                # Barrel export
│   └── index.ts                    # Barrel export
│
├── plugins/                        # Capacitor plugin definitions
│   └── storage-stats.ts            # Storage statistics plugin interface
│
├── dashboard/                      # Dashboard feature module
│   ├── dashboard.page.ts           # Dashboard component
│   ├── dashboard.page.html         # Dashboard template
│   └── dashboard.page.scss         # Dashboard styles
│
├── file-explorer/                  # File explorer feature module
│   ├── models/                     # Feature-specific models
│   │   ├── explorer-model.ts       # File items, types, view modes
│   │   └── index.ts                # Barrel export
│   ├── store/                      # NgRx state management
│   │   ├── explorer.actions.ts     # Action definitions
│   │   ├── explorer.effects.ts     # Side effects
│   │   ├── explorer.facade.ts      # Facade service
│   │   ├── explorer.reducer.ts     # Reducer
│   │   ├── explorer.selectors.ts   # Selectors
│   │   └── explorer.state.ts       # State interface
│   ├── components/                 # Feature components
│   │   └── file-details/
│   │       └── file-details.component.ts
│   └── pages/                      # Feature pages
│       ├── explorer.page.ts
│       ├── explorer.page.html
│       └── explorer.page.scss
│
├── app.component.ts                # Root component
├── app.component.html              # Root template
├── app.component.scss              # Root styles
└── app.routes.ts                   # App routing

```

## 🎯 Feature Status

### ✅ Implemented
- Dashboard with storage statistics
- File explorer with local storage browsing
- SAF integration for Android
- Permission handling
- NgRx state management
- File/folder navigation
- Selection mode
- Breadcrumb navigation

### 🚧 Work in Progress / To Be Implemented
- File operations (copy, move, delete)
- File search functionality
- Category-based file browsing
- Recent files view
- File details modal enhancements
- Clipboard operations (copy/paste)

## 📦 Dependencies

### Production
- **@angular/\***: v18.0.0 - Angular framework
- **@ionic/angular**: v8.7.15 - Ionic framework
- **@capacitor/\***: v8.0.0 - Native functionality
- **@ngrx/\***: v18.0.0 - State management
- **saf-file-ops**: Custom SAF operations plugin
- **saf-picker**: Custom SAF picker plugin

### Development
- **TypeScript**: v5.4.5
- **ESLint**: Code linting
- **Karma/Jasmine**: Testing (minimal setup)

## 🔌 Custom Plugins

### StorageStats Plugin
- Location: `src/app/plugins/storage-stats.ts`
- Native Implementation: `android/app/src/main/java/io/ionic/starter/StorageStatsPlugin.java`
- Features:
  - Get storage statistics
  - Check storage permissions
  - Request storage permissions

### SAF Plugins
- **saf-file-ops**: File operations with SAF
- **saf-picker**: Storage access picker

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run in browser
npm start

# Build for Android
npm run build
npx cap sync android
npx cap run android
```

## 📝 Coding Standards

### File Naming
- Components: `*.component.ts`
- Pages: `*.page.ts`
- Services: `*.service.ts`
- Models: `*.model.ts` or descriptive names like `explorer-model.ts`
- Constants: `kebab-case.ts`

### Folder Organization
- Feature modules should be self-contained
- Shared resources go in `/shared`
- Core singletons go in `/core`
- Plugin definitions go in `/plugins`

### Import Standards
- Use barrel exports (`index.ts`) for cleaner imports
- Prefer absolute imports for cross-feature imports
- Use relative imports within the same feature

## 🔍 Notes

- **www/** folder contains build output (ignored in git)
- **android/** folder contains native Android project
- Custom plugins (**saf-file-ops**, **saf-picker**) are local packages
- State management uses NgRx with facade pattern
- Standalone components (Angular 18 pattern)
