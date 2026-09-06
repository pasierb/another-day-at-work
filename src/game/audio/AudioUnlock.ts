export class AudioUnlockAdapter {
    private unlocked=false;private pending=false;
    constructor(private readonly resume:()=>Promise<boolean>){}
    get isUnlocked():boolean{return this.unlocked;}
    get isPending():boolean{return this.pending;}
    async qualifyingGesture():Promise<boolean>{if(this.unlocked||this.pending)return this.unlocked;this.pending=true;try{this.unlocked=await this.resume();return this.unlocked;}catch{return false;}finally{this.pending=false;}}
}
