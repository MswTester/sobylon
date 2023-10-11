import * as BABYLON from 'babylonjs';
import { Map } from "./map";

export const red = new BABYLON.Color3(1, 0, 0);
export const green = new BABYLON.Color3(0, 1, 0);
export const blue = new BABYLON.Color3(0, 0, 1);
export const cyan = new BABYLON.Color3(0, 1, 1);
export const magenta = new BABYLON.Color3(1, 0, 1);
export const yellow = new BABYLON.Color3(1, 1, 0);
export const black = new BABYLON.Color3(0, 0, 0);
export const white = new BABYLON.Color3(1, 1, 1);

export const createMap = (scene:BABYLON.Scene, map:Map, shadowGenerator:BABYLON.ShadowGenerator) => {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: map.width, height: map.height }, scene);
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = map.color
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:1 }, scene);
    map.meshes.forEach(mesh => {
        const box = BABYLON.MeshBuilder.CreateBox(mesh.name, { width: 1, height: 1, depth: 1 }, scene);
        box.position = mesh.position;
        box.rotation = mesh.rotation;
        box.scaling = mesh.scaling;
        const boxMat = new BABYLON.StandardMaterial(mesh.name+'Mat', scene);
        boxMat.diffuseColor = mesh.color;
        box.material = boxMat;
        box.receiveShadows = true;
        box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:1 }, scene);
        shadowGenerator.getShadowMap().renderList.push(box);
    })
}