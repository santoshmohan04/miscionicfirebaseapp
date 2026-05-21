import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet, AlertController, Platform } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import StorageStats from './plugins/storage-stats';
import { ThemeService } from './core/services/theme.service';
import { Subscription } from 'rxjs';
import { registerIcons } from './icons';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit, OnDestroy {
  private backButtonSub?: Subscription;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private themeService: ThemeService,
    private platform: Platform
  ) {
    // Theme service is auto-initialized via constructor
    registerIcons();
  }

  async ngOnInit() {
    // Permission handling moved to dashboard page to avoid race conditions
    this.setupBackButtonHandler();
  }

  ngOnDestroy() {
    this.backButtonSub?.unsubscribe();
  }

  private setupBackButtonHandler() {
    // Handle Android hardware back button using Ionic's Platform service
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Hardware back button pressed, current URL:', this.router.url);
      
      // Check if we are on the dashboard/root page
      if (this.router.url === '/dashboard' || this.router.url === '/') {
        this.showExitConfirmation();
      } else {
        // Let Ionic safely handle popping the page or closing open overlays
        processNextHandler();
      }
    });
  }

  private async showExitConfirmation() {
    const alert = await this.alertController.create({
      header: 'Exit App',
      message: 'Do you want to exit the app?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Exit',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });
    await alert.present();
  }

  async checkAndRequestPermissions() {
    try {
      const permissionStatus = await StorageStats.checkStoragePermission();

      if (!permissionStatus.granted) {
        await this.showPermissionDialog();
      } else {
        console.log('Storage permissions already granted');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      // Fallback to Capacitor Filesystem permission
      await this.requestFallbackPermission();
    }
  }

  private async showPermissionDialog() {
    const alert = await this.alertController.create({
      header: 'Storage Permission Required',
      message: 'This file manager app requires storage access to browse and manage your files. You will be redirected to settings to grant this permission.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Not Now',
          role: 'cancel',
          handler: () => {
            this.showPermissionDeniedWarning();
          }
        },
        {
          text: 'Grant Permission',
          handler: async () => {
            await this.requestStoragePermission();
          }
        }
      ]
    });
    await alert.present();
  }

  private async requestStoragePermission() {
    try {
      if (Capacitor.getPlatform() === 'android') {
        await StorageStats.requestStoragePermission();
        // Note: On Android 11+, this opens settings. When user returns,
        // the app will resume and dashboard will auto-refresh via App state listener
        console.log('Permission request initiated');
      }
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      // Fallback to older permission system
      await this.requestFallbackPermission();
    }
  }

  private async requestFallbackPermission() {
    try {
      const result = await Filesystem.requestPermissions();
      if (result.publicStorage === 'granted') {
        this.showPermissionGrantedMessage();
      } else {
        this.showPermissionDeniedWarning();
      }
    } catch (error) {
      console.error('Fallback permission request failed:', error);
    }
  }

  private async showPermissionGrantedMessage() {
    const alert = await this.alertController.create({
      header: 'Permission Granted',
      message: 'You can now browse and manage your files.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showPermissionDeniedWarning() {
    const alert = await this.alertController.create({
      header: 'Limited Functionality',
      message: 'Without storage permission, this app cannot access your files. You can grant permission later from app settings.',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        },
        {
          text: 'Open Settings',
          handler: async () => {
            await this.requestStoragePermission();
          }
        }
      ]
    });
    await alert.present();
  }
}
