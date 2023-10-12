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
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
const map_1 = __webpack_require__(/*! ./map */ "./src/map.ts");
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
    const ground = (0, utils_1.createMap)(scene, map_1.maps['default'], shadowGenerator);
    const newMeshes = (await BABYLON.SceneLoader.ImportMeshAsync('', 'obj/', 'map2.gltf', scene)).meshes;
    // continue with : https://playground.babylonjs.com/#R791PH#15
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

/***/ "./src/map.ts":
/*!********************!*\
  !*** ./src/map.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.maps = void 0;
const babylonjs_1 = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
const textures_1 = __webpack_require__(/*! ./textures */ "./src/textures.ts");
exports.maps = {
    default: {
        meshes: [
            { name: 'box1', position: new babylonjs_1.Vector3(4, 0.5, 6), rotation: new babylonjs_1.Vector3(0, 45, 0), scaling: new babylonjs_1.Vector3(1, 1, 1), color: textures_1.colors.white },
            { name: 'stair1', position: new babylonjs_1.Vector3(-7, -0.5, 2), rotation: new babylonjs_1.Vector3(0.3, 0, 0), scaling: new babylonjs_1.Vector3(2, 4, 10), color: textures_1.colors.white },
            { name: 'box1', position: new babylonjs_1.Vector3(-3, 1.39, -4.69), rotation: new babylonjs_1.Vector3(0, 0, 0), scaling: new babylonjs_1.Vector3(10, 3, 5), color: textures_1.colors.white },
        ],
        width: 40,
        height: 20,
        color: textures_1.colors.white,
    },
};


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


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createMap = void 0;
const BABYLON = __importStar(__webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js"));
const createMap = (scene, map, shadowGenerator) => {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: map.width, height: map.height }, scene);
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = map.color;
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 1 }, scene);
    map.meshes.forEach(mesh => {
        const box = BABYLON.MeshBuilder.CreateBox(mesh.name, { width: 1, height: 1, depth: 1 }, scene);
        box.position = mesh.position;
        box.rotation = mesh.rotation;
        box.scaling = mesh.scaling;
        const boxMat = new BABYLON.StandardMaterial(mesh.name + 'Mat', scene);
        boxMat.diffuseColor = mesh.color;
        box.material = boxMat;
        box.receiveShadows = true;
        box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 1 }, scene);
        shadowGenerator.getShadowMap().renderList.push(box);
    });
    return ground;
};
exports.createMap = createMap;


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendors"], () => (__webpack_exec__("./src/index.ts")));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlJLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQztJQUNGLE9BQU8sTUFBTTtBQUNqQixDQUFDO0FBcEJZLGlCQUFTLGFBb0JyQiIsInNvdXJjZXMiOlsid2VicGFjazovL2Zyb250Ly4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2Zyb250Ly4vc3JjL21hcC50cyIsIndlYnBhY2s6Ly9mcm9udC8uL3NyYy90ZXh0dXJlcy50cyIsIndlYnBhY2s6Ly9mcm9udC8uL3NyYy91dGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbywgU29ja2V0IH0gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XHJcbmltcG9ydCAqIGFzIEJBQllMT04gZnJvbSAnYmFieWxvbmpzJztcclxuaW1wb3J0ICogYXMgR1VJIGZyb20gJ2JhYnlsb25qcy1ndWknO1xyXG5pbXBvcnQgQ0FOTk9OIGZyb20gJ2Nhbm5vbidcclxuaW1wb3J0IHsgY3JlYXRlTWFwIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IG1hcHMgfSBmcm9tICcuL21hcCc7XHJcbmltcG9ydCB7IGdldEdyYW5pdGVNYXQsIGdldE1hdGVyaWFsLCBnZXRNZXRhbE1hdCwgZ2V0U3F1YXJlVGlsZU1hdCB9IGZyb20gJy4vdGV4dHVyZXMnO1xyXG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4vdHlwZXMnXHJcbmltcG9ydCAnYmFieWxvbmpzLWxvYWRlcnMvYmFieWxvbi5vYmpGaWxlTG9hZGVyJ1xyXG5pbXBvcnQgeyBPQkpGaWxlTG9hZGVyIH0gZnJvbSAnYmFieWxvbmpzLWxvYWRlcnMnO1xyXG5cclxuY29uc3Qgc2VydmVyID0gaW8oJy8nKVxyXG5cclxud2luZG93LkNBTk5PTiA9IENBTk5PTlxyXG5cclxuY29uc3QgaXNNb2JpbGUgPSAoKTpib29sZWFuID0+IHtcclxuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdBbmRyb2lkJykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnaVBob25lJyk7XHJcbn07XHJcblxyXG5sZXQgbXlXb3JsZDpXb3JsZHxudWxsID0gbnVsbFxyXG5cclxuY29uc3QgaW5pdEdhbWUgPSBhc3luYyAodGhpc1dvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAvLyB2YXJpYWJsZXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGxldCBpbnB1dEtleXM6c3RyaW5nW10gPSBbXVxyXG4gICAgbGV0IHdvcmxkOldvcmxkID0gdGhpc1dvcmxkO1xyXG4gICAgbGV0IG1vdmluZ0FuZ2xlOm51bWJlcnxudWxsID0gbnVsbFxyXG4gICAgXHJcbiAgICBjb25zdCBnbG9iYWxEYW1waW5nID0gMC41O1xyXG4gICAgY29uc3QgZ2xvYmFsUmVzdGl0dXRpb24gPSAxLjU7XHJcbiAgICBsZXQgY2FtUmFkaW91cyA9IGlzTW9iaWxlKCkgPyBpbm5lcldpZHRoID4gaW5uZXJIZWlnaHQgPyAxMyA6IDIwIDogMTA7XHJcbiAgICBjb25zdCBzcGVlZCA9IDAuMjtcclxuICAgIGNvbnN0IGp1bXBIZWlnaHQgPSA4O1xyXG4gICAgY29uc3QganVtcENvb2xUaW1lID0gNDAwO1xyXG4gICAgY29uc3Qgbmlja25hbWVPZmZzZXQgPSAxLjU7XHJcbiAgICBcclxuICAgIGxldCB0aW1lciA9IDA7XHJcblxyXG4gICAgLy8gZWxlbWVudHMgaW5pdGlhbGl6YXRpb25cclxuICAgIGNvbnN0IGp1bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanVtcCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAganVtcC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIFxyXG4gICAgLy8gZ2FtZSBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlbmRlckNhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgY29uc3QgZW5naW5lID0gbmV3IEJBQllMT04uRW5naW5lKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBCQUJZTE9OLlNjZW5lKGVuZ2luZSk7XHJcbiAgICBzY2VuZS5lbmFibGVQaHlzaWNzKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTkuODEsIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIFxyXG4gICAgLy8gbXkgc3BoZXJlXHJcbiAgICBjb25zdCBzcGhlcmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgnc3BoZXJlJywge2RpYW1ldGVyOjEsIHNlZ21lbnRzOjE2fSwgc2NlbmUpO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnggPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMF07XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueSA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblsxXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzJdO1xyXG4gICAgc3BoZXJlLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5jb2xvcik7XHJcbiAgICBjb25zdCBzcGhlcmVJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGhlcmUsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yID0gc3BoZXJlSW1wb3N0ZXI7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG5cclxuICAgIFxyXG4gICAgLy8gY2FtZXJhXHJcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQkFCWUxPTi5BcmNSb3RhdGVDYW1lcmEoJ0NhbWVyYScsIDAsIDAsIDEwLCBzcGhlcmUucG9zaXRpb24sIHNjZW5lKTtcclxuICAgIGNhbWVyYS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjYW1lcmEuaW5lcnRpYSA9IGlzTW9iaWxlKCkgPyAwLjggOiAwLjU7XHJcbiAgICBjYW1lcmEudXBwZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBcclxuICAgIC8vZm9nXHJcbiAgICBzY2VuZS5mb2dNb2RlID0gQkFCWUxPTi5TY2VuZS5GT0dNT0RFX0VYUDtcclxuICAgIHNjZW5lLmZvZ0RlbnNpdHkgPSAwLjAwNTtcclxuICAgIHNjZW5lLmZvZ0NvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAuOSwgMC45LCAwLjkpO1xyXG4gICAgc2NlbmUuZm9nU3RhcnQgPSAyMC4wO1xyXG4gICAgc2NlbmUuZm9nRW5kID0gNjAuMDtcclxuICAgIFxyXG4gICAgLy9MaWdodFxyXG4gICAgc2NlbmUuYW1iaWVudENvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsMSwxKTtcclxuICAgIHZhciBsaWdodDEgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KFwibGlnaHQxXCIsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMSwxLDApLCBzY2VuZSk7XHJcbiAgICB2YXIgbGlnaHQyID0gbmV3IEJBQllMT04uUG9pbnRMaWdodChcImxpZ2h0MlwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDYwLDYwLDApLCBzY2VuZSk7XHJcbiAgICBsaWdodDEuaW50ZW5zaXR5ID0gMC41O1xyXG4gICAgbGlnaHQyLmludGVuc2l0eSA9IDAuNTtcclxuICAgIFxyXG4gICAgLy8gc2hhZG93XHJcbiAgICBjb25zdCBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgQkFCWUxPTi5TaGFkb3dHZW5lcmF0b3IoMTAyNCwgbGlnaHQyKTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci51c2VDb250YWN0SGFyZGVuaW5nU2hhZG93ID0gdHJ1ZTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoZXJlKTtcclxuICAgIFxyXG4gICAgLy8gbWFwIChncm91bmQpXHJcbiAgICBjb25zdCBncm91bmQgPSBjcmVhdGVNYXAoc2NlbmUsIG1hcHNbJ2RlZmF1bHQnXSwgc2hhZG93R2VuZXJhdG9yKVxyXG5cclxuICAgIGNvbnN0IG5ld01lc2hlcyA9IChhd2FpdCBCQUJZTE9OLlNjZW5lTG9hZGVyLkltcG9ydE1lc2hBc3luYygnJywgJ29iai8nLCAnbWFwMi5nbHRmJywgc2NlbmUpKS5tZXNoZXMgYXMgQkFCWUxPTi5NZXNoW11cclxuXHJcbiAgICAvLyBjb250aW51ZSB3aXRoIDogaHR0cHM6Ly9wbGF5Z3JvdW5kLmJhYnlsb25qcy5jb20vI1I3OTFQSCMxNVxyXG5cclxuICAgIC8vIGp1bXAgdmFyc1xyXG4gICAgY29uc3QganVtcERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qdW1wID4gZGl2JykgYXMgSFRNTERpdkVsZW1lbnRcclxuICAgIGxldCBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgbGV0IGp1bXBUaW1lU3RhbXAgPSAwO1xyXG5cclxuICAgIC8vIGxvb3BcclxuICAgIGVuZ2luZS5ydW5SZW5kZXJMb29wKCgpID0+IHtcclxuICAgICAgICB0aW1lcisrO1xyXG4gICAgICAgIGNhbWVyYS5zZXRUYXJnZXQoc3BoZXJlLnBvc2l0aW9uKTtcclxuICAgICAgICBjb25zdCBkeCA9IChjYW1lcmEudGFyZ2V0LnggLSBjYW1lcmEucG9zaXRpb24ueClcclxuICAgICAgICBjb25zdCBkeiA9IChjYW1lcmEudGFyZ2V0LnogLSBjYW1lcmEucG9zaXRpb24ueilcclxuICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZHosIGR4KVxyXG4gICAgICAgIGlmKGlzTW9iaWxlKCkpIHtcclxuICAgICAgICAgICAgaWYobW92aW5nQW5nbGUpIG1vdmluZ0FuZ2xlICs9IGFuZ2xlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKGlucHV0S2V5cy5pbmNsdWRlcygndycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvNDt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlucHV0S2V5cy5pbmNsdWRlcygndycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvNDt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdzJykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdhJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlICsgTWF0aC5QSS80ICogMzt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdzJykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS80ICogMzt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlucHV0S2V5cy5pbmNsdWRlcygndycpKSB7bW92aW5nQW5nbGUgPSBhbmdsZTt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdzJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlICsgTWF0aC5QSTt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdhJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlICsgTWF0aC5QSS8yO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzI7fVxyXG4gICAgICAgICAgICBlbHNlIHttb3ZpbmdBbmdsZSA9IG51bGw7fVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihtb3ZpbmdBbmdsZSAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICBjb25zdCB6ID0gTWF0aC5zaW4obW92aW5nQW5nbGUpICogc3BlZWRcclxuICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMyh4LCAwLCB6KSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGlzTW9iaWxlKCkgJiYgbW92aW5nQW5nbGUgIT09IG51bGwpIHttb3ZpbmdBbmdsZSAtPSBhbmdsZTt9XHJcbiAgICAgICAgaWYoc3BoZXJlLnBvc2l0aW9uLnkgPCAtMTApIHtcclxuICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnggPSAwO1xyXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueSA9IDU7XHJcbiAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gMDtcclxuICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKDAsMCwwKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCFpc0p1bXBpbmcgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCcgJykpIHtcclxuICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMygwLCBqdW1wSGVpZ2h0LCAwKSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgIGlzSnVtcGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGp1bXBUaW1lU3RhbXAgPSB0aW1lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAganVtcERpdi5zdHlsZS5oZWlnaHQgPSBgJHt0aW1lciAtIGp1bXBUaW1lU3RhbXAgPiBqdW1wQ29vbFRpbWUgPyAxMDAgOiAodGltZXIgLSBqdW1wVGltZVN0YW1wKS9qdW1wQ29vbFRpbWUqMTAwfSVgO1xyXG4gICAgICAgIGlmKGlzSnVtcGluZyAmJiB0aW1lciAtIGp1bXBUaW1lU3RhbXAgPiBqdW1wQ29vbFRpbWUpIHtcclxuICAgICAgICAgICAgaXNKdW1waW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlcnZlci5lbWl0KCd1cGRhdGUnLCBbc3BoZXJlLnBvc2l0aW9uLngsIHNwaGVyZS5wb3NpdGlvbi55LCBzcGhlcmUucG9zaXRpb24uel0sIFtzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkueCwgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLnksIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS56XSk7XHJcbiAgICAgICAgc2NlbmUucmVuZGVyKCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gaW5wdXQgZXZlbnRcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmICghaW5wdXRLZXlzLmluY2x1ZGVzKGUua2V5KSkge1xyXG4gICAgICAgICAgICBpbnB1dEtleXMucHVzaChlLmtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09IGUua2V5KTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyByZXNpemUgZXZlbnRcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgZW5naW5lLnJlc2l6ZSgpXHJcbiAgICAgICAgY2FtUmFkaW91cyA9IGlzTW9iaWxlKCkgPyBpbm5lcldpZHRoID4gaW5uZXJIZWlnaHQgPyAxMyA6IDIwIDogMTA7XHJcbiAgICAgICAgY2FtZXJhLnVwcGVyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgICAgIGNhbWVyYS5sb3dlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBwb2ludGVyIGxvY2tcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2soKTtcclxuICAgICAgICBjYW52YXMuZm9jdXMoKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBtb2JpbGUgY29udHJvbFxyXG4gICAgY29uc3QgbW9iaWxlTGF5b3V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1vYmlsZS1sYXlvdXQnKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGNvbnN0IGpveXN0aWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpveXN0aWNrJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBqb3lzdGlja0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3lzdGljay1idXR0b24nKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGlmKGlzTW9iaWxlKCkpIG1vYmlsZUxheW91dC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIGxldCBzdGFydFBvaW50ID0gWzAsMF1cclxuICAgIFxyXG4gICAgY29uc3QgZ2V0VG91Y2hlc1hZID0gKGV2ZW50OlRvdWNoRXZlbnQpOltudW1iZXIsIG51bWJlcl0gPT4ge1xyXG4gICAgICAgIGxldCB4ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYXHJcbiAgICAgICAgbGV0IHkgPSBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgICBmb3IobGV0IGk9MTsgaTxldmVudC50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmQgPSBldmVudC50b3VjaGVzW2ldLmNsaWVudFggPCB4XHJcbiAgICAgICAgICAgIHggPSBjb25kID8gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRYIDogeFxyXG4gICAgICAgICAgICB5ID0gY29uZCA/IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WSA6IHlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt4LCB5XVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBqdW1wLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzLnB1c2goJyAnKVxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgIH0pXHJcbiAgICBqdW1wLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cyA9IGlucHV0S2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSAnICcpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgIH0pXHJcbiAgICBcclxuICAgIG1vYmlsZUxheW91dC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IFt4LCB5XSA9IGdldFRvdWNoZXNYWShldmVudClcclxuICAgICAgICBqb3lzdGljay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICBqb3lzdGljay5zdHlsZS5sZWZ0ID0gYCR7eH1weGBcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50b3AgPSBgJHt5fXB4YFxyXG4gICAgICAgIHN0YXJ0UG9pbnQgPSBbeCwgeV1cclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS5sZWZ0ID0gJzUwcHgnXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUudG9wID0gJzUwcHgnXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJ1xyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgbW92aW5nQW5nbGUgPSBudWxsO1xyXG4gICAgfSk7XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGxldCBbZHgsIGR5XSA9IGdldFRvdWNoZXNYWShldmVudClcclxuICAgICAgICBkeCAtPSBzdGFydFBvaW50WzBdXHJcbiAgICAgICAgZHkgLT0gc3RhcnRQb2ludFsxXVxyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeClcclxuICAgICAgICBjb25zdCBtYXhEaXN0YW5jZSA9IDUwXHJcbiAgICAgICAgY29uc3QgeCA9IE1hdGguY29zKGFuZ2xlKSAqIE1hdGgubWluKGRpc3RhbmNlLCBtYXhEaXN0YW5jZSlcclxuICAgICAgICBjb25zdCB5ID0gTWF0aC5zaW4oYW5nbGUpICogTWF0aC5taW4oZGlzdGFuY2UsIG1heERpc3RhbmNlKVxyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLmxlZnQgPSBgJHt4KzUwfXB4YFxyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLnRvcCA9IGAke3krNTB9cHhgXHJcbiAgICAgICAgbW92aW5nQW5nbGUgPSAoLWFuZ2xlKSAtIE1hdGguUEkvMjtcclxuICAgIH0pO1xyXG4gICAgbW9iaWxlTGF5b3V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGpveXN0aWNrLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAwLjVzJ1xyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gbnVsbDtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBlbmVteSBjcmVhdGlvblxyXG4gICAgY29uc3QgY3JlYXRlRW5lbXkgPSAoaWQ6c3RyaW5nLCBwb3M6bnVtYmVyW10sIHZlbG9jaXR5Om51bWJlcltdKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BoID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVTcGhlcmUoYCR7aWR9YCwge2RpYW1ldGVyOjEsIHNlZ21lbnRzOjMyfSwgc2NlbmUpO1xyXG4gICAgICAgIHNwaC5wb3NpdGlvbi54ID0gcG9zWzBdO1xyXG4gICAgICAgIHNwaC5wb3NpdGlvbi55ID0gcG9zWzFdO1xyXG4gICAgICAgIHNwaC5wb3NpdGlvbi56ID0gcG9zWzJdO1xyXG4gICAgICAgIGNvbnN0IHNwaEltcG9zdGVyID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKHNwaCwgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuU3BoZXJlSW1wb3N0b3IsIHsgbWFzczogMSwgcmVzdGl0dXRpb246IGdsb2JhbFJlc3RpdHV0aW9uLCBmcmljdGlvbjoxIH0sIHNjZW5lKTtcclxuICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yID0gc3BoSW1wb3N0ZXI7XHJcbiAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5waHlzaWNzQm9keS5saW5lYXJEYW1waW5nID0gZ2xvYmFsRGFtcGluZztcclxuICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjModmVsb2NpdHlbMF0sIHZlbG9jaXR5WzFdLCB2ZWxvY2l0eVsyXSkpO1xyXG4gICAgICAgIHNwaC5tYXRlcmlhbCA9IGdldE1hdGVyaWFsKHNjZW5lLCB3b3JsZC5wbGF5ZXJzW2lkXS5jb2xvcik7XHJcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlbmRlckxpc3QucHVzaChzcGgpO1xyXG4gICAgICAgIGNvbnN0IG5pY2sgPSB3b3JsZC5wbGF5ZXJzW2lkXS5uaWNrbmFtZVxyXG4gICAgICAgIGNvbnN0IHBsYW5lID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVQbGFuZShgJHtpZH0tcGxhbmVgLCB7d2lkdGg6IG5pY2subGVuZ3RoLCBoZWlnaHQ6IDV9LCBzY2VuZSk7XHJcbiAgICAgICAgcGxhbmUuYmlsbGJvYXJkTW9kZSA9IEJBQllMT04uTWVzaC5CSUxMQk9BUkRNT0RFX0FMTDtcclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi54ID0gcG9zWzBdXHJcbiAgICAgICAgcGxhbmUucG9zaXRpb24ueSA9IHBvc1sxXSArIG5pY2tuYW1lT2Zmc2V0XHJcbiAgICAgICAgcGxhbmUucG9zaXRpb24ueiA9IHBvc1syXVxyXG4gICAgICAgIGNvbnN0IG5pY2tUZXh0dXJlID0gR1VJLkFkdmFuY2VkRHluYW1pY1RleHR1cmUuQ3JlYXRlRm9yTWVzaChwbGFuZSk7XHJcbiAgICAgICAgY29uc3Qgbmlja1RleHQgPSBuZXcgR1VJLlRleHRCbG9jaygpO1xyXG4gICAgICAgIG5pY2tUZXh0LnRleHQgPSBuaWNrO1xyXG4gICAgICAgIG5pY2tUZXh0LmNvbG9yID0gJ3doaXRlJztcclxuICAgICAgICBuaWNrVGV4dC5mb250U2l6ZSA9IDEwMDtcclxuICAgICAgICBuaWNrVGV4dC5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRGYW1pbHkgPSAnQXJpYWwnO1xyXG4gICAgICAgIG5pY2tUZXh0dXJlLmFkZENvbnRyb2wobmlja1RleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XHJcbiAgICAvLyBzb2NrZXQuaW9cclxuICAgIHNlcnZlci5lbWl0KCdpbml0Jywgd29ybGQub3duZXJJZClcclxuICAgIHNlcnZlci5vbignaW5pdCcsIChkYXRhOiBXb3JsZCkgPT4ge1xyXG4gICAgICAgIHdvcmxkID0gZGF0YTtcclxuICAgICAgICBPYmplY3Qua2V5cyh3b3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcsIGk6bnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlkID09PSBzZXJ2ZXIuaWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3QgcG9zID0gd29ybGQucGxheWVyc1tpZF0ucG9zaXRpb247XHJcbiAgICAgICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gd29ybGQucGxheWVyc1tpZF0udmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGNyZWF0ZUVuZW15KGlkLCBwb3MsIHZlbG9jaXR5KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2cod29ybGQpXHJcbiAgICBzZXJ2ZXIub24oJ3VwZGF0ZScsIChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBpZihzdGFydGVkICYmIHdvcmxkLnBsYXllcnNbaWRdKXtcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tpZF0ucG9zaXRpb24gPSBwb3M7XHJcbiAgICAgICAgICAgIHdvcmxkLnBsYXllcnNbaWRdLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGlmKGlkID09PSBzZXJ2ZXIuaWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBsYW5lID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShgJHtpZH0tcGxhbmVgKTtcclxuICAgICAgICAgICAgaWYgKHNwaCAmJiBwbGFuZSkge1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi56ID0gcG9zWzJdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueiA9IHBvc1syXVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzZXJ2ZXIub24oJ2Rpc2Nvbm5lY3RlZCcsIChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCBzcGggPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGlkKTtcclxuICAgICAgICBjb25zdCBwbGFuZSA9IHNjZW5lLmdldE1lc2hCeU5hbWUoYCR7aWR9LXBsYW5lYCk7XHJcbiAgICAgICAgaWYgKHNwaCAmJiBwbGFuZSkge1xyXG4gICAgICAgICAgICBzcGguZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICBwbGFuZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSB3b3JsZC5wbGF5ZXJzW2lkXTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBtYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Lm5pY2tuYW1lJykgYXMgSFRNTElucHV0RWxlbWVudFxyXG5jb25zdCBzdGFydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5zdGFydCcpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHRleHR1cmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QudGV4dHVyZScpIGFzIEhUTUxTZWxlY3RFbGVtZW50XHJcblxyXG5jb25zdCByb29tcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb29tcycpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHBvcHVwQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLnBvcHVwJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYucG9wdXAnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBiYWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LmJhY2snKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucm9vbXMgPiAuY29udGFpbmVyJykgYXMgSFRNTERpdkVsZW1lbnRcclxuXHJcbmNvbnN0IGNyZWF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jcmVhdGUnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCByb29tbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0LnJvb21uYW1lJykgYXMgSFRNTElucHV0RWxlbWVudFxyXG5jb25zdCBtYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QubWFwJykgYXMgSFRNTFNlbGVjdEVsZW1lbnRcclxuY29uc3QgbWF4UGxheWVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0LnBsYXllcnMnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcblxyXG5jb25zdCBpblJvb20gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5Sb29tJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgaW5Sb29tQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluUm9vbSA+IC5jb250YWluZXInKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBzdGFydEdhbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uaW5pdC1nYW1lJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuc2V0dGluZ3MnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5cclxuY29uc3QgZW50ZXJHYW1lID0gKCkgPT4ge1xyXG4gICAgbWFpbi5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIHJvb21zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG59XHJcblxyXG5jb25zdCBvZmZQb3B1cCA9ICgpID0+IHtcclxuICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgYmFjay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxufVxyXG5cclxuY29uc3QgZW50ZXJSb29tID0gKCkgPT4ge1xyXG4gICAgcm9vbXMuY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICBpblJvb20uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbn1cclxuXHJcbnNlcnZlci5vbignY29ubmVjdCcsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQnKTtcclxuICAgIFxyXG4gICAgLy8gZXZlbnRzXHJcbiAgICBuaWNrbmFtZS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICBpZihlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgICAgICAgICBlbnRlckdhbWUoKVxyXG4gICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnZ2V0Um9vbXMnKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICBzdGFydC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBlbnRlckdhbWUoKVxyXG4gICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBwb3B1cEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBwb3B1cC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICBiYWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgYmFjay5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvZmZQb3B1cClcclxuICAgIGJhY2suYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9mZlBvcHVwKVxyXG5cclxuICAgIHNlcnZlci5vbignZ2V0Um9vbXMnLCAod29ybGRzOldvcmxkW10pID0+IHtcclxuICAgICAgICBpZihpblJvb20uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpe1xyXG4gICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgY29uc29sZS5sb2cod29ybGRzKVxyXG4gICAgICAgICAgICB3b3JsZHMuZm9yRWFjaCgod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHdvcmxkLnN0YXR1cyAhPT0gJ3dhaXRpbmcnKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgICAgIHJvb20uY2xhc3NMaXN0LmFkZCgncm9vbScpXHJcbiAgICAgICAgICAgICAgICByb29tLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmFtZVwiPiR7d29ybGQubmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFwXCI+JHt3b3JsZC5tYXB9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBsYXllcnNcIj4ke09iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmxlbmd0aH0vJHt3b3JsZC5tYXhQbGF5ZXJzfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICAgICAgY29uc3Qgam9pbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXHJcbiAgICAgICAgICAgICAgICBqb2luLmNsYXNzTGlzdC5hZGQoJ2pvaW4nKVxyXG4gICAgICAgICAgICAgICAgam9pbi5pbm5lclRleHQgPSAnSm9pbidcclxuICAgICAgICAgICAgICAgIGpvaW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RoID49IHdvcmxkLm1heFBsYXllcnMpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnam9pblJvb20nLCB3b3JsZC5vd25lcklkLCBuaWNrbmFtZS52YWx1ZSwgdGV4dHVyZS52YWx1ZSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICByb29tLmFwcGVuZENoaWxkKGpvaW4pXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocm9vbSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBteVdvcmxkID0gd29ybGRzLmZpbmQod29ybGQgPT4gd29ybGQub3duZXJJZCA9PT0gbXlXb3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICBpZihteVdvcmxkKXtcclxuICAgICAgICAgICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMobXlXb3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBteVdvcmxkLnBsYXllcnNbaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxheWVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJEaXYuY2xhc3NMaXN0LmFkZCgncGxheWVyJylcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJEaXYuaW5uZXJUZXh0ID0gcGxheWVyLm5pY2tuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyRGl2LnN0eWxlLmNvbG9yID0gcGxheWVyLmNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgaW5Sb29tQ29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXllckRpdilcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICByb29tcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIG15V29ybGQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGNyZWF0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnY3JlYXRlUm9vbScsIHJvb21uYW1lLnZhbHVlLCBtYXAudmFsdWUsIE51bWJlcihtYXhQbGF5ZXJzLnZhbHVlKSlcclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdjcmVhdGVkUm9vbScsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIHNlcnZlci5lbWl0KCdqb2luUm9vbScsIHdvcmxkLm93bmVySWQsIG5pY2tuYW1lLnZhbHVlLCB0ZXh0dXJlLnZhbHVlKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2pvaW5lZFJvb20nLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyh3b3JsZClcclxuICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICBlbnRlclJvb20oKVxyXG4gICAgICAgIGlmKHNlcnZlci5pZCA9PSB3b3JsZC5vd25lcklkKXtcclxuICAgICAgICAgICAgc3RhcnRHYW1lLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICBzdGFydEdhbWUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnc3RhcnRHYW1lJywgd29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgc2V0dGluZ3MuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2dhbWVTdGFydGVkJywgKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgIG15V29ybGQgPSB3b3JsZFxyXG4gICAgICAgIGluaXRHYW1lKG15V29ybGQpXHJcbiAgICB9KVxyXG59KSIsImltcG9ydCB7IENvbG9yMywgTWVzaCwgVmVjdG9yMyB9IGZyb20gXCJiYWJ5bG9uanNcIjtcclxuaW1wb3J0IHsgY29sb3JzIH0gZnJvbSBcIi4vdGV4dHVyZXNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTWFwTWVzaCB7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG4gICAgcG9zaXRpb246IFZlY3RvcjM7XHJcbiAgICByb3RhdGlvbjogVmVjdG9yMztcclxuICAgIHNjYWxpbmc6IFZlY3RvcjM7XHJcbiAgICBjb2xvcjogQ29sb3IzO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE1hcCB7XHJcbiAgICBtZXNoZXM6IE1hcE1lc2hbXTtcclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuICAgIGNvbG9yOiBDb2xvcjM7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBtYXBzOntba2V5OnN0cmluZ106TWFwfSA9IHtcclxuICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICBtZXNoZXM6IFtcclxuICAgICAgICAgICAge25hbWU6J2JveDEnLCBwb3NpdGlvbjpuZXcgVmVjdG9yMyg0LDAuNSw2KSwgcm90YXRpb246bmV3IFZlY3RvcjMoMCw0NSwwKSwgc2NhbGluZzpuZXcgVmVjdG9yMygxLDEsMSksIGNvbG9yOmNvbG9ycy53aGl0ZX0sXHJcbiAgICAgICAgICAgIHtuYW1lOidzdGFpcjEnLCBwb3NpdGlvbjpuZXcgVmVjdG9yMygtNywtMC41LDIpLCByb3RhdGlvbjpuZXcgVmVjdG9yMygwLjMsMCwwKSwgc2NhbGluZzpuZXcgVmVjdG9yMygyLDQsMTApLCBjb2xvcjpjb2xvcnMud2hpdGV9LFxyXG4gICAgICAgICAgICB7bmFtZTonYm94MScsIHBvc2l0aW9uOm5ldyBWZWN0b3IzKC0zLDEuMzksLTQuNjkpLCByb3RhdGlvbjpuZXcgVmVjdG9yMygwLDAsMCksIHNjYWxpbmc6bmV3IFZlY3RvcjMoMTAsMyw1KSwgY29sb3I6Y29sb3JzLndoaXRlfSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIHdpZHRoOiA0MCxcclxuICAgICAgICBoZWlnaHQ6IDIwLFxyXG4gICAgICAgIGNvbG9yOiBjb2xvcnMud2hpdGUsXHJcbiAgICB9LFxyXG59IiwiaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnXHJcblxyXG5leHBvcnQgY29uc3QgY29sb3JzID0ge1xyXG4gICAgcmVkIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDApLFxyXG4gICAgZ3JlZW4gOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMSwgMCksXHJcbiAgICBibHVlIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDEpLFxyXG4gICAgYXF1YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAxKSxcclxuICAgIG1hZ2VudGEgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMSksXHJcbiAgICB5ZWxsb3cgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMCksXHJcbiAgICBibGFjayA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKSxcclxuICAgIHdoaXRlIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWV0YWxNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBNZXRhbFNwaGVyZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ01ldGFsU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgTWV0YWxTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL2JjLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL24uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5zcGVjdWxhclRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYW8uanBnJywgc2NlbmUpXHJcbiAgICByZXR1cm4gTWV0YWxTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEdyYW5pdGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBHcmFuaXRlU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnR3Jhbml0ZVNwaGVyZU1hdCcsIHNjZW5lKTtcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL24ucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9hLnBuZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIEdyYW5pdGVTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNxdWFyZVRpbGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBTcXVhcmVUaWxlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnU3F1YXJlVGlsZU1hdCcsIHNjZW5lKTtcclxuICAgIFNxdWFyZVRpbGVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL2JjLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYW8ucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gU3F1YXJlVGlsZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q29sb3JNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgY29sb3I6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IENvbG9yTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnQ29sb3JNYXQnLCBzY2VuZSk7XHJcbiAgICBDb2xvck1hdC5kaWZmdXNlQ29sb3IgPSBjb2xvcnNbY29sb3JdXHJcbiAgICByZXR1cm4gQ29sb3JNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1hdGVyaWFsID0gKHNjZW5lOkJBQllMT04uU2NlbmUsIG5hbWU6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIHN3aXRjaChuYW1lKXtcclxuICAgICAgICBjYXNlICdtZXRhbCc6IHJldHVybiBnZXRNZXRhbE1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdncmFuaXRlJzogcmV0dXJuIGdldEdyYW5pdGVNYXQoc2NlbmUpXHJcbiAgICAgICAgY2FzZSAnc3F1YXJlX3RpbGUnOiByZXR1cm4gZ2V0U3F1YXJlVGlsZU1hdChzY2VuZSlcclxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gZ2V0Q29sb3JNYXQoc2NlbmUsIG5hbWUpXHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgKiBhcyBCQUJZTE9OIGZyb20gJ2JhYnlsb25qcyc7XHJcbmltcG9ydCB7IE1hcCB9IGZyb20gXCIuL21hcFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1hcCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lLCBtYXA6TWFwLCBzaGFkb3dHZW5lcmF0b3I6QkFCWUxPTi5TaGFkb3dHZW5lcmF0b3IpOkJBQllMT04uR3JvdW5kTWVzaCA9PiB7XHJcbiAgICBjb25zdCBncm91bmQgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCgnZ3JvdW5kJywgeyB3aWR0aDogbWFwLndpZHRoLCBoZWlnaHQ6IG1hcC5oZWlnaHQgfSwgc2NlbmUpO1xyXG4gICAgY29uc3QgZ3JvdW5kTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnZ3JvdW5kTWF0Jywgc2NlbmUpO1xyXG4gICAgZ3JvdW5kTWF0LmRpZmZ1c2VDb2xvciA9IG1hcC5jb2xvclxyXG4gICAgZ3JvdW5kLm1hdGVyaWFsID0gZ3JvdW5kTWF0O1xyXG4gICAgZ3JvdW5kLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZTtcclxuICAgIGdyb3VuZC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoZ3JvdW5kLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3RvciwgeyBtYXNzOiAwLCByZXN0aXR1dGlvbjogMC41LCBmcmljdGlvbjoxIH0sIHNjZW5lKTtcclxuICAgIG1hcC5tZXNoZXMuZm9yRWFjaChtZXNoID0+IHtcclxuICAgICAgICBjb25zdCBib3ggPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZUJveChtZXNoLm5hbWUsIHsgd2lkdGg6IDEsIGhlaWdodDogMSwgZGVwdGg6IDEgfSwgc2NlbmUpO1xyXG4gICAgICAgIGJveC5wb3NpdGlvbiA9IG1lc2gucG9zaXRpb247XHJcbiAgICAgICAgYm94LnJvdGF0aW9uID0gbWVzaC5yb3RhdGlvbjtcclxuICAgICAgICBib3guc2NhbGluZyA9IG1lc2guc2NhbGluZztcclxuICAgICAgICBjb25zdCBib3hNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKG1lc2gubmFtZSsnTWF0Jywgc2NlbmUpO1xyXG4gICAgICAgIGJveE1hdC5kaWZmdXNlQ29sb3IgPSBtZXNoLmNvbG9yO1xyXG4gICAgICAgIGJveC5tYXRlcmlhbCA9IGJveE1hdDtcclxuICAgICAgICBib3gucmVjZWl2ZVNoYWRvd3MgPSB0cnVlO1xyXG4gICAgICAgIGJveC5waHlzaWNzSW1wb3N0b3IgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IoYm94LCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5Cb3hJbXBvc3RvciwgeyBtYXNzOiAwLCByZXN0aXR1dGlvbjogMC41LCBmcmljdGlvbjoxIH0sIHNjZW5lKTtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKGJveCk7XHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIGdyb3VuZFxyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9