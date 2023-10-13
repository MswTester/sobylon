
export interface Player{
    nickname:string;
    color:string;
    position:number[];
    velocity:number[];
    life:number;
}

export interface World{
    gravity:number;
    speed:number;
    jumpHeight:number;
    jumpCooltime:number;
    damping:number;
    restitution:number;
    name:string;
    map:string;
    maxPlayers:number;
    ownerId:string;
    players:{[key:string]:Player};
    status:string;
}