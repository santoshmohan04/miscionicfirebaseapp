// explorer.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as ExplorerActions from './explorer.actions';
import { initialExplorerState } from './explorer.state';

export const explorerReducer = createReducer(
  initialExplorerState,

  on(ExplorerActions.loadFolder, (state, { path }) => ({
    ...state,
    currentPath: path,
    loading: true,
    selectedItems: [],
  })),

  on(ExplorerActions.loadFolderSuccess, (state, { files }) => ({
    ...state,
    files: files.map((f) => ({ ...f, selected: false, selectable: false })),
    loading: false,
  })),

  on(ExplorerActions.selectItem, (state, { item }) => {
    const updatedFiles = state.files.map((f) =>
      f.path === item.path
        ? { ...f, selected: !f.selected, selectable: true }
        : { ...f, selectable: true }
    );

    return {
      ...state,
      files: updatedFiles,
      selectedItems: updatedFiles.filter((f) => f.selected),
    };
  }),

  on(ExplorerActions.clearSelection, (state) => ({
    ...state,
    files: state.files.map((f) => ({
      ...f,
      selected: false,
      selectable: false,
    })),
    selectedItems: [],
  })),

  on(ExplorerActions.enableSelection, (state, { item }) => {
    const updatedFiles = state.files.map((f) => ({
      ...f,
      selectable: true,
      selected: f.path === item.path,
    }));

    return {
      ...state,
      files: updatedFiles,
      selectedItems: updatedFiles.filter((f) => f.selected),
    };
  }),

  on(ExplorerActions.enterSelectionMode, (state, { item }) => ({
    ...state,
    selectionMode: true,
    files: state.files.map((f) =>
      f === item
        ? { ...f, selected: true, selectable: true }
        : { ...f, selectable: true }
    ),
  })),

  on(ExplorerActions.exitSelectionMode, (state) => ({
    ...state,
    selectionMode: false,
    files: state.files.map((f) => ({
      ...f,
      selected: false,
      selectable: false,
    })),
  }))
);
