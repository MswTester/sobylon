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
__webpack_require__(/*! babylonjs-loaders */ "./node_modules/babylonjs-loaders/babylonjs.loaders.js");
const server = (0, socket_io_client_1.io)('/');
window.CANNON = cannon_1.default;
const isMobile = () => {
    return navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone');
};
let myWorld = null;
const initGame = (thisWorld) => {
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
    // BABYLON.SceneLoader.Append()
    const ground = (0, utils_1.createMap)(scene, map_1.maps['default'], shadowGenerator);
    const importObj = (url, name) => {
        BABYLON.SceneLoader.Append(url, name + '.obj', scene, () => { });
    };
    importObj('obj/map', 'mainmap');
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
    });
    console.log(world);
    server.on('update', (id, pos, velocity) => {
        if (world.players[id]) {
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
        if (sph) {
            sph.dispose();
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
    cyan: new BABYLON.Color3(0, 1, 1),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2SEFBOEM7QUFDOUMsMEdBQXFDO0FBQ3JDLGtIQUFxQztBQUNyQyw2R0FBMkI7QUFDM0IscUVBQW9DO0FBQ3BDLCtEQUE2QjtBQUM3Qiw4RUFBdUY7QUFFdkYsc0dBQTBCO0FBRTFCLE1BQU0sTUFBTSxHQUFHLHlCQUFFLEVBQUMsR0FBRyxDQUFDO0FBRXRCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsZ0JBQU07QUFFdEIsTUFBTSxRQUFRLEdBQUcsR0FBVyxFQUFFO0lBQzFCLE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0YsQ0FBQyxDQUFDO0FBRUYsSUFBSSxPQUFPLEdBQWMsSUFBSTtBQUU3QixNQUFNLFFBQVEsR0FBRyxDQUFDLFNBQWUsRUFBRSxFQUFFO0lBQ2pDLDJCQUEyQjtJQUMzQixJQUFJLFNBQVMsR0FBWSxFQUFFO0lBQzNCLElBQUksS0FBSyxHQUFTLFNBQVMsQ0FBQztJQUM1QixJQUFJLFdBQVcsR0FBZSxJQUFJO0lBRWxDLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQztJQUMxQixNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztJQUM5QixJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN0RSxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7SUFDbEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQztJQUN6QixNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7SUFFM0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBRWQsMEJBQTBCO0lBQzFCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFtQixDQUFDO0lBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUU3QixzQkFBc0I7SUFDdEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQXNCLENBQUM7SUFDNUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBRXBGLFlBQVk7SUFDWixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBQyxFQUFFLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RCxNQUFNLENBQUMsUUFBUSxHQUFHLDBCQUFXLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkssTUFBTSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7SUFDeEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUdqRSxTQUFTO0lBQ1QsTUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZGLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ3hDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7SUFDckMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztJQUVyQyxLQUFLO0lBQ0wsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUMxQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUN6QixLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ25ELEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRXBCLE9BQU87SUFDUCxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9DLElBQUksTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2RixJQUFJLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25GLE1BQU0sQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBRXZCLFNBQVM7SUFDVCxNQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xFLGVBQWUsQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7SUFDakQsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdkQsZUFBZTtJQUNmLCtCQUErQjtJQUMvQixNQUFNLE1BQU0sR0FBRyxxQkFBUyxFQUFDLEtBQUssRUFBRSxVQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsZUFBZSxDQUFDO0lBRWpFLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBVSxFQUFFLElBQVcsRUFBRSxFQUFFO1FBQzFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBQ0QsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7SUFFL0IsWUFBWTtJQUNaLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFtQjtJQUN2RSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDckIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBRXRCLE9BQU87SUFDUCxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRTtRQUN0QixLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDaEMsSUFBRyxRQUFRLEVBQUUsRUFBRTtZQUNYLElBQUcsV0FBVztnQkFBRSxXQUFXLElBQUksS0FBSyxDQUFDO1NBQ3hDO2FBQU07WUFDSCxJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBQyxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO2FBQUM7aUJBQ3BGLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7YUFBQztpQkFDMUYsSUFBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFBQztpQkFDN0YsSUFBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFBQztpQkFDN0YsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7YUFBQztpQkFDbkQsSUFBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUFDO2lCQUM1RCxJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQzthQUFDO2lCQUM5RCxJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQzthQUFDO2lCQUM5RDtnQkFBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2FBQUM7U0FDN0I7UUFDRCxJQUFHLFdBQVcsS0FBSyxJQUFJLEVBQUM7WUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxLQUFLO1lBQ3ZDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSztZQUN2QyxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1NBQ25HO1FBQ0QsSUFBRyxRQUFRLEVBQUUsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQztTQUFDO1FBQzlELElBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBRyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RDLE1BQU0sQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7WUFDekcsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNqQixhQUFhLEdBQUcsS0FBSyxDQUFDO1NBQ3pCO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsYUFBYSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsR0FBQyxZQUFZLEdBQUMsR0FBRyxHQUFHLENBQUM7UUFDbkgsSUFBRyxTQUFTLElBQUksS0FBSyxHQUFHLGFBQWEsR0FBRyxZQUFZLEVBQUU7WUFDbEQsU0FBUyxHQUFHLEtBQUssQ0FBQztTQUNyQjtRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3TixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxjQUFjO0lBQ2QsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM1QixTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ3JDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUMsQ0FBQyxDQUFDO0lBRUgsZUFBZTtJQUNmLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZixVQUFVLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbEUsTUFBTSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztRQUNyQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsZUFBZTtJQUNmLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQixDQUFDLENBQUMsQ0FBQztJQUVILGlCQUFpQjtJQUNqQixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFtQixDQUFDO0lBQ2hGLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFtQixDQUFDO0lBQ3ZFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQW1CLENBQUM7SUFDcEYsSUFBRyxRQUFRLEVBQUU7UUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDcEQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBRXRCLE1BQU0sWUFBWSxHQUFHLENBQUMsS0FBZ0IsRUFBbUIsRUFBRTtRQUN2RCxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDaEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2hDLEtBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDO1lBQ3pDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakIsQ0FBQztJQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDeEMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbkIsS0FBSyxDQUFDLGNBQWMsRUFBRTtJQUMxQixDQUFDLENBQUM7SUFDRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQ3RDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDbkQsS0FBSyxDQUFDLGNBQWMsRUFBRTtJQUMxQixDQUFDLENBQUM7SUFFRixZQUFZLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQ2hELE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUNsQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDakMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUk7UUFDOUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUk7UUFDN0IsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuQixjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxNQUFNO1FBQ2xDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU07UUFDakMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTTtRQUNsQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyx1QkFBdUI7UUFDbEQsV0FBVyxHQUFHLElBQUksQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztJQUNILFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDL0MsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ2xDLEVBQUUsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25CLEVBQUUsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUMsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNoQyxNQUFNLFdBQVcsR0FBRyxFQUFFO1FBQ3RCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1FBQzNELGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFDLEVBQUUsSUFBSTtRQUN2QyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBQyxFQUFFLElBQUk7UUFDdEMsV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztJQUNILFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDOUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQzlCLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLGNBQWM7UUFDMUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztJQUVILGlCQUFpQjtJQUNqQixNQUFNLFdBQVcsR0FBRyxDQUFDLEVBQVMsRUFBRSxHQUFZLEVBQUUsUUFBaUIsRUFBRSxFQUFFO1FBQy9ELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBQyxFQUFFLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixNQUFNLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdKLEdBQUcsQ0FBQyxlQUFlLEdBQUcsV0FBVyxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDOUQsR0FBRyxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLEdBQUcsQ0FBQyxRQUFRLEdBQUcsMEJBQVcsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRCxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVE7UUFDdkMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRyxLQUFLLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDckQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYztRQUMxQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDckIsUUFBUSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7UUFDekIsUUFBUSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDeEIsUUFBUSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7UUFDN0IsUUFBUSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7UUFDOUIsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsWUFBWTtJQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDbEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFXLEVBQUUsRUFBRTtRQUM5QixLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBUyxFQUFFLENBQVEsRUFBRSxFQUFFO1lBQ3ZELElBQUcsRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUFFO2dCQUFFLE9BQU87WUFDNUIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDdkMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDNUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQ2xCLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBUyxFQUFFLEdBQVksRUFBRSxRQUFpQixFQUFFLEVBQUU7UUFDL0QsSUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFDO1lBQ2pCLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNqQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDdEMsSUFBRyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUU7Z0JBQUUsT0FBTztZQUM1QixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2pELElBQUksR0FBRyxJQUFJLEtBQUssRUFBRTtnQkFDZCxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixHQUFHLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjO2dCQUMxQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzVCO2lCQUFNO2dCQUNILFdBQVcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBUyxFQUFFLEVBQUU7UUFDcEMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLEdBQUcsRUFBRTtZQUNMLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNqQjtRQUNELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBbUI7QUFDOUQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBcUI7QUFDN0UsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQXNCO0FBQ3pFLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQXNCO0FBRTdFLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFtQjtBQUNoRSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBc0I7QUFDNUUsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQW1CO0FBQ25FLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFtQjtBQUNqRSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFtQjtBQUVqRixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBc0I7QUFDM0UsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBcUI7QUFDN0UsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQXNCO0FBQ3JFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFxQjtBQUU5RSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBbUI7QUFDbEUsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBbUI7QUFDeEYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBc0I7QUFDakYsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQW1CO0FBRXpFLE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFBRTtJQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDMUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2xDLENBQUM7QUFFRCxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7SUFDbEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztBQUM5QixDQUFDO0FBRUQsTUFBTSxTQUFTLEdBQUcsR0FBRyxFQUFFO0lBQ25CLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUMzQixNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDbkMsQ0FBQztBQUVELE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtJQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXpCLFNBQVM7SUFDVCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDdkMsSUFBRyxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTtZQUNsQixTQUFTLEVBQUU7WUFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUMxQjtJQUNMLENBQUMsQ0FBQztJQUNGLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLFNBQVMsRUFBRTtRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUMsQ0FBQztJQUVGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDakMsQ0FBQyxDQUFDO0lBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7SUFDNUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTtRQUNyQyxJQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFDO1lBQ2pDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRTtZQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNuQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBVyxFQUFFLEVBQUU7Z0JBQzNCLElBQUcsS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTO29CQUFFLE9BQU87Z0JBQ3RDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUc7d0NBQ08sS0FBSyxDQUFDLElBQUk7dUNBQ1gsS0FBSyxDQUFDLEdBQUc7MkNBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVO2lCQUMvRTtnQkFDRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU07Z0JBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNoQyxJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVTt3QkFBRSxPQUFPO29CQUNqRSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDekUsQ0FBQyxDQUFDO2dCQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUN0QixTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUMvQixDQUFDLENBQUM7U0FDTDthQUFNO1lBQ0gsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDakUsSUFBRyxPQUFPLEVBQUM7Z0JBQ1AsZUFBZSxDQUFDLFNBQVMsR0FBRyxFQUFFO2dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFTLEVBQUUsRUFBRTtvQkFDL0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO29CQUMvQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7b0JBQ2pDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVE7b0JBQ3JDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO29CQUNwQyxlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDO2FBQ0w7aUJBQU07Z0JBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUM1QixLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQzlCLE9BQU8sR0FBRyxJQUFJO2FBQ2pCO1NBQ0o7SUFDTCxDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRixDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQVcsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3pFLENBQUMsQ0FBQztJQUVGLE1BQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBVyxFQUFFLEVBQUU7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDbEIsT0FBTyxHQUFHLEtBQUs7UUFDZixTQUFTLEVBQUU7UUFDWCxJQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBQztZQUMxQixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbEMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNoQyxDQUFDLENBQUM7WUFDRixRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FDcEM7SUFDTCxDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQVcsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUM1QixPQUFPLEdBQUcsS0FBSztRQUNmLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDckIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3ZhRixnR0FBa0Q7QUFDbEQsOEVBQW9DO0FBaUJ2QixZQUFJLEdBQXNCO0lBQ25DLE9BQU8sRUFBRTtRQUNMLE1BQU0sRUFBRTtZQUNKLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsSUFBSSxtQkFBTyxDQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFDLElBQUksbUJBQU8sQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBQyxJQUFJLG1CQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsaUJBQU0sQ0FBQyxLQUFLLEVBQUM7WUFDMUgsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxJQUFJLG1CQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFDLElBQUksbUJBQU8sQ0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBQyxJQUFJLG1CQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUMsaUJBQU0sQ0FBQyxLQUFLLEVBQUM7WUFDaEksRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxJQUFJLG1CQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFDLElBQUksbUJBQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBQyxJQUFJLG1CQUFPLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsaUJBQU0sQ0FBQyxLQUFLLEVBQUM7U0FDbkk7UUFDRCxLQUFLLEVBQUUsRUFBRTtRQUNULE1BQU0sRUFBRSxFQUFFO1FBQ1YsS0FBSyxFQUFFLGlCQUFNLENBQUMsS0FBSztLQUN0QjtDQUNKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN0JELDBHQUFvQztBQUV2QixjQUFNLEdBQUc7SUFDbEIsR0FBRyxFQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQyxLQUFLLEVBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLElBQUksRUFBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEMsSUFBSSxFQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQyxPQUFPLEVBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sRUFBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEMsS0FBSyxFQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuQyxLQUFLLEVBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RDO0FBRU0sTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFtQixFQUFtQixFQUFFO0lBQ2hFLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdFLGNBQWMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQztJQUNsRixjQUFjLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUM7SUFDOUUsY0FBYyxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDO0lBQ2xGLGNBQWMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQztJQUNsRixjQUFjLENBQUMsY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUM7SUFDbEYsT0FBTyxjQUFjO0FBQ3pCLENBQUM7QUFSWSxtQkFBVyxlQVF2QjtBQUVNLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBbUIsRUFBbUIsRUFBRTtJQUNsRSxNQUFNLGdCQUFnQixHQUFHLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pGLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDO0lBQ3RGLGdCQUFnQixDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDO0lBQ2xGLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDO0lBQ3RGLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDO0lBQ3JGLE9BQU8sZ0JBQWdCO0FBQzNCLENBQUM7QUFQWSxxQkFBYSxpQkFPekI7QUFFTSxNQUFNLGdCQUFnQixHQUFHLENBQUMsS0FBbUIsRUFBbUIsRUFBRTtJQUNyRSxNQUFNLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0UsYUFBYSxDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO0lBQ3ZGLGFBQWEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLEtBQUssQ0FBQztJQUNuRixhQUFhLENBQUMsZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUM7SUFDdkYsYUFBYSxDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO0lBQ3ZGLE9BQU8sYUFBYTtBQUN4QixDQUFDO0FBUFksd0JBQWdCLG9CQU81QjtBQUVNLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBbUIsRUFBRSxLQUFZLEVBQW1CLEVBQUU7SUFDOUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLFFBQVEsQ0FBQyxZQUFZLEdBQUcsY0FBTSxDQUFDLEtBQUssQ0FBQztJQUNyQyxPQUFPLFFBQVE7QUFDbkIsQ0FBQztBQUpZLG1CQUFXLGVBSXZCO0FBRU0sTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFtQixFQUFFLElBQVcsRUFBbUIsRUFBRTtJQUM3RSxRQUFPLElBQUksRUFBQztRQUNSLEtBQUssT0FBTyxDQUFDLENBQUMsT0FBTyx1QkFBVyxFQUFDLEtBQUssQ0FBQztRQUN2QyxLQUFLLFNBQVMsQ0FBQyxDQUFDLE9BQU8seUJBQWEsRUFBQyxLQUFLLENBQUM7UUFDM0MsS0FBSyxhQUFhLENBQUMsQ0FBQyxPQUFPLDRCQUFnQixFQUFDLEtBQUssQ0FBQztRQUNsRCxPQUFPLENBQUMsQ0FBQyxPQUFPLHVCQUFXLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQztLQUMzQztBQUNMLENBQUM7QUFQWSxtQkFBVyxlQU92Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RERCwwR0FBcUM7QUFHOUIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxLQUFtQixFQUFFLEdBQU8sRUFBRSxlQUF1QyxFQUFxQixFQUFFO0lBQ2xILE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0csTUFBTSxTQUFTLEdBQUcsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25FLFNBQVMsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUs7SUFDbEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7SUFDNUIsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDN0IsTUFBTSxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwSixHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN0QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvRixHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDN0IsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRSxNQUFNLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDakMsR0FBRyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDdEIsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDMUIsR0FBRyxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5SSxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUM7SUFDRixPQUFPLE1BQU07QUFDakIsQ0FBQztBQXBCWSxpQkFBUyxhQW9CckIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mcm9udC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mcm9udC8uL3NyYy9tYXAudHMiLCJ3ZWJwYWNrOi8vZnJvbnQvLi9zcmMvdGV4dHVyZXMudHMiLCJ3ZWJwYWNrOi8vZnJvbnQvLi9zcmMvdXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW8sIFNvY2tldCB9IGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xyXG5pbXBvcnQgKiBhcyBCQUJZTE9OIGZyb20gJ2JhYnlsb25qcyc7XHJcbmltcG9ydCAqIGFzIEdVSSBmcm9tICdiYWJ5bG9uanMtZ3VpJztcclxuaW1wb3J0IENBTk5PTiBmcm9tICdjYW5ub24nXHJcbmltcG9ydCB7IGNyZWF0ZU1hcCB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBtYXBzIH0gZnJvbSAnLi9tYXAnO1xyXG5pbXBvcnQgeyBnZXRHcmFuaXRlTWF0LCBnZXRNYXRlcmlhbCwgZ2V0TWV0YWxNYXQsIGdldFNxdWFyZVRpbGVNYXQgfSBmcm9tICcuL3RleHR1cmVzJztcclxuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuL3R5cGVzJ1xyXG5pbXBvcnQgJ2JhYnlsb25qcy1sb2FkZXJzJ1xyXG5cclxuY29uc3Qgc2VydmVyID0gaW8oJy8nKVxyXG5cclxud2luZG93LkNBTk5PTiA9IENBTk5PTlxyXG5cclxuY29uc3QgaXNNb2JpbGUgPSAoKTpib29sZWFuID0+IHtcclxuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdBbmRyb2lkJykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnaVBob25lJyk7XHJcbn07XHJcblxyXG5sZXQgbXlXb3JsZDpXb3JsZHxudWxsID0gbnVsbFxyXG5cclxuY29uc3QgaW5pdEdhbWUgPSAodGhpc1dvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAvLyB2YXJpYWJsZXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGxldCBpbnB1dEtleXM6c3RyaW5nW10gPSBbXVxyXG4gICAgbGV0IHdvcmxkOldvcmxkID0gdGhpc1dvcmxkO1xyXG4gICAgbGV0IG1vdmluZ0FuZ2xlOm51bWJlcnxudWxsID0gbnVsbFxyXG4gICAgXHJcbiAgICBjb25zdCBnbG9iYWxEYW1waW5nID0gMC41O1xyXG4gICAgY29uc3QgZ2xvYmFsUmVzdGl0dXRpb24gPSAxLjU7XHJcbiAgICBsZXQgY2FtUmFkaW91cyA9IGlzTW9iaWxlKCkgPyBpbm5lcldpZHRoID4gaW5uZXJIZWlnaHQgPyAxMyA6IDIwIDogMTA7XHJcbiAgICBjb25zdCBzcGVlZCA9IDAuMjtcclxuICAgIGNvbnN0IGp1bXBIZWlnaHQgPSA4O1xyXG4gICAgY29uc3QganVtcENvb2xUaW1lID0gNDAwO1xyXG4gICAgY29uc3Qgbmlja25hbWVPZmZzZXQgPSAxLjU7XHJcbiAgICBcclxuICAgIGxldCB0aW1lciA9IDA7XHJcblxyXG4gICAgLy8gZWxlbWVudHMgaW5pdGlhbGl6YXRpb25cclxuICAgIGNvbnN0IGp1bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanVtcCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAganVtcC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIFxyXG4gICAgLy8gZ2FtZSBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlbmRlckNhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgY29uc3QgZW5naW5lID0gbmV3IEJBQllMT04uRW5naW5lKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBCQUJZTE9OLlNjZW5lKGVuZ2luZSk7XHJcbiAgICBzY2VuZS5lbmFibGVQaHlzaWNzKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTkuODEsIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIFxyXG4gICAgLy8gbXkgc3BoZXJlXHJcbiAgICBjb25zdCBzcGhlcmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgnc3BoZXJlJywge2RpYW1ldGVyOjEsIHNlZ21lbnRzOjE2fSwgc2NlbmUpO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnggPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMF07XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueSA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblsxXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzJdO1xyXG4gICAgc3BoZXJlLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5jb2xvcik7XHJcbiAgICBjb25zdCBzcGhlcmVJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGhlcmUsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yID0gc3BoZXJlSW1wb3N0ZXI7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG5cclxuICAgIFxyXG4gICAgLy8gY2FtZXJhXHJcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQkFCWUxPTi5BcmNSb3RhdGVDYW1lcmEoJ0NhbWVyYScsIDAsIDAsIDEwLCBzcGhlcmUucG9zaXRpb24sIHNjZW5lKTtcclxuICAgIGNhbWVyYS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjYW1lcmEuaW5lcnRpYSA9IGlzTW9iaWxlKCkgPyAwLjggOiAwLjU7XHJcbiAgICBjYW1lcmEudXBwZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBcclxuICAgIC8vZm9nXHJcbiAgICBzY2VuZS5mb2dNb2RlID0gQkFCWUxPTi5TY2VuZS5GT0dNT0RFX0VYUDtcclxuICAgIHNjZW5lLmZvZ0RlbnNpdHkgPSAwLjAwNTtcclxuICAgIHNjZW5lLmZvZ0NvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAuOSwgMC45LCAwLjkpO1xyXG4gICAgc2NlbmUuZm9nU3RhcnQgPSAyMC4wO1xyXG4gICAgc2NlbmUuZm9nRW5kID0gNjAuMDtcclxuICAgIFxyXG4gICAgLy9MaWdodFxyXG4gICAgc2NlbmUuYW1iaWVudENvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsMSwxKTtcclxuICAgIHZhciBsaWdodDEgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KFwibGlnaHQxXCIsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMSwxLDApLCBzY2VuZSk7XHJcbiAgICB2YXIgbGlnaHQyID0gbmV3IEJBQllMT04uUG9pbnRMaWdodChcImxpZ2h0MlwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDYwLDYwLDApLCBzY2VuZSk7XHJcbiAgICBsaWdodDEuaW50ZW5zaXR5ID0gMC41O1xyXG4gICAgbGlnaHQyLmludGVuc2l0eSA9IDAuNTtcclxuICAgIFxyXG4gICAgLy8gc2hhZG93XHJcbiAgICBjb25zdCBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgQkFCWUxPTi5TaGFkb3dHZW5lcmF0b3IoMTAyNCwgbGlnaHQyKTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci51c2VDb250YWN0SGFyZGVuaW5nU2hhZG93ID0gdHJ1ZTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoZXJlKTtcclxuICAgIFxyXG4gICAgLy8gbWFwIChncm91bmQpXHJcbiAgICAvLyBCQUJZTE9OLlNjZW5lTG9hZGVyLkFwcGVuZCgpXHJcbiAgICBjb25zdCBncm91bmQgPSBjcmVhdGVNYXAoc2NlbmUsIG1hcHNbJ2RlZmF1bHQnXSwgc2hhZG93R2VuZXJhdG9yKVxyXG5cclxuICAgIGNvbnN0IGltcG9ydE9iaiA9ICh1cmw6c3RyaW5nLCBuYW1lOnN0cmluZykgPT4ge1xyXG4gICAgICAgIEJBQllMT04uU2NlbmVMb2FkZXIuQXBwZW5kKHVybCwgbmFtZSsnLm9iaicsIHNjZW5lLCAoKSA9PiB7fSk7XHJcbiAgICB9XHJcbiAgICBpbXBvcnRPYmooJ29iai9tYXAnLCAnbWFpbm1hcCcpXHJcbiAgICBcclxuICAgIC8vIGp1bXAgdmFyc1xyXG4gICAgY29uc3QganVtcERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qdW1wID4gZGl2JykgYXMgSFRNTERpdkVsZW1lbnRcclxuICAgIGxldCBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgbGV0IGp1bXBUaW1lU3RhbXAgPSAwO1xyXG4gICAgXHJcbiAgICAvLyBsb29wXHJcbiAgICBlbmdpbmUucnVuUmVuZGVyTG9vcCgoKSA9PiB7XHJcbiAgICAgICAgdGltZXIrKztcclxuICAgICAgICBjYW1lcmEuc2V0VGFyZ2V0KHNwaGVyZS5wb3NpdGlvbik7XHJcbiAgICAgICAgY29uc3QgZHggPSAoY2FtZXJhLnRhcmdldC54IC0gY2FtZXJhLnBvc2l0aW9uLngpXHJcbiAgICAgICAgY29uc3QgZHogPSAoY2FtZXJhLnRhcmdldC56IC0gY2FtZXJhLnBvc2l0aW9uLnopXHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR6LCBkeClcclxuICAgICAgICBpZihpc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlKSBtb3ZpbmdBbmdsZSArPSBhbmdsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSkge21vdmluZ0FuZ2xlID0gYW5nbGU7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEk7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS8yO31cclxuICAgICAgICAgICAgZWxzZSB7bW92aW5nQW5nbGUgPSBudWxsO31cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYobW92aW5nQW5nbGUgIT09IG51bGwpe1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5jb3MobW92aW5nQW5nbGUpICogc3BlZWRcclxuICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuYXBwbHlJbXB1bHNlKG5ldyBCQUJZTE9OLlZlY3RvcjMoeCwgMCwgeiksIHNwaGVyZS5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihpc01vYmlsZSgpICYmIG1vdmluZ0FuZ2xlICE9PSBudWxsKSB7bW92aW5nQW5nbGUgLT0gYW5nbGU7fVxyXG4gICAgICAgIGlmKHNwaGVyZS5wb3NpdGlvbi55IDwgLTEwKSB7XHJcbiAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi54ID0gMDtcclxuICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnkgPSA1O1xyXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueiA9IDA7XHJcbiAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMygwLDAsMCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZighaXNKdW1waW5nICYmIGlucHV0S2V5cy5pbmNsdWRlcygnICcpKSB7XHJcbiAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuYXBwbHlJbXB1bHNlKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwganVtcEhlaWdodCwgMCksIHNwaGVyZS5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBqdW1wVGltZVN0YW1wID0gdGltZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGp1bXBEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGltZXIgLSBqdW1wVGltZVN0YW1wID4ganVtcENvb2xUaW1lID8gMTAwIDogKHRpbWVyIC0ganVtcFRpbWVTdGFtcCkvanVtcENvb2xUaW1lKjEwMH0lYDtcclxuICAgICAgICBpZihpc0p1bXBpbmcgJiYgdGltZXIgLSBqdW1wVGltZVN0YW1wID4ganVtcENvb2xUaW1lKSB7XHJcbiAgICAgICAgICAgIGlzSnVtcGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXJ2ZXIuZW1pdCgndXBkYXRlJywgW3NwaGVyZS5wb3NpdGlvbi54LCBzcGhlcmUucG9zaXRpb24ueSwgc3BoZXJlLnBvc2l0aW9uLnpdLCBbc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLngsIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS55LCBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkuel0pO1xyXG4gICAgICAgIHNjZW5lLnJlbmRlcigpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIGlucHV0IGV2ZW50XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICBpZiAoIWlucHV0S2V5cy5pbmNsdWRlcyhlLmtleSkpIHtcclxuICAgICAgICAgICAgaW5wdXRLZXlzLnB1c2goZS5rZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cyA9IGlucHV0S2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSBlLmtleSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gcmVzaXplIGV2ZW50XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgIGVuZ2luZS5yZXNpemUoKVxyXG4gICAgICAgIGNhbVJhZGlvdXMgPSBpc01vYmlsZSgpID8gaW5uZXJXaWR0aCA+IGlubmVySGVpZ2h0ID8gMTMgOiAyMCA6IDEwO1xyXG4gICAgICAgIGNhbWVyYS51cHBlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgICAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gcG9pbnRlciBsb2NrXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgY2FudmFzLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gbW9iaWxlIGNvbnRyb2xcclxuICAgIGNvbnN0IG1vYmlsZUxheW91dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtbGF5b3V0JykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBqb3lzdGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3lzdGljaycpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3Qgam95c3RpY2tCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuam95c3RpY2stYnV0dG9uJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBpZihpc01vYmlsZSgpKSBtb2JpbGVMYXlvdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBsZXQgc3RhcnRQb2ludCA9IFswLDBdXHJcbiAgICBcclxuICAgIGNvbnN0IGdldFRvdWNoZXNYWSA9IChldmVudDpUb3VjaEV2ZW50KTpbbnVtYmVyLCBudW1iZXJdID0+IHtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WFxyXG4gICAgICAgIGxldCB5ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgICAgZm9yKGxldCBpPTE7IGk8ZXZlbnQudG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25kID0gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRYIDwgeFxyXG4gICAgICAgICAgICB4ID0gY29uZCA/IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WCA6IHhcclxuICAgICAgICAgICAgeSA9IGNvbmQgPyBldmVudC50b3VjaGVzW2ldLmNsaWVudFkgOiB5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbeCwgeV1cclxuICAgIH1cclxuICAgIFxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cy5wdXNoKCcgJylcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJyAnKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBjb25zdCBbeCwgeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgam95c3RpY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUubGVmdCA9IGAke3h9cHhgXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudG9wID0gYCR7eX1weGBcclxuICAgICAgICBzdGFydFBvaW50ID0gW3gsIHldXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUubGVmdCA9ICc1MHB4J1xyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLnRvcCA9ICc1MHB4J1xyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gbnVsbDtcclxuICAgIH0pO1xyXG4gICAgbW9iaWxlTGF5b3V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGV2ZW50ID0+IHtcclxuICAgICAgICBsZXQgW2R4LCBkeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgZHggLT0gc3RhcnRQb2ludFswXVxyXG4gICAgICAgIGR5IC09IHN0YXJ0UG9pbnRbMV1cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXHJcbiAgICAgICAgY29uc3QgbWF4RGlzdGFuY2UgPSA1MFxyXG4gICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgY29uc3QgeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKGRpc3RhbmNlLCBtYXhEaXN0YW5jZSlcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS5sZWZ0ID0gYCR7eCs1MH1weGBcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSBgJHt5KzUwfXB4YFxyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gKC1hbmdsZSkgLSBNYXRoLlBJLzI7XHJcbiAgICB9KTtcclxuICAgIG1vYmlsZUxheW91dC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBqb3lzdGljay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC41cydcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gZW5lbXkgY3JlYXRpb25cclxuICAgIGNvbnN0IGNyZWF0ZUVuZW15ID0gKGlkOnN0cmluZywgcG9zOm51bWJlcltdLCB2ZWxvY2l0eTpudW1iZXJbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNwaCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKGAke2lkfWAsIHtkaWFtZXRlcjoxLCBzZWdtZW50czozMn0sIHNjZW5lKTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueCA9IHBvc1swXTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueiA9IHBvc1syXTtcclxuICAgICAgICBjb25zdCBzcGhJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGgsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3RvciA9IHNwaEltcG9zdGVyO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IucGh5c2ljc0JvZHkubGluZWFyRGFtcGluZyA9IGdsb2JhbERhbXBpbmc7XHJcbiAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICBzcGgubWF0ZXJpYWwgPSBnZXRNYXRlcmlhbChzY2VuZSwgd29ybGQucGxheWVyc1tpZF0uY29sb3IpO1xyXG4gICAgICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoKTtcclxuICAgICAgICBjb25zdCBuaWNrID0gd29ybGQucGxheWVyc1tpZF0ubmlja25hbWVcclxuICAgICAgICBjb25zdCBwbGFuZSA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlUGxhbmUoYCR7aWR9LXBsYW5lYCwge3dpZHRoOiBuaWNrLmxlbmd0aCwgaGVpZ2h0OiA1fSwgc2NlbmUpO1xyXG4gICAgICAgIHBsYW5lLmJpbGxib2FyZE1vZGUgPSBCQUJZTE9OLk1lc2guQklMTEJPQVJETU9ERV9BTEw7XHJcbiAgICAgICAgcGxhbmUucG9zaXRpb24ueCA9IHBvc1swXVxyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnogPSBwb3NbMl1cclxuICAgICAgICBjb25zdCBuaWNrVGV4dHVyZSA9IEdVSS5BZHZhbmNlZER5bmFtaWNUZXh0dXJlLkNyZWF0ZUZvck1lc2gocGxhbmUpO1xyXG4gICAgICAgIGNvbnN0IG5pY2tUZXh0ID0gbmV3IEdVSS5UZXh0QmxvY2soKTtcclxuICAgICAgICBuaWNrVGV4dC50ZXh0ID0gbmljaztcclxuICAgICAgICBuaWNrVGV4dC5jb2xvciA9ICd3aGl0ZSc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udFNpemUgPSAxMDA7XHJcbiAgICAgICAgbmlja1RleHQuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgICAgICBuaWNrVGV4dC5mb250RmFtaWx5ID0gJ0FyaWFsJztcclxuICAgICAgICBuaWNrVGV4dHVyZS5hZGRDb250cm9sKG5pY2tUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzb2NrZXQuaW9cclxuICAgIHNlcnZlci5lbWl0KCdpbml0Jywgd29ybGQub3duZXJJZClcclxuICAgIHNlcnZlci5vbignaW5pdCcsIChkYXRhOiBXb3JsZCkgPT4ge1xyXG4gICAgICAgIHdvcmxkID0gZGF0YTtcclxuICAgICAgICBPYmplY3Qua2V5cyh3b3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcsIGk6bnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlkID09PSBzZXJ2ZXIuaWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3QgcG9zID0gd29ybGQucGxheWVyc1tpZF0ucG9zaXRpb247XHJcbiAgICAgICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gd29ybGQucGxheWVyc1tpZF0udmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGNyZWF0ZUVuZW15KGlkLCBwb3MsIHZlbG9jaXR5KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2cod29ybGQpXHJcbiAgICBzZXJ2ZXIub24oJ3VwZGF0ZScsIChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBpZih3b3JsZC5wbGF5ZXJzW2lkXSl7XHJcbiAgICAgICAgICAgIHdvcmxkLnBsYXllcnNbaWRdLnBvc2l0aW9uID0gcG9zO1xyXG4gICAgICAgICAgICB3b3JsZC5wbGF5ZXJzW2lkXS52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG4gICAgICAgICAgICBpZihpZCA9PT0gc2VydmVyLmlkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IHNwaCA9IHNjZW5lLmdldE1lc2hCeU5hbWUoaWQpO1xyXG4gICAgICAgICAgICBjb25zdCBwbGFuZSA9IHNjZW5lLmdldE1lc2hCeU5hbWUoYCR7aWR9LXBsYW5lYCk7XHJcbiAgICAgICAgICAgIGlmIChzcGggJiYgcGxhbmUpIHtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi54ID0gcG9zWzBdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnkgPSBwb3NbMV07XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueiA9IHBvc1syXTtcclxuICAgICAgICAgICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMyh2ZWxvY2l0eVswXSwgdmVsb2NpdHlbMV0sIHZlbG9jaXR5WzJdKSk7XHJcbiAgICAgICAgICAgICAgICBwbGFuZS5wb3NpdGlvbi54ID0gcG9zWzBdXHJcbiAgICAgICAgICAgICAgICBwbGFuZS5wb3NpdGlvbi55ID0gcG9zWzFdICsgbmlja25hbWVPZmZzZXRcclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnogPSBwb3NbMl1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZUVuZW15KGlkLCBwb3MsIHZlbG9jaXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VydmVyLm9uKCdkaXNjb25uZWN0ZWQnLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgaWYgKHNwaCkge1xyXG4gICAgICAgICAgICBzcGguZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgd29ybGQucGxheWVyc1tpZF07XHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgbWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5uaWNrbmFtZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3Qgc3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uc3RhcnQnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCB0ZXh0dXJlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0LnRleHR1cmUnKSBhcyBIVE1MU2VsZWN0RWxlbWVudFxyXG5cclxuY29uc3Qgcm9vbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucm9vbXMnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBwb3B1cEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5wb3B1cCcpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnBvcHVwJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgYmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5iYWNrJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb21zID4gLmNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50XHJcblxyXG5jb25zdCBjcmVhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY3JlYXRlJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3Qgcm9vbW5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5yb29tbmFtZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3QgbWFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0Lm1hcCcpIGFzIEhUTUxTZWxlY3RFbGVtZW50XHJcbmNvbnN0IG1heFBsYXllcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5wbGF5ZXJzJykgYXMgSFRNTElucHV0RWxlbWVudFxyXG5cclxuY29uc3QgaW5Sb29tID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluUm9vbScpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGluUm9vbUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pblJvb20gPiAuY29udGFpbmVyJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3Qgc3RhcnRHYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmluaXQtZ2FtZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHNldHRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnNldHRpbmdzJykgYXMgSFRNTERpdkVsZW1lbnRcclxuXHJcbmNvbnN0IGVudGVyR2FtZSA9ICgpID0+IHtcclxuICAgIG1haW4uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICByb29tcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxufVxyXG5cclxuY29uc3Qgb2ZmUG9wdXAgPSAoKSA9PiB7XHJcbiAgICBwb3B1cC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIGJhY2suY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbn1cclxuXHJcbmNvbnN0IGVudGVyUm9vbSA9ICgpID0+IHtcclxuICAgIHJvb21zLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgaW5Sb29tLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG59XHJcblxyXG5zZXJ2ZXIub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnY29ubmVjdGVkJyk7XHJcbiAgICBcclxuICAgIC8vIGV2ZW50c1xyXG4gICAgbmlja25hbWUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgaWYoZS5rZXkgPT09ICdFbnRlcicpIHtcclxuICAgICAgICAgICAgZW50ZXJHYW1lKClcclxuICAgICAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgc3RhcnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgZW50ZXJHYW1lKClcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnZ2V0Um9vbXMnKVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgcG9wdXBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgcG9wdXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgYmFjay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIGJhY2suYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb2ZmUG9wdXApXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvZmZQb3B1cClcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2dldFJvb21zJywgKHdvcmxkczpXb3JsZFtdKSA9PiB7XHJcbiAgICAgICAgaWYoaW5Sb29tLmNsYXNzTGlzdC5jb250YWlucygnaGlkZScpKXtcclxuICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHdvcmxkcylcclxuICAgICAgICAgICAgd29ybGRzLmZvckVhY2goKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih3b3JsZC5zdGF0dXMgIT09ICd3YWl0aW5nJykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgICAgICByb29tLmNsYXNzTGlzdC5hZGQoJ3Jvb20nKVxyXG4gICAgICAgICAgICAgICAgcm9vbS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hbWVcIj4ke3dvcmxkLm5hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcFwiPiR7d29ybGQubWFwfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5ZXJzXCI+JHtPYmplY3Qua2V5cyh3b3JsZC5wbGF5ZXJzKS5sZW5ndGh9LyR7d29ybGQubWF4UGxheWVyc308L2Rpdj5cclxuICAgICAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxyXG4gICAgICAgICAgICAgICAgam9pbi5jbGFzc0xpc3QuYWRkKCdqb2luJylcclxuICAgICAgICAgICAgICAgIGpvaW4uaW5uZXJUZXh0ID0gJ0pvaW4nXHJcbiAgICAgICAgICAgICAgICBqb2luLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmxlbmd0aCA+PSB3b3JsZC5tYXhQbGF5ZXJzKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLmVtaXQoJ2pvaW5Sb29tJywgd29ybGQub3duZXJJZCwgbmlja25hbWUudmFsdWUsIHRleHR1cmUudmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgcm9vbS5hcHBlbmRDaGlsZChqb2luKVxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJvb20pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbXlXb3JsZCA9IHdvcmxkcy5maW5kKHdvcmxkID0+IHdvcmxkLm93bmVySWQgPT09IG15V29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgaWYobXlXb3JsZCl7XHJcbiAgICAgICAgICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKG15V29ybGQucGxheWVycykuZm9yRWFjaCgoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxheWVyID0gbXlXb3JsZC5wbGF5ZXJzW2lkXVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYXllckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyRGl2LmNsYXNzTGlzdC5hZGQoJ3BsYXllcicpXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyRGl2LmlubmVyVGV4dCA9IHBsYXllci5uaWNrbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckRpdi5zdHlsZS5jb2xvciA9IHBsYXllci5jb2xvclxyXG4gICAgICAgICAgICAgICAgICAgIGluUm9vbUNvbnRhaW5lci5hcHBlbmRDaGlsZChwbGF5ZXJEaXYpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgcm9vbXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICBteVdvcmxkID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBjcmVhdGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2NyZWF0ZVJvb20nLCByb29tbmFtZS52YWx1ZSwgbWFwLnZhbHVlLCBOdW1iZXIobWF4UGxheWVycy52YWx1ZSkpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignY3JlYXRlZFJvb20nLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnam9pblJvb20nLCB3b3JsZC5vd25lcklkLCBuaWNrbmFtZS52YWx1ZSwgdGV4dHVyZS52YWx1ZSlcclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdqb2luZWRSb29tJywgKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2cod29ybGQpXHJcbiAgICAgICAgbXlXb3JsZCA9IHdvcmxkXHJcbiAgICAgICAgZW50ZXJSb29tKClcclxuICAgICAgICBpZihzZXJ2ZXIuaWQgPT0gd29ybGQub3duZXJJZCl7XHJcbiAgICAgICAgICAgIHN0YXJ0R2FtZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgc3RhcnRHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VydmVyLmVtaXQoJ3N0YXJ0R2FtZScsIHdvcmxkLm93bmVySWQpXHJcbiAgICAgICAgICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHNldHRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdnYW1lU3RhcnRlZCcsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICBpbml0R2FtZShteVdvcmxkKVxyXG4gICAgfSlcclxufSkiLCJpbXBvcnQgeyBDb2xvcjMsIE1lc2gsIFZlY3RvcjMgfSBmcm9tIFwiYmFieWxvbmpzXCI7XHJcbmltcG9ydCB7IGNvbG9ycyB9IGZyb20gXCIuL3RleHR1cmVzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE1hcE1lc2gge1xyXG4gICAgbmFtZT86IHN0cmluZztcclxuICAgIHBvc2l0aW9uOiBWZWN0b3IzO1xyXG4gICAgcm90YXRpb246IFZlY3RvcjM7XHJcbiAgICBzY2FsaW5nOiBWZWN0b3IzO1xyXG4gICAgY29sb3I6IENvbG9yMztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBNYXAge1xyXG4gICAgbWVzaGVzOiBNYXBNZXNoW107XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBjb2xvcjogQ29sb3IzO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbWFwczp7W2tleTpzdHJpbmddOk1hcH0gPSB7XHJcbiAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgbWVzaGVzOiBbXHJcbiAgICAgICAgICAgIHtuYW1lOidib3gxJywgcG9zaXRpb246bmV3IFZlY3RvcjMoNCwwLjUsNiksIHJvdGF0aW9uOm5ldyBWZWN0b3IzKDAsNDUsMCksIHNjYWxpbmc6bmV3IFZlY3RvcjMoMSwxLDEpLCBjb2xvcjpjb2xvcnMud2hpdGV9LFxyXG4gICAgICAgICAgICB7bmFtZTonc3RhaXIxJywgcG9zaXRpb246bmV3IFZlY3RvcjMoLTcsLTAuNSwyKSwgcm90YXRpb246bmV3IFZlY3RvcjMoMC4zLDAsMCksIHNjYWxpbmc6bmV3IFZlY3RvcjMoMiw0LDEwKSwgY29sb3I6Y29sb3JzLndoaXRlfSxcclxuICAgICAgICAgICAge25hbWU6J2JveDEnLCBwb3NpdGlvbjpuZXcgVmVjdG9yMygtMywxLjM5LC00LjY5KSwgcm90YXRpb246bmV3IFZlY3RvcjMoMCwwLDApLCBzY2FsaW5nOm5ldyBWZWN0b3IzKDEwLDMsNSksIGNvbG9yOmNvbG9ycy53aGl0ZX0sXHJcbiAgICAgICAgXSxcclxuICAgICAgICB3aWR0aDogNDAsXHJcbiAgICAgICAgaGVpZ2h0OiAyMCxcclxuICAgICAgICBjb2xvcjogY29sb3JzLndoaXRlLFxyXG4gICAgfSxcclxufSIsImltcG9ydCAqIGFzIEJBQllMT04gZnJvbSAnYmFieWxvbmpzJ1xyXG5cclxuZXhwb3J0IGNvbnN0IGNvbG9ycyA9IHtcclxuICAgIHJlZCA6IG5ldyBCQUJZTE9OLkNvbG9yMygxLCAwLCAwKSxcclxuICAgIGdyZWVuIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDEsIDApLFxyXG4gICAgYmx1ZSA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAxKSxcclxuICAgIGN5YW4gOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMSwgMSksXHJcbiAgICBtYWdlbnRhIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDEpLFxyXG4gICAgeWVsbG93IDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDApLFxyXG4gICAgYmxhY2sgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCksXHJcbiAgICB3aGl0ZSA6IG5ldyBCQUJZTE9OLkNvbG9yMygxLCAxLCAxKSxcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1ldGFsTWF0ID0gKHNjZW5lOkJBQllMT04uU2NlbmUpOkJBQllMT04uTWF0ZXJpYWwgPT4ge1xyXG4gICAgY29uc3QgTWV0YWxTcGhlcmVNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdNZXRhbFNwaGVyZU1hdCcsIHNjZW5lKTtcclxuICAgIE1ldGFsU3BoZXJlTWF0LmRpZmZ1c2VUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9tZXRhbC9iYy5qcGcnLCBzY2VuZSlcclxuICAgIE1ldGFsU3BoZXJlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9tZXRhbC9uLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9tZXRhbC9tLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuc3BlY3VsYXJUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9tZXRhbC9tLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuYW1iaWVudFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL2FvLmpwZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIE1ldGFsU3BoZXJlTWF0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRHcmFuaXRlTWF0ID0gKHNjZW5lOkJBQllMT04uU2NlbmUpOkJBQllMT04uTWF0ZXJpYWwgPT4ge1xyXG4gICAgY29uc3QgR3Jhbml0ZVNwaGVyZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ0dyYW5pdGVTcGhlcmVNYXQnLCBzY2VuZSk7XHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmRpZmZ1c2VUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL2JjLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9uLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvci5wbmcnLCBzY2VuZSlcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuYW1iaWVudFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvYS5wbmcnLCBzY2VuZSlcclxuICAgIHJldHVybiBHcmFuaXRlU3BoZXJlTWF0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRTcXVhcmVUaWxlTWF0ID0gKHNjZW5lOkJBQllMT04uU2NlbmUpOkJBQllMT04uTWF0ZXJpYWwgPT4ge1xyXG4gICAgY29uc3QgU3F1YXJlVGlsZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ1NxdWFyZVRpbGVNYXQnLCBzY2VuZSk7XHJcbiAgICBTcXVhcmVUaWxlTWF0LmRpZmZ1c2VUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9iYy5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL24ucG5nJywgc2NlbmUpXHJcbiAgICBTcXVhcmVUaWxlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvci5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuYW1iaWVudFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL2FvLnBuZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIFNxdWFyZVRpbGVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldENvbG9yTWF0ID0gKHNjZW5lOkJBQllMT04uU2NlbmUsIGNvbG9yOnN0cmluZyk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBDb2xvck1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ0NvbG9yTWF0Jywgc2NlbmUpO1xyXG4gICAgQ29sb3JNYXQuZGlmZnVzZUNvbG9yID0gY29sb3JzW2NvbG9yXVxyXG4gICAgcmV0dXJuIENvbG9yTWF0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRNYXRlcmlhbCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lLCBuYW1lOnN0cmluZyk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBzd2l0Y2gobmFtZSl7XHJcbiAgICAgICAgY2FzZSAnbWV0YWwnOiByZXR1cm4gZ2V0TWV0YWxNYXQoc2NlbmUpXHJcbiAgICAgICAgY2FzZSAnZ3Jhbml0ZSc6IHJldHVybiBnZXRHcmFuaXRlTWF0KHNjZW5lKVxyXG4gICAgICAgIGNhc2UgJ3NxdWFyZV90aWxlJzogcmV0dXJuIGdldFNxdWFyZVRpbGVNYXQoc2NlbmUpXHJcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIGdldENvbG9yTWF0KHNjZW5lLCBuYW1lKVxyXG4gICAgfVxyXG59IiwiaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnO1xyXG5pbXBvcnQgeyBNYXAgfSBmcm9tIFwiLi9tYXBcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVNYXAgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgbWFwOk1hcCwgc2hhZG93R2VuZXJhdG9yOkJBQllMT04uU2hhZG93R2VuZXJhdG9yKTpCQUJZTE9OLkdyb3VuZE1lc2ggPT4ge1xyXG4gICAgY29uc3QgZ3JvdW5kID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVHcm91bmQoJ2dyb3VuZCcsIHsgd2lkdGg6IG1hcC53aWR0aCwgaGVpZ2h0OiBtYXAuaGVpZ2h0IH0sIHNjZW5lKTtcclxuICAgIGNvbnN0IGdyb3VuZE1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ2dyb3VuZE1hdCcsIHNjZW5lKTtcclxuICAgIGdyb3VuZE1hdC5kaWZmdXNlQ29sb3IgPSBtYXAuY29sb3JcclxuICAgIGdyb3VuZC5tYXRlcmlhbCA9IGdyb3VuZE1hdDtcclxuICAgIGdyb3VuZC5yZWNlaXZlU2hhZG93cyA9IHRydWU7XHJcbiAgICBncm91bmQucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKGdyb3VuZCwgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHsgbWFzczogMCwgcmVzdGl0dXRpb246IDAuNSwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICBtYXAubWVzaGVzLmZvckVhY2gobWVzaCA9PiB7XHJcbiAgICAgICAgY29uc3QgYm94ID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVCb3gobWVzaC5uYW1lLCB7IHdpZHRoOiAxLCBoZWlnaHQ6IDEsIGRlcHRoOiAxIH0sIHNjZW5lKTtcclxuICAgICAgICBib3gucG9zaXRpb24gPSBtZXNoLnBvc2l0aW9uO1xyXG4gICAgICAgIGJveC5yb3RhdGlvbiA9IG1lc2gucm90YXRpb247XHJcbiAgICAgICAgYm94LnNjYWxpbmcgPSBtZXNoLnNjYWxpbmc7XHJcbiAgICAgICAgY29uc3QgYm94TWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbChtZXNoLm5hbWUrJ01hdCcsIHNjZW5lKTtcclxuICAgICAgICBib3hNYXQuZGlmZnVzZUNvbG9yID0gbWVzaC5jb2xvcjtcclxuICAgICAgICBib3gubWF0ZXJpYWwgPSBib3hNYXQ7XHJcbiAgICAgICAgYm94LnJlY2VpdmVTaGFkb3dzID0gdHJ1ZTtcclxuICAgICAgICBib3gucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKGJveCwgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuQm94SW1wb3N0b3IsIHsgbWFzczogMCwgcmVzdGl0dXRpb246IDAuNSwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlbmRlckxpc3QucHVzaChib3gpO1xyXG4gICAgfSlcclxuICAgIHJldHVybiBncm91bmRcclxufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==