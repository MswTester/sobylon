import { io, Socket } from 'socket.io-client';
import * as BABYLON from 'babylonjs';
import CANNON from 'cannon'
import { cyan, red, blue, yellow, green, magenta, black, white, createMap } from './utils';
import { maps } from './map';
const server = io('/')

window.CANNON = CANNON

let inputKeys:string[] = []

let world:{[key:string]:number[][]} = {}

const globalDamping = 0.5;
const globalRestitution = 1.5;

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

const mySphereMat = new BABYLON.StandardMaterial('mySphereMat', scene);
mySphereMat.diffuseColor = blue
mySphereMat.emissiveColor = blue

const enSphereMat = new BABYLON.StandardMaterial('enSphereMat', scene);
enSphereMat.diffuseColor = red
enSphereMat.emissiveColor = red

const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter:1, segments:32}, scene);
sphere.position.y = 5;
sphere.material = mySphereMat;

const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 10, sphere.position, scene);
camera.attachControl(canvas, true);
camera.inertia = 0.5;
camera.upperRadiusLimit = 10;
camera.lowerRadiusLimit = 10;
const sphereImposter = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: globalRestitution, friction:1 }, scene);
sphere.physicsImpostor = sphereImposter;
sphere.physicsImpostor.physicsBody.linearDamping = globalDamping;

scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
scene.fogDensity = 0.005;
scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.9);
scene.fogStart = 20.0;
scene.fogEnd = 60.0;

//Light
scene.ambientColor = new BABYLON.Color3(1,1,1);
var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1,1,0), scene);
var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(60,60,0), scene);
light1.intensity = 0.5;
light2.intensity = 0.5;

const shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
shadowGenerator.useContactHardeningShadow = true;

shadowGenerator.getShadowMap().renderList.push(sphere);

createMap(scene, maps['default'], shadowGenerator)

engine.runRenderLoop(() => {
    camera.setTarget(sphere.position);
    if (inputKeys.includes(' ')) {
        const cam_target = new BABYLON.Vector2(camera.target.x, camera.target.z);
        const cam_pos = new BABYLON.Vector2(camera.position.x, camera.position.z);
        const distance = BABYLON.Vector2.Distance(cam_target, cam_pos)*5;
        const dx = (camera.target.x - camera.position.x)/distance
        const dz = (camera.target.z - camera.position.z)/distance
        sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(dx, 0, dz), sphere.getAbsolutePosition());
    }
    if(sphere.position.y < -10) {
        sphere.position.x = 0;
        sphere.position.y = 5;
        sphere.position.z = 0;
        sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,0));
    }
    server.emit('update', [sphere.position.x, sphere.position.y, sphere.position.z], [sphere.physicsImpostor.getLinearVelocity().x, sphere.physicsImpostor.getLinearVelocity().y, sphere.physicsImpostor.getLinearVelocity().z]);
    scene.render();
});

document.addEventListener('keydown', (e) => {
    if (!inputKeys.includes(e.key)) {
        inputKeys.push(e.key);
    }
});

document.addEventListener('keyup', (e) => {
    inputKeys = inputKeys.filter((key) => key !== e.key);
});

window.addEventListener('resize', () => engine.resize());

document.addEventListener('click', () => {
    canvas.requestPointerLock();
    canvas.focus();
});

const createEnemy = (id:string, pos:number[], velocity:number[]) => {
    const sph = BABYLON.MeshBuilder.CreateSphere(`${id}`, {diameter:1, segments:32}, scene);
    sph.position.x = pos[0];
    sph.position.y = pos[1];
    sph.position.z = pos[2];
    const sphImposter = new BABYLON.PhysicsImpostor(sph, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: globalRestitution, friction:1 }, scene);
    sph.physicsImpostor = sphImposter;
    sph.physicsImpostor.physicsBody.linearDamping = globalDamping;
    sph.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocity[0], velocity[1], velocity[2]));
    sph.material = enSphereMat;
    shadowGenerator.getShadowMap().renderList.push(sph);
}
server.on('connect', () => {
    console.log('connected');
    server.on('init', (data: any) => {
        world = data;
        Object.keys(world).forEach((id:string, i:number) => {
            if(id === server.id) return;
            const pos = world[id][0];
            const velocity = world[id][1];
            createEnemy(id, pos, velocity);
        });
    });
    server.on('update', (id:string, pos:number[], velocity:number[]) => {
        world[id] = [pos, velocity];
        if(id === server.id) return;
        const sph = scene.getMeshByName(id);
        console.log(sph, world)
        if (sph) {
            sph.position.x = pos[0];
            sph.position.y = pos[1];
            sph.position.z = pos[2];
            sph.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocity[0], velocity[1], velocity[2]));
        } else {
            createEnemy(id, pos, velocity);
        }
    });
    server.on('disconnected', (id:string) => {
        const sph = scene.getMeshByName(id);
        if (sph) {
            sph.dispose();
        }
        delete world[id];
    });
});
