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
    const globalDamping = world.damping;
    const globalRestitution = world.restitution;
    let camRadious = isMobile() ? innerWidth > innerHeight ? 13 : 20 : 10;
    const speed = world.speed * 0.2;
    const jumpHeight = world.jumpHeight;
    const jumpCoolTime = world.jumpCooltime;
    const nicknameOffset = 1.2;
    let timer = 0;
    // elements initialization
    const jump = document.querySelector('.jump');
    jump.classList.remove('hide');
    // game initialization
    const canvas = document.getElementById('renderCanvas');
    canvas.classList.remove('hide');
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, world.gravity * (-9.81), 0), new BABYLON.CannonJSPlugin());
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
    // map
    let newMeshes = (await BABYLON.SceneLoader.ImportMeshAsync('', 'obj/', '8.obj', scene)).meshes;
    engine.hideLoadingUI();
    const mapOffset = [8, 3, 0];
    newMeshes.forEach((mesh) => {
        shadowGenerator.getShadowMap().renderList.push(mesh);
        mesh.receiveShadows = true;
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: globalRestitution / 5, friction: 1, damping: globalDamping }, scene);
        mesh.position.x += mapOffset[0];
        mesh.position.y += mapOffset[1];
        mesh.position.z += mapOffset[2];
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
const players = document.querySelector('div.playersBtn');
const settings = document.querySelector('div.settingsBtn');
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
    server.emit('debug', navigator.userAgent);
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
    const loadPlayers = () => {
        Object.keys(myWorld.players).forEach((id) => {
            const player = myWorld.players[id];
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');
            playerDiv.innerText = player.nickname;
            playerDiv.style.color = player.color;
            inRoomContainer.appendChild(playerDiv);
        });
    };
    const loadSettings = () => {
        const set = document.createElement('div');
        set.classList.add('settings');
        set.innerHTML = `
            <div class="gravity">
                <label for="gravity">Gravity</label>
                <input type="number" name="gravity" value="${myWorld.gravity}" step="0.1">
            </div>
            <div class="speed">
                <label for="speed">Speed</label>
                <input type="number" name="speed" value="${myWorld.speed}" step="0.1">
            </div>
            <div class="jumpHeight">
                <label for="jumpHeight">Jump Height</label>
                <input type="number" name="jumpHeight" value="${myWorld.jumpHeight}" step="0.1">
            </div>
            <div class="jumpCooltime">
                <label for="jumpCooltime">Jump Cooltime</label>
                <input type="number" name="jumpCooltime" value="${myWorld.jumpCooltime}" step="0.1">
            </div>
            <div class="damping">
                <label for="damping">Damping</label>
                <input type="number" name="damping" value="${myWorld.damping}" step="0.1">
            </div>
            <div class="restitution">
                <label for="restitution">Restitution</label>
                <input type="number" name="restitution" value="${myWorld.restitution}" step="0.1">
            </div>
        `;
        inRoomContainer.append(set);
    };
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
                loadPlayers();
            }
            else {
                inRoom.classList.add('hide');
                rooms.classList.remove('hide');
                myWorld = null;
            }
        }
    });
    players.addEventListener('click', () => {
        inRoomContainer.innerHTML = '';
        loadPlayers();
    });
    settings.addEventListener('click', () => {
        inRoomContainer.innerHTML = '';
        loadSettings();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FDM0M7QUFDTCxDQUFDO0FBUFksbUJBQVcsZUFPdkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mcm9udC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mcm9udC8uL3NyYy90ZXh0dXJlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbywgU29ja2V0IH0gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XHJcbmltcG9ydCAqIGFzIEJBQllMT04gZnJvbSAnYmFieWxvbmpzJztcclxuaW1wb3J0ICogYXMgR1VJIGZyb20gJ2JhYnlsb25qcy1ndWknO1xyXG5pbXBvcnQgQ0FOTk9OIGZyb20gJ2Nhbm5vbidcclxuaW1wb3J0IHsgZ2V0R3Jhbml0ZU1hdCwgZ2V0TWF0ZXJpYWwsIGdldE1ldGFsTWF0LCBnZXRTcXVhcmVUaWxlTWF0IH0gZnJvbSAnLi90ZXh0dXJlcyc7XHJcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSAnLi90eXBlcydcclxuaW1wb3J0ICdiYWJ5bG9uanMtbG9hZGVycy9iYWJ5bG9uLm9iakZpbGVMb2FkZXInXHJcblxyXG5jb25zdCBzZXJ2ZXIgPSBpbygnLycpXHJcblxyXG53aW5kb3cuQ0FOTk9OID0gQ0FOTk9OXHJcblxyXG5jb25zdCBpc01vYmlsZSA9ICgpOmJvb2xlYW4gPT4ge1xyXG4gICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ0FuZHJvaWQnKSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdpUGhvbmUnKTtcclxufTtcclxuXHJcbmxldCBteVdvcmxkOldvcmxkfG51bGwgPSBudWxsXHJcblxyXG5jb25zdCBpbml0R2FtZSA9IGFzeW5jICh0aGlzV29ybGQ6V29ybGQpID0+IHtcclxuICAgIC8vIHZhcmlhYmxlcyBpbml0aWFsaXphdGlvblxyXG4gICAgbGV0IGlucHV0S2V5czpzdHJpbmdbXSA9IFtdXHJcbiAgICBsZXQgd29ybGQ6V29ybGQgPSB0aGlzV29ybGQ7XHJcbiAgICBsZXQgbW92aW5nQW5nbGU6bnVtYmVyfG51bGwgPSBudWxsXHJcbiAgICBcclxuICAgIGNvbnN0IGdsb2JhbERhbXBpbmcgPSB3b3JsZC5kYW1waW5nO1xyXG4gICAgY29uc3QgZ2xvYmFsUmVzdGl0dXRpb24gPSB3b3JsZC5yZXN0aXR1dGlvbjtcclxuICAgIGxldCBjYW1SYWRpb3VzID0gaXNNb2JpbGUoKSA/IGlubmVyV2lkdGggPiBpbm5lckhlaWdodCA/IDEzIDogMjAgOiAxMDtcclxuICAgIGNvbnN0IHNwZWVkID0gd29ybGQuc3BlZWQqMC4yO1xyXG4gICAgY29uc3QganVtcEhlaWdodCA9IHdvcmxkLmp1bXBIZWlnaHQ7XHJcbiAgICBjb25zdCBqdW1wQ29vbFRpbWUgPSB3b3JsZC5qdW1wQ29vbHRpbWU7XHJcbiAgICBjb25zdCBuaWNrbmFtZU9mZnNldCA9IDEuMjtcclxuICAgIFxyXG4gICAgbGV0IHRpbWVyID0gMDtcclxuXHJcbiAgICAvLyBlbGVtZW50cyBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QganVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qdW1wJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBqdW1wLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgXHJcbiAgICAvLyBnYW1lIGluaXRpYWxpemF0aW9uXHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVuZGVyQ2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBjb25zdCBlbmdpbmUgPSBuZXcgQkFCWUxPTi5FbmdpbmUoY2FudmFzLCB0cnVlKTtcclxuICAgIGNvbnN0IHNjZW5lID0gbmV3IEJBQllMT04uU2NlbmUoZW5naW5lKTtcclxuICAgIHNjZW5lLmVuYWJsZVBoeXNpY3MobmV3IEJBQllMT04uVmVjdG9yMygwLCB3b3JsZC5ncmF2aXR5KigtOS44MSksIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIFxyXG4gICAgLy8gbXkgc3BoZXJlXHJcbiAgICBjb25zdCBzcGhlcmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgnc3BoZXJlJywge2RpYW1ldGVyOjEsIHNlZ21lbnRzOjE2fSwgc2NlbmUpO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnggPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMF07XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueSA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblsxXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzJdO1xyXG4gICAgc3BoZXJlLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5jb2xvcik7XHJcbiAgICBjb25zdCBzcGhlcmVJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGhlcmUsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yID0gc3BoZXJlSW1wb3N0ZXI7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG5cclxuICAgIC8vIGNhbWVyYVxyXG4gICAgY29uc3QgY2FtZXJhID0gbmV3IEJBQllMT04uQXJjUm90YXRlQ2FtZXJhKCdDYW1lcmEnLCAwLCAwLCAxMCwgc3BoZXJlLnBvc2l0aW9uLCBzY2VuZSk7XHJcbiAgICBjYW1lcmEuYXR0YWNoQ29udHJvbChjYW52YXMsIHRydWUpO1xyXG4gICAgY2FtZXJhLmluZXJ0aWEgPSBpc01vYmlsZSgpID8gMC44IDogMC41O1xyXG4gICAgY2FtZXJhLnVwcGVyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgY2FtZXJhLmxvd2VyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgXHJcbiAgICAvL2ZvZ1xyXG4gICAgc2NlbmUuZm9nTW9kZSA9IEJBQllMT04uU2NlbmUuRk9HTU9ERV9FWFA7XHJcbiAgICBzY2VuZS5mb2dEZW5zaXR5ID0gMC4wMDU7XHJcbiAgICBzY2VuZS5mb2dDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLjksIDAuOSwgMC45KTtcclxuICAgIHNjZW5lLmZvZ1N0YXJ0ID0gMjAuMDtcclxuICAgIHNjZW5lLmZvZ0VuZCA9IDYwLjA7XHJcbiAgICBcclxuICAgIC8vTGlnaHRcclxuICAgIHNjZW5lLmFtYmllbnRDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygxLDEsMSk7XHJcbiAgICB2YXIgbGlnaHQxID0gbmV3IEJBQllMT04uSGVtaXNwaGVyaWNMaWdodChcImxpZ2h0MVwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDEsMSwwKSwgc2NlbmUpO1xyXG4gICAgdmFyIGxpZ2h0MiA9IG5ldyBCQUJZTE9OLlBvaW50TGlnaHQoXCJsaWdodDJcIiwgbmV3IEJBQllMT04uVmVjdG9yMyg2MCw2MCwwKSwgc2NlbmUpO1xyXG4gICAgbGlnaHQxLmludGVuc2l0eSA9IDAuNTtcclxuICAgIGxpZ2h0Mi5pbnRlbnNpdHkgPSAwLjU7XHJcbiAgICBcclxuICAgIC8vIHNoYWRvd1xyXG4gICAgY29uc3Qgc2hhZG93R2VuZXJhdG9yID0gbmV3IEJBQllMT04uU2hhZG93R2VuZXJhdG9yKDEwMjQsIGxpZ2h0Mik7XHJcbiAgICBzaGFkb3dHZW5lcmF0b3IudXNlQ29udGFjdEhhcmRlbmluZ1NoYWRvdyA9IHRydWU7XHJcbiAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaGVyZSk7XHJcbiAgICBcclxuICAgIC8vIG1hcFxyXG4gICAgbGV0IG5ld01lc2hlcyA9IChhd2FpdCBCQUJZTE9OLlNjZW5lTG9hZGVyLkltcG9ydE1lc2hBc3luYygnJywgJ29iai8nLCAnOC5vYmonLCBzY2VuZSkpLm1lc2hlcztcclxuICAgIGVuZ2luZS5oaWRlTG9hZGluZ1VJKClcclxuICAgIFxyXG4gICAgY29uc3QgbWFwT2Zmc2V0ID0gWzgsIDMsIDBdXHJcblxyXG4gICAgbmV3TWVzaGVzLmZvckVhY2goKG1lc2gpID0+IHtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKG1lc2gpO1xyXG4gICAgICAgIG1lc2gucmVjZWl2ZVNoYWRvd3MgPSB0cnVlO1xyXG4gICAgICAgIG1lc2gucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKG1lc2gsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLk1lc2hJbXBvc3RvciwgeyBtYXNzOiAwLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24vNSwgZnJpY3Rpb246MSwgZGFtcGluZzpnbG9iYWxEYW1waW5nIH0sIHNjZW5lKTtcclxuICAgICAgICBtZXNoLnBvc2l0aW9uLnggKz0gbWFwT2Zmc2V0WzBdO1xyXG4gICAgICAgIG1lc2gucG9zaXRpb24ueSArPSBtYXBPZmZzZXRbMV07XHJcbiAgICAgICAgbWVzaC5wb3NpdGlvbi56ICs9IG1hcE9mZnNldFsyXTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8ganVtcCB2YXJzXHJcbiAgICBjb25zdCBqdW1wRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmp1bXAgPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzSnVtcGluZyA9IHRydWU7XHJcbiAgICBsZXQganVtcFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gbG9vcFxyXG4gICAgZW5naW5lLnJ1blJlbmRlckxvb3AoKCkgPT4ge1xyXG4gICAgICAgIHRpbWVyKys7XHJcbiAgICAgICAgY2FtZXJhLnNldFRhcmdldChzcGhlcmUucG9zaXRpb24pO1xyXG4gICAgICAgIGNvbnN0IGR4ID0gKGNhbWVyYS50YXJnZXQueCAtIGNhbWVyYS5wb3NpdGlvbi54KVxyXG4gICAgICAgIGNvbnN0IGR6ID0gKGNhbWVyYS50YXJnZXQueiAtIGNhbWVyYS5wb3NpdGlvbi56KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeiwgZHgpXHJcbiAgICAgICAgaWYoaXNNb2JpbGUoKSkge1xyXG4gICAgICAgICAgICBpZihtb3ZpbmdBbmdsZSkgbW92aW5nQW5nbGUgKz0gYW5nbGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdhJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlICsgTWF0aC5QSS80O31cclxuICAgICAgICAgICAgZWxzZSBpZiAoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS80O31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQgKiAzO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQgKiAzO31cclxuICAgICAgICAgICAgZWxzZSBpZiAoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzI7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2Uge21vdmluZ0FuZ2xlID0gbnVsbDt9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgY29uc3QgeCA9IE1hdGguY29zKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgIGNvbnN0IHogPSBNYXRoLnNpbihtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIDAsIHopLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoaXNNb2JpbGUoKSAmJiBtb3ZpbmdBbmdsZSAhPT0gbnVsbCkge21vdmluZ0FuZ2xlIC09IGFuZ2xlO31cclxuICAgICAgICBpZihzcGhlcmUucG9zaXRpb24ueSA8IC0xMCkge1xyXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgICAgIHNwaGVyZS5wb3NpdGlvbi55ID0gNTtcclxuICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnogPSAwO1xyXG4gICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwwLDApKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIWlzSnVtcGluZyAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJyAnKSkge1xyXG4gICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIGp1bXBIZWlnaHQsIDApLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgaXNKdW1waW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAganVtcFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBqdW1wRGl2LnN0eWxlLmhlaWdodCA9IGAke3RpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSA/IDEwMCA6ICh0aW1lciAtIGp1bXBUaW1lU3RhbXApL2p1bXBDb29sVGltZSoxMDB9JWA7XHJcbiAgICAgICAgaWYoaXNKdW1waW5nICYmIHRpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSkge1xyXG4gICAgICAgICAgICBpc0p1bXBpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ3VwZGF0ZScsIFtzcGhlcmUucG9zaXRpb24ueCwgc3BoZXJlLnBvc2l0aW9uLnksIHNwaGVyZS5wb3NpdGlvbi56XSwgW3NwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS54LCBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkueSwgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLnpdKTtcclxuICAgICAgICBzY2VuZS5yZW5kZXIoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGlucHV0IGV2ZW50XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICBpZiAoIWlucHV0S2V5cy5pbmNsdWRlcyhlLmtleSkpIHtcclxuICAgICAgICAgICAgaW5wdXRLZXlzLnB1c2goZS5rZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cyA9IGlucHV0S2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSBlLmtleSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gcmVzaXplIGV2ZW50XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgIGVuZ2luZS5yZXNpemUoKVxyXG4gICAgICAgIGNhbVJhZGlvdXMgPSBpc01vYmlsZSgpID8gaW5uZXJXaWR0aCA+IGlubmVySGVpZ2h0ID8gMTMgOiAyMCA6IDEwO1xyXG4gICAgICAgIGNhbWVyYS51cHBlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgICAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gcG9pbnRlciBsb2NrXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgY2FudmFzLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gbW9iaWxlIGNvbnRyb2xcclxuICAgIGNvbnN0IG1vYmlsZUxheW91dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtbGF5b3V0JykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBqb3lzdGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3lzdGljaycpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3Qgam95c3RpY2tCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuam95c3RpY2stYnV0dG9uJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBpZihpc01vYmlsZSgpKSBtb2JpbGVMYXlvdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBsZXQgc3RhcnRQb2ludCA9IFswLDBdXHJcbiAgICBcclxuICAgIGNvbnN0IGdldFRvdWNoZXNYWSA9IChldmVudDpUb3VjaEV2ZW50KTpbbnVtYmVyLCBudW1iZXJdID0+IHtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WFxyXG4gICAgICAgIGxldCB5ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgICAgZm9yKGxldCBpPTE7IGk8ZXZlbnQudG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25kID0gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRYIDwgeFxyXG4gICAgICAgICAgICB4ID0gY29uZCA/IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WCA6IHhcclxuICAgICAgICAgICAgeSA9IGNvbmQgPyBldmVudC50b3VjaGVzW2ldLmNsaWVudFkgOiB5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbeCwgeV1cclxuICAgIH1cclxuICAgIFxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cy5wdXNoKCcgJylcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJyAnKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBjb25zdCBbeCwgeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgam95c3RpY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUubGVmdCA9IGAke3h9cHhgXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudG9wID0gYCR7eX1weGBcclxuICAgICAgICBzdGFydFBvaW50ID0gW3gsIHldXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUubGVmdCA9ICc1MHB4J1xyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLnRvcCA9ICc1MHB4J1xyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gbnVsbDtcclxuICAgIH0pO1xyXG4gICAgbW9iaWxlTGF5b3V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGV2ZW50ID0+IHtcclxuICAgICAgICBsZXQgW2R4LCBkeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgZHggLT0gc3RhcnRQb2ludFswXVxyXG4gICAgICAgIGR5IC09IHN0YXJ0UG9pbnRbMV1cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXHJcbiAgICAgICAgY29uc3QgbWF4RGlzdGFuY2UgPSA1MFxyXG4gICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgY29uc3QgeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKGRpc3RhbmNlLCBtYXhEaXN0YW5jZSlcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS5sZWZ0ID0gYCR7eCs1MH1weGBcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSBgJHt5KzUwfXB4YFxyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gKC1hbmdsZSkgLSBNYXRoLlBJLzI7XHJcbiAgICB9KTtcclxuICAgIG1vYmlsZUxheW91dC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBqb3lzdGljay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC41cydcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gZW5lbXkgY3JlYXRpb25cclxuICAgIGNvbnN0IGNyZWF0ZUVuZW15ID0gKGlkOnN0cmluZywgcG9zOm51bWJlcltdLCB2ZWxvY2l0eTpudW1iZXJbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNwaCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKGAke2lkfWAsIHtkaWFtZXRlcjoxLCBzZWdtZW50czozMn0sIHNjZW5lKTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueCA9IHBvc1swXTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueiA9IHBvc1syXTtcclxuICAgICAgICBjb25zdCBzcGhJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGgsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3RvciA9IHNwaEltcG9zdGVyO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IucGh5c2ljc0JvZHkubGluZWFyRGFtcGluZyA9IGdsb2JhbERhbXBpbmc7XHJcbiAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICBzcGgubWF0ZXJpYWwgPSBnZXRNYXRlcmlhbChzY2VuZSwgd29ybGQucGxheWVyc1tpZF0uY29sb3IpO1xyXG4gICAgICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoKTtcclxuICAgICAgICBjb25zdCBuaWNrID0gd29ybGQucGxheWVyc1tpZF0ubmlja25hbWVcclxuICAgICAgICBjb25zdCBwbGFuZSA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlUGxhbmUoYCR7aWR9LXBsYW5lYCwge3dpZHRoOiBuaWNrLmxlbmd0aCwgaGVpZ2h0OiA1fSwgc2NlbmUpO1xyXG4gICAgICAgIHBsYW5lLmJpbGxib2FyZE1vZGUgPSBCQUJZTE9OLk1lc2guQklMTEJPQVJETU9ERV9BTEw7XHJcbiAgICAgICAgcGxhbmUucG9zaXRpb24ueCA9IHBvc1swXVxyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnogPSBwb3NbMl1cclxuICAgICAgICBjb25zdCBuaWNrVGV4dHVyZSA9IEdVSS5BZHZhbmNlZER5bmFtaWNUZXh0dXJlLkNyZWF0ZUZvck1lc2gocGxhbmUpO1xyXG4gICAgICAgIGNvbnN0IG5pY2tUZXh0ID0gbmV3IEdVSS5UZXh0QmxvY2soKTtcclxuICAgICAgICBuaWNrVGV4dC50ZXh0ID0gbmljaztcclxuICAgICAgICBuaWNrVGV4dC5jb2xvciA9ICd3aGl0ZSc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udFNpemUgPSAxMDA7XHJcbiAgICAgICAgbmlja1RleHQuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgICAgICBuaWNrVGV4dC5mb250RmFtaWx5ID0gJ0FyaWFsJztcclxuICAgICAgICBuaWNrVGV4dHVyZS5hZGRDb250cm9sKG5pY2tUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy8gc29ja2V0LmlvXHJcbiAgICBzZXJ2ZXIuZW1pdCgnaW5pdCcsIHdvcmxkLm93bmVySWQpXHJcbiAgICBzZXJ2ZXIub24oJ2luaXQnLCAoZGF0YTogV29ybGQpID0+IHtcclxuICAgICAgICB3b3JsZCA9IGRhdGE7XHJcbiAgICAgICAgT2JqZWN0LmtleXMod29ybGQucGxheWVycykuZm9yRWFjaCgoaWQ6c3RyaW5nLCBpOm51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBpZihpZCA9PT0gc2VydmVyLmlkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHdvcmxkLnBsYXllcnNbaWRdLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICBjb25zdCB2ZWxvY2l0eSA9IHdvcmxkLnBsYXllcnNbaWRdLnZlbG9jaXR5O1xyXG4gICAgICAgICAgICBjcmVhdGVFbmVteShpZCwgcG9zLCB2ZWxvY2l0eSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIGNvbnNvbGUubG9nKHdvcmxkKVxyXG4gICAgc2VydmVyLm9uKCd1cGRhdGUnLCAoaWQ6c3RyaW5nLCBwb3M6bnVtYmVyW10sIHZlbG9jaXR5Om51bWJlcltdKSA9PiB7XHJcbiAgICAgICAgaWYoc3RhcnRlZCAmJiB3b3JsZC5wbGF5ZXJzW2lkXSl7XHJcbiAgICAgICAgICAgIHdvcmxkLnBsYXllcnNbaWRdLnBvc2l0aW9uID0gcG9zO1xyXG4gICAgICAgICAgICB3b3JsZC5wbGF5ZXJzW2lkXS52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG4gICAgICAgICAgICBpZihpZCA9PT0gc2VydmVyLmlkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IHNwaCA9IHNjZW5lLmdldE1lc2hCeU5hbWUoaWQpO1xyXG4gICAgICAgICAgICBjb25zdCBwbGFuZSA9IHNjZW5lLmdldE1lc2hCeU5hbWUoYCR7aWR9LXBsYW5lYCk7XHJcbiAgICAgICAgICAgIGlmIChzcGggJiYgcGxhbmUpIHtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi54ID0gcG9zWzBdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnkgPSBwb3NbMV07XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueiA9IHBvc1syXTtcclxuICAgICAgICAgICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMyh2ZWxvY2l0eVswXSwgdmVsb2NpdHlbMV0sIHZlbG9jaXR5WzJdKSk7XHJcbiAgICAgICAgICAgICAgICBwbGFuZS5wb3NpdGlvbi54ID0gcG9zWzBdXHJcbiAgICAgICAgICAgICAgICBwbGFuZS5wb3NpdGlvbi55ID0gcG9zWzFdICsgbmlja25hbWVPZmZzZXRcclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnogPSBwb3NbMl1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZUVuZW15KGlkLCBwb3MsIHZlbG9jaXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VydmVyLm9uKCdkaXNjb25uZWN0ZWQnLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGAke2lkfS1wbGFuZWApO1xyXG4gICAgICAgIGlmIChzcGggJiYgcGxhbmUpIHtcclxuICAgICAgICAgICAgc3BoLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgcGxhbmUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgd29ybGQucGxheWVyc1tpZF07XHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgbWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5uaWNrbmFtZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3Qgc3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uc3RhcnQnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCB0ZXh0dXJlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0LnRleHR1cmUnKSBhcyBIVE1MU2VsZWN0RWxlbWVudFxyXG5cclxuY29uc3Qgcm9vbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucm9vbXMnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBwb3B1cEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5wb3B1cCcpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnBvcHVwJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgYmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5iYWNrJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb21zID4gLmNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50XHJcblxyXG5jb25zdCBjcmVhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY3JlYXRlJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3Qgcm9vbW5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5yb29tbmFtZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3QgbWFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0Lm1hcCcpIGFzIEhUTUxTZWxlY3RFbGVtZW50XHJcbmNvbnN0IG1heFBsYXllcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5wbGF5ZXJzJykgYXMgSFRNTElucHV0RWxlbWVudFxyXG5cclxuY29uc3QgaW5Sb29tID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluUm9vbScpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGluUm9vbUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pblJvb20gPiAuY29udGFpbmVyJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3Qgc3RhcnRHYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmluaXQtZ2FtZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHBsYXllcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYucGxheWVyc0J0bicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHNldHRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnNldHRpbmdzQnRuJykgYXMgSFRNTERpdkVsZW1lbnRcclxuXHJcbmNvbnN0IGVudGVyR2FtZSA9ICgpID0+IHtcclxuICAgIG1haW4uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICByb29tcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxufVxyXG5cclxuY29uc3Qgb2ZmUG9wdXAgPSAoKSA9PiB7XHJcbiAgICBwb3B1cC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIGJhY2suY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbn1cclxuXHJcbmNvbnN0IGVudGVyUm9vbSA9ICgpID0+IHtcclxuICAgIHJvb21zLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgaW5Sb29tLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG59XHJcblxyXG5zZXJ2ZXIub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnY29ubmVjdGVkJyk7XHJcbiAgICBzZXJ2ZXIuZW1pdCgnZGVidWcnLCBuYXZpZ2F0b3IudXNlckFnZW50KVxyXG4gICAgXHJcbiAgICAvLyBldmVudHNcclxuICAgIG5pY2tuYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIHBvcHVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9mZlBvcHVwKVxyXG4gICAgYmFjay5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb2ZmUG9wdXApXHJcblxyXG4gICAgY29uc3QgbG9hZFBsYXllcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobXlXb3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gbXlXb3JsZC5wbGF5ZXJzW2lkXVxyXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuY2xhc3NMaXN0LmFkZCgncGxheWVyJylcclxuICAgICAgICAgICAgcGxheWVyRGl2LmlubmVyVGV4dCA9IHBsYXllci5uaWNrbmFtZVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuc3R5bGUuY29sb3IgPSBwbGF5ZXIuY29sb3JcclxuICAgICAgICAgICAgaW5Sb29tQ29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXllckRpdilcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvYWRTZXR0aW5ncyA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIHNldC5jbGFzc0xpc3QuYWRkKCdzZXR0aW5ncycpXHJcbiAgICAgICAgc2V0LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyYXZpdHlcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJncmF2aXR5XCI+R3Jhdml0eTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJncmF2aXR5XCIgdmFsdWU9XCIke215V29ybGQuZ3Jhdml0eX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BlZWRcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzcGVlZFwiPlNwZWVkPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgbmFtZT1cInNwZWVkXCIgdmFsdWU9XCIke215V29ybGQuc3BlZWR9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImp1bXBIZWlnaHRcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJqdW1wSGVpZ2h0XCI+SnVtcCBIZWlnaHQ8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBuYW1lPVwianVtcEhlaWdodFwiIHZhbHVlPVwiJHtteVdvcmxkLmp1bXBIZWlnaHR9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImp1bXBDb29sdGltZVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImp1bXBDb29sdGltZVwiPkp1bXAgQ29vbHRpbWU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBuYW1lPVwianVtcENvb2x0aW1lXCIgdmFsdWU9XCIke215V29ybGQuanVtcENvb2x0aW1lfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYW1waW5nXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGFtcGluZ1wiPkRhbXBpbmc8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBuYW1lPVwiZGFtcGluZ1wiIHZhbHVlPVwiJHtteVdvcmxkLmRhbXBpbmd9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RpdHV0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwicmVzdGl0dXRpb25cIj5SZXN0aXR1dGlvbjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJyZXN0aXR1dGlvblwiIHZhbHVlPVwiJHtteVdvcmxkLnJlc3RpdHV0aW9ufVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYFxyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5hcHBlbmQoc2V0KVxyXG4gICAgfVxyXG5cclxuICAgIHNlcnZlci5vbignZ2V0Um9vbXMnLCAod29ybGRzOldvcmxkW10pID0+IHtcclxuICAgICAgICBpZihpblJvb20uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpe1xyXG4gICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgY29uc29sZS5sb2cod29ybGRzKVxyXG4gICAgICAgICAgICB3b3JsZHMuZm9yRWFjaCgod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHdvcmxkLnN0YXR1cyAhPT0gJ3dhaXRpbmcnKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgICAgIHJvb20uY2xhc3NMaXN0LmFkZCgncm9vbScpXHJcbiAgICAgICAgICAgICAgICByb29tLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmFtZVwiPiR7d29ybGQubmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFwXCI+JHt3b3JsZC5tYXB9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBsYXllcnNcIj4ke09iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmxlbmd0aH0vJHt3b3JsZC5tYXhQbGF5ZXJzfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICAgICAgY29uc3Qgam9pbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXHJcbiAgICAgICAgICAgICAgICBqb2luLmNsYXNzTGlzdC5hZGQoJ2pvaW4nKVxyXG4gICAgICAgICAgICAgICAgam9pbi5pbm5lclRleHQgPSAnSm9pbidcclxuICAgICAgICAgICAgICAgIGpvaW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RoID49IHdvcmxkLm1heFBsYXllcnMpIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnam9pblJvb20nLCB3b3JsZC5vd25lcklkLCBuaWNrbmFtZS52YWx1ZSwgdGV4dHVyZS52YWx1ZSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICByb29tLmFwcGVuZENoaWxkKGpvaW4pXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocm9vbSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBteVdvcmxkID0gd29ybGRzLmZpbmQod29ybGQgPT4gd29ybGQub3duZXJJZCA9PT0gbXlXb3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICBpZihteVdvcmxkKXtcclxuICAgICAgICAgICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgICAgICAgICAgbG9hZFBsYXllcnMoKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgcm9vbXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICBteVdvcmxkID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBwbGF5ZXJzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIGxvYWRQbGF5ZXJzKClcclxuICAgIH0pXHJcblxyXG4gICAgc2V0dGluZ3MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgaW5Sb29tQ29udGFpbmVyLmlubmVySFRNTCA9ICcnXHJcbiAgICAgICAgbG9hZFNldHRpbmdzKClcclxuICAgIH0pXHJcblxyXG4gICAgY3JlYXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHNlcnZlci5lbWl0KCdjcmVhdGVSb29tJywgcm9vbW5hbWUudmFsdWUsIG1hcC52YWx1ZSwgTnVtYmVyKG1heFBsYXllcnMudmFsdWUpKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2NyZWF0ZWRSb29tJywgKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2pvaW5Sb29tJywgd29ybGQub3duZXJJZCwgbmlja25hbWUudmFsdWUsIHRleHR1cmUudmFsdWUpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignam9pbmVkUm9vbScsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHdvcmxkKVxyXG4gICAgICAgIG15V29ybGQgPSB3b3JsZFxyXG4gICAgICAgIGVudGVyUm9vbSgpXHJcbiAgICAgICAgaWYoc2VydmVyLmlkID09IHdvcmxkLm93bmVySWQpe1xyXG4gICAgICAgICAgICBzdGFydEdhbWUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgICAgIHN0YXJ0R2FtZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNlcnZlci5lbWl0KCdzdGFydEdhbWUnLCB3b3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignZ2FtZVN0YXJ0ZWQnLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgbXlXb3JsZCA9IHdvcmxkXHJcbiAgICAgICAgaW5pdEdhbWUobXlXb3JsZClcclxuICAgIH0pXHJcbn0pIiwiaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnXHJcblxyXG5leHBvcnQgY29uc3QgY29sb3JzID0ge1xyXG4gICAgcmVkIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDApLFxyXG4gICAgZ3JlZW4gOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMSwgMCksXHJcbiAgICBibHVlIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDEpLFxyXG4gICAgYXF1YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAxKSxcclxuICAgIG1hZ2VudGEgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMSksXHJcbiAgICB5ZWxsb3cgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMCksXHJcbiAgICBibGFjayA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKSxcclxuICAgIHdoaXRlIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWV0YWxNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBNZXRhbFNwaGVyZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ01ldGFsU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgTWV0YWxTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL2JjLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL24uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5zcGVjdWxhclRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYW8uanBnJywgc2NlbmUpXHJcbiAgICByZXR1cm4gTWV0YWxTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEdyYW5pdGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBHcmFuaXRlU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnR3Jhbml0ZVNwaGVyZU1hdCcsIHNjZW5lKTtcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL24ucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9hLnBuZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIEdyYW5pdGVTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNxdWFyZVRpbGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBTcXVhcmVUaWxlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnU3F1YXJlVGlsZU1hdCcsIHNjZW5lKTtcclxuICAgIFNxdWFyZVRpbGVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL2JjLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYW8ucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gU3F1YXJlVGlsZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q29sb3JNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgY29sb3I6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IENvbG9yTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnQ29sb3JNYXQnLCBzY2VuZSk7XHJcbiAgICBDb2xvck1hdC5kaWZmdXNlQ29sb3IgPSBjb2xvcnNbY29sb3JdXHJcbiAgICByZXR1cm4gQ29sb3JNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1hdGVyaWFsID0gKHNjZW5lOkJBQllMT04uU2NlbmUsIG5hbWU6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIHN3aXRjaChuYW1lKXtcclxuICAgICAgICBjYXNlICdtZXRhbCc6IHJldHVybiBnZXRNZXRhbE1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdncmFuaXRlJzogcmV0dXJuIGdldEdyYW5pdGVNYXQoc2NlbmUpXHJcbiAgICAgICAgY2FzZSAnc3F1YXJlX3RpbGUnOiByZXR1cm4gZ2V0U3F1YXJlVGlsZU1hdChzY2VuZSlcclxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gZ2V0Q29sb3JNYXQoc2NlbmUsIG5hbWUpXHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=