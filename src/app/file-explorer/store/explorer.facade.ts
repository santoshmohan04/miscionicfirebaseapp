// explorer.facade.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ExplorerActions from './explorer.actions';
import * as ExplorerSelectors from './explorer.selectors';

@Injectable({ providedIn: 'root' })
export class ExplorerFacade {

  files$ = this.store.select(ExplorerSelectors.selectFiles);
  currentPath$ = this.store.select(ExplorerSelectors.selectCurrentPath);
  hasSelection$ = this.store.select(ExplorerSelectors.selectHasSelection);

  constructor(private store: Store) {}

  loadRoot() {
    this.store.dispatch(ExplorerActions.loadFolder({ path: '/' }));
  }

  openFolder(path: string) {
    this.store.dispatch(ExplorerActions.loadFolder({ path }));
  }

  toggleSelection(item: any) {
    this.store.dispatch(ExplorerActions.selectItem({ item }));
  }

  clearSelection() {
    this.store.dispatch(ExplorerActions.clearSelection());
  }

  deleteSelected() {
    this.store.dispatch(ExplorerActions.deleteSelected());
  }

  playMedia(item: any) {
    // will integrate with Player Store later
  }

  startMove() {
    // future implementation
  }

  startCopy() {
    // future implementation
  }
}