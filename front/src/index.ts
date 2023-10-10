import { io, Socket } from 'socket.io-client';
import * as BABYLON from 'babylonjs';
import CANNON from 'cannon'
const server = io('/')

window.CANNON = CANNON

let inputKeys:string[] = []

let world:{[key:string]:number[]} = {}

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 10, BABYLON.Vector3.Zero(), scene);

camera.attachControl(canvas, true);
camera.inertia = 0.5;

// const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
// light.intensity = 0.7;
const shadowLight = new BABYLON.DirectionalLight('shadowLight', new BABYLON.Vector3(0, -1, 0), scene);
shadowLight.intensity = 0.7;
const shadowGenerator = new BABYLON.ShadowGenerator(1024, shadowLight);
shadowGenerator.useContactHardeningShadow = true;

const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter:1, segments:32}, scene);
sphere.position.y = 5;
const sphereMat = new BABYLON.StandardMaterial('sphereMat', scene);
sphereMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
sphere.material = sphereMat;
shadowGenerator.getShadowMap().renderList.push(sphere);
shadowGenerator.useExponentialShadowMap = true;


const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 15, height: 15 }, scene);
ground.position.y = -0.5;
const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
ground.material = groundMat;
ground.receiveShadows = true;

scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

const sphereImposter = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5, friction:1 }, scene);
const groundImposter = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:1 }, scene);

sphere.physicsImpostor = sphereImposter;
sphere.physicsImpostor.physicsBody.linearDamping = 0.8;
ground.physicsImpostor = groundImposter;

engine.runRenderLoop(() => {
    camera.setTarget(sphere.position);
    if (inputKeys.includes(' ')) {
        const cam_target = new BABYLON.Vector2(camera.target.x, camera.target.z);
        const cam_pos = new BABYLON.Vector2(camera.position.x, camera.position.z);
        const distance = BABYLON.Vector2.Distance(cam_target, cam_pos)*10;
        const dx = (camera.target.x - camera.position.x)/distance
        const dz = (camera.target.z - camera.position.z)/distance
        sphere.moveWithCollisions(new BABYLON.Vector3(dx, 0, dz));
    }
    if(sphere.position.y < -10) {
        sphere.position.x = 0;
        sphere.position.y = 5;
        sphere.position.z = 0;
        sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,0));
    }
    server.emit('update', [sphere.position.x, sphere.position.y, sphere.position.z]);
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

server.on('connect', () => {
    console.log('connected');
    server.on('init', (data: any) => {
        world = data;
        Object.keys(world).forEach((id:string, i:number) => {
            if(id === server.id) return;
            const sph = BABYLON.MeshBuilder.CreateSphere(`${id}`, {diameter:1, segments:32}, scene);
            sph.position.x = world[id][0];
            sph.position.y = world[id][1];
            sph.position.z = world[id][2];
            const sphImposter = new BABYLON.PhysicsImpostor(sph, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5, friction:1 }, scene);
            sph.physicsImpostor = sphImposter;
            sph.physicsImpostor.physicsBody.linearDamping = 0.8;
        });
    });
    server.on('update', (id:string, pos:number[]) => {
        world[id] = pos;
        if(id === server.id) return;
        const sph = scene.getMeshByName(id);
        if (sph) {
            sph.moveWithCollisions(new BABYLON.Vector3(pos[0]-sph.position.x, pos[1]-sph.position.y, pos[2]-sph.position.z));
        } else {
            const sph = BABYLON.MeshBuilder.CreateSphere(`${id}`, {diameter:1, segments:32}, scene);
            sph.position.x = pos[0];
            sph.position.y = pos[1];
            sph.position.z = pos[2];
            const sphImposter = new BABYLON.PhysicsImpostor(sph, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5, friction:1 }, scene);
            sph.physicsImpostor = sphImposter;
            sph.physicsImpostor.physicsBody.linearDamping = 0.8;
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
