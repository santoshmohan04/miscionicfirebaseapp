import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { FileItem } from '../../pages/explorer-model';

@Component({
  selector: 'app-file-details',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>File details</ion-title>
        <ion-button slot="end" fill="clear" (click)="dismiss()">
          <ion-icon name="close-outline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-item lines="none">
        <ion-icon
          slot="start"
          [name]="icon"
          size="large"
        ></ion-icon>

        <ion-label>
          <h2>{{ file.name }}</h2>
          <p>{{ file.isFolder ? 'Folder' : file.type }}</p>
        </ion-label>
      </ion-item>

      <ion-item>
        <ion-label>Path</ion-label>
        <p>{{ file.path }}</p>
      </ion-item>

      <ion-item *ngIf="file.meta">
        <ion-label>Info</ion-label>
        <p>{{ file.meta }}</p>
      </ion-item>

      <ion-item>
        <ion-label>Type</ion-label>
        <p>{{ file.isFolder ? 'Folder' : file.type }}</p>
      </ion-item>
    </ion-content>
  `,
})
export class FileDetailsComponent {
  @Input() file!: FileItem;

  get icon() {
    if (this.file.isFolder) return 'folder-outline';
    if (this.file.type === 'audio') return 'musical-notes-outline';
    if (this.file.type === 'video') return 'videocam-outline';
    return 'document-outline';
  }

  dismiss() {
    document.querySelector('ion-modal')?.dismiss();
  }
}