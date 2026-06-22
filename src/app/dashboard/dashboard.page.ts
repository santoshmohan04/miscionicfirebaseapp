import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { PluginListenerHandle } from '@capacitor/core';
import StorageStats from '../plugins/storage-stats';
import { CircularProgressComponent } from '../shared/components/circular-progress/circular-progress.component';
import { StorageCardComponent } from '../shared/components/storage-card/storage-card.component';
import { ThemeService } from '../core/services/theme.service';
import { ThemeToggleComponent } from '../shared/components/theme-toggle/theme-toggle.component';
import { addIcons } from 'ionicons';
import {
  imageOutline,
  videocamOutline,
  musicalNotesOutline,
  downloadOutline,
  warning,
  informationCircle,
  albums,
  checkmarkCircle,
  checkmarkCircleOutline,
  image,
  videocam,
  musicalNotes,
  document as documentIcon,
  sunnyOutline,
  moonOutline,
  contrastOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, CircularProgressComponent, StorageCardComponent]
})
export class DashboardPage implements OnInit, OnDestroy {
  // Using Angular Signals for automatic change detection
  stats = signal<any>(null);
  largestFiles = signal<any[]>([]);
  loading = signal(true);
  error = signal(false);
  contentLoaded = signal(false);
  
  private appStateListener?: PluginListenerHandle;

  constructor(
    private popoverController: PopoverController,
    private themeService: ThemeService
  ) {
    // Register inside constructor to prevent Vite from tree-shaking it in production builds
    addIcons({
      'image-outline': imageOutline,
      'videocam-outline': videocamOutline,
      'musical-notes-outline': musicalNotesOutline,
      'download-outline': downloadOutline,
      warning,
      'information-circle': informationCircle,
      albums,
      'checkmark-circle': checkmarkCircle,
      'checkmark-circle-outline': checkmarkCircleOutline,
      image,
      videocam,
      'musical-notes': musicalNotes,
      document: documentIcon,
      'sunny-outline': sunnyOutline,
      'moon-outline': moonOutline,
      'contrast-outline': contrastOutline
    });
  }

  ngOnInit() {
    this.setupAppStateListener();
    this.loadStats();
    
    // Safety timeout
    setTimeout(() => {
      if (this.loading() && !this.stats()) {
        console.error('TIMEOUT: loadStats did not complete in 5 seconds');
        this.loading.set(false);
        this.error.set(true);
      }
    }, 5000);
  }

  ionViewDidEnter() {
    this.loadStats();
  }

  ngOnDestroy() {
    this.appStateListener?.remove();
  }

  private setupAppStateListener() {
    if (!Capacitor.isPluginAvailable('App')) {
      console.warn('App plugin is not available; skipping app resume listener in Dashboard.');
      return;
    }

    // Listen for app resume (when user returns from settings)
    App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        console.log('App resumed, reloading stats...');
        await this.loadStats();
      }
    }).then(listener => {
      this.appStateListener = listener;
    });
  }

  async loadStats() {
    try {
      this.loading.set(true);
      this.error.set(false);
      this.contentLoaded.set(false);
      
      // Check permissions first
      try {
        const permStatus = await StorageStats.checkStoragePermission();
        if (!permStatus.granted) {
          this.error.set(true);
          this.loading.set(false);
          return;
        }
      } catch (permError) {
        console.error('Error checking permissions:', permError);
        this.error.set(true);
        this.loading.set(false);
        return;
      }
      
      const result = await StorageStats.getStatistics();
      
      // Update signals - this triggers automatic change detection!
      this.stats.set(result);
      this.loading.set(false);
      
      setTimeout(() => {
        this.contentLoaded.set(true);
      }, 100);
      
      // Trigger haptic feedback on successful load
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available
      }
      
      // Load largest files asynchronously without blocking UI
      this.loadLargestFilesAsync();
    } catch (e) {
      console.error('Error fetching storage stats:', e);
      this.stats.set(null);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  async handleRefresh(event: any) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available
    }
    await this.loadStats();
    event.target.complete();
  }

  async requestPermissionsAndLoad() {
    try {
      console.log('Requesting storage permissions...');
      await StorageStats.requestStoragePermission();
      // On Android 11+, this opens settings. When user returns, app state listener will reload
      // For older Android, try loading immediately
      setTimeout(() => {
        this.loadStats();
      }, 500);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  private async loadLargestFilesAsync() {
    try {
      const largestResult = await StorageStats.getLargestFiles({ limit: 8 });
      this.largestFiles.set(largestResult.files);
    } catch (e) {
      console.error('Error fetching largest files:', e);
      this.largestFiles.set([]);
    }
  }

  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Convert getters to computed signals for better performance
  usagePercentage = computed(() => {
    const stats = this.stats();
    if (!stats) return 0;
    return Math.round((stats.usedSpace / stats.totalSpace) * 100);
  });

  getCategoryPercentage(size: number): number {
    const stats = this.stats();
    if (!stats || !stats.totalSpace) return 0;
    const percentage = (size / stats.totalSpace) * 100;
    return Math.round(Math.min(percentage, 100));
  }

  categories = computed(() => {
    const stats = this.stats();
    if (!stats) return [];
    return [
      {
        name: 'Images',
        icon: imageOutline,
        size: stats.imagesSize,
        count: stats.imagesCount || 0,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#667eea',
        route: '/category/images'
      },
      {
        name: 'Videos',
        icon: videocamOutline,
        size: stats.videosSize,
        count: stats.videosCount || 0,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#f093fb',
        route: '/category/videos'
      },
      {
        name: 'Audio',
        icon: musicalNotesOutline,
        size: stats.audioSize,
        count: stats.audioCount || 0,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#4facfe',
        route: '/category/audio'
      },
      {
        name: 'Downloads',
        icon: downloadOutline,
        size: stats.documentsSize,
        count: stats.documentsCount || 0,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: '#fa709a',
        route: '/category/downloads'
      }
    ];
  });

  async openThemeSelector(event: Event) {
    const popover = await this.popoverController.create({
      component: ThemeToggleComponent,
      event: event,
      translucent: true,
      showBackdrop: true,
      cssClass: 'theme-popover'
    });
    await popover.present();
  }

  getThemeIcon(): string {
    return this.themeService.getThemeIcon(this.themeService.currentTheme());
  }

  recommendations = computed(() => {
    const stats = this.stats();
    if (!stats) return [];
    
    const recs = [];
    const usagePercent = this.usagePercentage();
    
    // Storage warning
    if (usagePercent > 90) {
      recs.push({
        icon: warning,
        color: 'danger',
        title: 'Storage Almost Full',
        description: 'Your storage is ' + usagePercent + '% full. Consider cleaning up large files.',
        action: 'Review Large Files'
      });
    } else if (usagePercent > 75) {
      recs.push({
        icon: informationCircle,
        color: 'warning',
        title: 'Storage Running Low',
        description: 'You\'ve used ' + usagePercent + '% of your storage. Keep an eye on large files.',
        action: 'Manage Storage'
      });
    }
    
    // Large category recommendations
    const categories = this.categories();
    const largestCategory = categories.reduce((prev, current) => 
      prev.size > current.size ? prev : current
    );
    
    if (largestCategory && largestCategory.size > stats.totalSpace * 0.3) {
      recs.push({
        icon: albums,
        color: 'primary',
        title: largestCategory.name + ' Taking Up Space',
        description: largestCategory.name + ' occupy ' + this.formatBytes(largestCategory.size) + '. Review and delete unwanted files.',
        action: 'Browse ' + largestCategory.name
      });
    }
    
    // Free space available
    if (usagePercent < 50) {
      recs.push({
        icon: checkmarkCircle,
        color: 'success',
        title: 'Storage Looks Good',
        description: 'You have ' + this.formatBytes(stats.freeSpace) + ' of free space available.',
        action: 'Keep It Up'
      });
    }
    
    return recs;
  });

  getCategoryIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return image;
    if (mimeType.startsWith('video/')) return videocam;
    if (mimeType.startsWith('audio/')) return musicalNotes;
    return documentIcon;
  }

  getCategoryName(category: string): string {
    const names: any = {
      'image': 'Images',
      'video': 'Videos',
      'audio': 'Audio',
      'document': 'Downloads'
    };
    return names[category] || 'Files';
  }

  getCategoryRoute(category: string): string {
    const routes: any = {
      'image': '/category/images',
      'video': '/category/videos',
      'audio': '/category/audio',
      'document': '/category/downloads'
    };
    return routes[category] || '/explorer';
  }
}