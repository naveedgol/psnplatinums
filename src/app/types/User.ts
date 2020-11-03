export class User {
    id: string;
    bronzeCount: number;
    silverCount: number;
    goldCount: number;
    platinumCount: number;
    level: number;
    avatar: string;
    levelProgress: number;

    getTotalCount(): number {
        return this.bronzeCount + this.silverCount + this.goldCount + this.platinumCount;
    }
}