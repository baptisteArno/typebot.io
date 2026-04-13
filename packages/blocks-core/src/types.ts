export type Platform = 'whatsapp' | 'web';

export interface BlockBase {
  id: string;
  type: string;
  unsupportedPlatforms?: Platform[];
}

export interface BlockOptions {
  // Block-specific options
}

export interface Block extends BlockBase {
  options?: BlockOptions;
}

export type BlockType = string;
