import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  withLatestFrom,
  filter,
  tap,
} from 'rxjs/operators';

import * as ExplorerActions from './explorer.actions';
import * as ExplorerSelectors from './explorer.selectors';

import { LocalFilesService } from '../../core/services/local-files.service';
import { FilesystemService } from '../../core/services/filesystem.service';

@Injectable()
export class ExplorerEffects {
  private actions$ = inject(Actions);
  private local = inject(LocalFilesService);
  private fs = inject(FilesystemService);
  private store = inject(Store);

  constructor() {}

  /* =====================================================
     LOCAL VIEW – ROOT
     ===================================================== */
  loadLocalRoots$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.loadLocalRoots),
      switchMap(() => {
        this.local.reset();
        return from(this.local.openRoot()).pipe(
          map(files => ExplorerActions.loadFolderSuccess({ files })),
          catchError(() => of(ExplorerActions.loadFolderFailure()))
        );
      })
    )
  );

  /* =====================================================
     LOCAL VIEW – OPEN STORAGE
     ===================================================== */
  openStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.openStorage),
      tap(({ storageName }) => console.log('=== Effect openStorage$ triggered for:', storageName)),
      switchMap(({ storageName }) =>
        from(this.local.openStorage(storageName)).pipe(
          tap(() => console.log('=== openStorage completed successfully')),
          map(files => ExplorerActions.loadFolderSuccess({ files })),
          catchError((error) => {
            console.error('=== openStorage failed:', error);
            
            // Show user-friendly error message
            if (error.message === 'Picker already open') {
              console.warn('⚠️ Please wait for the current picker to complete');
            } else if (error.message === 'User cancelled') {
              console.log('ℹ️ Folder selection cancelled');
            } else {
              console.error('❌ Failed to open storage:', error.message);
            }
            
            return of(ExplorerActions.loadFolderFailure());
          })
        )
      )
    )
  );

  /* =====================================================
     LOCAL VIEW – OPEN FOLDER
     ===================================================== */
  openLocalFolder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.loadFolder),
      withLatestFrom(this.store.select(ExplorerSelectors.selectViewMode)),
      tap(([{ path }, viewMode]) => console.log('=== Effect openLocalFolder$ - path:', path, 'viewMode:', viewMode)),
      filter(([_, viewMode]) => viewMode === 'local'),
      tap(([{ path }]) => console.log('=== After viewMode filter - path:', path)),
      filter(([{ path }, _]) => path !== 'internal' && path !== 'external'), // Skip storage root items
      filter(([{ path }, _]) => !path.startsWith('/category/')), // Skip virtual category routes
      tap(([{ path }]) => console.log('=== After path filter, proceeding with:', path)),
      switchMap(([{ path }]) =>
        from(this.local.openFolderByPath(path)).pipe(
          map(files => ExplorerActions.loadFolderSuccess({ files })),
          catchError(() => of(ExplorerActions.loadFolderFailure()))
        )
      )
    )
  );

  /* =====================================================
     CATEGORY VIEW - OPEN CATEGORY
     ===================================================== */
  openCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.openCategory),
      switchMap(({ category }) =>
        from(this.fs.getExplorerFilesByCategory(category)).pipe(
          map((files) => ExplorerActions.loadFolderSuccess({ files })),
          catchError(() => of(ExplorerActions.loadFolderFailure()))
        )
      )
    )
  );

  /* =====================================================
     LOCAL VIEW – BACK NAVIGATION
     ===================================================== */
  navigateUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.navigateUp),
      withLatestFrom(
        this.store.select(ExplorerSelectors.selectViewMode),
        this.store.select(ExplorerSelectors.selectCurrentPath)
      ),
      filter(([_, viewMode]) => viewMode === 'local'),
      switchMap(([_, __, currentPath]) => {
        if (currentPath.startsWith('/category/')) {
          return of(ExplorerActions.loadCategoryView());
        }

        return from(this.local.goBack()).pipe(
          filter((files): files is any[] => files !== null),
          map(files => ExplorerActions.loadFolderSuccess({ files })),
          catchError(() => of(ExplorerActions.loadFolderFailure()))
        );
      })
    )
  );

  /* =====================================================
     FILE OPERATIONS
     ===================================================== */
  deleteSelected$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.deleteSelected),
      withLatestFrom(this.store.select(ExplorerSelectors.selectSelectedItems)),
      switchMap(([_, items]) =>
        from(this.fs.deleteSafItems(items)).pipe(
          map(() => ExplorerActions.fileOpSuccess()),
          catchError(err =>
            of(ExplorerActions.fileOpFailure({ error: err }))
          )
        )
      )
    )
  );

  paste$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.confirmPaste),
      withLatestFrom(this.store.select(ExplorerSelectors.selectClipboard)),
      switchMap(([{ targetUri }, clipboard]) => {
        if (!clipboard) return of();

        return from(
          clipboard.mode === 'copy'
            ? this.fs.copySafItems(clipboard.items, targetUri)
            : this.fs.moveSafItems(clipboard.items, targetUri)
        ).pipe(
          map(() => ExplorerActions.fileOpSuccess()),
          catchError(err =>
            of(ExplorerActions.fileOpFailure({ error: err }))
          )
        );
      })
    )
  );
}