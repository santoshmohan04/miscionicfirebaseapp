import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { GestureController } from '@ionic/angular';

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
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { ExplorerFacade } from '../store/explorer.facade';
import { FileItem, ExplorerViewMode } from './explorer-model';
import { FileDetailsComponent } from '../components/file-details/file-details.component';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
  standalone: true,
  imports: [
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
    FileDetailsComponent,
  ],
})
export class ExplorerPage implements OnInit, AfterViewInit {
  /* ===== Store streams ===== */
  files$ = this.facade.files$;
  currentPath$ = this.facade.currentPath$;
  selectionMode$ = this.facade.selectionMode$;
  selectedCount$ = this.facade.selectedCount$;
  hasAnySelection$ = this.facade.hasAnySelection$;
  viewMode$ = this.facade.viewMode$;
  breadcrumbs$ = this.facade.breadcrumbs$;

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

  constructor(
    private facade: ExplorerFacade,
    private gestureCtrl: GestureController,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.facade.setViewMode('local');
    this.facade.loadLocalRoots();

    this.files$.subscribe((f) => (this.filesSnapshot = f));
    this.selectionMode$.subscribe((m) => (this.selectionModeSnapshot = m));
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
      this.facade.openFolder(item.path);
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
