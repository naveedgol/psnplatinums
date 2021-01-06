export class User {
    id: string = "naveedgol";
    bronzeCount: number = 2005;
    silverCount: number = 873;
    goldCount: number = 211;
    platinumCount: number = 41;
    level: number = 330;
    avatar: string = "https://i.psnprofiles.com/avatars/l/G3a726e979.png";
    levelProgress: number = 20;

    getTotalCount(): number {
        return this.bronzeCount + this.silverCount + this.goldCount + this.platinumCount;
    }
}