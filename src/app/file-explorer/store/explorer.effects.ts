// explorer.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ExplorerActions from './explorer.actions';
import { FilesystemService } from '../../../core/services/filesystem.service';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class ExplorerEffects {

  loadFolder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExplorerActions.loadFolder),
      mergeMap(({ path }) =>
        this.fs.readFolder(path).pipe(
          map(files => ExplorerActions.loadFolderSuccess({ files })),
          catchError(() => of(ExplorerActions.loadFolderFailure()))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private fs: FilesystemService
  ) {}
}