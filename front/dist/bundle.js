"use strict";
(self["webpackChunkfront"] = self["webpackChunkfront"] || []).push([["bundle"],{

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const socket_io_client_1 = __webpack_require__(/*! socket.io-client */ "./node_modules/socket.io-client/build/cjs/index.js");
const BABYLON = __importStar(__webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js"));
const GUI = __importStar(__webpack_require__(/*! babylonjs-gui */ "./node_modules/babylonjs-gui/babylon.gui.js"));
const cannon_1 = __importDefault(__webpack_require__(/*! cannon */ "./node_modules/cannon/build/cannon.js"));
const textures_1 = __webpack_require__(/*! ./textures */ "./src/textures.ts");
__webpack_require__(/*! babylonjs-loaders/babylon.objFileLoader */ "./node_modules/babylonjs-loaders/babylon.objFileLoader.js");
const server = (0, socket_io_client_1.io)('/');
window.CANNON = cannon_1.default;
const isMobile = () => {
    return navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone');
};
let myWorld = null;
const initGame = async (thisWorld) => {
    // variables initialization
    let inputKeys = [];
    let world = thisWorld;
    let movingAngle = null;
    const globalDamping = 0.5;
    const globalRestitution = 1.5;
    let camRadious = isMobile() ? innerWidth > innerHeight ? 13 : 20 : 10;
    const speed = 0.2;
    const jumpHeight = 8;
    const jumpCoolTime = 400;
    const nicknameOffset = 1.5;
    let timer = 0;
    // elements initialization
    const jump = document.querySelector('.jump');
    jump.classList.remove('hide');
    // game initialization
    const canvas = document.getElementById('renderCanvas');
    canvas.classList.remove('hide');
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    // my sphere
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1, segments: 16 }, scene);
    sphere.position.x = world.players[server.id].position[0];
    sphere.position.y = world.players[server.id].position[1];
    sphere.position.z = world.players[server.id].position[2];
    sphere.material = (0, textures_1.getMaterial)(scene, world.players[server.id].color);
    const sphereImposter = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: globalRestitution, friction: 1 }, scene);
    sphere.physicsImpostor = sphereImposter;
    sphere.physicsImpostor.physicsBody.linearDamping = globalDamping;
    // camera
    const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 10, sphere.position, scene);
    camera.attachControl(canvas, true);
    camera.inertia = isMobile() ? 0.8 : 0.5;
    camera.upperRadiusLimit = camRadious;
    camera.lowerRadiusLimit = camRadious;
    //fog
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.005;
    scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    scene.fogStart = 20.0;
    scene.fogEnd = 60.0;
    //Light
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(60, 60, 0), scene);
    light1.intensity = 0.5;
    light2.intensity = 0.5;
    // shadow
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.useContactHardeningShadow = true;
    shadowGenerator.getShadowMap().renderList.push(sphere);
    // map (ground)
    // const ground = createMap(scene, maps['default'], shadowGenerator)
    // https://playground.babylonjs.com/#0IRV8X
    let newMeshes = (await BABYLON.SceneLoader.ImportMeshAsync('', 'obj/', 'test1.obj', scene)).meshes;
    engine.hideLoadingUI();
    newMeshes.forEach((mesh) => {
        shadowGenerator.getShadowMap().renderList.push(mesh);
        mesh.receiveShadows = true;
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.01, friction: 1, damping: 100 }, scene);
    });
    // jump vars
    const jumpDiv = document.querySelector('.jump > div');
    let isJumping = true;
    let jumpTimeStamp = 0;
    // loop
    engine.runRenderLoop(() => {
        timer++;
        camera.setTarget(sphere.position);
        const dx = (camera.target.x - camera.position.x);
        const dz = (camera.target.z - camera.position.z);
        const angle = Math.atan2(dz, dx);
        if (isMobile()) {
            if (movingAngle)
                movingAngle += angle;
        }
        else {
            if (inputKeys.includes('w') && inputKeys.includes('a')) {
                movingAngle = angle + Math.PI / 4;
            }
            else if (inputKeys.includes('w') && inputKeys.includes('d')) {
                movingAngle = angle - Math.PI / 4;
            }
            else if (inputKeys.includes('s') && inputKeys.includes('a')) {
                movingAngle = angle + Math.PI / 4 * 3;
            }
            else if (inputKeys.includes('s') && inputKeys.includes('d')) {
                movingAngle = angle - Math.PI / 4 * 3;
            }
            else if (inputKeys.includes('w')) {
                movingAngle = angle;
            }
            else if (inputKeys.includes('s')) {
                movingAngle = angle + Math.PI;
            }
            else if (inputKeys.includes('a')) {
                movingAngle = angle + Math.PI / 2;
            }
            else if (inputKeys.includes('d')) {
                movingAngle = angle - Math.PI / 2;
            }
            else {
                movingAngle = null;
            }
        }
        if (movingAngle !== null) {
            const x = Math.cos(movingAngle) * speed;
            const z = Math.sin(movingAngle) * speed;
            sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(x, 0, z), sphere.getAbsolutePosition());
        }
        if (isMobile() && movingAngle !== null) {
            movingAngle -= angle;
        }
        if (sphere.position.y < -10) {
            sphere.position.x = 0;
            sphere.position.y = 5;
            sphere.position.z = 0;
            sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
        }
        if (!isJumping && inputKeys.includes(' ')) {
            sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, jumpHeight, 0), sphere.getAbsolutePosition());
            isJumping = true;
            jumpTimeStamp = timer;
        }
        jumpDiv.style.height = `${timer - jumpTimeStamp > jumpCoolTime ? 100 : (timer - jumpTimeStamp) / jumpCoolTime * 100}%`;
        if (isJumping && timer - jumpTimeStamp > jumpCoolTime) {
            isJumping = false;
        }
        server.emit('update', [sphere.position.x, sphere.position.y, sphere.position.z], [sphere.physicsImpostor.getLinearVelocity().x, sphere.physicsImpostor.getLinearVelocity().y, sphere.physicsImpostor.getLinearVelocity().z]);
        scene.render();
    });
    // input event
    document.addEventListener('keydown', (e) => {
        if (!inputKeys.includes(e.key)) {
            inputKeys.push(e.key);
        }
    });
    document.addEventListener('keyup', (e) => {
        inputKeys = inputKeys.filter((key) => key !== e.key);
    });
    // resize event
    window.addEventListener('resize', () => {
        engine.resize();
        camRadious = isMobile() ? innerWidth > innerHeight ? 13 : 20 : 10;
        camera.upperRadiusLimit = camRadious;
        camera.lowerRadiusLimit = camRadious;
    });
    // pointer lock
    document.addEventListener('click', () => {
        canvas.requestPointerLock();
        canvas.focus();
    });
    // mobile control
    const mobileLayout = document.querySelector('.mobile-layout');
    const joystick = document.querySelector('.joystick');
    const joystickButton = document.querySelector('.joystick-button');
    if (isMobile())
        mobileLayout.classList.remove('hide');
    let startPoint = [0, 0];
    const getTouchesXY = (event) => {
        let x = event.touches[0].clientX;
        let y = event.touches[0].clientY;
        for (let i = 1; i < event.touches.length; i++) {
            const cond = event.touches[i].clientX < x;
            x = cond ? event.touches[i].clientX : x;
            y = cond ? event.touches[i].clientY : y;
        }
        return [x, y];
    };
    jump.addEventListener('touchstart', event => {
        inputKeys.push(' ');
        event.preventDefault();
    });
    jump.addEventListener('touchend', event => {
        inputKeys = inputKeys.filter((key) => key !== ' ');
        event.preventDefault();
    });
    mobileLayout.addEventListener('touchstart', event => {
        const [x, y] = getTouchesXY(event);
        joystick.classList.remove('hide');
        joystick.style.left = `${x}px`;
        joystick.style.top = `${y}px`;
        startPoint = [x, y];
        joystickButton.style.left = '50px';
        joystickButton.style.top = '50px';
        joystick.style.transition = 'none';
        joystick.style.transform = 'translate(-50%, -50%)';
        movingAngle = null;
    });
    mobileLayout.addEventListener('touchmove', event => {
        let [dx, dy] = getTouchesXY(event);
        dx -= startPoint[0];
        dy -= startPoint[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const maxDistance = 50;
        const x = Math.cos(angle) * Math.min(distance, maxDistance);
        const y = Math.sin(angle) * Math.min(distance, maxDistance);
        joystickButton.style.left = `${x + 50}px`;
        joystickButton.style.top = `${y + 50}px`;
        movingAngle = (-angle) - Math.PI / 2;
    });
    mobileLayout.addEventListener('touchend', event => {
        joystick.classList.add('hide');
        joystick.style.transition = 'opacity 0.5s';
        movingAngle = null;
    });
    // enemy creation
    const createEnemy = (id, pos, velocity) => {
        const sph = BABYLON.MeshBuilder.CreateSphere(`${id}`, { diameter: 1, segments: 32 }, scene);
        sph.position.x = pos[0];
        sph.position.y = pos[1];
        sph.position.z = pos[2];
        const sphImposter = new BABYLON.PhysicsImpostor(sph, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: globalRestitution, friction: 1 }, scene);
        sph.physicsImpostor = sphImposter;
        sph.physicsImpostor.physicsBody.linearDamping = globalDamping;
        sph.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocity[0], velocity[1], velocity[2]));
        sph.material = (0, textures_1.getMaterial)(scene, world.players[id].color);
        shadowGenerator.getShadowMap().renderList.push(sph);
        const nick = world.players[id].nickname;
        const plane = BABYLON.MeshBuilder.CreatePlane(`${id}-plane`, { width: nick.length, height: 5 }, scene);
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        plane.position.x = pos[0];
        plane.position.y = pos[1] + nicknameOffset;
        plane.position.z = pos[2];
        const nickTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        const nickText = new GUI.TextBlock();
        nickText.text = nick;
        nickText.color = 'white';
        nickText.fontSize = 100;
        nickText.fontWeight = 'bold';
        nickText.fontFamily = 'Arial';
        nickTexture.addControl(nickText);
    };
    let started = false;
    // socket.io
    server.emit('init', world.ownerId);
    server.on('init', (data) => {
        world = data;
        Object.keys(world.players).forEach((id, i) => {
            if (id === server.id)
                return;
            const pos = world.players[id].position;
            const velocity = world.players[id].velocity;
            createEnemy(id, pos, velocity);
        });
        started = true;
    });
    console.log(world);
    server.on('update', (id, pos, velocity) => {
        if (started && world.players[id]) {
            world.players[id].position = pos;
            world.players[id].velocity = velocity;
            if (id === server.id)
                return;
            const sph = scene.getMeshByName(id);
            const plane = scene.getMeshByName(`${id}-plane`);
            if (sph && plane) {
                sph.position.x = pos[0];
                sph.position.y = pos[1];
                sph.position.z = pos[2];
                sph.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocity[0], velocity[1], velocity[2]));
                plane.position.x = pos[0];
                plane.position.y = pos[1] + nicknameOffset;
                plane.position.z = pos[2];
            }
            else {
                createEnemy(id, pos, velocity);
            }
        }
    });
    server.on('disconnected', (id) => {
        const sph = scene.getMeshByName(id);
        const plane = scene.getMeshByName(`${id}-plane`);
        if (sph && plane) {
            sph.dispose();
            plane.dispose();
        }
        delete world.players[id];
    });
};
const main = document.querySelector('.main');
const nickname = document.querySelector('input.nickname');
const start = document.querySelector('button.start');
const texture = document.querySelector('select.texture');
const rooms = document.querySelector('.rooms');
const popupBtn = document.querySelector('button.popup');
const popup = document.querySelector('div.popup');
const back = document.querySelector('div.back');
const container = document.querySelector('.rooms > .container');
const create = document.querySelector('button.create');
const roomname = document.querySelector('input.roomname');
const map = document.querySelector('select.map');
const maxPlayers = document.querySelector('input.players');
const inRoom = document.querySelector('.inRoom');
const inRoomContainer = document.querySelector('.inRoom > .container');
const startGame = document.querySelector('button.init-game');
const settings = document.querySelector('div.settings');
const enterGame = () => {
    main.classList.add('hide');
    rooms.classList.remove('hide');
};
const offPopup = () => {
    popup.classList.add('hide');
    back.classList.add('hide');
};
const enterRoom = () => {
    rooms.classList.add('hide');
    inRoom.classList.remove('hide');
};
server.on('connect', () => {
    console.log('connected');
    // events
    nickname.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            enterGame();
            server.emit('getRooms');
        }
    });
    start.addEventListener('click', () => {
        enterGame();
        server.emit('getRooms');
    });
    popupBtn.addEventListener('click', () => {
        popup.classList.remove('hide');
        back.classList.remove('hide');
    });
    back.addEventListener('mousedown', offPopup);
    back.addEventListener('touchstart', offPopup);
    server.on('getRooms', (worlds) => {
        if (inRoom.classList.contains('hide')) {
            container.innerHTML = '';
            console.log(worlds);
            worlds.forEach((world) => {
                if (world.status !== 'waiting')
                    return;
                const room = document.createElement('div');
                room.classList.add('room');
                room.innerHTML = `
                    <div class="name">${world.name}</div>
                    <div class="map">${world.map}</div>
                    <div class="players">${Object.keys(world.players).length}/${world.maxPlayers}</div>
                `;
                const join = document.createElement('button');
                join.classList.add('join');
                join.innerText = 'Join';
                join.addEventListener('click', () => {
                    if (Object.keys(world.players).length >= world.maxPlayers)
                        return;
                    server.emit('joinRoom', world.ownerId, nickname.value, texture.value);
                });
                room.appendChild(join);
                container.appendChild(room);
            });
        }
        else {
            myWorld = worlds.find(world => world.ownerId === myWorld.ownerId);
            if (myWorld) {
                inRoomContainer.innerHTML = '';
                Object.keys(myWorld.players).forEach((id) => {
                    const player = myWorld.players[id];
                    const playerDiv = document.createElement('div');
                    playerDiv.classList.add('player');
                    playerDiv.innerText = player.nickname;
                    playerDiv.style.color = player.color;
                    inRoomContainer.appendChild(playerDiv);
                });
            }
            else {
                inRoom.classList.add('hide');
                rooms.classList.remove('hide');
                myWorld = null;
            }
        }
    });
    create.addEventListener('click', () => {
        server.emit('createRoom', roomname.value, map.value, Number(maxPlayers.value));
    });
    server.on('createdRoom', (world) => {
        server.emit('joinRoom', world.ownerId, nickname.value, texture.value);
    });
    server.on('joinedRoom', (world) => {
        console.log(world);
        myWorld = world;
        enterRoom();
        if (server.id == world.ownerId) {
            startGame.classList.remove('hide');
            startGame.addEventListener('click', () => {
                server.emit('startGame', world.ownerId);
                inRoom.classList.add('hide');
            });
            settings.classList.remove('hide');
        }
    });
    server.on('gameStarted', (world) => {
        inRoom.classList.add('hide');
        myWorld = world;
        initGame(myWorld);
    });
});


/***/ }),

/***/ "./src/textures.ts":
/*!*************************!*\
  !*** ./src/textures.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMaterial = exports.getColorMat = exports.getSquareTileMat = exports.getGraniteMat = exports.getMetalMat = exports.colors = void 0;
const BABYLON = __importStar(__webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js"));
exports.colors = {
    red: new BABYLON.Color3(1, 0, 0),
    green: new BABYLON.Color3(0, 1, 0),
    blue: new BABYLON.Color3(0, 0, 1),
    aqua: new BABYLON.Color3(0, 1, 1),
    magenta: new BABYLON.Color3(1, 0, 1),
    yellow: new BABYLON.Color3(1, 1, 0),
    black: new BABYLON.Color3(0, 0, 0),
    white: new BABYLON.Color3(1, 1, 1),
};
const getMetalMat = (scene) => {
    const MetalSphereMat = new BABYLON.StandardMaterial('MetalSphereMat', scene);
    MetalSphereMat.diffuseTexture = new BABYLON.Texture('texture/metal/bc.jpg', scene);
    MetalSphereMat.bumpTexture = new BABYLON.Texture('texture/metal/n.jpg', scene);
    MetalSphereMat.emissiveTexture = new BABYLON.Texture('texture/metal/m.jpg', scene);
    MetalSphereMat.specularTexture = new BABYLON.Texture('texture/metal/m.jpg', scene);
    MetalSphereMat.ambientTexture = new BABYLON.Texture('texture/metal/ao.jpg', scene);
    return MetalSphereMat;
};
exports.getMetalMat = getMetalMat;
const getGraniteMat = (scene) => {
    const GraniteSphereMat = new BABYLON.StandardMaterial('GraniteSphereMat', scene);
    GraniteSphereMat.diffuseTexture = new BABYLON.Texture('texture/granite/bc.png', scene);
    GraniteSphereMat.bumpTexture = new BABYLON.Texture('texture/granite/n.png', scene);
    GraniteSphereMat.emissiveTexture = new BABYLON.Texture('texture/granite/r.png', scene);
    GraniteSphereMat.ambientTexture = new BABYLON.Texture('texture/granite/a.png', scene);
    return GraniteSphereMat;
};
exports.getGraniteMat = getGraniteMat;
const getSquareTileMat = (scene) => {
    const SquareTileMat = new BABYLON.StandardMaterial('SquareTileMat', scene);
    SquareTileMat.diffuseTexture = new BABYLON.Texture('texture/square_tile/bc.png', scene);
    SquareTileMat.bumpTexture = new BABYLON.Texture('texture/square_tile/n.png', scene);
    SquareTileMat.emissiveTexture = new BABYLON.Texture('texture/square_tile/r.png', scene);
    SquareTileMat.ambientTexture = new BABYLON.Texture('texture/square_tile/ao.png', scene);
    return SquareTileMat;
};
exports.getSquareTileMat = getSquareTileMat;
const getColorMat = (scene, color) => {
    const ColorMat = new BABYLON.StandardMaterial('ColorMat', scene);
    ColorMat.diffuseColor = exports.colors[color];
    return ColorMat;
};
exports.getColorMat = getColorMat;
const getMaterial = (scene, name) => {
    switch (name) {
        case 'metal': return (0, exports.getMetalMat)(scene);
        case 'granite': return (0, exports.getGraniteMat)(scene);
        case 'square_tile': return (0, exports.getSquareTileMat)(scene);
        default: return (0, exports.getColorMat)(scene, name);
    }
};
exports.getMaterial = getMaterial;


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendors"], () => (__webpack_exec__("./src/index.ts")));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUM7SUFDbkYsYUFBYSxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxDQUFDO0lBQ3ZGLGFBQWEsQ0FBQyxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQztJQUN2RixPQUFPLGFBQWE7QUFDeEIsQ0FBQztBQVBZLHdCQUFnQixvQkFPNUI7QUFFTSxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQW1CLEVBQUUsS0FBWSxFQUFtQixFQUFFO0lBQzlFLE1BQU0sUUFBUSxHQUFHLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRSxRQUFRLENBQUMsWUFBWSxHQUFHLGNBQU0sQ0FBQyxLQUFLLENBQUM7SUFDckMsT0FBTyxRQUFRO0FBQ25CLENBQUM7QUFKWSxtQkFBVyxlQUl2QjtBQUVNLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBbUIsRUFBRSxJQUFXLEVBQW1CLEVBQUU7SUFDN0UsUUFBTyxJQUFJLEVBQUM7UUFDUixLQUFLLE9BQU8sQ0FBQyxDQUFDLE9BQU8sdUJBQVcsRUFBQyxLQUFLLENBQUM7UUFDdkMsS0FBSyxTQUFTLENBQUMsQ0FBQyxPQUFPLHlCQUFhLEVBQUMsS0FBSyxDQUFDO1FBQzNDLEtBQUssYUFBYSxDQUFDLENBQUMsT0FBTyw0QkFBZ0IsRUFBQyxLQUFLLENBQUM7UUFDbEQsT0FBTyxDQUFDLENBQUMsT0FBTyx1QkFBVyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7S0FDM0M7QUFDTCxDQUFDO0FBUFksbUJBQVcsZUFPdkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mcm9udC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mcm9udC8uL3NyYy90ZXh0dXJlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbywgU29ja2V0IH0gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XHJcbmltcG9ydCAqIGFzIEJBQllMT04gZnJvbSAnYmFieWxvbmpzJztcclxuaW1wb3J0ICogYXMgR1VJIGZyb20gJ2JhYnlsb25qcy1ndWknO1xyXG5pbXBvcnQgQ0FOTk9OIGZyb20gJ2Nhbm5vbidcclxuaW1wb3J0IHsgY3JlYXRlTWFwIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IG1hcHMgfSBmcm9tICcuL21hcCc7XHJcbmltcG9ydCB7IGdldEdyYW5pdGVNYXQsIGdldE1hdGVyaWFsLCBnZXRNZXRhbE1hdCwgZ2V0U3F1YXJlVGlsZU1hdCB9IGZyb20gJy4vdGV4dHVyZXMnO1xyXG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4vdHlwZXMnXHJcbmltcG9ydCAnYmFieWxvbmpzLWxvYWRlcnMvYmFieWxvbi5vYmpGaWxlTG9hZGVyJ1xyXG5cclxuY29uc3Qgc2VydmVyID0gaW8oJy8nKVxyXG5cclxud2luZG93LkNBTk5PTiA9IENBTk5PTlxyXG5cclxuY29uc3QgaXNNb2JpbGUgPSAoKTpib29sZWFuID0+IHtcclxuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdBbmRyb2lkJykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnaVBob25lJyk7XHJcbn07XHJcblxyXG5sZXQgbXlXb3JsZDpXb3JsZHxudWxsID0gbnVsbFxyXG5cclxuY29uc3QgaW5pdEdhbWUgPSBhc3luYyAodGhpc1dvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAvLyB2YXJpYWJsZXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGxldCBpbnB1dEtleXM6c3RyaW5nW10gPSBbXVxyXG4gICAgbGV0IHdvcmxkOldvcmxkID0gdGhpc1dvcmxkO1xyXG4gICAgbGV0IG1vdmluZ0FuZ2xlOm51bWJlcnxudWxsID0gbnVsbFxyXG4gICAgXHJcbiAgICBjb25zdCBnbG9iYWxEYW1waW5nID0gMC41O1xyXG4gICAgY29uc3QgZ2xvYmFsUmVzdGl0dXRpb24gPSAxLjU7XHJcbiAgICBsZXQgY2FtUmFkaW91cyA9IGlzTW9iaWxlKCkgPyBpbm5lcldpZHRoID4gaW5uZXJIZWlnaHQgPyAxMyA6IDIwIDogMTA7XHJcbiAgICBjb25zdCBzcGVlZCA9IDAuMjtcclxuICAgIGNvbnN0IGp1bXBIZWlnaHQgPSA4O1xyXG4gICAgY29uc3QganVtcENvb2xUaW1lID0gNDAwO1xyXG4gICAgY29uc3Qgbmlja25hbWVPZmZzZXQgPSAxLjU7XHJcbiAgICBcclxuICAgIGxldCB0aW1lciA9IDA7XHJcblxyXG4gICAgLy8gZWxlbWVudHMgaW5pdGlhbGl6YXRpb25cclxuICAgIGNvbnN0IGp1bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanVtcCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAganVtcC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIFxyXG4gICAgLy8gZ2FtZSBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlbmRlckNhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgY29uc3QgZW5naW5lID0gbmV3IEJBQllMT04uRW5naW5lKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBCQUJZTE9OLlNjZW5lKGVuZ2luZSk7XHJcbiAgICBzY2VuZS5lbmFibGVQaHlzaWNzKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTkuODEsIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIFxyXG4gICAgLy8gbXkgc3BoZXJlXHJcbiAgICBjb25zdCBzcGhlcmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgnc3BoZXJlJywge2RpYW1ldGVyOjEsIHNlZ21lbnRzOjE2fSwgc2NlbmUpO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnggPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMF07XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueSA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblsxXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzJdO1xyXG4gICAgc3BoZXJlLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5jb2xvcik7XHJcbiAgICBjb25zdCBzcGhlcmVJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGhlcmUsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yID0gc3BoZXJlSW1wb3N0ZXI7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG5cclxuICAgIFxyXG4gICAgLy8gY2FtZXJhXHJcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQkFCWUxPTi5BcmNSb3RhdGVDYW1lcmEoJ0NhbWVyYScsIDAsIDAsIDEwLCBzcGhlcmUucG9zaXRpb24sIHNjZW5lKTtcclxuICAgIGNhbWVyYS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjYW1lcmEuaW5lcnRpYSA9IGlzTW9iaWxlKCkgPyAwLjggOiAwLjU7XHJcbiAgICBjYW1lcmEudXBwZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBcclxuICAgIC8vZm9nXHJcbiAgICBzY2VuZS5mb2dNb2RlID0gQkFCWUxPTi5TY2VuZS5GT0dNT0RFX0VYUDtcclxuICAgIHNjZW5lLmZvZ0RlbnNpdHkgPSAwLjAwNTtcclxuICAgIHNjZW5lLmZvZ0NvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAuOSwgMC45LCAwLjkpO1xyXG4gICAgc2NlbmUuZm9nU3RhcnQgPSAyMC4wO1xyXG4gICAgc2NlbmUuZm9nRW5kID0gNjAuMDtcclxuICAgIFxyXG4gICAgLy9MaWdodFxyXG4gICAgc2NlbmUuYW1iaWVudENvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsMSwxKTtcclxuICAgIHZhciBsaWdodDEgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KFwibGlnaHQxXCIsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMSwxLDApLCBzY2VuZSk7XHJcbiAgICB2YXIgbGlnaHQyID0gbmV3IEJBQllMT04uUG9pbnRMaWdodChcImxpZ2h0MlwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDYwLDYwLDApLCBzY2VuZSk7XHJcbiAgICBsaWdodDEuaW50ZW5zaXR5ID0gMC41O1xyXG4gICAgbGlnaHQyLmludGVuc2l0eSA9IDAuNTtcclxuICAgIFxyXG4gICAgLy8gc2hhZG93XHJcbiAgICBjb25zdCBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgQkFCWUxPTi5TaGFkb3dHZW5lcmF0b3IoMTAyNCwgbGlnaHQyKTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci51c2VDb250YWN0SGFyZGVuaW5nU2hhZG93ID0gdHJ1ZTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoZXJlKTtcclxuICAgIFxyXG4gICAgLy8gbWFwIChncm91bmQpXHJcbiAgICAvLyBjb25zdCBncm91bmQgPSBjcmVhdGVNYXAoc2NlbmUsIG1hcHNbJ2RlZmF1bHQnXSwgc2hhZG93R2VuZXJhdG9yKVxyXG5cclxuICAgIC8vIGh0dHBzOi8vcGxheWdyb3VuZC5iYWJ5bG9uanMuY29tLyMwSVJWOFhcclxuICAgIFxyXG4gICAgbGV0IG5ld01lc2hlcyA9IChhd2FpdCBCQUJZTE9OLlNjZW5lTG9hZGVyLkltcG9ydE1lc2hBc3luYygnJywgJ29iai8nLCAndGVzdDEub2JqJywgc2NlbmUpKS5tZXNoZXM7XHJcbiAgICBlbmdpbmUuaGlkZUxvYWRpbmdVSSgpXHJcbiAgICBcclxuICAgIG5ld01lc2hlcy5mb3JFYWNoKChtZXNoKSA9PiB7XHJcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlbmRlckxpc3QucHVzaChtZXNoKTtcclxuICAgICAgICBtZXNoLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZTtcclxuICAgICAgICBtZXNoLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihtZXNoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5NZXNoSW1wb3N0b3IsIHsgbWFzczogMCwgcmVzdGl0dXRpb246IDAuMDEsIGZyaWN0aW9uOjEsIGRhbXBpbmc6MTAwIH0sIHNjZW5lKTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8ganVtcCB2YXJzXHJcbiAgICBjb25zdCBqdW1wRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmp1bXAgPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzSnVtcGluZyA9IHRydWU7XHJcbiAgICBsZXQganVtcFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gbG9vcFxyXG4gICAgZW5naW5lLnJ1blJlbmRlckxvb3AoKCkgPT4ge1xyXG4gICAgICAgIHRpbWVyKys7XHJcbiAgICAgICAgY2FtZXJhLnNldFRhcmdldChzcGhlcmUucG9zaXRpb24pO1xyXG4gICAgICAgIGNvbnN0IGR4ID0gKGNhbWVyYS50YXJnZXQueCAtIGNhbWVyYS5wb3NpdGlvbi54KVxyXG4gICAgICAgIGNvbnN0IGR6ID0gKGNhbWVyYS50YXJnZXQueiAtIGNhbWVyYS5wb3NpdGlvbi56KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeiwgZHgpXHJcbiAgICAgICAgaWYoaXNNb2JpbGUoKSkge1xyXG4gICAgICAgICAgICBpZihtb3ZpbmdBbmdsZSkgbW92aW5nQW5nbGUgKz0gYW5nbGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdhJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlICsgTWF0aC5QSS80O31cclxuICAgICAgICAgICAgZWxzZSBpZiAoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS80O31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQgKiAzO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQgKiAzO31cclxuICAgICAgICAgICAgZWxzZSBpZiAoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzI7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2Uge21vdmluZ0FuZ2xlID0gbnVsbDt9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgY29uc3QgeCA9IE1hdGguY29zKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgIGNvbnN0IHogPSBNYXRoLnNpbihtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIDAsIHopLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoaXNNb2JpbGUoKSAmJiBtb3ZpbmdBbmdsZSAhPT0gbnVsbCkge21vdmluZ0FuZ2xlIC09IGFuZ2xlO31cclxuICAgICAgICBpZihzcGhlcmUucG9zaXRpb24ueSA8IC0xMCkge1xyXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi55ID0gNTtcclxuICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnogPSAwO1xyXG4gICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwwLDApKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIWlzSnVtcGluZyAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJyAnKSkge1xyXG4gICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIGp1bXBIZWlnaHQsIDApLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgaXNKdW1waW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAganVtcFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBqdW1wRGl2LnN0eWxlLmhlaWdodCA9IGAke3RpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSA/IDEwMCA6ICh0aW1lciAtIGp1bXBUaW1lU3RhbXApL2p1bXBDb29sVGltZSoxMDB9JWA7XHJcbiAgICAgICAgaWYoaXNKdW1waW5nICYmIHRpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSkge1xyXG4gICAgICAgICAgICBpc0p1bXBpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ3VwZGF0ZScsIFtzcGhlcmUucG9zaXRpb24ueCwgc3BoZXJlLnBvc2l0aW9uLnksIHNwaGVyZS5wb3NpdGlvbi56XSwgW3NwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS54LCBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkueSwgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLnpdKTtcclxuICAgICAgICBzY2VuZS5yZW5kZXIoKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBpbnB1dCBldmVudFxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKCFpbnB1dEtleXMuaW5jbHVkZXMoZS5rZXkpKSB7XHJcbiAgICAgICAgICAgIGlucHV0S2V5cy5wdXNoKGUua2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gZS5rZXkpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIHJlc2l6ZSBldmVudFxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICBlbmdpbmUucmVzaXplKClcclxuICAgICAgICBjYW1SYWRpb3VzID0gaXNNb2JpbGUoKSA/IGlubmVyV2lkdGggPiBpbm5lckhlaWdodCA/IDEzIDogMjAgOiAxMDtcclxuICAgICAgICBjYW1lcmEudXBwZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICAgICAgY2FtZXJhLmxvd2VyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIHBvaW50ZXIgbG9ja1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY2FudmFzLnJlcXVlc3RQb2ludGVyTG9jaygpO1xyXG4gICAgICAgIGNhbnZhcy5mb2N1cygpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIG1vYmlsZSBjb250cm9sXHJcbiAgICBjb25zdCBtb2JpbGVMYXlvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubW9iaWxlLWxheW91dCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3Qgam95c3RpY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuam95c3RpY2snKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGNvbnN0IGpveXN0aWNrQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpveXN0aWNrLWJ1dHRvbicpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgaWYoaXNNb2JpbGUoKSkgbW9iaWxlTGF5b3V0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgbGV0IHN0YXJ0UG9pbnQgPSBbMCwwXVxyXG4gICAgXHJcbiAgICBjb25zdCBnZXRUb3VjaGVzWFkgPSAoZXZlbnQ6VG91Y2hFdmVudCk6W251bWJlciwgbnVtYmVyXSA9PiB7XHJcbiAgICAgICAgbGV0IHggPSBldmVudC50b3VjaGVzWzBdLmNsaWVudFhcclxuICAgICAgICBsZXQgeSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICAgIGZvcihsZXQgaT0xOyBpPGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZCA9IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WCA8IHhcclxuICAgICAgICAgICAgeCA9IGNvbmQgPyBldmVudC50b3VjaGVzW2ldLmNsaWVudFggOiB4XHJcbiAgICAgICAgICAgIHkgPSBjb25kID8gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRZIDogeVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3gsIHldXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGp1bXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBpbnB1dEtleXMucHVzaCgnICcpXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfSlcclxuICAgIGp1bXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICcgJyk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgbW9iaWxlTGF5b3V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgW3gsIHldID0gZ2V0VG91Y2hlc1hZKGV2ZW50KVxyXG4gICAgICAgIGpveXN0aWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLmxlZnQgPSBgJHt4fXB4YFxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRvcCA9IGAke3l9cHhgXHJcbiAgICAgICAgc3RhcnRQb2ludCA9IFt4LCB5XVxyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLmxlZnQgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIG1vYmlsZUxheW91dC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBldmVudCA9PiB7XHJcbiAgICAgICAgbGV0IFtkeCwgZHldID0gZ2V0VG91Y2hlc1hZKGV2ZW50KVxyXG4gICAgICAgIGR4IC09IHN0YXJ0UG9pbnRbMF1cclxuICAgICAgICBkeSAtPSBzdGFydFBvaW50WzFdXHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcclxuICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxyXG4gICAgICAgIGNvbnN0IG1heERpc3RhbmNlID0gNTBcclxuICAgICAgICBjb25zdCB4ID0gTWF0aC5jb3MoYW5nbGUpICogTWF0aC5taW4oZGlzdGFuY2UsIG1heERpc3RhbmNlKVxyXG4gICAgICAgIGNvbnN0IHkgPSBNYXRoLnNpbihhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUubGVmdCA9IGAke3grNTB9cHhgXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUudG9wID0gYCR7eSs1MH1weGBcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9ICgtYW5nbGUpIC0gTWF0aC5QSS8yO1xyXG4gICAgfSk7XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgam95c3RpY2suY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuNXMnXHJcbiAgICAgICAgbW92aW5nQW5nbGUgPSBudWxsO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIGVuZW15IGNyZWF0aW9uXHJcbiAgICBjb25zdCBjcmVhdGVFbmVteSA9IChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBjb25zdCBzcGggPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZShgJHtpZH1gLCB7ZGlhbWV0ZXI6MSwgc2VnbWVudHM6MzJ9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnkgPSBwb3NbMV07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnogPSBwb3NbMl07XHJcbiAgICAgICAgY29uc3Qgc3BoSW1wb3N0ZXIgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3Ioc3BoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3RvciwgeyBtYXNzOiAxLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24sIGZyaWN0aW9uOjEgfSwgc2NlbmUpO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IgPSBzcGhJbXBvc3RlcjtcclxuICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMyh2ZWxvY2l0eVswXSwgdmVsb2NpdHlbMV0sIHZlbG9jaXR5WzJdKSk7XHJcbiAgICAgICAgc3BoLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbaWRdLmNvbG9yKTtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaCk7XHJcbiAgICAgICAgY29uc3QgbmljayA9IHdvcmxkLnBsYXllcnNbaWRdLm5pY2tuYW1lXHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKGAke2lkfS1wbGFuZWAsIHt3aWR0aDogbmljay5sZW5ndGgsIGhlaWdodDogNX0sIHNjZW5lKTtcclxuICAgICAgICBwbGFuZS5iaWxsYm9hcmRNb2RlID0gQkFCWUxPTi5NZXNoLkJJTExCT0FSRE1PREVfQUxMO1xyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi55ID0gcG9zWzFdICsgbmlja25hbWVPZmZzZXRcclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi56ID0gcG9zWzJdXHJcbiAgICAgICAgY29uc3Qgbmlja1RleHR1cmUgPSBHVUkuQWR2YW5jZWREeW5hbWljVGV4dHVyZS5DcmVhdGVGb3JNZXNoKHBsYW5lKTtcclxuICAgICAgICBjb25zdCBuaWNrVGV4dCA9IG5ldyBHVUkuVGV4dEJsb2NrKCk7XHJcbiAgICAgICAgbmlja1RleHQudGV4dCA9IG5pY2s7XHJcbiAgICAgICAgbmlja1RleHQuY29sb3IgPSAnd2hpdGUnO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRTaXplID0gMTAwO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udEZhbWlseSA9ICdBcmlhbCc7XHJcbiAgICAgICAgbmlja1RleHR1cmUuYWRkQ29udHJvbChuaWNrVGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vIHNvY2tldC5pb1xyXG4gICAgc2VydmVyLmVtaXQoJ2luaXQnLCB3b3JsZC5vd25lcklkKVxyXG4gICAgc2VydmVyLm9uKCdpbml0JywgKGRhdGE6IFdvcmxkKSA9PiB7XHJcbiAgICAgICAgd29ybGQgPSBkYXRhO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmZvckVhY2goKGlkOnN0cmluZywgaTpudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgaWYoaWQgPT09IHNlcnZlci5pZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB3b3JsZC5wbGF5ZXJzW2lkXS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgY29uc3QgdmVsb2NpdHkgPSB3b3JsZC5wbGF5ZXJzW2lkXS52ZWxvY2l0eTtcclxuICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyh3b3JsZClcclxuICAgIHNlcnZlci5vbigndXBkYXRlJywgKGlkOnN0cmluZywgcG9zOm51bWJlcltdLCB2ZWxvY2l0eTpudW1iZXJbXSkgPT4ge1xyXG4gICAgICAgIGlmKHN0YXJ0ZWQgJiYgd29ybGQucGxheWVyc1tpZF0pe1xyXG4gICAgICAgICAgICB3b3JsZC5wbGF5ZXJzW2lkXS5wb3NpdGlvbiA9IHBvcztcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tpZF0udmVsb2NpdHkgPSB2ZWxvY2l0eTtcclxuICAgICAgICAgICAgaWYoaWQgPT09IHNlcnZlci5pZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBzcGggPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGlkKTtcclxuICAgICAgICAgICAgY29uc3QgcGxhbmUgPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGAke2lkfS1wbGFuZWApO1xyXG4gICAgICAgICAgICBpZiAoc3BoICYmIHBsYW5lKSB7XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueCA9IHBvc1swXTtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi55ID0gcG9zWzFdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnogPSBwb3NbMl07XHJcbiAgICAgICAgICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjModmVsb2NpdHlbMF0sIHZlbG9jaXR5WzFdLCB2ZWxvY2l0eVsyXSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueCA9IHBvc1swXVxyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueSA9IHBvc1sxXSArIG5pY2tuYW1lT2Zmc2V0XHJcbiAgICAgICAgICAgICAgICBwbGFuZS5wb3NpdGlvbi56ID0gcG9zWzJdXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGVFbmVteShpZCwgcG9zLCB2ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlcnZlci5vbignZGlzY29ubmVjdGVkJywgKGlkOnN0cmluZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNwaCA9IHNjZW5lLmdldE1lc2hCeU5hbWUoaWQpO1xyXG4gICAgICAgIGNvbnN0IHBsYW5lID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShgJHtpZH0tcGxhbmVgKTtcclxuICAgICAgICBpZiAoc3BoICYmIHBsYW5lKSB7XHJcbiAgICAgICAgICAgIHNwaC5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIHBsYW5lLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHdvcmxkLnBsYXllcnNbaWRdO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IG1haW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IG5pY2tuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQubmlja25hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IHN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLnN0YXJ0JykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3QgdGV4dHVyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC50ZXh0dXJlJykgYXMgSFRNTFNlbGVjdEVsZW1lbnRcclxuXHJcbmNvbnN0IHJvb21zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb21zJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgcG9wdXBCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24ucG9wdXAnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5wb3B1cCcpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGJhY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuYmFjaycpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb29tcyA+IC5jb250YWluZXInKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5cclxuY29uc3QgY3JlYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmNyZWF0ZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHJvb21uYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucm9vbW5hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IG1hcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC5tYXAnKSBhcyBIVE1MU2VsZWN0RWxlbWVudFxyXG5jb25zdCBtYXhQbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucGxheWVycycpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuXHJcbmNvbnN0IGluUm9vbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pblJvb20nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBpblJvb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5Sb29tID4gLmNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHN0YXJ0R2FtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5pbml0LWdhbWUnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5zZXR0aW5ncycpIGFzIEhUTUxEaXZFbGVtZW50XHJcblxyXG5jb25zdCBlbnRlckdhbWUgPSAoKSA9PiB7XHJcbiAgICBtYWluLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgcm9vbXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbn1cclxuXHJcbmNvbnN0IG9mZlBvcHVwID0gKCkgPT4ge1xyXG4gICAgcG9wdXAuY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICBiYWNrLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG59XHJcblxyXG5jb25zdCBlbnRlclJvb20gPSAoKSA9PiB7XHJcbiAgICByb29tcy5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIGluUm9vbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxufVxyXG5cclxuc2VydmVyLm9uKCdjb25uZWN0JywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCcpO1xyXG4gICAgXHJcbiAgICAvLyBldmVudHNcclxuICAgIG5pY2tuYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIHBvcHVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9mZlBvcHVwKVxyXG4gICAgYmFjay5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb2ZmUG9wdXApXHJcblxyXG4gICAgc2VydmVyLm9uKCdnZXRSb29tcycsICh3b3JsZHM6V29ybGRbXSkgPT4ge1xyXG4gICAgICAgIGlmKGluUm9vbS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGUnKSl7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh3b3JsZHMpXHJcbiAgICAgICAgICAgIHdvcmxkcy5mb3JFYWNoKCh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYod29ybGQuc3RhdHVzICE9PSAnd2FpdGluZycpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICAgICAgcm9vbS5jbGFzc0xpc3QuYWRkKCdyb29tJylcclxuICAgICAgICAgICAgICAgIHJvb20uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYW1lXCI+JHt3b3JsZC5uYW1lfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXBcIj4ke3dvcmxkLm1hcH08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGxheWVyc1wiPiR7T2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RofS8ke3dvcmxkLm1heFBsYXllcnN9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBqb2luID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcclxuICAgICAgICAgICAgICAgIGpvaW4uY2xhc3NMaXN0LmFkZCgnam9pbicpXHJcbiAgICAgICAgICAgICAgICBqb2luLmlubmVyVGV4dCA9ICdKb2luJ1xyXG4gICAgICAgICAgICAgICAgam9pbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihPYmplY3Qua2V5cyh3b3JsZC5wbGF5ZXJzKS5sZW5ndGggPj0gd29ybGQubWF4UGxheWVycykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5lbWl0KCdqb2luUm9vbScsIHdvcmxkLm93bmVySWQsIG5pY2tuYW1lLnZhbHVlLCB0ZXh0dXJlLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHJvb20uYXBwZW5kQ2hpbGQoam9pbilcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyb29tKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG15V29ybGQgPSB3b3JsZHMuZmluZCh3b3JsZCA9PiB3b3JsZC5vd25lcklkID09PSBteVdvcmxkLm93bmVySWQpXHJcbiAgICAgICAgICAgIGlmKG15V29ybGQpe1xyXG4gICAgICAgICAgICAgICAgaW5Sb29tQ29udGFpbmVyLmlubmVySFRNTCA9ICcnXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhteVdvcmxkLnBsYXllcnMpLmZvckVhY2goKGlkOnN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYXllciA9IG15V29ybGQucGxheWVyc1tpZF1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckRpdi5jbGFzc0xpc3QuYWRkKCdwbGF5ZXInKVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckRpdi5pbm5lclRleHQgPSBwbGF5ZXIubmlja25hbWVcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJEaXYuc3R5bGUuY29sb3IgPSBwbGF5ZXIuY29sb3JcclxuICAgICAgICAgICAgICAgICAgICBpblJvb21Db250YWluZXIuYXBwZW5kQ2hpbGQocGxheWVyRGl2KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIHJvb21zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgbXlXb3JsZCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgY3JlYXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHNlcnZlci5lbWl0KCdjcmVhdGVSb29tJywgcm9vbW5hbWUudmFsdWUsIG1hcC52YWx1ZSwgTnVtYmVyKG1heFBsYXllcnMudmFsdWUpKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2NyZWF0ZWRSb29tJywgKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2pvaW5Sb29tJywgd29ybGQub3duZXJJZCwgbmlja25hbWUudmFsdWUsIHRleHR1cmUudmFsdWUpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignam9pbmVkUm9vbScsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHdvcmxkKVxyXG4gICAgICAgIG15V29ybGQgPSB3b3JsZFxyXG4gICAgICAgIGVudGVyUm9vbSgpXHJcbiAgICAgICAgaWYoc2VydmVyLmlkID09IHdvcmxkLm93bmVySWQpe1xyXG4gICAgICAgICAgICBzdGFydEdhbWUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgICAgIHN0YXJ0R2FtZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNlcnZlci5lbWl0KCdzdGFydEdhbWUnLCB3b3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignZ2FtZVN0YXJ0ZWQnLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgbXlXb3JsZCA9IHdvcmxkXHJcbiAgICAgICAgaW5pdEdhbWUobXlXb3JsZClcclxuICAgIH0pXHJcbn0pIiwiaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnXHJcblxyXG5leHBvcnQgY29uc3QgY29sb3JzID0ge1xyXG4gICAgcmVkIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDApLFxyXG4gICAgZ3JlZW4gOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMSwgMCksXHJcbiAgICBibHVlIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDEpLFxyXG4gICAgYXF1YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAxKSxcclxuICAgIG1hZ2VudGEgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMSksXHJcbiAgICB5ZWxsb3cgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMCksXHJcbiAgICBibGFjayA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKSxcclxuICAgIHdoaXRlIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWV0YWxNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBNZXRhbFNwaGVyZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ01ldGFsU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgTWV0YWxTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL2JjLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL24uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5zcGVjdWxhclRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYW8uanBnJywgc2NlbmUpXHJcbiAgICByZXR1cm4gTWV0YWxTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEdyYW5pdGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBHcmFuaXRlU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnR3Jhbml0ZVNwaGVyZU1hdCcsIHNjZW5lKTtcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL24ucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9hLnBuZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIEdyYW5pdGVTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNxdWFyZVRpbGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBTcXVhcmVUaWxlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnU3F1YXJlVGlsZU1hdCcsIHNjZW5lKTtcclxuICAgIFNxdWFyZVRpbGVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL2JjLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYW8ucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gU3F1YXJlVGlsZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q29sb3JNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgY29sb3I6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IENvbG9yTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnQ29sb3JNYXQnLCBzY2VuZSk7XHJcbiAgICBDb2xvck1hdC5kaWZmdXNlQ29sb3IgPSBjb2xvcnNbY29sb3JdXHJcbiAgICByZXR1cm4gQ29sb3JNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1hdGVyaWFsID0gKHNjZW5lOkJBQllMT04uU2NlbmUsIG5hbWU6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIHN3aXRjaChuYW1lKXtcclxuICAgICAgICBjYXNlICdtZXRhbCc6IHJldHVybiBnZXRNZXRhbE1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdncmFuaXRlJzogcmV0dXJuIGdldEdyYW5pdGVNYXQoc2NlbmUpXHJcbiAgICAgICAgY2FzZSAnc3F1YXJlX3RpbGUnOiByZXR1cm4gZ2V0U3F1YXJlVGlsZU1hdChzY2VuZSlcclxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gZ2V0Q29sb3JNYXQoc2NlbmUsIG5hbWUpXHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=