export type AiModeId = 'prompt' | 'plan';
export interface AiModeCopy { readonly label:string;readonly summary:string;readonly planning:string;readonly generating:string }
export interface AiEvidenceThresholds { readonly tests:number;readonly concerns:number }
export interface AiQualityBounds { readonly adverseChance:number;readonly revisionImprovement:number }
export interface AiModeProfile {
 readonly id:AiModeId;readonly planningGameMs:number;readonly generationGameMs:number;
 readonly work:Readonly<{minimum:number;maximum:number}>;readonly revision:Readonly<{generationGameMs:number;staminaCost:number;maximumTier:number}>;
 readonly evidence:AiEvidenceThresholds;readonly quality:AiQualityBounds;readonly copy:AiModeCopy;
 readonly adverseEffects:readonly Record<string,unknown>[];
}

export const AI_MODE_PROFILES=Object.freeze([
 Object.freeze({id:'prompt',planningGameMs:0,generationGameMs:20*60_000,work:Object.freeze({minimum:7,maximum:11}),revision:Object.freeze({generationGameMs:10*60_000,staminaCost:4,maximumTier:2}),evidence:Object.freeze({tests:1,concerns:0}),quality:Object.freeze({adverseChance:.3,revisionImprovement:.11}),copy:Object.freeze({label:'Prompt Mode',summary:'Fast, smaller changes with more uncertainty.',planning:'',generating:'AI is drafting a focused change.'}),adverseEffects:Object.freeze([{type:'resource',resource:'technicalDebt',amount:4}])}),
 Object.freeze({id:'plan',planningGameMs:15*60_000,generationGameMs:20*60_000,work:Object.freeze({minimum:10,maximum:15}),revision:Object.freeze({generationGameMs:8*60_000,staminaCost:3,maximumTier:2}),evidence:Object.freeze({tests:2,concerns:1}),quality:Object.freeze({adverseChance:.14,revisionImprovement:.07}),copy:Object.freeze({label:'Plan Mode',summary:'Slower, larger changes with stronger evidence.',planning:'AI is mapping dependencies and risks.',generating:'AI is implementing the reviewed plan.'}),adverseEffects:Object.freeze([{type:'resource',resource:'technicalDebt',amount:2}])})
]);
