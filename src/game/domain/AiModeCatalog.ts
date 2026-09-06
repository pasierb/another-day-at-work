import type { AiModeProfile } from '../content/aiModes';
import { validateEffects } from './effects';
const text=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0;
export function validateAiModeCatalog(catalog:readonly AiModeProfile[]):void{
 if(!Array.isArray(catalog)||catalog.length<2)throw new TypeError('AI mode catalog must contain prompt and plan profiles.');
 const ids=new Set<string>();for(const mode of catalog){
  if(!text(mode.id)||ids.has(mode.id))throw new TypeError('AI mode identifiers must be non-empty and unique.');ids.add(mode.id);
  const nonnegative=[mode.planningGameMs,mode.generationGameMs,mode.revision.generationGameMs,mode.revision.staminaCost,mode.evidence.tests,mode.evidence.concerns,mode.quality.adverseChance,mode.quality.revisionImprovement];
  if(nonnegative.some(value=>!Number.isFinite(value)||value<0))throw new RangeError(`${mode.id} has invalid numeric content.`);
  if(mode.generationGameMs<=0||mode.work.minimum<=0||mode.work.maximum<mode.work.minimum)throw new RangeError(`${mode.id} has invalid timing or work bounds.`);
  if(!Number.isInteger(mode.revision.maximumTier)||mode.revision.maximumTier<0)throw new RangeError(`${mode.id} has an invalid revision ceiling.`);
  if(mode.quality.adverseChance>1||mode.quality.revisionImprovement>1)throw new RangeError(`${mode.id} has quality outside zero to one.`);
  if(!text(mode.copy.label)||!text(mode.copy.summary)||!text(mode.copy.generating)||(mode.planningGameMs>0&&!text(mode.copy.planning)))throw new TypeError(`${mode.id} has invalid player-facing copy.`);
  validateEffects(mode.adverseEffects as readonly import('./effects').Effect[],`${mode.id} adverse effects`);
 }
 const prompt=catalog.find(x=>x.id==='prompt'),plan=catalog.find(x=>x.id==='plan');if(!prompt||!plan)throw new TypeError('AI mode catalog requires prompt and plan.');
 if(plan.planningGameMs+plan.generationGameMs<=prompt.planningGameMs+prompt.generationGameMs||plan.work.minimum<prompt.work.minimum||plan.work.maximum<prompt.work.maximum||plan.evidence.tests<prompt.evidence.tests||plan.evidence.concerns<prompt.evidence.concerns||plan.quality.adverseChance>prompt.quality.adverseChance)throw new RangeError('Plan mode must be slower and no worse in work, evidence, or adverse likelihood.');
}
