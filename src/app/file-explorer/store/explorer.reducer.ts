// explorer.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as ExplorerActions from './explorer.actions';
import { ExplorerState, initialExplorerState } from './explorer.state';
import { CATEGORY_ITEMS } from '../file-categories';
import { STORAGE_ROOTS } from '../storage-roots';
import { ExplorerViewMode } from '../pages/explorer-model';

export const explorerReducer = createReducer<ExplorerState>(
  initialExplorerState,

  /* =======================
     LOCAL ROOTS
     ======================= */
  on(ExplorerActions.loadLocalRoots, (state) => ({
    ...state,
    viewMode: 'local' as ExplorerViewMode,
    currentPath: '/',
    files: STORAGE_ROOTS.map((r) => ({
      ...r,
      selected: false,
      selectable: false,
    })),
    selectionMode: false,
    selectedItems: [],
  })),

  /* =======================
     LOAD FOLDER
     ======================= */
  on(ExplorerActions.loadFolder, (state, { path }) => ({
    ...state,
    currentPath: path,
    pathStack: path.split('/').filter(Boolean),
    loading: true,
    selectionMode: false,
    selectedItems: [],
  })),

  on(ExplorerActions.loadFolderSuccess, (state, { files }) => ({
    ...state,
    files: files.map((f) => ({
      ...f,
      selected: false,
      selectable: false,
    })),
    loading: false,
  })),

  /* =======================
     SELECTION MODE
     ======================= */
  on(ExplorerActions.enterSelectionMode, (state, { item }) => {
    const files = state.files.map((f) =>
      f.path === item.path
        ? { ...f, selected: true }
        : { ...f, selected: false }
    );

    return {
      ...state,
      selectionMode: true,
      files,
      selectedItems: files.filter((f) => f.selected),
    };
  }),

  on(ExplorerActions.selectItem, (state, { item }) => {
    const files = state.files.map((f) =>
      f.path === item.path ? { ...f, selected: !f.selected } : f
    );

    return {
      ...state,
      files,
      selectedItems: files.filter((f) => f.selected),
    };
  }),

  on(ExplorerActions.exitSelectionMode, (state) => ({
    ...state,
    selectionMode: false,
    files: state.files.map((f) => ({
      ...f,
      selected: false,
      selectable: false,
    })),
    selectedItems: [],
  })),

  /* =======================
     VIEW MODE
     ======================= */
  on(ExplorerActions.setViewMode, (state, { mode }) => ({
    ...state,
    viewMode: mode as ExplorerViewMode,
    selectionMode: false,
    selectedItems: [],
  })),

  /* =======================
     CATEGORY VIEW
     ======================= */
  on(ExplorerActions.loadCategoryView, (state) => ({
    ...state,
    viewMode: 'category' as ExplorerViewMode,
    currentPath: '/',
    files: CATEGORY_ITEMS.map((c) => ({
      ...c,
      selected: false,
      selectable: false,
    })),
    selectionMode: false,
    selectedItems: [],
  })),

  on(ExplorerActions.openCategory, (state, { category }) => ({
    ...state,
    viewMode: 'local' as ExplorerViewMode,
    currentPath: category,
    files: state.files
      .filter((f) => f.category === category)
      .map((f) => ({
        ...f,
        selected: false,
        selectable: false,
      })),
    selectionMode: false,
    selectedItems: [],
  })),

  on(ExplorerActions.markItemAccessed, (state, { path }) => ({
    ...state,
    files: state.files.map((f) =>
      f.path === path ? { ...f, lastAccessed: Date.now() } : f
    ),
  })),

  on(ExplorerActions.loadRecentView, (state) => ({
    ...state,
    viewMode: 'recent',
    currentPath: 'Recent',
    selectionMode: false,
    selectedItems: [],
    files: [...state.files]
      .filter((f) => !f.isFolder && f.lastAccessed)
      .sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))
      .map((f) => ({
        ...f,
        selected: false,
        selectable: false, // 🚫 no selection in Recent
      })),
  })),

  on(ExplorerActions.navigateUp, (state) => {
    const newStack = [...state.pathStack];
    newStack.pop();

    return {
      ...state,
      pathStack: Array.from(new Set(state.pathStack)),
      currentPath: '/' + newStack.join('/'),
    };
  })
);
