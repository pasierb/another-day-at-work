import{expect,test,type Page}from'playwright/test';
type Snapshot={runId:number;scene:'workstation'|'results';paused:boolean;activeInterruptionIds:string[];resolvedInterruptionIds:string[];resolvedCaseIds:string[];failedCaseIds:string[];legalActionTypes:string[];guidanceVisible:boolean;terminal:boolean};
const snap=(page:Page)=>page.evaluate(()=>window.__WORKDAY_PLAYTEST__?.getSnapshot()as Snapshot|undefined);async function point(page:Page,x:number,y:number){const b=await page.locator('canvas').boundingBox();if(!b)throw new Error('No canvas');await page.mouse.click(b.x+x/1280*b.width,b.y+y/720*b.height);}async function start(page:Page){await page.goto('/?playtest=1');await expect(page.locator('canvas')).toBeVisible();await expect.poll(()=>snap(page)).toBeTruthy();if((await snap(page))?.guidanceVisible)await point(page,640,555);await expect.poll(async()=>!(await snap(page))?.guidanceVisible).toBeTruthy();}
test('sticky-only workstation and meta controls',async({page})=>{await start(page);await expect.poll(async()=>(await snap(page))?.activeInterruptionIds.length).toBeGreaterThan(0);expect((await snap(page))?.legalActionTypes).toEqual([]);await point(page,1048,684);expect((await snap(page))?.paused).toBe(true);await point(page,1048,684);expect((await snap(page))?.paused).toBe(false);const state=await page.evaluate(()=>{const s=(window as any).__PHASER_GAME__.scene.getScene('Workstation');return{taskQueue:'taskQueue'in s,ai:'ai'in s,coding:'coding'in s,laptop:s.textures.exists('presentation.ui.laptop-shell')};});expect(state).toEqual({taskQueue:false,ai:false,coding:false,laptop:true});});
test('inline choice resolves once and results restart',async({page})=>{await start(page);await expect.poll(async()=>(await snap(page))?.activeInterruptionIds.length).toBeGreaterThan(0);const target=await page.evaluate(()=>{const s=(window as any).__PHASER_GAME__.scene.getScene('Workstation'),card=s.stickyLayer.list[0],button=card.list.find((child:any)=>child.input&&child.width<card.width);return card.getWorldTransformMatrix().transformPoint(button.x+button.width/2,button.y+button.height/2);});await point(page,target.x,target.y);await expect.poll(async()=>(await snap(page))?.resolvedInterruptionIds.length).toBeGreaterThan(0);await page.evaluate(()=>{const s=(window as any).__PHASER_GAME__.scene.getScene('Workstation');s.workday.mutateResource('stamina',-100);});await expect.poll(async()=>(await snap(page))?.scene).toBe('results');await point(page,640,630);await expect.poll(async()=>(await snap(page))?.scene).toBe('workstation');});
test.describe('minimum touch viewport',()=>{test.use({viewport:{width:390,height:700},hasTouch:true,isMobile:true});test('stickies and passive workstation remain usable',async({page})=>{await start(page);await expect(page.locator('canvas')).toBeVisible();await expect.poll(async()=>(await snap(page))?.activeInterruptionIds.length).toBeGreaterThan(0);});});
test('normal mode exposes no diagnostics',async({page})=>{await page.goto('/');await expect(page.locator('canvas')).toBeVisible();expect(await page.evaluate(()=>'__WORKDAY_PLAYTEST__'in window)).toBe(false);});

test('notification cards fit their contents',async({page})=>{
 await start(page);
 const problems=await page.evaluate(()=>{
  const s=(window as any).__PHASER_GAME__.scene.getScene('Workstation');
  s.workday.pause('card-layout-check');s.interruptions.reset();
  const failures:string[]=[];
  for(const definition of s.interruptions.definitions.values()){
   s.stickyLayer.removeAll(true);
   s.buildSticky({...definition,severity:'critical',activationSequence:1,ageGameMinutes:120,status:'active'});
   const card=s.stickyLayer.list[0];

   for(const child of card.list){
    if(child.type==='Text'&&child.x>=65&&(child.x-child.displayOriginX+child.width>310||child.y+child.height>card.height))failures.push(`${definition.id}: text overflows`);
   }
   if(card.list.filter((child:any)=>child.input&&child.width<card.width).length!==definition.choices.length)failures.push(`${definition.id}: missing choice`);
  }
  s.stickyLayer.removeAll(true);
  for(const id of ['case-search','case-login','ambient-review','case-build','need-sleepiness','need-bathroom'])s.interruptions.activate(id,0);
  return failures;
 });
 expect(problems).toEqual([]);
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
 await page.screenshot({path:'playtest-results/notification-cards.png'});
});

test('all cards appear, overlap safely, and keep their positions',async({page})=>{
 await start(page);
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 const layout=await page.evaluate(()=>{
  const s=(window as any).__PHASER_GAME__.scene.getScene('Workstation');
  s.workday.pause('placement-check');s.interruptions.reset();
  for(const id of [...s.interruptions.definitions.keys()].slice(0,10))s.interruptions.activate(id,0);
  const distinct=new Set(s.stickyLayer.list.map((c:any)=>`${c.x}:${c.y}`)).size;
  const positions=()=>s.stickyLayer.list.map((c:any)=>({x:c.x,y:c.y,width:c.width,height:c.height}));
  const before=positions();s.renderStickies();const after=positions();
  for(const position of s.stickyPositions.values()){position.x=350;position.y=150;}
  s.renderStickies();
  const cards=s.stickyLayer.list,bottom=cards[0],top=cards[cards.length-1];
  // Put an upper card's paper over a lower card's choice.
  const button=bottom.list.find((c:any)=>c.input&&c.width<bottom.width);
  top.setPosition(bottom.x+button.x,bottom.y+button.y);
  return{before,after,distinct,active:s.interruptions.snapshot.active.length,
   covered:{x:top.x+8,y:top.y+8},resolved:s.interruptions.snapshot.resolvedIds.length};
 });
 expect(layout.active).toBeGreaterThan(6);
 expect(layout.distinct).toBeGreaterThan(1);
 expect(layout.before).toHaveLength(layout.active);
 expect(layout.after).toEqual(layout.before);
 for(const card of layout.before){expect(card.x).toBeGreaterThanOrEqual(20);expect(card.y).toBeGreaterThanOrEqual(88);expect(card.x+card.width).toBeLessThanOrEqual(1004);expect(card.y+card.height).toBeLessThanOrEqual(700);}
 await point(page,layout.covered.x,layout.covered.y);
 expect((await snap(page))?.resolvedInterruptionIds.length).toBe(layout.resolved);
 const target=await page.evaluate(()=>{
  const s=(window as any).__PHASER_GAME__.scene.getScene('Workstation'),card=s.stickyLayer.list[0];
  card.setPosition(20,88);
  return{x:card.x+8,y:card.y+8,order:s.stickyOrder};
 });
 await point(page,target.x,target.y);
 const stacking=await page.evaluate(()=>{
  const s=(window as any).__PHASER_GAME__.scene.getScene('Workstation'),front=s.stickyLayer.list.at(-1).depth;
  s.renderStickies();return{front,after:s.stickyLayer.list.at(-1).depth};
 });
 expect(stacking.front).toBeGreaterThan(target.order);
 expect(stacking.after).toBe(stacking.front);
 expect(errors).toEqual([]);
});
