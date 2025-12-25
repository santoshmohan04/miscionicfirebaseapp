// src/app/core/services/filesystem.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FileItem } from '../../file-explorer/pages/explorer-model';

@Injectable({ providedIn: 'root' })
export class FilesystemService {

  /**
   * TEMP mock implementation
   * Will be replaced by Capacitor Filesystem / MediaStore
   */
  readFolder(path: string): Observable<FileItem[]> {
    const mockFiles: FileItem[] = [
      {
        name: 'Music',
        path: `${path}/Music`,
        isFolder: true,
        meta: 'Folder',
        selectable: true,
      },
      {
        name: 'song.mp3',
        path: `${path}/song.mp3`,
        isFolder: false,
        type: 'audio',
        meta: '3.4 MB • 3:45',
        selectable: true,
      },
      {
        name: 'video.mp4',
        path: `${path}/video.mp4`,
        isFolder: false,
        type: 'video',
        meta: '24 MB • 720p',
        selectable: true,
      },
    ];

    return of(mockFiles);
  }
}