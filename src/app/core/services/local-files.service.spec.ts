import { FileItem } from 'src/app/file-explorer/models/explorer-model';
import { FilesystemService } from './filesystem.service';
import { LocalFilesService } from './local-files.service';

describe('LocalFilesService', () => {
  let filesystem: jasmine.SpyObj<FilesystemService>;
  let service: LocalFilesService;

  beforeEach(() => {
    filesystem = jasmine.createSpyObj<FilesystemService>('FilesystemService', [
      'getStorageList',
      'getSavedRoot',
      'pickRootFolder',
      'readSafFolder',
    ]);
    service = new LocalFilesService(filesystem);
  });

  it('rejects current URI access before a root has been opened', () => {
    expect(() => service.currentUri).toThrowError('No storage folder is open');
  });

  it('does not change the current path when opening a folder fails', async () => {
    filesystem.getSavedRoot.and.resolveTo({ uri: 'root-uri', name: 'Root' });
    filesystem.readSafFolder.and.resolveTo([]);
    await service.openStorage('Internal Storage');

    filesystem.readSafFolder.and.rejectWith(new Error('Folder unavailable'));
    const folder: FileItem = {
      name: 'Child',
      path: 'child-uri',
      isFolder: true,
      type: 'folder',
    };

    await expectAsync(service.openFolder(folder)).toBeRejected();
    expect(service.currentUri).toBe('root-uri');
  });

  it('does not change the current path when loading a parent folder fails', async () => {
    filesystem.getSavedRoot.and.resolveTo({ uri: 'root-uri', name: 'Root' });
    filesystem.readSafFolder.and.resolveTo([]);
    await service.openStorage('Internal Storage');

    await service.openFolder({
      name: 'Child',
      path: 'child-uri',
      isFolder: true,
      type: 'folder',
    });

    filesystem.readSafFolder.and.rejectWith(new Error('Parent unavailable'));
    await expectAsync(service.goBack()).toBeRejected();
    expect(service.currentUri).toBe('child-uri');
  });
});
