export interface SafItem {
  uri: string;
  name: string;
}

export interface SafFileItem {
  uri: string;
  name: string;
  isFolder: boolean;
  size?: number;
  mimeType?: string;
  lastModified?: number;
}

export interface SafRoot {
  uri: string;
  name: string;
}

export interface SafFileOpsPlugin {
  deleteItems(options: { items: SafItem[] }): Promise<void>;
  copyItems(options: { items: SafItem[]; targetUri: string }): Promise<void>;
  moveItems(options: { items: SafItem[]; targetUri: string }): Promise<void>;
  pickRoot(): Promise<SafRoot>;
  listFolder(options: { uri: string }): Promise<{ items: SafFileItem[] }>;
  getPersistedRoot(options?: { key?: string }): Promise<SafRoot | null>;
  persistRoot(options: { uri: string; name: string; key?: string }): Promise<void>;
  renameMedia(options: { uri: string; name: string; newName: string }): Promise<void>;
  deleteMedia(options: { uri: string; name: string }): Promise<void>;
  transferMedia(options: {
    uri: string;
    name: string;
    targetUri: string;
    existingUri?: string;
    move: boolean;
  }): Promise<void>;
}