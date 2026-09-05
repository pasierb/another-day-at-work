export type Region = Readonly<{ x: number; y: number; width: number; height: number }>;
export const GAME_SIZE = { width: 1280, height: 720 } as const;
export const REGIONS = {
    resourceHud: { x: 24, y: 20, width: 926, height: 92 },
    dayClock: { x: 966, y: 20, width: 290, height: 92 },
    taskQueue: { x: 24, y: 128, width: 274, height: 504 },
    laptop: { x: 314, y: 128, width: 636, height: 504 },
    alerts: { x: 966, y: 128, width: 290, height: 504 },
    quickActions: { x: 298, y: 648, width: 668, height: 56 }
} satisfies Record<string, Region>;
