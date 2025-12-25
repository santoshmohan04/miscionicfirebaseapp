// explorer.actions.ts
import { createAction, props } from '@ngrx/store';
import { FileItem } from '../../../core/models/file-item.model';

export const loadFolder = createAction(
  '[Explorer] Load Folder',
  props<{ path: string }>()
);

export const loadFolderSuccess = createAction(
  '[Explorer] Load Folder Success',
  props<{ files: FileItem[] }>()
);

export const loadFolderFailure = createAction(
  '[Explorer] Load Folder Failure'
);

export const selectItem = createAction(
  '[Explorer] Select Item',
  props<{ item: FileItem }>()
);

export const clearSelection = createAction(
  '[Explorer] Clear Selection'
);

export const deleteSelected = createAction(
  '[Explorer] Delete Selected'
);
