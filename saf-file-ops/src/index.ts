import { registerPlugin } from '@capacitor/core';
import type { SafFileOpsPlugin } from './definitions';

export const SafFileOps = registerPlugin<SafFileOpsPlugin>('SafFileOps');

export * from './definitions';