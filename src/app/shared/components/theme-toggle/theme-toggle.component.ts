import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonItem, PopoverController } from '@ionic/angular/standalone';
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline, contrastOutline, checkmarkCircle, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonItem]
})
export class ThemeToggleComponent {
  readonly themeOptions: ThemeMode[] = ['light', 'dark', 'auto'];
  currentTheme = this.themeService.currentTheme;

  constructor(
    private themeService: ThemeService,
    private popoverController: PopoverController
  ) {
    addIcons({
      'sunny-outline': sunnyOutline,
      'moon-outline': moonOutline,
      'contrast-outline': contrastOutline,
      'checkmark-circle': checkmarkCircle,
      'close-outline': closeOutline
    });
  }

  async selectTheme(mode: ThemeMode) {
    void Haptics.impact({ style: ImpactStyle.Light }).catch((error) => {
      console.warn('Haptics impact failed', error);
    });
    
    await this.themeService.setTheme(mode);
    await this.popoverController.dismiss();
  }

  getThemeIcon(mode: ThemeMode): string {
    return this.themeService.getThemeIcon(mode);
  }

  getThemeLabel(mode: ThemeMode): string {
    return this.themeService.getThemeLabel(mode);
  }

  async dismiss() {
    await this.popoverController.dismiss();
  }
}
