import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, take } from 'rxjs/operators';
import { GestureController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonLabel,
  IonItem,
  IonIcon,
  IonContent,
  IonButton,
  IonFooter,
  IonList,
  IonMenuButton,
  IonCheckbox,
  IonSegment,
  IonSegmentButton,
  IonRippleEffect, IonSpinner } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { ExplorerFacade } from '../store/explorer.facade';
import { FileItem, ExplorerViewMode } from '../models/explorer-model';
import { FileDetailsComponent } from '../components/file-details/file-details.component';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
  standalone: true,
  imports: [IonSpinner, 
    IonRippleEffect,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonLabel,
    IonItem,
    IonIcon,
    IonContent,
    IonButton,
    IonFooter,
    IonList,
    IonMenuButton,
    IonCheckbox,
    IonSegment,
    IonSegmentButton,
  ],
})
export class ExplorerPage implements OnInit, AfterViewInit, OnDestroy {
  /* ===== Injected services ===== */
  facade = inject(ExplorerFacade);
  private gestureCtrl = inject(GestureController);
  private modalCtrl = inject(ModalController);
  private appStateListener?: PluginListenerHandle;

  /* ===== Store streams ===== */
  files$ = this.facade.files$;
  currentPath$ = this.facade.currentPath$;
  selectionMode$ = this.facade.selectionMode$;
  selectedCount$ = this.facade.selectedCount$;
  hasAnySelection$ = this.facade.hasAnySelection$;
  viewMode$ = this.facade.viewMode$;
  breadcrumbs$ = this.facade.breadcrumbs$;
  clipboard$ = this.facade.clipboard$;

  /* ===== Header state ===== */
  headerTitle$ = this.currentPath$.pipe(
    map((path) =>
      !path || path === '/' ? 'File Manager' : path.split('/').pop()!
    )
  );

  isInsideStorage$ = this.currentPath$.pipe(
    map((path) => !!path && path !== '/')
  );

  /* ===== Snapshots ===== */
  private filesSnapshot: FileItem[] = [];
  private selectionModeSnapshot = false;
  private viewModeSnapshot: ExplorerViewMode = 'local';

  @ViewChildren('fileItem', { read: ElementRef })
  fileItems!: QueryList<ElementRef>;

  constructor() {}

  ngOnInit() {
    this.facade.setViewMode('local');
    this.facade.loadLocalRoots();

    this.files$.subscribe((f) => (this.filesSnapshot = f));
    this.selectionMode$.subscribe((m) => (this.selectionModeSnapshot = m));
    
    this.setupAppStateListener();
  }

  ngOnDestroy() {
    this.appStateListener?.remove();
  }

  private setupAppStateListener() {
    // Reload file list when app resumes (after granting permissions)
    App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        console.log('Explorer: App resumed, reloading files...');
        this.currentPath$.pipe(take(1)).subscribe(path => {
          if (!path || path === '/') {
            this.facade.loadLocalRoots();
          }
        });
      }
    }).then(listener => {
      this.appStateListener = listener;
    });
    this.viewMode$.subscribe((v) => (this.viewModeSnapshot = v));
  }

  ngAfterViewInit() {
    this.fileItems.changes.subscribe(() => this.attachLongPress());
    this.attachLongPress();
  }

  private attachLongPress() {
    if (this.viewModeSnapshot === 'category') return;

    this.fileItems.forEach((el, index) => {
      const item = this.filesSnapshot[index];
      if (!item?.selectable) return;

      const gesture = this.gestureCtrl.create({
        el: el.nativeElement,
        threshold: 0,
        gestureName: 'long-press',
        onStart: () => {
          const item = this.filesSnapshot[index];
          if (!item || item.isFolder) return;
          this.openDetails(item);
        },
      });

      gesture.enable(true);
    });
  }

  open(item: FileItem) {
    console.log('=== ExplorerPage.open() called ===');
    console.log('Item:', item);
    console.log('ViewMode:', this.viewModeSnapshot);
    console.log('SelectionMode:', this.selectionModeSnapshot);

    if (this.viewModeSnapshot === 'recent') {
      this.facade.playMedia(item);
      this.facade.markAccess(item);
      return;
    }

    if (this.selectionModeSnapshot) {
      this.facade.toggleSelection(item);
      return;
    }

    if (this.viewModeSnapshot === 'category') {
      if (item.category) {
        this.facade.openCategory(item.category);
      }
      return;
    }

    if (item.isFolder) {
      // Check if this is a storage selection (path = 'internal' or 'external')
      if (this.viewModeSnapshot === 'local' && (item.path === 'internal' || item.path === 'external')) {
        console.log('>>> Opening storage:', item.name);
        this.facade.openStorage(item.name);
      } else {
        console.log('>>> Opening folder:', item.path);
        this.facade.openFolder(item.path);
      }
      this.facade.markAccess(item);
    } else {
      this.facade.playMedia(item);
      this.facade.markAccess(item);
    }
  }

  toggleSelection(item: FileItem) {
    if (item.selectable) {
      this.facade.toggleSelection(item);
    }
  }

  clearSelection() {
    this.facade.exitSelectionMode();
  }

  move() {
    this.facade.startMove();
  }

  copy() {
    this.facade.startCopy();
  }

  deleteSelected() {
    this.facade.deleteSelected();
  }

  paste() {
    this.currentPath$.pipe(take(1)).subscribe(path => {
      if (path) {
        this.facade.confirmPaste(path);
      }
    });
  }

  goBack() {
    this.facade.navigateUp();
  }

  changeView(value: unknown) {
    if (value !== 'category' && value !== 'recent' && value !== 'local') return;

    this.facade.setViewMode(value);

    if (value === 'category') this.facade.loadCategoryView();
    if (value === 'recent') this.facade.loadRecentView();
    if (value === 'local') this.facade.loadLocalRoots();
  }

  navigateToCrumb(index: number) {
    this.facade.navigateToPathIndex(index);
  }

  async openDetails(item: FileItem) {
    const modal = await this.modalCtrl.create({
      component: FileDetailsComponent,
      componentProps: { file: item },
      initialBreakpoint: 0.4,
      breakpoints: [0.25, 0.4, 0.7],
      handle: true,
    });

    await modal.present();
  }
}
