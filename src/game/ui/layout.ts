export type Region = Readonly<{ x: number; y: number; width: number; height: number }>;
export const GAME_SIZE = { width: 1280, height: 720 } as const;
export const REGIONS = {
    dayClock: { x: 984, y: 4, width: 292, height: 72 },
    taskQueue: { x: 4, y: 84, width: 250, height: 562 },
    laptop: { x: 430, y: 340, width: 420, height: 306 },
    statusSidebar: { x: 1024, y: 84, width: 252, height: 562 },
    quickActions: { x: 264, y: 654, width: 750, height: 62 }
} satisfies Record<string, Region>;
