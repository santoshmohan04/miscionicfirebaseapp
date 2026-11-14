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
  IonCheckbox,
  IonPopover,
  IonList,
  AlertController,
  ToastController,
  IonImg
} from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { FilesystemService } from '../core/services/filesystem.service';
import StorageStats from '../plugins/storage-stats';
import { SafFileOps } from 'saf-file-ops';

interface FileItem {
  id: string;
  uri: string;
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
    IonCheckbox,
    IonPopover,
    IonList,
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
  layout = signal<'list' | 'grid'>('list');
  selectionMode = signal(false);
  operationBusy = signal(false);
  selectedIds = signal<Set<string>>(new Set());
  selectedFiles = computed(() => this.files().filter(file => this.selectedIds().has(file.id)));

  
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
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
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
      this.clearSelection();
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

  clearSelection() {
    this.selectedIds.set(new Set());
    this.selectionMode.set(false);
  }

  toggleSelection(file: FileItem) {
    if (this.operationBusy()) return;
    this.selectedIds.update(current => {
      const selected = new Set(current);
      if (selected.has(file.id)) {
        selected.delete(file.id);
      } else {
        selected.add(file.id);
      }
      return selected;
    });
  }

  onFileClick(file: FileItem) {
    if (this.operationBusy()) return;
    if (this.selectionMode()) {
      this.toggleSelection(file);
    } else {
      void this.openFile(file);
    }
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
    await this.shareFiles([file]);
  }

  async shareFiles(files: FileItem[]) {
    if (files.length === 0) return;
    try {
      await StorageStats.shareFiles({
        category: this.categoryType(),
        ids: files.map(file => file.id),
        mimeTypes: files.map(file => file.mimeType || '*/*')
      });
    } catch (error) {
      console.error('Error sharing files:', error);
      const toast = await this.toastCtrl.create({
        message: 'Unable to share the selected files.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async renameSelected() {
    const files = this.selectedFiles();
    if (this.operationBusy() || files.length !== 1) return;
    this.operationBusy.set(true);
    let attempted = false;
    try {
      const file = files[0];
      const alert = await this.alertCtrl.create({
        header: 'Rename file',
        inputs: [{ name: 'name', type: 'text', value: file.name, placeholder: 'File name' }],
        buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Rename', role: 'confirm' }]
      });
      await alert.present();
      const result = await alert.onDidDismiss<{ values?: { name?: string } }>();
      if (result.role !== 'confirm') return;
      const newName = result.data?.values?.name;
      if (!newName || !newName.trim()) throw new Error('Enter a valid file name.');
      if (newName === file.name) return;
      attempted = true;
      await SafFileOps.renameMedia({ uri: file.uri, name: file.name, newName });
      await this.showOperationResult('Rename complete', `Renamed ${file.name} to ${newName}.`);
    } catch (error) {
      await this.showOperationResult('Rename failed', this.errorText(error));
    } finally {
      if (attempted) await this.loadFiles();
      this.operationBusy.set(false);
    }
  }

  async deleteSelected() {
    const files = this.selectedFiles();
    if (this.operationBusy() || files.length === 0) return;
    this.operationBusy.set(true);
    let completed = 0;
    let attempted = false;
    try {
      if (!await this.confirmOperation('Delete files?', `Permanently delete ${files.length} selected ${files.length === 1 ? 'file' : 'files'}?`)) return;
      for (const file of files) {
        attempted = true;
        try {
          await SafFileOps.deleteMedia({ uri: file.uri, name: file.name });
          completed++;
        } catch (error) {
          throw new Error(`${file.name}: ${this.errorText(error)}`);
        }
      }
      await this.showOperationResult('Delete complete', `Deleted ${completed} ${completed === 1 ? 'file' : 'files'}.`);
    } catch (error) {
      await this.showOperationResult('Delete stopped', `${completed} of ${files.length} completed. ${this.errorText(error)}`);
    } finally {
      if (attempted) await this.loadFiles();
      this.operationBusy.set(false);
    }
  }

  async transferSelected(move: boolean) {
    const files = this.selectedFiles();
    if (this.operationBusy() || files.length === 0) return;
    this.operationBusy.set(true);
    let completed = 0;
    let attempted = false;
    try {
      if (new Set(files.map(file => file.name)).size !== files.length) {
        throw new Error('The selection contains files with the same name. Transfer them separately.');
      }
      let destination;
      try {
        destination = await SafFileOps.pickRoot();
      } catch (error) {
        if (this.errorText(error) === 'Picker cancelled') return;
        throw error;
      }
      const { items } = await SafFileOps.listFolder({ uri: destination.uri });
      const collisions = files.filter(file => items.some(item => item.name === file.name));
      if (collisions.length > 0) {
        const names = collisions.map(file => file.name).join(', ');
        if (!await this.confirmOperation('Replace existing files?', `The destination contains: ${names}. Replace them?`)) return;
      }
      for (const file of files) {
        attempted = true;
        try {
          await SafFileOps.transferMedia({
            uri: file.uri,
            name: file.name,
            targetUri: destination.uri,
            existingUri: items.find(item => item.name === file.name)?.uri,
            move
          });
          completed++;
        } catch (error) {
          throw new Error(`${file.name}: ${this.errorText(error)}`);
        }
      }
      await this.showOperationResult(move ? 'Move complete' : 'Copy complete', `${completed} ${completed === 1 ? 'file' : 'files'} ${move ? 'moved' : 'copied'}.`);
    } catch (error) {
      await this.showOperationResult(move ? 'Move stopped' : 'Copy stopped', `${completed} of ${files.length} completed. ${this.errorText(error)}`);
    } finally {
      if (attempted) await this.loadFiles();
      this.operationBusy.set(false);
    }
  }

  private errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private async confirmOperation(header: string, message: string): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header, message,
      buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Confirm', role: 'confirm' }]
    });
    await alert.present();
    return (await alert.onDidDismiss()).role === 'confirm';
  }

  private async showOperationResult(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
