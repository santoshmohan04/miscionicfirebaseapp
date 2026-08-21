# Quick Reference Guide

## 📁 Where new code usually goes

### Feature code
```text
src/app/
└── [feature-name]/
    ├── components/
    ├── models/
    ├── pages/
    ├── services/
    └── store/
```

### Shared code
```text
src/app/shared/
├── components/
├── constants/
├── models/
└── ...
```

### App-wide singletons
```text
src/app/core/services/
├── filesystem.service.ts
├── local-files.service.ts
├── theme.service.ts
└── ...
```

### Capacitor plugin definitions
```text
src/app/plugins/
├── storage-stats.ts
├── index.ts
└── ...
```

## 🔄 Import patterns

### Within the same feature
```typescript
import { MyModel } from '../models/my-model';
import { MyService } from '../services/my.service';
```

### Across features
```typescript
import { FilesystemService } from 'src/app/core/services/filesystem.service';
import { STORAGE_ROOTS } from 'src/app/shared/constants';
import StorageStats from 'src/app/plugins/storage-stats';
```

### Using barrel exports
```typescript
import { FileItem, ExplorerViewMode } from '../models';
```

## 🎨 Naming conventions

### Files
- Component: `*.component.ts`
- Page: `*.page.ts`
- Service: `*.service.ts`
- Model: `*.model.ts` or descriptive names like `explorer-model.ts`
- Constants: `kebab-case.ts`

### Classes
```typescript
export class DashboardPage { }
export class FilesystemService { }
export interface FileItem { }
```

## 🏗️ NgRx pattern used in this repo

```text
[feature]/store/
├── [feature].actions.ts
├── [feature].effects.ts
├── [feature].facade.ts
├── [feature].reducer.ts
├── [feature].selectors.ts
├── [feature].state.ts
└── ...
```

## 🚀 Working commands

```bash
npm install
npm start
npm run build
npm run lint
npx cap sync android
npx cap run android
```

## 📋 Common project checks

- Is it app-wide? → `src/app/core/services/`
- Is it shared? → `src/app/shared/`
- Is it feature-specific? → `src/app/[feature]/`
- Is it a plugin? → `src/app/plugins/`
- Does it need a barrel export? → add/update `index.ts`

## 🔎 Key files to check first

- src/app/core/services/filesystem.service.ts
- src/app/dashboard/dashboard.page.ts
- src/app/category-detail/category-detail.page.ts
- src/app/plugins/storage-stats.ts
- src/app/file-explorer/store/explorer.effects.ts
- capacitor.config.ts
- firebase.json

## 📚 Related docs

- APP-CONTEXT.md — current app context and feature status
- TODO.md — unresolved gaps and roadmap
- FIREBASE_APK_BUILD.md — build and distribution process
- KEYSTORE_SETUP.md — Android signing setup
- RELEASE_CHECKLIST.md — pre-release verification

## 🆘 Troubleshooting

### Import path issues
- Use relative imports within the same feature
- Use absolute paths for cross-feature imports
- Prefer barrel exports where available

### Angular/TypeScript issues
- Restart the TypeScript server if imports look stale
- Confirm the file exists before creating a new import path

### Android build issues
- Run `npx cap sync android`
- Rebuild from the Angular app using `npm run build`
- Check Android config in `capacitor.config.ts` and `android/app/build.gradle`
