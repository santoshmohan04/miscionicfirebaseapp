import StorageStats from 'src/app/plugins/storage-stats';
import { FilesystemService, StorageAccessError } from './filesystem.service';

describe('FilesystemService', () => {
  let service: FilesystemService;

  beforeEach(() => {
    service = new FilesystemService();
  });

  it('returns an empty list when the native query has no files', async () => {
    spyOn(StorageStats, 'checkStoragePermission').and.resolveTo({ granted: true });
    spyOn(StorageStats, 'getFilesByCategory').and.resolveTo({ files: [] });

    await expectAsync(service.getFilesByCategory('images')).toBeResolvedTo([]);
  });

  it('reports denied storage access without querying files', async () => {
    spyOn(StorageStats, 'checkStoragePermission').and.resolveTo({ granted: false });
    const query = spyOn(StorageStats, 'getFilesByCategory');

    await expectAsync(service.getFilesByCategory('images'))
      .toBeRejectedWith(jasmine.objectContaining({
        code: 'permission-denied',
      }));
    expect(query).not.toHaveBeenCalled();
  });

  it('reports native query failures instead of returning mock files', async () => {
    spyOn(StorageStats, 'checkStoragePermission').and.resolveTo({ granted: true });
    spyOn(StorageStats, 'getFilesByCategory').and.rejectWith(new Error('Native query failed'));

    let error: StorageAccessError | undefined;
    try {
      await service.getFilesByCategory('images');
    } catch (caught) {
      error = caught as StorageAccessError;
    }

    expect(error).toEqual(jasmine.any(StorageAccessError));
    expect(error?.code).toBe('query-failed');
  });
});
