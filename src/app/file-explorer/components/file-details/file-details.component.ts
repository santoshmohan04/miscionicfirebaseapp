import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonIcon,
  IonList,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';
import { FileItem } from '../../pages/explorer-model';

@Component({
  selector: 'app-file-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonIcon,
    IonList,
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
      <ion-list>

        <ion-item>
          <ion-icon slot="start" [name]="icon" size="large"></ion-icon>
          <ion-label>
            <h2>{{ file.name }}</h2>
            <p>{{ file.isFolder ? 'Folder' : file.type }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Type</h2>
            <p>{{ file.type || 'Unknown' }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Path</h2>
            <p class="mono">{{ file.path }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="file.size">
          <ion-label>
            <h2>Size</h2>
            <p>{{ file.size | number }} bytes</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="file.lastModified">
          <ion-label>
            <h2>Last modified</h2>
            <p>{{ file.lastModified | date:'medium' }}</p>
          </ion-label>
        </ion-item>

      </ion-list>
    </ion-content>
  `,
  styles: [`
    .mono {
      font-family: monospace;
      font-size: 12px;
      opacity: 0.8;
    }
  `],
})
export class FileDetailsComponent {
  @Input() file!: FileItem;
  private modalCtrl = inject(ModalController);

  get icon() {
    if (this.file.isFolder) return 'folder-outline';
    if (this.file.type === 'audio') return 'musical-notes-outline';
    if (this.file.type === 'video') return 'videocam-outline';
    return 'document-outline';
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}