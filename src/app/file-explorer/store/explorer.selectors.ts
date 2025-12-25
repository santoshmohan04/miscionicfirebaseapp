// explorer.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExplorerState } from './explorer.state';

export const selectExplorerState =
  createFeatureSelector<ExplorerState>('explorer');

export const selectFiles = createSelector(
  selectExplorerState,
  state => state.files
);

export const selectCurrentPath = createSelector(
  selectExplorerState,
  state => state.currentPath
);

export const selectHasSelection = createSelector(
  selectExplorerState,
  state => state.selectedItems.length > 0
);

export const selectSelectedItems = createSelector(
  selectExplorerState,
  state => state.selectedItems
);
