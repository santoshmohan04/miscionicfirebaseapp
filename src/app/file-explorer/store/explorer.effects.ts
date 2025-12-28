import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  withLatestFrom,
  filter,
} from 'rxjs/operators';

import * as ExplorerActions from './explorer.actions';
import * as ExplorerSelectors from './explorer.selectors';

import { LocalFilesService } from '../../core/services/local-files.service';
import { FilesystemService } from '../../core/services/filesystem.service';

@Injectable()
export class ExplorerEffects {
  constructor(
    private actions$: Actions,
    private local: LocalFilesService,
    private fs: FilesystemService,
    private store: Store
  ) {}

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
     LOCAL VIEW – OPEN FOLDER
     ===================================================== */
  openLocalFolder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.loadFolder),
      withLatestFrom(this.store.select(ExplorerSelectors.selectViewMode)),
      filter(([_, viewMode]) => viewMode === 'local'),
      switchMap(([{ path }]) =>
        from(this.local.openFolderByPath(path)).pipe(
          map(files => ExplorerActions.loadFolderSuccess({ files })),
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
      withLatestFrom(this.store.select(ExplorerSelectors.selectViewMode)),
      filter(([_, viewMode]) => viewMode === 'local'),
      switchMap(() =>
        from(this.local.goBack()).pipe(
          filter((files): files is any[] => files !== null),
          map(files => ExplorerActions.loadFolderSuccess({ files })),
          catchError(() => of(ExplorerActions.loadFolderFailure()))
        )
      )
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