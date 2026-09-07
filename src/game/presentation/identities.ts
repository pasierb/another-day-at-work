import type { InterruptionCategory,InterruptionSeverity } from '../domain/interruptions';
export type IdentityKind='stakeholder'|'teammate'|'workplace-tool'|'production-system'|'unknown';
export interface PresentationIdentity{readonly kind:IdentityKind;readonly glyph:string;readonly label:string;readonly shape:'round'|'square'|'diamond'|'hex'}
const CATEGORY_IDENTITIES:Partial<Record<InterruptionCategory,PresentationIdentity>>={'product-owner':{kind:'stakeholder',glyph:'PO',label:'STAKEHOLDER',shape:'round'},teammate:{kind:'teammate',glyph:'TM',label:'TEAMMATE',shape:'round'},tooling:{kind:'workplace-tool',glyph:'⌘',label:'WORKPLACE TOOL',shape:'square'},production:{kind:'production-system',glyph:'SYS',label:'PRODUCTION',shape:'hex'}};
const UNKNOWN:PresentationIdentity={kind:'unknown',glyph:'?',label:'UNKNOWN SOURCE',shape:'diamond'};
export function interruptionIdentity(category:string):PresentationIdentity{return CATEGORY_IDENTITIES[category as InterruptionCategory]??UNKNOWN;}
export function severityMarker(severity:InterruptionSeverity):string{return({low:'• LOW',medium:'▲ MEDIUM',high:'!! HIGH',critical:'!!! CRITICAL'}as const)[severity];}
export interface NotificationIdentity{readonly sender:string;readonly channel:string;readonly texture?:string;readonly fallback:string}
export function notificationIdentity(id:string,category:string,title=''):NotificationIdentity{
 if(id==='tooling-ai')return{sender:'Claude',channel:'Coding assistant',texture:'presentation.service.claude',fallback:'C'};
 if(id==='ambient-review'||/review/i.test(title))return{sender:'GitHub',channel:'Pull request review',texture:'presentation.service.github',fallback:'GH'};
 if(category==='product-owner')return{sender:'Product Owner',channel:'Slack',texture:'presentation.service.slack',fallback:'PO'};
 if(category==='teammate')return{sender:'Teammate',channel:'Slack',texture:'presentation.service.slack',fallback:'TM'};
 if(category==='personal')return{sender:'Workday reminder',channel:'Slack',texture:'presentation.service.slack',fallback:'ME'};
 if(category==='consequence')return{sender:'Follow-up Bot',channel:'Slack',texture:'presentation.service.slack',fallback:'BOT'};
 if(id==='tooling-github')return{sender:'GitHub',channel:'Status update',texture:'presentation.service.github',fallback:'GH'};
 if(category==='tooling')return{sender:'Developer Tools',channel:'Service status',fallback:'DEV'};
 if(category==='production')return{sender:'DeployBot',channel:'Production monitor',fallback:'!'};
 return{sender:'Workday',channel:'Notification',fallback:'?'};
}
