import { Injectable, signal, effect } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal for current theme mode
  private readonly themeMode = signal<ThemeMode>('auto');
  
  // Public readonly signal
  readonly currentTheme = this.themeMode.asReadonly();

  // System preference matcher
  private darkModeMediaQuery?: MediaQueryList;

  constructor() {
    // Effect to apply theme whenever it changes
    effect(() => {
      const mode = this.themeMode();
      this.applyTheme(mode);
      console.log('Theme effect triggered:', mode);
    });
    
    // Initialize theme (must happen after effect is registered)
    this.initializeTheme();
  }

  private async initializeTheme() {
    try {
      // Load saved preference
      const { value } = await Preferences.get({ key: 'theme-mode' });
      const savedMode = (value as ThemeMode) || 'light'; // Default to light instead of auto
      console.log('Loaded theme preference:', savedMode);
      this.themeMode.set(savedMode);
      
      // Force immediate application
      this.applyTheme(savedMode);
      
      console.log('Theme initialized and applied:', savedMode);
    } catch (error) {
      console.error('Error loading theme preference:', error);
      this.themeMode.set('light');
      this.applyTheme('light');
    }

    // Setup system theme listener
    this.setupSystemThemeListener();
  }

  private setupSystemThemeListener() {
    if (window.matchMedia) {
      this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Listen for system theme changes
      this.darkModeMediaQuery.addEventListener('change', (e) => {
        console.log('System theme changed:', e.matches ? 'dark' : 'light');
        // Only react if we're in auto mode
        if (this.themeMode() === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  async setTheme(mode: ThemeMode) {
    try {
      // Save preference
      await Preferences.set({
        key: 'theme-mode',
        value: mode
      });
      
      // Update signal (this will trigger the effect to apply the theme)
      this.themeMode.set(mode);
      
      console.log('Theme set to:', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }

  private applyTheme(mode: ThemeMode) {
    const body = document.body;
    
    console.log('Applying theme:', mode);
    console.log('Current body classes before:', body.className);
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    
    // Add the selected mode class
    body.classList.add(`theme-${mode}`);
    
    // Apply actual dark/light class based on mode
    if (mode === 'auto') {
      // Use system preference
      const prefersDark = this.darkModeMediaQuery?.matches ?? false;
      console.log('Auto mode - system prefers dark:', prefersDark);
      this.toggleDarkClass(prefersDark);
    } else {
      // Use explicit mode
      console.log('Explicit mode - is dark:', mode === 'dark');
      this.toggleDarkClass(mode === 'dark');
    }
    
    console.log('Current body classes after:', body.className);
    console.log('Theme applied successfully:', mode);
  }

  private toggleDarkClass(isDark: boolean) {
    const body = document.body;
    
    if (isDark) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    
    // Update meta theme-color for status bar
    this.updateMetaThemeColor(isDark);
  }

  private updateMetaThemeColor(isDark: boolean) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = isDark ? '#1e1e1e' : '#ffffff';
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  getThemeIcon(mode: ThemeMode): string {
    switch (mode) {
      case 'light':
        return 'sunny-outline';
      case 'dark':
        return 'moon-outline';
      case 'auto':
        return 'contrast-outline';
    }
  }

  getThemeLabel(mode: ThemeMode): string {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto (System)';
    }
  }
}
