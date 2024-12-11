export interface AnimationConfig {
  key: string;
  frameRate: number;
  repeat: number;
  frames: number;
  prefix: string;
}

export interface EntityAssetConfig {
  key: string;
  scale: number;
  defaultTexture?: string;
  animations: AnimationConfig[];
}

export const ASSETS_CONFIG: { [key: string]: EntityAssetConfig } = {
  knight: {
    key: "knight",
    scale: 0.5,
    animations: [
      {
        key: "knight_idle",
        frameRate: 10,
        repeat: -1,
        frames: 12,
        prefix: "assets/sprites/knight/idle",
      },
      {
        key: "knight_walk",
        frameRate: 12,
        repeat: -1,
        frames: 8,
        prefix: "assets/sprites/knight/walk",
      },
    ],
  },
  skeleton: {
    key: "skeleton",
    scale: 1,
    defaultTexture: "skeleton",
    animations: [],
  },
  // Add more entities here as needed
};

// Helper type for getting entity keys
export type EntityType = keyof typeof ASSETS_CONFIG;
