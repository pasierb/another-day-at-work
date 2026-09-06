import { INTERRUPTION_CATEGORIES, type InterruptionCategory } from './interruptions';
import type { NeedId } from './PlayerNeeds';
import type { ResourceValues } from './DayState';

export const PACING_BAND_IDS = ['morning', 'normal-workload', 'lunch', 'main-chaos', 'endgame'] as const;
export type PacingBandId = typeof PACING_BAND_IDS[number];
export type PacingProfileId = 'normal' | 'developer';
export const WORKDAY_START_MINUTE = 9 * 60;
export const WORKDAY_END_MINUTE = 17 * 60;
export const WORKDAY_DURATION_MS = (WORKDAY_END_MINUTE - WORKDAY_START_MINUTE) * 60_000;

export interface PacingBand {
    readonly id: PacingBandId;
    readonly startGameMs: number;
    readonly endGameMs: number;
    readonly minimumSpawnIntervalMs: number;
    readonly maximumSpawnIntervalMs: number;
    readonly categoryWeightModifiers: Readonly<Partial<Record<InterruptionCategory, number>>>;
    readonly escalationPressure: number;
    readonly needRateModifiers: Readonly<Partial<Record<NeedId, number>>>;
}
export interface PacingGuardrails {
    readonly floodPressure: number;
    readonly floodDeferralGameMs: number;
    readonly maximumQuietGameMs: number;
    readonly minimumCategoryWeight: number;
    readonly maximumCategoryWeight: number;
}
export interface PacingProfile {
    readonly id: PacingProfileId;
    readonly gameMinutesPerRealSecond: number;
    readonly bands: readonly PacingBand[];
    readonly guardrails: PacingGuardrails;
    readonly simulationStepGameMs: number;
    readonly balance:Readonly<{readonly initialResources:ResourceValues;readonly taskWorkPerGameMinute:number;readonly codingStaminaPerGameMinute:number;readonly bathroomGameMinutes:number;readonly bathroomFocusReduction:number;readonly coffeeStaminaRestoration:number;readonly cokeZeroStaminaRestoration:number;readonly cokeZeroToiletIncrease:number}>;
}
export interface PacingInterval { readonly band: PacingBand; readonly startGameMs: number; readonly endGameMs: number; readonly durationGameMs: number }

const minute = (clock: string): number => {
    const [hour, minutes] = clock.split(':').map(Number);
    return ((hour! * 60 + minutes!) - WORKDAY_START_MINUTE) * 60_000;
};
const band = (id:PacingBandId,start:string,end:string,min:number,max:number,weights:Partial<Record<InterruptionCategory,number>>,escalationPressure:number,needs:Partial<Record<NeedId,number>>):PacingBand => Object.freeze({
    id,startGameMs:minute(start),endGameMs:minute(end),minimumSpawnIntervalMs:min*60_000,maximumSpawnIntervalMs:max*60_000,
    categoryWeightModifiers:Object.freeze({...weights}),escalationPressure,needRateModifiers:Object.freeze({...needs})
});
const guardrails:PacingGuardrails=Object.freeze({floodPressure:6,floodDeferralGameMs:5*60_000,maximumQuietGameMs:38*60_000,minimumCategoryWeight:.25,maximumCategoryWeight:3});
const balance=Object.freeze({initialResources:Object.freeze({stamina:75,poHappiness:75,systemStability:75,technicalDebt:0}),taskWorkPerGameMinute:.34,codingStaminaPerGameMinute:.18,bathroomGameMinutes:10,bathroomFocusReduction:.2,coffeeStaminaRestoration:30,cokeZeroStaminaRestoration:15,cokeZeroToiletIncrease:12});
const normalBands=Object.freeze([
    band('morning','09:00','10:15',24,34,{'product-owner':.7,production:.65,teammate:.8,tooling:.75,personal:.7,consequence:.7},.85,{sleepiness:.7,toilet:.8}),
    band('normal-workload','10:15','12:00',18,27,{},1,{sleepiness:.9,toilet:1}),
    band('lunch','12:00','13:00',25,34,{'product-owner':.7,production:.8,teammate:.75,personal:1.25},.85,{sleepiness:1.15,toilet:1.1}),
    band('main-chaos','13:00','16:00',11,18,{'product-owner':1.25,production:1.45,teammate:1.2,tooling:1.35,consequence:1.3},1.3,{sleepiness:1.25,toilet:1.2}),
    band('endgame','16:00','17:00',14,22,{'product-owner':1.35,production:1.2,consequence:1.25},1.15,{sleepiness:1.45,toilet:1.3})
]);

export const NORMAL_PACING_PROFILE:PacingProfile=createPacingProfile({id:'normal',gameMinutesPerRealSecond:.5,bands:normalBands,guardrails,balance,simulationStepGameMs:60_000});
export const DEVELOPER_PACING_PROFILE:PacingProfile=createPacingProfile({id:'developer',gameMinutesPerRealSecond:8,bands:normalBands,guardrails,balance,simulationStepGameMs:5*60_000});
export const PACING_PROFILES:Readonly<Record<PacingProfileId,PacingProfile>>=Object.freeze({normal:NORMAL_PACING_PROFILE,developer:DEVELOPER_PACING_PROFILE});

export function createPacingProfile(input:PacingProfile):PacingProfile {
    validatePacingProfile(input);
    return Object.freeze({...input,bands:Object.freeze(input.bands.map(item=>Object.freeze({...item,categoryWeightModifiers:Object.freeze({...item.categoryWeightModifiers}),needRateModifiers:Object.freeze({...item.needRateModifiers})}))),guardrails:Object.freeze({...input.guardrails}),balance:Object.freeze({...input.balance,initialResources:Object.freeze({...input.balance.initialResources})})});
}
export function validatePacingProfile(profile:PacingProfile):void {
    if(profile.id!=='normal'&&profile.id!=='developer')throw new TypeError(`Unknown pacing profile ${String(profile.id)}.`);
    if(!Number.isFinite(profile.gameMinutesPerRealSecond)||profile.gameMinutesPerRealSecond<=0||!Number.isFinite(profile.simulationStepGameMs)||profile.simulationStepGameMs<=0)throw new RangeError('Pacing time scales must be finite and positive.');
    if(profile.bands.length!==PACING_BAND_IDS.length)throw new RangeError('Pacing profile must contain exactly five bands.');
    let cursor=0;
    profile.bands.forEach((item,index)=>{
        if(item.id!==PACING_BAND_IDS[index])throw new TypeError('Pacing bands must use the five named identities in order.');
        if(item.startGameMs!==cursor||!Number.isFinite(item.endGameMs)||item.endGameMs<=item.startGameMs)throw new RangeError('Pacing bands must be ordered, non-overlapping, and gap-free.');
        if(!Number.isFinite(item.minimumSpawnIntervalMs)||item.minimumSpawnIntervalMs<=0||!Number.isFinite(item.maximumSpawnIntervalMs)||item.maximumSpawnIntervalMs<item.minimumSpawnIntervalMs)throw new RangeError(`Invalid spawn interval for ${item.id}.`);
        if(!Number.isFinite(item.escalationPressure)||item.escalationPressure<.25||item.escalationPressure>4)throw new RangeError(`Invalid escalation pressure for ${item.id}.`);
        Object.entries(item.categoryWeightModifiers).forEach(([key,value])=>{if(!INTERRUPTION_CATEGORIES.includes(key as InterruptionCategory))throw new TypeError(`Unknown interruption category ${key}.`);if(!Number.isFinite(value)||value!<0||value!>4)throw new RangeError(`Invalid category modifier for ${key}.`);});
        Object.entries(item.needRateModifiers).forEach(([key,value])=>{if(key!=='sleepiness'&&key!=='toilet')throw new TypeError(`Unknown need ${key}.`);if(!Number.isFinite(value)||value!<0||value!>4)throw new RangeError(`Invalid need modifier for ${key}.`);});
        cursor=item.endGameMs;
    });
    if(cursor!==WORKDAY_DURATION_MS)throw new RangeError('Pacing bands must cover exactly 09:00–17:00.');
    const g=profile.guardrails;
    if(!Number.isInteger(g.floodPressure)||g.floodPressure<1||![g.floodDeferralGameMs,g.maximumQuietGameMs,g.minimumCategoryWeight,g.maximumCategoryWeight].every(Number.isFinite)||g.floodDeferralGameMs<=0||g.maximumQuietGameMs<=0||g.minimumCategoryWeight<0||g.maximumCategoryWeight<g.minimumCategoryWeight)throw new RangeError('Invalid pacing guardrails.');
    const b=profile.balance;if(!b||!Object.values(b.initialResources).every(value=>Number.isFinite(value)&&value>=0&&value<=100)||![b.taskWorkPerGameMinute,b.codingStaminaPerGameMinute,b.bathroomGameMinutes,b.bathroomFocusReduction,b.coffeeStaminaRestoration,b.cokeZeroStaminaRestoration,b.cokeZeroToiletIncrease].every(value=>Number.isFinite(value)&&value>=0)||b.taskWorkPerGameMinute<=0||b.coffeeStaminaRestoration<=b.cokeZeroStaminaRestoration)throw new RangeError('Invalid profile-owned balance values.');
}
export function activePacingBand(profile:PacingProfile,gameMs:number):PacingBand {
    if(!Number.isFinite(gameMs)||gameMs<0||gameMs>WORKDAY_DURATION_MS)throw new RangeError('Pacing time must be within the workday.');
    return profile.bands.find(item=>gameMs>=item.startGameMs&&gameMs<item.endGameMs)??profile.bands[profile.bands.length-1]!;
}
export function splitPacingInterval(profile:PacingProfile,startGameMs:number,endGameMs:number):readonly PacingInterval[] {
    if(!Number.isFinite(startGameMs)||!Number.isFinite(endGameMs)||startGameMs<0||endGameMs<startGameMs||endGameMs>WORKDAY_DURATION_MS)throw new RangeError('Pacing interval must be ordered within the workday.');
    if(startGameMs===endGameMs)return Object.freeze([]);
    return Object.freeze(profile.bands.filter(item=>item.endGameMs>startGameMs&&item.startGameMs<endGameMs).map(item=>{const start=Math.max(startGameMs,item.startGameMs),end=Math.min(endGameMs,item.endGameMs);return Object.freeze({band:item,startGameMs:start,endGameMs:end,durationGameMs:end-start});}));
}
export function resolvePacingProfile(id:PacingProfileId):PacingProfile{return PACING_PROFILES[id];}
