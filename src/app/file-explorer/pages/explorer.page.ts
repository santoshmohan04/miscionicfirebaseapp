import { Component, OnInit } from '@angular/core';
import { ExplorerFacade } from '../store/explorer.facade';
import { Observable } from 'rxjs';
import { FileItem } from './explorer-model';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonLabel, IonItem, IonIcon, IonContent, IonButton, IonFooter, IonCheckbox, IonList } from "@ionic/angular/standalone";

@Component({
    selector: 'app-explorer',
    templateUrl: './explorer.page.html',
    styleUrls: ['./explorer.page.scss'],
    imports: [IonList, IonCheckbox, IonFooter, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonTitle, IonButtons, IonToolbar, IonHeader]
})
export class ExplorerPage implements OnInit {

  files$: Observable<FileItem[]>;
  currentPath$: Observable<string>;
  hasSelection$: Observable<boolean>;

  constructor(private explorerFacade: ExplorerFacade) {
    this.files$ = this.explorerFacade.files$;
    this.currentPath$ = this.explorerFacade.currentPath$;
    this.hasSelection$ = this.explorerFacade.hasSelection$;
  }

  ngOnInit() {
    this.explorerFacade.loadRoot();
  }

  open(item: FileItem) {
    if (item.isFolder) {
      this.explorerFacade.openFolder(item.path);
    } else {
      this.explorerFacade.playMedia(item);
    }
  }

  longPress(item: FileItem) {
    this.explorerFacade.enableSelection(item);
  }

  toggleSelection(item: FileItem) {
    this.explorerFacade.toggleSelection(item);
  }

  clearSelection() {
    this.explorerFacade.clearSelection();
  }

  move() {
    this.explorerFacade.startMove();
  }

  copy() {
    this.explorerFacade.startCopy();
  }

  delete() {
    this.explorerFacade.deleteSelected();
  }
}