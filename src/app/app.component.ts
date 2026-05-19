import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import StorageStats from './plugins/storage-stats';
import { ThemeService } from './core/services/theme.service';
import {
  folderOutline,
  imageOutline,
  musicalNotesOutline,
  videocamOutline,
  documentTextOutline,
  archiveOutline,
  appsOutline,
  searchOutline,
  chevronForwardOutline,
  menuOutline,
  arrowBackOutline,
  settingsOutline
} from 'ionicons/icons';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit, OnDestroy {
  private backButtonListener?: PluginListenerHandle;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private themeService: ThemeService
  ) {
    // Theme service is auto-initialized via constructor
    addIcons({
      folderOutline,
      imageOutline,
      musicalNotesOutline,
      videocamOutline,
      documentTextOutline,
      archiveOutline,
      appsOutline,
      searchOutline,
      chevronForwardOutline,
      menuOutline,
      arrowBackOutline,
      settingsOutline,
    });
  }

  async ngOnInit() {
    // Permission handling moved to dashboard page to avoid race conditions
    this.setupBackButtonHandler();
  }

  ngOnDestroy() {
    this.backButtonListener?.remove();
  }

  private setupBackButtonHandler() {
    // Handle Android hardware back button
    App.addListener('backButton', ({ canGoBack }) => {
      console.log('Hardware back button pressed, canGoBack:', canGoBack);
      
      if (canGoBack) {
        // Navigate back in the app
        window.history.back();
      } else {
        // We're at the root, show exit confirmation
        this.showExitConfirmation();
      }
    }).then(listener => {
      this.backButtonListener = listener;
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
