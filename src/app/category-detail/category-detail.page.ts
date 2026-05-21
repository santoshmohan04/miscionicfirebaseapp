import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  ToastController,
  IonImg
} from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { FilesystemService } from '../core/services/filesystem.service';
import StorageStats from '../plugins/storage-stats';

interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  dateModified: number;
  thumbnailUri?: string;
  duration?: number;
  width?: number;
  height?: number;
  // Pre-computed fields for performance
  formattedSize?: string;
  formattedDate?: string;
  formattedDuration?: string;
  iconName?: string;
}

type SortOption = 'size' | 'name' | 'date';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.page.html',
  styleUrls: ['./category-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButton,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonImg
  ]
})
export class CategoryDetailPage implements OnInit {
  // Using Angular Signals for reactive state management
  categoryType = signal<string>('');
  categoryName = signal<string>('');
  categoryIcon = signal<string>('');
  files = signal<FileItem[]>([]);
  loading = signal(true);
  sortBy = signal<SortOption>('size');
  hasPermission = signal(false);
  errorMessage = signal<string | null>(null);
  totalFilesInStorage = signal<number>(0);

  
  // Computed signals for derived state
  filteredFiles = computed(() => {
    const filesList = this.files();
    const sort = this.sortBy();
    const sorted = [...filesList];
    
    switch (sort) {
      case 'size':
        sorted.sort((a, b) => b.size - a.size);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        sorted.sort((a, b) => b.dateModified - a.dateModified);
        break;
    }
    
    return sorted;
  });

  totalSize = computed(() => {
    return this.files().reduce((sum, file) => sum + file.size, 0);
  });

  private categoryConfig: Record<string, { name: string; icon: string; color: string }> = {
    images: { name: 'Images', icon: 'image-outline', color: '#667eea' },
    videos: { name: 'Videos', icon: 'videocam-outline', color: '#f093fb' },
    audio: { name: 'Audio', icon: 'musical-notes-outline', color: '#4facfe' },
    downloads: { name: 'Downloads', icon: 'download-outline', color: '#fa709a' }
  };

  constructor(
    private route: ActivatedRoute,
    private filesystemService: FilesystemService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const type = this.route.snapshot.paramMap.get('type') || '';
    this.categoryType.set(type);
    
    const config = this.categoryConfig[type];
    
    if (config) {
      this.categoryName.set(config.name);
      this.categoryIcon.set(config.icon);
    }

    // Check permissions first
    await this.checkPermissions();
    if (this.hasPermission()) {
      await this.loadFiles();
    }
  }

  async checkPermissions() {
    try {
      const permStatus = await StorageStats.checkStoragePermission();
      console.log('Permission status:', permStatus);
      this.hasPermission.set(permStatus.granted);
      
      if (!permStatus.granted) {
        this.errorMessage.set('Storage permission required to view files');
        this.loading.set(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      this.hasPermission.set(false);
      this.errorMessage.set('Unable to check permissions');
      this.loading.set(false);
    }
  }

  async requestPermissions() {
    try {
      console.log('Requesting storage permissions...');
      await StorageStats.requestStoragePermission();
      // After requesting, check again
      setTimeout(async () => {
        await this.checkPermissions();
        if (this.hasPermission()) {
          await this.loadFiles();
        }
      }, 500);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      this.errorMessage.set('Failed to request permissions');
    }
  }

  async loadFiles() {
    try {
      this.loading.set(true);
      this.errorMessage.set(null);
      
      console.log('=== Loading files for category ===');
      console.log('Category:', this.categoryType());
      
      const filesData = await this.filesystemService.getFilesByCategory(this.categoryType());
      console.log('Files loaded successfully:', filesData.length);
      
      // Check if we're getting limited results
      if (filesData.length === 500 || filesData.length === 1000) {
        console.warn('⚠️ Possible query limit reached:', filesData.length);
      }
      
      // Log file details for debugging
      if (filesData.length > 0) {
        console.log('First file:', filesData[0]);
        console.log('Last file:', filesData[filesData.length - 1]);
      } else {
        console.warn('⚠️ No files returned for category:', this.categoryType());
      }
      
      // Convert native content:// URIs to web-accessible URIs to prevent "Not allowed to load local resource"
      const processedFiles = filesData.map((file: FileItem) => {
        if (file.thumbnailUri) {
          // HTML <img> tags cannot natively render raw video files (like .mp4) as images.
          // We remove the URI for videos so the UI gracefully falls back to the video SVG icon.
          if (file.mimeType && file.mimeType.startsWith('video/')) {
            delete file.thumbnailUri;
          } else {
            file.thumbnailUri = Capacitor.convertFileSrc(file.thumbnailUri);
          }
        }
        
        // Pre-compute formatted values to prevent template function calls from lagging the UI
        file.formattedSize = this.formatBytes(file.size);
        file.formattedDate = this.formatDate(file.dateModified);
        if (file.duration) file.formattedDuration = this.formatDuration(file.duration);
        file.iconName = this.getFileIcon(file.mimeType || '');
        
        return file;
      });
      
      this.files.set(processedFiles);
      this.totalFilesInStorage.set(processedFiles.length);
      
      console.log('Total files in storage for', this.categoryType(), ':', filesData.length);
    } catch (error) {
      console.error('Error loading files:', error);
      this.errorMessage.set('Failed to load files: ' + (error as any).message);
      this.files.set([]);
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
    
    if (this.hasPermission()) {
      await this.loadFiles();
    } else {
      await this.checkPermissions();
    }
    
    event.target.complete();
  }

  changeSortOption(option: SortOption) {
    this.sortBy.set(option);
    // filteredFiles will automatically recompute
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image-outline';
    if (mimeType.startsWith('video/')) return 'videocam-outline';
    if (mimeType.startsWith('audio/')) return 'musical-note-outline';
    if (mimeType.includes('pdf')) return 'document-text-outline';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive-outline';
    return 'document-outline';
  }

  trackByFileId(index: number, file: FileItem): string {
    return file.id;
  }

  async openFile(file: FileItem) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available
    }

    try {
      await (StorageStats as any).openFile({
        id: file.id,
        category: this.categoryType(),
        mimeType: file.mimeType || '*/*'
      });
    } catch (error) {
      console.error('Error opening file:', error);
      const toast = await this.toastCtrl.create({
        message: 'No app found to open this file type.',
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
    }
  }

  async shareFile(file: FileItem) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available
    }
    // TODO: Implement file sharing
    console.log('Sharing file:', file);
  }

  async deleteFile(file: FileItem) {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // Haptics not available
    }
    // TODO: Implement file deletion with confirmation
    console.log('Deleting file:', file);
  }
}
