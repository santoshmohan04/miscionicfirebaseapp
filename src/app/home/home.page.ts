import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FirestoreService } from '../services/data/firestore.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Song } from '../models/song.interface';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {addIcons} from 'ionicons';
import { addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonIcon, IonButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, RouterModule, CommonModule],
})

export class HomePage {
  songList: Observable<Song[]> = this.firestoreService.getSongList();

  constructor(private firestoreService: FirestoreService) {
    addIcons({ addOutline });
  }
}
