// explorer.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExplorerState } from './explorer.state';

export const selectExplorerState =
  createFeatureSelector<ExplorerState>('explorer');

/* =======================
   BASIC STATE
   ======================= */

export const selectFiles = createSelector(
  selectExplorerState,
  (state) => state.files
);

export const selectCurrentPath = createSelector(
  selectExplorerState,
  (state) => state.currentPath
);

export const selectViewMode = createSelector(
  selectExplorerState,
  (state) => state.viewMode
);

export const selectLoading = createSelector(
  selectExplorerState,
  (state) => state.loading
);

/* =======================
   SELECTION
   ======================= */

export const selectSelectionMode = createSelector(
  selectExplorerState,
  (state) => state.selectionMode
);

export const selectSelectedItems = createSelector(
  selectExplorerState,
  (state) => state.selectedItems
);

export const selectSelectedCount = createSelector(
  selectSelectedItems,
  (items) => items.length
);

export const selectHasSelection = createSelector(
  selectSelectedCount,
  (count) => count > 0
);

export const selectHasAnySelection = createSelector(
  selectHasSelection,
  (has) => has
);

export const selectBreadcrumbs = createSelector(
  selectExplorerState,
  (state) => state.pathStack
);