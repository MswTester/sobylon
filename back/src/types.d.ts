
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
    dashPower:number;
    dashCooltime:number;
    damping:number;
    restitution:number;
    maxlife:number;
    name:string;
    map:string;
    maxPlayers:number;
    ownerId:string;
    status:string;
    players:{[key:string]:Player};
}