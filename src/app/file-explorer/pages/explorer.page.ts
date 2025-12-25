import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
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
  IonRippleEffect, IonCheckbox } from '@ionic/angular/standalone';

import { ExplorerFacade } from '../store/explorer.facade';
import { FileItem } from './explorer-model';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
  standalone: true,
  imports: [IonCheckbox, 
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
    IonRippleEffect,
  ],
})
export class ExplorerPage implements OnInit, AfterViewInit {
  files$: Observable<FileItem[]>;
  currentPath$: Observable<string>;
  hasSelection$: Observable<boolean>;
  selectionMode$: Observable<boolean>;
  selectedCount$: Observable<number>;

  private filesSnapshot: FileItem[] = [];
  private selectionModeSnapshot = false;

  @ViewChildren('fileItem', { read: ElementRef })
  fileItems!: QueryList<ElementRef>;

  constructor(
    private explorerFacade: ExplorerFacade,
    private gestureCtrl: GestureController
  ) {
    this.files$ = this.explorerFacade.files$;
    this.currentPath$ = this.explorerFacade.currentPath$;
    this.hasSelection$ = this.explorerFacade.hasSelection$;
    this.selectionMode$ = this.explorerFacade.selectionMode$;
    this.selectedCount$ = this.explorerFacade.selectedCount$;
  }

  ngOnInit() {
    this.explorerFacade.loadRoot();

    // keep snapshots in sync
    this.files$.subscribe((files) => (this.filesSnapshot = files));
    this.selectionMode$.subscribe(
      (mode) => (this.selectionModeSnapshot = mode)
    );
  }

  ngAfterViewInit() {
    this.fileItems.changes.subscribe(() => {
      this.attachLongPressGestures();
    });

    this.attachLongPressGestures();
  }

  private attachLongPressGestures() {
    this.fileItems.forEach((el, index) => {
      const gesture = this.gestureCtrl.create({
        el: el.nativeElement,
        threshold: 0,
        gestureName: 'long-press',
        onStart: () => {
          const item = this.filesSnapshot[index];
          if (item) {
            this.explorerFacade.enterSelectionMode(item);
          }
        },
      });

      gesture.enable(true);
    });
  }

  // tap behavior
  open(item: FileItem) {
    if (this.selectionModeSnapshot) {
      this.explorerFacade.toggleSelection(item);
      return;
    }

    if (item.isFolder) {
      this.explorerFacade.openFolder(item.path);
    } else {
      this.explorerFacade.playMedia(item);
    }
  }

  toggleSelection(item: FileItem) {
    this.explorerFacade.toggleSelection(item);
  }

  clearSelection() {
    this.explorerFacade.exitSelectionMode();
  }

  deleteSelected() {
    this.explorerFacade.deleteSelected();
  }

  move() {
    this.explorerFacade.startMove();
  }

  copy() {
    this.explorerFacade.startCopy();
  }
}
