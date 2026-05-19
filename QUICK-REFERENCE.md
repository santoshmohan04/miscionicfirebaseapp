# Quick Reference Guide

## 📁 Where to Put New Code

### Adding a New Feature
```
src/app/
└── [feature-name]/
    ├── components/      # Feature-specific components
    ├── models/          # Feature models & interfaces
    ├── pages/           # Routable pages
    ├── services/        # Feature-specific services
    └── store/           # NgRx state (if needed)
```

### Adding Shared Code

#### Shared Models/Interfaces
```typescript
// Location: src/app/shared/models/[name].model.ts
export interface MySharedModel {
  // ...
}

// Then add to: src/app/shared/models/index.ts
export * from './[name].model';
```

#### Shared Constants
```typescript
// Location: src/app/shared/constants/[name].ts
export const MY_CONSTANT = {
  // ...
};

// Then add to: src/app/shared/constants/index.ts
export * from './[name]';
```

#### App-wide Services (Singletons)
```typescript
// Location: src/app/core/services/[name].service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  // ...
}
```

### Adding Capacitor Plugins

#### Plugin Definition
```typescript
// Location: src/app/plugins/[plugin-name].ts
import { registerPlugin } from '@capacitor/core';

export interface MyPluginInterface {
  myMethod(): Promise<void>;
}

const MyPlugin = registerPlugin<MyPluginInterface>('MyPlugin');
export default MyPlugin;

// Then add to: src/app/plugins/index.ts
export { default as MyPlugin } from './[plugin-name]';
export type { MyPluginInterface } from './[plugin-name]';
```

#### Native Implementation
```
android/app/src/main/java/io/ionic/starter/[PluginName].java
```

## 🔄 Common Import Patterns

### Within Same Feature
```typescript
// From page to model in same feature
import { MyModel } from '../models/my-model';

// From component to service in same feature
import { MyService } from '../services/my.service';
```

### Cross-Feature Imports
```typescript
// From any feature to shared
import { MY_CONSTANT } from 'src/app/shared/constants';
import { SharedModel } from 'src/app/shared/models';

// From any feature to core services
import { FilesystemService } from 'src/app/core/services/filesystem.service';

// From any feature to plugins
import { StorageStats } from 'src/app/plugins';
```

### Using Barrel Exports
```typescript
// ✅ Good - using barrel export
import { FileItem, ExplorerViewMode } from '../models';

// ❌ Avoid - direct file import when barrel exists
import { FileItem } from '../models/explorer-model';
```

## 🎨 Naming Conventions

### Files
| Type | Pattern | Example |
|------|---------|---------|
| Component | `*.component.ts` | `file-list.component.ts` |
| Page | `*.page.ts` | `explorer.page.ts` |
| Service | `*.service.ts` | `filesystem.service.ts` |
| Model | `*.model.ts` or descriptive | `user.model.ts` or `explorer-model.ts` |
| Constants | `kebab-case.ts` | `file-categories.ts` |
| Guard | `*.guard.ts` | `auth.guard.ts` |
| Pipe | `*.pipe.ts` | `file-size.pipe.ts` |

### Classes
```typescript
// Component
export class FileListComponent { }

// Page
export class ExplorerPage { }

// Service
export class FilesystemService { }

// Model (interface)
export interface FileItem { }
```

### Folders
```
kebab-case/
  - file-explorer/
  - storage-stats/
  - user-profile/
```

## 🏗️ Creating NgRx State

If adding state management to a feature:

```
[feature]/store/
├── [feature].actions.ts      # Action definitions
├── [feature].effects.ts      # Side effects
├── [feature].facade.ts       # Facade service (recommended)
├── [feature].reducer.ts      # Reducer
├── [feature].selectors.ts    # Selectors
└── [feature].state.ts        # State interface
```

Register in `src/main.ts`:
```typescript
provideStore({
  explorer: explorerReducer,
  [feature]: [feature]Reducer  // Add your feature
}),
provideEffects([
  ExplorerEffects,
  [Feature]Effects  // Add your effects
]),
```

## 📋 File Organization Checklist

When creating new code, ask:

- [ ] Is this feature-specific? → Put in feature folder
- [ ] Is this shared across features? → Put in `shared/`
- [ ] Is this an app-wide singleton service? → Put in `core/services/`
- [ ] Is this a Capacitor plugin? → Put in `plugins/`
- [ ] Does it need a barrel export? → Create/update `index.ts`
- [ ] Are imports clean and using barrel exports? → Review imports
- [ ] Is the file named correctly? → Check naming conventions

## 🚀 Common Commands

```bash
# Development
npm start                    # Run in browser
npm run build               # Build for production

# Capacitor
npx cap sync android        # Sync web → native
npx cap run android         # Build and run on device
npx cap open android        # Open in Android Studio

# Code Quality
npm run lint                # Run ESLint
npm test                    # Run tests

# Generate (Angular CLI)
ng generate component [name] --standalone
ng generate service [name]
ng generate interface [name]
```

## 💡 Tips

1. **Always use barrel exports** for cleaner imports
2. **Keep features self-contained** - minimize cross-feature dependencies
3. **Use absolute paths** for imports outside current feature
4. **Follow the facade pattern** for NgRx (easier testing & cleaner components)
5. **Use standalone components** (Angular 18+ pattern)
6. **Type everything** - avoid `any` type
7. **Document complex logic** with comments
8. **Keep components small** - split large components

## 📚 Related Documentation

- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Full structure overview
- [TODO.md](TODO.md) - Incomplete features & roadmap
- [REORGANIZATION-SUMMARY.md](REORGANIZATION-SUMMARY.md) - Recent changes

## 🆘 Troubleshooting

### "Cannot find module" errors
1. Check if file exists at import path
2. Verify barrel exports include the file
3. Reload VS Code window
4. Restart TypeScript server (Cmd/Ctrl + Shift + P → "Restart TS Server")

### Import path confusion
- Use **relative paths** (`../`, `./`) within same feature
- Use **absolute paths** (`src/app/...`) for cross-feature imports
- Use **barrel exports** (`from '../models'`) when available

### Where does this file go?
1. Is it specific to one feature? → `src/app/[feature]/`
2. Is it shared? → `src/app/shared/`
3. Is it core/singleton? → `src/app/core/`
4. Is it a plugin? → `src/app/plugins/`
