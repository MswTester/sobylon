
export interface Player{
    nickname:string;
    color:string;
    position:number[];
    velocity:number[];
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
    status:string;
    players:{[key:string]:Player};
}