export interface SafItem {
  uri: string;
  name: string;
}

export interface SafFileOpsPlugin {
  deleteItems(options: { items: SafItem[] }): Promise<void>;
  copyItems(options: { items: SafItem[]; targetUri: string }): Promise<void>;
  moveItems(options: { items: SafItem[]; targetUri: string }): Promise<void>;
}