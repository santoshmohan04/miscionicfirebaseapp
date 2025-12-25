import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ExplorerActions from './explorer.actions';
import * as ExplorerSelectors from './explorer.selectors';
import { ExplorerViewMode, FileItem } from '../pages/explorer-model';
import { StoragePermissionService } from 'src/app/core/services/storage-permission.service';

@Injectable({ providedIn: 'root' })
export class ExplorerFacade {
  files$ = this.store.select(ExplorerSelectors.selectFiles);
  currentPath$ = this.store.select(ExplorerSelectors.selectCurrentPath);
  selectionMode$ = this.store.select(ExplorerSelectors.selectSelectionMode);
  selectedCount$ = this.store.select(ExplorerSelectors.selectSelectedCount);
  hasAnySelection$ = this.store.select(ExplorerSelectors.selectHasAnySelection);
  viewMode$ = this.store.select(ExplorerSelectors.selectViewMode);
  breadcrumbs$ = this.store.select(ExplorerSelectors.selectBreadcrumbs);

  constructor(
    private store: Store,
    private permissionService: StoragePermissionService
  ) {}

  async loadLocalRoots() {
    const granted = await this.permissionService.check();
    if (!granted) {
      const allowed = await this.permissionService.request();
      if (!allowed) return;
    }

    this.store.dispatch(ExplorerActions.loadLocalRoots());
  }

  openFolder(path: string) {
    this.store.dispatch(ExplorerActions.loadFolder({ path }));
  }

  loadFolder(path: string) {
    this.store.dispatch(ExplorerActions.loadFolder({ path }));
  }

  navigateUp() {
    this.store.dispatch(ExplorerActions.navigateUp());
  }

  loadCategoryView() {
    this.store.dispatch(ExplorerActions.loadCategoryView());
  }

  openCategory(category: string) {
    this.store.dispatch(ExplorerActions.openCategory({ category }));
  }

  loadRecentView() {
    this.store.dispatch(ExplorerActions.loadRecentView());
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

  deleteSelected() {
    this.store.dispatch(ExplorerActions.deleteSelected());
  }

  startMove() {
    this.store.dispatch(ExplorerActions.startMove());
  }

  startCopy() {
    this.store.dispatch(ExplorerActions.startCopy());
  }

  playMedia(item: FileItem) {
    this.store.dispatch(ExplorerActions.playMedia({ item }));
  }

  setViewMode(mode: ExplorerViewMode) {
    this.store.dispatch(ExplorerActions.setViewMode({ mode }));
  }

  markAccess(item: FileItem) {
    this.store.dispatch(ExplorerActions.markItemAccessed({ path: item.path }));
  }

  navigateToPathIndex(index: number) {
    this.store.dispatch(ExplorerActions.navigateToPathIndex({ index }));
  }
}
