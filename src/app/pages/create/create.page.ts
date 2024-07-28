import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonInput, IonContent, IonTextarea, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonText } from '@ionic/angular/standalone';
import { LoadingController, AlertController } from '@ionic/angular';
import { FirestoreService } from '../../services/data/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true,
  imports: [IonText, CommonModule, FormsModule, ReactiveFormsModule, IonText, IonInput, IonTextarea, IonButton, IonLabel, IonItem, IonContent, IonHeader, IonTitle, IonToolbar]
})
export class CreatePage implements OnInit {
  createSongForm!: FormGroup;

  constructor(
    private readonly loadingCtrl: LoadingController,
  private readonly alertCtrl: AlertController,
  private firestoreService: FirestoreService,
  private formBuilder: FormBuilder,
  private router: Router
  ) { }

  ngOnInit() {
    this.createSongForm = this.formBuilder.group({
      albumName: ['', Validators.required],
      artistName: ['', Validators.required],
      songDescription: ['', Validators.required],
      songName: ['', Validators.required],
    });
  }

  async createSong() {
    const loading = await this.loadingCtrl.create();
  
    const albumName = this.createSongForm.value.albumName;
    const artistName = this.createSongForm.value.artistName;
    const songDescription = this.createSongForm.value.songDescription;
    const songName = this.createSongForm.value.songName;
  
    this.firestoreService
    .createSong(albumName, artistName, songDescription, songName)
    .then(
      () => {
        loading.dismiss().then(() => {
          this.router.navigateByUrl('');
        });
      },
      error => {
        loading.dismiss().then(() => {
          console.error(error);
        });
      }
    );

  return await loading.present();
  }
  

}
