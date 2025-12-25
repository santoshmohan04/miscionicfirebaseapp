// src/app/core/services/filesystem.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FileItem } from '../../file-explorer/pages/explorer-model';

@Injectable({
  providedIn: 'root'
})
export class FilesystemService {

  constructor() {}

  /**
   * Temporary mock implementation
   * Later we will replace this with Capacitor Filesystem / MediaStore
   */
  readFolder(path: string): Observable<FileItem[]> {
    const mockFiles: FileItem[] = [
      {
        name: 'Music',
        path: `${path}/Music`,
        isFolder: true,
        meta: 'Folder'
      },
      {
        name: 'song.mp3',
        path: `${path}/song.mp3`,
        isFolder: false,
        type: 'audio',
        meta: '3.4 MB • 3:45'
      },
      {
        name: 'video.mp4',
        path: `${path}/video.mp4`,
        isFolder: false,
        type: 'video',
        meta: '24 MB • 720p'
      }
    ];

    return of(mockFiles);
  }
}