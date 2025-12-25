import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ExplorerActions from './explorer.actions';
import * as ExplorerSelectors from './explorer.selectors';
import { FileItem } from '../pages/explorer-model';

@Injectable({ providedIn: 'root' })
export class ExplorerFacade {
  files$ = this.store.select(ExplorerSelectors.selectFiles);
  currentPath$ = this.store.select(ExplorerSelectors.selectCurrentPath);
  hasSelection$ = this.store.select(ExplorerSelectors.selectHasSelection);
  selectionMode$ = this.store.select(ExplorerSelectors.selectSelectionMode);
  selectedCount$ = this.store.select(ExplorerSelectors.selectSelectedCount);

  constructor(private store: Store) {}

  loadRoot() {
    this.store.dispatch(ExplorerActions.loadFolder({ path: '/' }));
  }

  openFolder(path: string) {
    this.store.dispatch(ExplorerActions.loadFolder({ path }));
  }

  enterSelectionMode(item: FileItem) {
    this.store.dispatch(ExplorerActions.enterSelectionMode({ item }));
  }

  exitSelectionMode() {
    this.store.dispatch(ExplorerActions.exitSelectionMode());
  }

  toggleSelection(item: FileItem) {
    this.store.dispatch(ExplorerActions.selectItem({ item }));
  }

  clearSelection() {
    this.store.dispatch(ExplorerActions.clearSelection());
  }

  deleteSelected() {
    this.store.dispatch(ExplorerActions.deleteSelected());
  }

  playMedia(item: FileItem) {
    // later: player store
  }

  startMove() {}

  startCopy() {}
}
