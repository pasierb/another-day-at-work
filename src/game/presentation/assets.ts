import type { StressStage } from './PresentationState';

export type PresentationAssetClass='critical'|'optional';
export type PresentationAssetGroup='background'|'environment'|'character'|'ui'|'portrait'|'service'|'props'|'foreground';
export interface PresentationAsset {readonly key:string;readonly path:string;readonly classification:PresentationAssetClass;readonly group:PresentationAssetGroup;readonly maxBytes:number;readonly display?:Readonly<{x:number;y:number;width:number;height:number}>}

export const PRESENTATION_ASSETS = [
 {key:'presentation.background.office',path:'assets/presentation/office-background.webp',classification:'critical',group:'background',maxBytes:358_400},
 {key:'presentation.environment.desk',path:'assets/presentation/desk-environment.webp',classification:'critical',group:'environment',maxBytes:512_000},
 {key:'presentation.character.calm',path:'assets/presentation/developer-calm.webp',classification:'optional',group:'character',maxBytes:512_000,display:{x:468,y:40,width:344,height:230}},
 {key:'presentation.ui.laptop-shell',path:'assets/presentation/laptop-shell.webp',classification:'critical',group:'ui',maxBytes:512_000,display:{x:302,y:116,width:660,height:528}},
 {key:'presentation.foreground.frame',path:'assets/presentation/foreground-frame.webp',classification:'optional',group:'foreground',maxBytes:512_000},
 {key:'presentation.identities.atlas',path:'assets/presentation/identity-atlas.png',classification:'optional',group:'portrait',maxBytes:358_400},
 {key:'presentation.service.slack',path:'assets/presentation/slack-logo.png',classification:'optional',group:'service',maxBytes:16_384},
 {key:'presentation.service.github',path:'assets/presentation/github-logo.svg',classification:'optional',group:'service',maxBytes:16_384},
 {key:'presentation.service.claude',path:'assets/presentation/claude-logo.png',classification:'optional',group:'service',maxBytes:16_384},
] as const satisfies readonly PresentationAsset[];

export const PRESENTATION_ASSET_KEYS=new Set(PRESENTATION_ASSETS.map(asset=>asset.key));
export const CRITICAL_PRESENTATION_ASSETS=PRESENTATION_ASSETS.filter(asset=>asset.classification==='critical');
export const OPTIONAL_PRESENTATION_ASSETS=PRESENTATION_ASSETS.filter(asset=>asset.classification==='optional');
export const STRESS_BUNDLES:Record<StressStage,Readonly<{props:readonly string[];character:string;alpha:number}>>={
 calm:{props:[],character:'presentation.character.calm',alpha:0},busy:{props:['note'],character:'presentation.character.calm',alpha:.12},strained:{props:['note','papers'],character:'presentation.character.calm',alpha:.2},critical:{props:['note','papers','cable'],character:'presentation.character.calm',alpha:.3}
};

export function presentationTexture(scene:{textures:{exists(key:string):boolean}},key:string,fallback='__WHITE'):string{return scene.textures.exists(key)?key:fallback;}
