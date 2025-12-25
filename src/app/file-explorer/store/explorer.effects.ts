// explorer.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ExplorerActions from './explorer.actions';
import * as ExplorerSelectors from './explorer.selectors';
import { FilesystemService } from '../../core/services/filesystem.service';
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

@Injectable()
export class ExplorerEffects {
  constructor(
    private actions$: Actions,
    private fs: FilesystemService,
    private store: Store
  ) {}

  /* =======================
     LOAD FOLDER (LOCAL)
     ======================= */

  loadFolder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.loadFolder),
      mergeMap(({ path }) =>
        this.fs.readFolder(path).pipe(
          map((files) =>
            ExplorerActions.loadFolderSuccess({ files })
          ),
          catchError(() =>
            of(ExplorerActions.loadFolderFailure())
          )
        )
      )
    )
  );

  /* =======================
     RECENT VIEW (TEMP)
     ======================= */
  // Later this will sort by lastModified / lastOpened
  loadRecentView$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.loadRecentView),
      map(() =>
        ExplorerActions.loadFolder({ path: '/' })
      )
    )
  );

  navigateUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.navigateUp),
      withLatestFrom(
        this.store.select(ExplorerSelectors.selectCurrentPath),
        this.store.select(ExplorerSelectors.selectViewMode)
      ),
      filter(([_, path, viewMode]) => {
        // only for local view
        return viewMode === 'local' && !!path && path !== '/';
      }),
      map(([_, path]) => {
        const parts = path.split('/').filter(Boolean);
        parts.pop(); // remove current folder

        const parentPath = '/' + parts.join('/');

        return ExplorerActions.loadFolder({
          path: parentPath === '/' ? '/' : parentPath,
        });
      })
    )
  );
}
