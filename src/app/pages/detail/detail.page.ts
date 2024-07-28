import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Song } from '../../models/song.interface';
import { FirestoreService } from '../../services/data/firestore.service';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule],
  providers: [FirestoreService, AlertController]
})
export class DetailPage implements OnInit {
  song: BehaviorSubject<Song | null> = new BehaviorSubject<Song | null>(null);

  constructor(
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    const songId: string | null = this.route.snapshot.paramMap.get('id');
    if (songId) {
      this.firestoreService.getSongDetail(songId).subscribe({
        next: (song:any) => {
          this.song.next(song);
        },
        error: err => {
          console.error('Error fetching song:', err);
          this.presentErrorAlert('Error fetching song details.');
        }
      });
    } else {
      console.error('No song ID found in route parameters.');
      this.presentErrorAlert('Invalid song ID.');
    }
  }

  async deleteSong(): Promise<void> {
    const song = this.song.value;
    if (song?.id && song.songName) {
    const alert = await this.alertController.create({
      message: `Are you sure you want to delete ${song.songName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: 'Okay',
          handler: () => {
            this.firestoreService.deleteSong(song.id).then(() => {
              this.router.navigateByUrl('/'); // Navigate to the home page or another appropriate page
            }).catch(err => {
              console.error('Error deleting song:', err);
              this.presentErrorAlert('Error deleting song.');
            });
          },
        },
      ],
    });

    await alert.present();
  } else {
    console.error('Error: Song ID or Name is not defined.');
    this.presentErrorAlert('Song details are missing.');
  }
  }

  private async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
