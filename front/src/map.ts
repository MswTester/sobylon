import { Color3, Mesh, Vector3 } from "babylonjs";
import { colors } from "./textures";

export interface MapMesh {
    name?: string;
    position: Vector3;
    rotation: Vector3;
    scaling: Vector3;
    color: Color3;
}

export interface Map {
    meshes: MapMesh[];
    width: number;
    height: number;
    color: Color3;
}

export const maps:{[key:string]:Map} = {
    default: {
        meshes: [
            {name:'box1', position:new Vector3(4,0.5,6), rotation:new Vector3(0,45,0), scaling:new Vector3(1,1,1), color:colors.white},
            {name:'stair1', position:new Vector3(-7,-0.5,2), rotation:new Vector3(0.3,0,0), scaling:new Vector3(2,4,10), color:colors.white},
            {name:'box1', position:new Vector3(-3,1.39,-4.69), rotation:new Vector3(0,0,0), scaling:new Vector3(10,3,5), color:colors.white},
        ],
        width: 40,
        height: 20,
        color: colors.white,
    },
}