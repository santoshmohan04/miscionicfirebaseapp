import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline, contrastOutline, checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
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
      'checkmark-circle': checkmarkCircle
    });
  }

  async selectTheme(mode: ThemeMode) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available
    }
    
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
