// explorer.actions.ts
import { createAction, props } from '@ngrx/store';
import { FileItem } from '../pages/explorer-model';

/* =======================
   FOLDER / FILE LOADING
   ======================= */

export const loadFolder = createAction(
  '[Explorer] Load Folder',
  props<{ path: string }>()
);

export const loadFolderSuccess = createAction(
  '[Explorer] Load Folder Success',
  props<{ files: FileItem[] }>()
);

export const loadFolderFailure = createAction('[Explorer] Load Folder Failure');

export const loadFilesSuccess = createAction(
  '[Explorer] Load Files Success',
  props<{ files: FileItem[] }>()
);

export const loadFilesFailure = createAction(
  '[Explorer] Load Files Failure',
  props<{ error: unknown }>()
);

/* =======================
   SELECTION
   ======================= */

export const enterSelectionMode = createAction(
  '[Explorer] Enter Selection Mode',
  props<{ item: FileItem }>()
);

export const exitSelectionMode = createAction('[Explorer] Exit Selection Mode');

export const selectItem = createAction(
  '[Explorer] Toggle Select Item',
  props<{ item: FileItem }>()
);

export const clearSelection = createAction('[Explorer] Clear Selection');

export const deleteSelected = createAction('[Explorer] Delete Selected');

/* =======================
   VIEW MODE
   ======================= */

export const setViewMode = createAction(
  '[Explorer] Set View Mode',
  props<{ mode: 'category' | 'recent' | 'local' }>()
);

/* =======================
   CATEGORY VIEW
   ======================= */

export const loadCategoryView = createAction('[Explorer] Load Category View');

export const openCategory = createAction(
  '[Explorer] Open Category',
  props<{ category: string }>()
);

/* =======================
   RECENT VIEW
   ======================= */

export const loadRecentView = createAction('[Explorer] Load Recent View');

export const markItemAccessed = createAction(
  '[Explorer] Mark Item Accessed',
  props<{ path: string }>()
);

/* =======================
   NAVIGATION
   ======================= */

export const navigateUp = createAction('[Explorer] Navigate Up');

export const navigateToPathIndex = createAction(
  '[Explorer] Navigate To Path Index',
  props<{ index: number }>()
);

/* =======================
   ACTIONS (FUTURE)
   ======================= */

export const startMove = createAction('[Explorer] Start Move');

export const startCopy = createAction('[Explorer] Start Copy');

export const confirmPaste = createAction(
  '[Explorer] Confirm Paste',
  props<{ targetUri: string }>()
);

export const fileOpSuccess = createAction('[Explorer] File Operation Success');

export const fileOpFailure = createAction(
  '[Explorer] File Operation Failure',
  props<{ error: any }>()
);

export const playMedia = createAction(
  '[Explorer] Play Media',
  props<{ item: FileItem }>()
);

export const loadLocalRoots = createAction('[Explorer] Load Local Roots');
