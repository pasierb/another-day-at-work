export const COLORS = {
    backdrop: 0x101316, desk: 0x2a211b, deskEdge: 0x18130f,
    surface: 0x20272d, surfaceRaised: 0x29333b, surfaceMuted: 0x171d22,
    border: 0x52616b, borderStrong: 0x8aa0ad, text: '#f7f1e8', textMuted: '#b8c1c5',
    mint: 0x70d6b4, amber: 0xf2bd61, blue: 0x74b7e8, danger: 0xef7878,
    disabled: 0x657078, focus: 0xffe09b, selected: 0x9bd7ff, shadow: 0x000000
} as const;
export const TYPE = { family: 'Arial, sans-serif', mono: 'ui-monospace, Consolas, monospace', display: 34, title: 22, heading: 15, body: 13, small: 11, micro: 9, lineHeight: { tight: 1.05, normal: 1.25, relaxed: 1.45 } } as const;
export const SPACE = { xxs: 3, xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;
export const SURFACE = { radius: 8, border: 1, selectedBorder: 3, urgentBorder: 3, shadowX: 4, shadowY: 5, shadowAlpha: 0.3, disabledAlpha: 0.58 } as const;
export const SEVERITY = { low: { color: COLORS.mint, marker: '•', label: 'LOW' }, medium: { color: COLORS.amber, marker: '▲', label: 'MEDIUM' }, high: { color: COLORS.danger, marker: '!!', label: 'HIGH' }, critical: { color: COLORS.danger, marker: '!!!', label: 'CRITICAL' } } as const;
export const INTERACTION = { enabled: { alpha: 1, border: COLORS.blue, prefix: '›' }, hover: { alpha: 1, border: COLORS.focus, prefix: '›' }, pressed: { alpha: .86, border: COLORS.focus, prefix: '»' }, selected: { alpha: 1, border: COLORS.selected, prefix: '✓' }, urgent: { alpha: 1, border: COLORS.danger, prefix: '!' }, disabled: { alpha: SURFACE.disabledAlpha, border: COLORS.disabled, prefix: '×' } } as const;
export const DEPTH = { background: 0, environment: 2, decoration: 2, character: 4, panels: 10, content: 20, foreground: 24, controls: 30, overlay: 100 } as const;
