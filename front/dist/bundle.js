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
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
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
    const dashPower = world.dashPower;
    const dashCoolTime = world.dashCooltime;
    const nicknameOffset = 1.2;
    let timer = 0;
    // elements initialization
    const jump = document.querySelector('.jump');
    const dash = document.querySelector('.dash');
    jump.classList.remove('hide');
    dash.classList.remove('hide');
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
    let newMeshes = (await BABYLON.SceneLoader.ImportMeshAsync('', 'obj/', 'test1.obj', scene)).meshes;
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
    // dash vars
    const dashDiv = document.querySelector('.dash > div');
    let isDashing = true;
    let dashTimeStamp = 0;
    // loop
    engine.runRenderLoop(() => {
        timer++;
        let dx = (camera.target.x - camera.position.x);
        let dz = (camera.target.z - camera.position.z);
        if (world.players[server.id].life <= 0) {
            const spectateCam = scene.getCameraByName('spectateCam');
            dx = spectateCam.target.x - spectateCam.position.x;
            dz = spectateCam.target.z - spectateCam.position.z;
        }
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
        if (world.players[server.id].life >= 1) {
            if (movingAngle !== null) {
                const x = Math.cos(movingAngle) * speed;
                const z = Math.sin(movingAngle) * speed;
                sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(x, 0, z), sphere.getAbsolutePosition());
            }
            camera.setTarget(sphere.position);
            if (!isJumping && inputKeys.includes(' ')) {
                let vel = sphere.physicsImpostor.getLinearVelocity();
                vel.y = 0;
                sphere.physicsImpostor.setLinearVelocity(vel);
                sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, jumpHeight, 0), sphere.getAbsolutePosition());
                isJumping = true;
                jumpTimeStamp = timer;
            }
            jumpDiv.style.height = `${timer - jumpTimeStamp > jumpCoolTime ? 100 : (timer - jumpTimeStamp) / jumpCoolTime * 100}%`;
            if (isJumping && timer - jumpTimeStamp > jumpCoolTime) {
                isJumping = false;
            }
            if (!isDashing && inputKeys.includes('Shift')) {
                const x = Math.cos(angle) * dashPower;
                const z = Math.sin(angle) * dashPower;
                sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
                sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(x, 0, z), sphere.getAbsolutePosition());
                isDashing = true;
                dashTimeStamp = timer;
            }
            dashDiv.style.height = `${timer - dashTimeStamp > dashCoolTime ? 100 : (timer - dashTimeStamp) / dashCoolTime * 100}%`;
            if (isDashing && timer - dashTimeStamp > dashCoolTime) {
                isDashing = false;
            }
            server.emit('update', [sphere.position.x, sphere.position.y, sphere.position.z], [sphere.physicsImpostor.getLinearVelocity().x, sphere.physicsImpostor.getLinearVelocity().y, sphere.physicsImpostor.getLinearVelocity().z], world.players[server.id].life);
        }
        else {
            const spectateCam = scene.getCameraByName('spectateCam');
            if (movingAngle !== null) {
                const x = Math.cos(movingAngle) * speed;
                const z = Math.sin(movingAngle) * speed;
                spectateCam.position.x += x;
                spectateCam.position.z += z;
            }
            if (inputKeys.includes(' ')) {
                spectateCam.position.y += speed;
            }
            else if (inputKeys.includes('Shift')) {
                spectateCam.position.y -= speed;
            }
        }
        if (isMobile() && movingAngle !== null) {
            movingAngle -= angle;
        }
        if (sphere.position.y < -10 && world.players[server.id].life >= 1) {
            world.players[server.id].life -= 1;
            if (world.players[server.id].life <= 0) {
                server.emit('gameOver', world.ownerId);
                // death && spectate cam
                sphere.dispose();
                jumpDiv.style.height = '0%';
                dashDiv.style.height = '0%';
                const spectateCam = new BABYLON.FreeCamera('spectateCam', new BABYLON.Vector3(0, 10, 0), scene);
                spectateCam.attachControl(canvas, true);
                spectateCam.inertia = isMobile() ? 0.8 : 0.5;
                spectateCam.setTarget(new BABYLON.Vector3(0, 0, 0));
                camera.dispose();
            }
            else {
                sphere.position.x = 0;
                sphere.position.y = 5;
                sphere.position.z = 0;
                sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            }
        }
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
    dash.addEventListener('touchstart', event => {
        inputKeys.push('Shift');
        event.preventDefault();
    });
    dash.addEventListener('touchend', event => {
        inputKeys = inputKeys.filter((key) => key !== 'Shift');
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
    const removePlayer = (id) => {
        const sph = scene.getMeshByName(id);
        const plane = scene.getMeshByName(`${id}-plane`);
        if (sph && plane) {
            sph.dispose();
            plane.dispose();
        }
    };
    server.on('gameOver', (id) => {
        removePlayer(id);
    });
    server.on('disconnected', (id) => {
        removePlayer(id);
        delete world.players[id];
    });
    server.on('ownerChanged', (worldId, newOwnerId) => {
        if (world.ownerId !== worldId)
            return;
        world.ownerId = newOwnerId;
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
        }
        if (e.code === 'KeyL' && e.ctrlKey) {
            e.preventDefault();
            server.emit('log');
        }
    });
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
    const saveRoom = () => {
        myWorld.gravity = Number(document.querySelector('input[name="gravity"]').value);
        myWorld.speed = Number(document.querySelector('input[name="speed"]').value);
        myWorld.jumpHeight = Number(document.querySelector('input[name="jumpHeight"]').value);
        myWorld.jumpCooltime = Number(document.querySelector('input[name="jumpCooltime"]').value);
        myWorld.dashPower = Number(document.querySelector('input[name="dashPower"]').value);
        myWorld.dashCooltime = Number(document.querySelector('input[name="dashCooltime"]').value);
        myWorld.damping = Number(document.querySelector('input[name="damping"]').value);
        myWorld.restitution = Number(document.querySelector('input[name="restitution"]').value);
        myWorld.maxlife = Number(document.querySelector('input[name="maxlife"]').value);
        server.emit('updateRoom', myWorld);
    };
    const loadSettings = () => {
        const set = document.createElement('div');
        set.classList.add('settings');
        set.innerHTML = `
            <div class="gravity">
                <label for="gravity">Gravity</label>
                <input class="room-set" type="number" name="gravity" value="${myWorld.gravity}" step="0.1">
            </div>
            <div class="speed">
                <label for="speed">Speed</label>
                <input class="room-set" type="number" name="speed" value="${myWorld.speed}" step="0.1">
            </div>
            <div class="jumpHeight">
                <label for="jumpHeight">Jump Height</label>
                <input class="room-set" type="number" name="jumpHeight" value="${myWorld.jumpHeight}" step="0.1">
            </div>
            <div class="jumpCooltime">
                <label for="jumpCooltime">Jump Cooltime</label>
                <input class="room-set" type="number" name="jumpCooltime" value="${myWorld.jumpCooltime}" step="0.1">
            </div>
            <div class="dashPower">
                <label for="dashPower">Dash Power</label>
                <input class="room-set" type="number" name="dashPower" value="${myWorld.dashPower}" step="0.1">
            </div>
            <div class="dashCooltime">
                <label for="dashCooltime">Dash Cooltime</label>
                <input class="room-set" type="number" name="dashCooltime" value="${myWorld.dashCooltime}" step="0.1">
            </div>
            <div class="damping">
                <label for="damping">Damping</label>
                <input class="room-set" type="number" name="damping" value="${myWorld.damping}" step="0.1">
            </div>
            <div class="restitution">
                <label for="restitution">Restitution</label>
                <input class="room-set" type="number" name="restitution" value="${myWorld.restitution}" step="0.1">
            </div>
            <div class="maxlife">
                <label for="maxlife">Max Life</label>
                <input class="room-set" type="number" name="maxlife" value="${myWorld.maxlife}" step="0.1">
            </div>
            <button class="save">Save</button>
        `;
        const save = set.querySelector('button.save');
        save.addEventListener('click', saveRoom);
        inRoomContainer.append(set);
    };
    server.on('ownerChanged', (worldId, newOwnerId) => {
        if (myWorld) {
            if (myWorld.ownerId !== worldId)
                return;
            myWorld.ownerId = newOwnerId;
        }
    });
    server.on('getRooms', (worlds) => {
        if (!inRoom.classList.contains('hide')) {
            myWorld = worlds.find(world => world.ownerId === myWorld.ownerId);
            if (myWorld) {
                inRoomContainer.innerHTML = '';
                loadPlayers();
                if (myWorld.ownerId == server.id) {
                    startGame.classList.remove('hide');
                    startGame.addEventListener('click', () => {
                        server.emit('startGame', myWorld.ownerId);
                        inRoom.classList.add('hide');
                    });
                    settings.classList.remove('hide');
                }
            }
            else {
                inRoom.classList.add('hide');
                rooms.classList.remove('hide');
                myWorld = null;
            }
        }
        container.innerHTML = '';
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
        if (myWorld) {
            if (myWorld.ownerId === world.ownerId) {
                inRoom.classList.add('hide');
                myWorld = world;
                initGame(myWorld);
            }
        }
    });
    server.on('log', (logger) => {
        console.log(logger.join('\n'));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUssU0FBUyxDQUFDLENBQUMsT0FBTyx5QkFBYSxFQUFDLEtBQUssQ0FBQztRQUMzQyxLQUFLLGFBQWEsQ0FBQyxDQUFDLE9BQU8sNEJBQWdCLEVBQUMsS0FBSyxDQUFDO1FBQ2xELE9BQU8sQ0FBQyxDQUFDLE9BQU8sdUJBQVcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0tBQzNDO0FBQ0wsQ0FBQztBQVBZLG1CQUFXLGVBT3ZCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnJvbnQvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnJvbnQvLi9zcmMvdGV4dHVyZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW8sIFNvY2tldCB9IGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xyXG5pbXBvcnQgKiBhcyBCQUJZTE9OIGZyb20gJ2JhYnlsb25qcyc7XHJcbmltcG9ydCAqIGFzIEdVSSBmcm9tICdiYWJ5bG9uanMtZ3VpJztcclxuaW1wb3J0IENBTk5PTiBmcm9tICdjYW5ub24nXHJcbmltcG9ydCB7IGdldEdyYW5pdGVNYXQsIGdldE1hdGVyaWFsLCBnZXRNZXRhbE1hdCwgZ2V0U3F1YXJlVGlsZU1hdCB9IGZyb20gJy4vdGV4dHVyZXMnO1xyXG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4vdHlwZXMnXHJcbmltcG9ydCAnYmFieWxvbmpzLWxvYWRlcnMvYmFieWxvbi5vYmpGaWxlTG9hZGVyJ1xyXG5cclxuY29uc3Qgc2VydmVyID0gaW8oJy8nKVxyXG5cclxud2luZG93LkNBTk5PTiA9IENBTk5PTlxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4ge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG59KTtcclxuXHJcbmNvbnN0IGlzTW9iaWxlID0gKCk6Ym9vbGVhbiA9PiB7XHJcbiAgICByZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnQW5kcm9pZCcpIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ2lQaG9uZScpO1xyXG59O1xyXG5cclxubGV0IG15V29ybGQ6V29ybGR8bnVsbCA9IG51bGxcclxuXHJcbmNvbnN0IGluaXRHYW1lID0gYXN5bmMgKHRoaXNXb3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgLy8gdmFyaWFibGVzIGluaXRpYWxpemF0aW9uXHJcbiAgICBsZXQgaW5wdXRLZXlzOnN0cmluZ1tdID0gW11cclxuICAgIGxldCB3b3JsZDpXb3JsZCA9IHRoaXNXb3JsZDtcclxuICAgIGxldCBtb3ZpbmdBbmdsZTpudW1iZXJ8bnVsbCA9IG51bGxcclxuICAgIFxyXG4gICAgY29uc3QgZ2xvYmFsRGFtcGluZyA9IHdvcmxkLmRhbXBpbmc7XHJcbiAgICBjb25zdCBnbG9iYWxSZXN0aXR1dGlvbiA9IHdvcmxkLnJlc3RpdHV0aW9uO1xyXG4gICAgbGV0IGNhbVJhZGlvdXMgPSBpc01vYmlsZSgpID8gaW5uZXJXaWR0aCA+IGlubmVySGVpZ2h0ID8gMTMgOiAyMCA6IDEwO1xyXG4gICAgY29uc3Qgc3BlZWQgPSB3b3JsZC5zcGVlZCowLjI7XHJcbiAgICBjb25zdCBqdW1wSGVpZ2h0ID0gd29ybGQuanVtcEhlaWdodDtcclxuICAgIGNvbnN0IGp1bXBDb29sVGltZSA9IHdvcmxkLmp1bXBDb29sdGltZTtcclxuICAgIGNvbnN0IGRhc2hQb3dlciA9IHdvcmxkLmRhc2hQb3dlclxyXG4gICAgY29uc3QgZGFzaENvb2xUaW1lID0gd29ybGQuZGFzaENvb2x0aW1lXHJcbiAgICBjb25zdCBuaWNrbmFtZU9mZnNldCA9IDEuMjtcclxuICAgIFxyXG4gICAgbGV0IHRpbWVyID0gMDtcclxuXHJcbiAgICAvLyBlbGVtZW50cyBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QganVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qdW1wJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBkYXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRhc2gnKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGp1bXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBkYXNoLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgXHJcbiAgICAvLyBnYW1lIGluaXRpYWxpemF0aW9uXHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVuZGVyQ2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBjb25zdCBlbmdpbmUgPSBuZXcgQkFCWUxPTi5FbmdpbmUoY2FudmFzLCB0cnVlKTtcclxuICAgIGNvbnN0IHNjZW5lID0gbmV3IEJBQllMT04uU2NlbmUoZW5naW5lKTtcclxuICAgIHNjZW5lLmVuYWJsZVBoeXNpY3MobmV3IEJBQllMT04uVmVjdG9yMygwLCB3b3JsZC5ncmF2aXR5KigtOS44MSksIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIFxyXG4gICAgLy8gbXkgc3BoZXJlXHJcbiAgICBjb25zdCBzcGhlcmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgnc3BoZXJlJywge2RpYW1ldGVyOjEsIHNlZ21lbnRzOjE2fSwgc2NlbmUpO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnggPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMF07XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueSA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblsxXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzJdO1xyXG4gICAgc3BoZXJlLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5jb2xvcik7XHJcbiAgICBjb25zdCBzcGhlcmVJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGhlcmUsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yID0gc3BoZXJlSW1wb3N0ZXI7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG5cclxuICAgIC8vIGNhbWVyYVxyXG4gICAgY29uc3QgY2FtZXJhID0gbmV3IEJBQllMT04uQXJjUm90YXRlQ2FtZXJhKCdDYW1lcmEnLCAwLCAwLCAxMCwgc3BoZXJlLnBvc2l0aW9uLCBzY2VuZSk7XHJcbiAgICBjYW1lcmEuYXR0YWNoQ29udHJvbChjYW52YXMsIHRydWUpO1xyXG4gICAgY2FtZXJhLmluZXJ0aWEgPSBpc01vYmlsZSgpID8gMC44IDogMC41O1xyXG4gICAgY2FtZXJhLnVwcGVyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgY2FtZXJhLmxvd2VyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgXHJcbiAgICAvL2ZvZ1xyXG4gICAgc2NlbmUuZm9nTW9kZSA9IEJBQllMT04uU2NlbmUuRk9HTU9ERV9FWFA7XHJcbiAgICBzY2VuZS5mb2dEZW5zaXR5ID0gMC4wMDU7XHJcbiAgICBzY2VuZS5mb2dDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLjksIDAuOSwgMC45KTtcclxuICAgIHNjZW5lLmZvZ1N0YXJ0ID0gMjAuMDtcclxuICAgIHNjZW5lLmZvZ0VuZCA9IDYwLjA7XHJcbiAgICBcclxuICAgIC8vTGlnaHRcclxuICAgIHNjZW5lLmFtYmllbnRDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygxLDEsMSk7XHJcbiAgICB2YXIgbGlnaHQxID0gbmV3IEJBQllMT04uSGVtaXNwaGVyaWNMaWdodChcImxpZ2h0MVwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDEsMSwwKSwgc2NlbmUpO1xyXG4gICAgdmFyIGxpZ2h0MiA9IG5ldyBCQUJZTE9OLlBvaW50TGlnaHQoXCJsaWdodDJcIiwgbmV3IEJBQllMT04uVmVjdG9yMyg2MCw2MCwwKSwgc2NlbmUpO1xyXG4gICAgbGlnaHQxLmludGVuc2l0eSA9IDAuNTtcclxuICAgIGxpZ2h0Mi5pbnRlbnNpdHkgPSAwLjU7XHJcbiAgICBcclxuICAgIC8vIHNoYWRvd1xyXG4gICAgY29uc3Qgc2hhZG93R2VuZXJhdG9yID0gbmV3IEJBQllMT04uU2hhZG93R2VuZXJhdG9yKDEwMjQsIGxpZ2h0Mik7XHJcbiAgICBzaGFkb3dHZW5lcmF0b3IudXNlQ29udGFjdEhhcmRlbmluZ1NoYWRvdyA9IHRydWU7XHJcbiAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaGVyZSk7XHJcbiAgICBcclxuICAgIC8vIG1hcFxyXG4gICAgbGV0IG5ld01lc2hlcyA9IChhd2FpdCBCQUJZTE9OLlNjZW5lTG9hZGVyLkltcG9ydE1lc2hBc3luYygnJywgJ29iai8nLCAndGVzdDEub2JqJywgc2NlbmUpKS5tZXNoZXM7XHJcbiAgICBlbmdpbmUuaGlkZUxvYWRpbmdVSSgpXHJcbiAgICBcclxuICAgIGNvbnN0IG1hcE9mZnNldCA9IFs4LCAzLCAwXVxyXG5cclxuICAgIG5ld01lc2hlcy5mb3JFYWNoKChtZXNoKSA9PiB7XHJcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlbmRlckxpc3QucHVzaChtZXNoKTtcclxuICAgICAgICBtZXNoLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZTtcclxuICAgICAgICBtZXNoLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihtZXNoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5NZXNoSW1wb3N0b3IsIHsgbWFzczogMCwgcmVzdGl0dXRpb246IGdsb2JhbFJlc3RpdHV0aW9uLzUsIGZyaWN0aW9uOjEsIGRhbXBpbmc6Z2xvYmFsRGFtcGluZyB9LCBzY2VuZSk7XHJcbiAgICAgICAgbWVzaC5wb3NpdGlvbi54ICs9IG1hcE9mZnNldFswXTtcclxuICAgICAgICBtZXNoLnBvc2l0aW9uLnkgKz0gbWFwT2Zmc2V0WzFdO1xyXG4gICAgICAgIG1lc2gucG9zaXRpb24ueiArPSBtYXBPZmZzZXRbMl07XHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGp1bXAgdmFyc1xyXG4gICAgY29uc3QganVtcERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qdW1wID4gZGl2JykgYXMgSFRNTERpdkVsZW1lbnRcclxuICAgIGxldCBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgbGV0IGp1bXBUaW1lU3RhbXAgPSAwO1xyXG5cclxuICAgIC8vIGRhc2ggdmFyc1xyXG4gICAgY29uc3QgZGFzaERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kYXNoID4gZGl2JykgYXMgSFRNTERpdkVsZW1lbnRcclxuICAgIGxldCBpc0Rhc2hpbmcgPSB0cnVlO1xyXG4gICAgbGV0IGRhc2hUaW1lU3RhbXAgPSAwO1xyXG5cclxuICAgIC8vIGxvb3BcclxuICAgIGVuZ2luZS5ydW5SZW5kZXJMb29wKCgpID0+IHtcclxuICAgICAgICB0aW1lcisrO1xyXG4gICAgICAgIGxldCBkeCA9IChjYW1lcmEudGFyZ2V0LnggLSBjYW1lcmEucG9zaXRpb24ueClcclxuICAgICAgICBsZXQgZHogPSAoY2FtZXJhLnRhcmdldC56IC0gY2FtZXJhLnBvc2l0aW9uLnopXHJcbiAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPD0gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBzcGVjdGF0ZUNhbSA9IHNjZW5lLmdldENhbWVyYUJ5TmFtZSgnc3BlY3RhdGVDYW0nKSBhcyBCQUJZTE9OLkZyZWVDYW1lcmFcclxuICAgICAgICAgICAgZHggPSBzcGVjdGF0ZUNhbS50YXJnZXQueCAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnhcclxuICAgICAgICAgICAgZHogPSBzcGVjdGF0ZUNhbS50YXJnZXQueiAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnpcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR6LCBkeClcclxuICAgICAgICBpZihpc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlKSBtb3ZpbmdBbmdsZSArPSBhbmdsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSkge21vdmluZ0FuZ2xlID0gYW5nbGU7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEk7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS8yO31cclxuICAgICAgICAgICAgZWxzZSB7bW92aW5nQW5nbGUgPSBudWxsO31cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPj0gMSl7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIDAsIHopLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW1lcmEuc2V0VGFyZ2V0KHNwaGVyZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmKCFpc0p1bXBpbmcgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCcgJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ZWwgPSBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KClcclxuICAgICAgICAgICAgICAgIHZlbC55ID0gMFxyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eSh2ZWwpO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMygwLCBqdW1wSGVpZ2h0LCAwKSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAganVtcFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGp1bXBEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGltZXIgLSBqdW1wVGltZVN0YW1wID4ganVtcENvb2xUaW1lID8gMTAwIDogKHRpbWVyIC0ganVtcFRpbWVTdGFtcCkvanVtcENvb2xUaW1lKjEwMH0lYDtcclxuICAgICAgICAgICAgaWYoaXNKdW1waW5nICYmIHRpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSkge1xyXG4gICAgICAgICAgICAgICAgaXNKdW1waW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIWlzRGFzaGluZyAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ1NoaWZ0JykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBkYXNoUG93ZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBNYXRoLnNpbihhbmdsZSkgKiBkYXNoUG93ZXJcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMygwLDAsMCkpO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMyh4LCAwLCB6KSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBpc0Rhc2hpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZGFzaFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRhc2hEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGltZXIgLSBkYXNoVGltZVN0YW1wID4gZGFzaENvb2xUaW1lID8gMTAwIDogKHRpbWVyIC0gZGFzaFRpbWVTdGFtcCkvZGFzaENvb2xUaW1lKjEwMH0lYDtcclxuICAgICAgICAgICAgaWYoaXNEYXNoaW5nICYmIHRpbWVyIC0gZGFzaFRpbWVTdGFtcCA+IGRhc2hDb29sVGltZSkge1xyXG4gICAgICAgICAgICAgICAgaXNEYXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VydmVyLmVtaXQoJ3VwZGF0ZScsIFtzcGhlcmUucG9zaXRpb24ueCwgc3BoZXJlLnBvc2l0aW9uLnksIHNwaGVyZS5wb3NpdGlvbi56XSwgW3NwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS54LCBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkueSwgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLnpdLCB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgc3BlY3RhdGVDYW0gPSBzY2VuZS5nZXRDYW1lcmFCeU5hbWUoJ3NwZWN0YXRlQ2FtJykgYXMgQkFCWUxPTi5GcmVlQ2FtZXJhXHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5wb3NpdGlvbi54ICs9IHhcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnogKz0gelxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnICcpKXtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnkgKz0gc3BlZWRcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnU2hpZnQnKSkge1xyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0ucG9zaXRpb24ueSAtPSBzcGVlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGlzTW9iaWxlKCkgJiYgbW92aW5nQW5nbGUgIT09IG51bGwpIHttb3ZpbmdBbmdsZSAtPSBhbmdsZTt9XHJcbiAgICAgICAgaWYoc3BoZXJlLnBvc2l0aW9uLnkgPCAtMTAgJiYgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPj0gMSkge1xyXG4gICAgICAgICAgICB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSAtPSAxO1xyXG4gICAgICAgICAgICBpZih3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnZ2FtZU92ZXInLCB3b3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICAgICAgLy8gZGVhdGggJiYgc3BlY3RhdGUgY2FtXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAganVtcERpdi5zdHlsZS5oZWlnaHQgPSAnMCUnO1xyXG4gICAgICAgICAgICAgICAgZGFzaERpdi5zdHlsZS5oZWlnaHQgPSAnMCUnO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY3RhdGVDYW0gPSBuZXcgQkFCWUxPTi5GcmVlQ2FtZXJhKCdzcGVjdGF0ZUNhbScsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMTAsIDApLCBzY2VuZSk7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5pbmVydGlhID0gaXNNb2JpbGUoKSA/IDAuOCA6IDAuNTtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnNldFRhcmdldChuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgICAgICAgIGNhbWVyYS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueSA9IDU7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueiA9IDA7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwwLDApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzY2VuZS5yZW5kZXIoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGlucHV0IGV2ZW50XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICBpZiAoIWlucHV0S2V5cy5pbmNsdWRlcyhlLmtleSkpIHtcclxuICAgICAgICAgICAgaW5wdXRLZXlzLnB1c2goZS5rZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cyA9IGlucHV0S2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSBlLmtleSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gcmVzaXplIGV2ZW50XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgIGVuZ2luZS5yZXNpemUoKVxyXG4gICAgICAgIGNhbVJhZGlvdXMgPSBpc01vYmlsZSgpID8gaW5uZXJXaWR0aCA+IGlubmVySGVpZ2h0ID8gMTMgOiAyMCA6IDEwO1xyXG4gICAgICAgIGNhbWVyYS51cHBlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgICAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gcG9pbnRlciBsb2NrXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgY2FudmFzLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gbW9iaWxlIGNvbnRyb2xcclxuICAgIGNvbnN0IG1vYmlsZUxheW91dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtbGF5b3V0JykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBqb3lzdGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3lzdGljaycpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3Qgam95c3RpY2tCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuam95c3RpY2stYnV0dG9uJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBpZihpc01vYmlsZSgpKSBtb2JpbGVMYXlvdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBsZXQgc3RhcnRQb2ludCA9IFswLDBdXHJcbiAgICBcclxuICAgIGNvbnN0IGdldFRvdWNoZXNYWSA9IChldmVudDpUb3VjaEV2ZW50KTpbbnVtYmVyLCBudW1iZXJdID0+IHtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WFxyXG4gICAgICAgIGxldCB5ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgICAgZm9yKGxldCBpPTE7IGk8ZXZlbnQudG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25kID0gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRYIDwgeFxyXG4gICAgICAgICAgICB4ID0gY29uZCA/IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WCA6IHhcclxuICAgICAgICAgICAgeSA9IGNvbmQgPyBldmVudC50b3VjaGVzW2ldLmNsaWVudFkgOiB5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbeCwgeV1cclxuICAgIH1cclxuICAgIFxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cy5wdXNoKCcgJylcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJyAnKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG5cclxuICAgIGRhc2guYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBpbnB1dEtleXMucHVzaCgnU2hpZnQnKVxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgIH0pXHJcbiAgICBkYXNoLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZXZlbnQgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cyA9IGlucHV0S2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSAnU2hpZnQnKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBjb25zdCBbeCwgeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgam95c3RpY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUubGVmdCA9IGAke3h9cHhgXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudG9wID0gYCR7eX1weGBcclxuICAgICAgICBzdGFydFBvaW50ID0gW3gsIHldXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUubGVmdCA9ICc1MHB4J1xyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLnRvcCA9ICc1MHB4J1xyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gbnVsbDtcclxuICAgIH0pO1xyXG4gICAgbW9iaWxlTGF5b3V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGV2ZW50ID0+IHtcclxuICAgICAgICBsZXQgW2R4LCBkeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgZHggLT0gc3RhcnRQb2ludFswXVxyXG4gICAgICAgIGR5IC09IHN0YXJ0UG9pbnRbMV1cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXHJcbiAgICAgICAgY29uc3QgbWF4RGlzdGFuY2UgPSA1MFxyXG4gICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgY29uc3QgeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKGRpc3RhbmNlLCBtYXhEaXN0YW5jZSlcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS5sZWZ0ID0gYCR7eCs1MH1weGBcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSBgJHt5KzUwfXB4YFxyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gKC1hbmdsZSkgLSBNYXRoLlBJLzI7XHJcbiAgICB9KTtcclxuICAgIG1vYmlsZUxheW91dC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBqb3lzdGljay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC41cydcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gZW5lbXkgY3JlYXRpb25cclxuICAgIGNvbnN0IGNyZWF0ZUVuZW15ID0gKGlkOnN0cmluZywgcG9zOm51bWJlcltdLCB2ZWxvY2l0eTpudW1iZXJbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNwaCA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKGAke2lkfWAsIHtkaWFtZXRlcjoxLCBzZWdtZW50czozMn0sIHNjZW5lKTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueCA9IHBvc1swXTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICBzcGgucG9zaXRpb24ueiA9IHBvc1syXTtcclxuICAgICAgICBjb25zdCBzcGhJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGgsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3RvciA9IHNwaEltcG9zdGVyO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IucGh5c2ljc0JvZHkubGluZWFyRGFtcGluZyA9IGdsb2JhbERhbXBpbmc7XHJcbiAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICBzcGgubWF0ZXJpYWwgPSBnZXRNYXRlcmlhbChzY2VuZSwgd29ybGQucGxheWVyc1tpZF0uY29sb3IpO1xyXG4gICAgICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoKTtcclxuICAgICAgICBjb25zdCBuaWNrID0gd29ybGQucGxheWVyc1tpZF0ubmlja25hbWVcclxuICAgICAgICBjb25zdCBwbGFuZSA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlUGxhbmUoYCR7aWR9LXBsYW5lYCwge3dpZHRoOiBuaWNrLmxlbmd0aCwgaGVpZ2h0OiA1fSwgc2NlbmUpO1xyXG4gICAgICAgIHBsYW5lLmJpbGxib2FyZE1vZGUgPSBCQUJZTE9OLk1lc2guQklMTEJPQVJETU9ERV9BTEw7XHJcbiAgICAgICAgcGxhbmUucG9zaXRpb24ueCA9IHBvc1swXVxyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnogPSBwb3NbMl1cclxuICAgICAgICBjb25zdCBuaWNrVGV4dHVyZSA9IEdVSS5BZHZhbmNlZER5bmFtaWNUZXh0dXJlLkNyZWF0ZUZvck1lc2gocGxhbmUpO1xyXG4gICAgICAgIGNvbnN0IG5pY2tUZXh0ID0gbmV3IEdVSS5UZXh0QmxvY2soKTtcclxuICAgICAgICBuaWNrVGV4dC50ZXh0ID0gbmljaztcclxuICAgICAgICBuaWNrVGV4dC5jb2xvciA9ICd3aGl0ZSc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udFNpemUgPSAxMDA7XHJcbiAgICAgICAgbmlja1RleHQuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgICAgICBuaWNrVGV4dC5mb250RmFtaWx5ID0gJ0FyaWFsJztcclxuICAgICAgICBuaWNrVGV4dHVyZS5hZGRDb250cm9sKG5pY2tUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgLy8gc29ja2V0LmlvXHJcbiAgICBzZXJ2ZXIuZW1pdCgnaW5pdCcsIHdvcmxkLm93bmVySWQpXHJcbiAgICBzZXJ2ZXIub24oJ2luaXQnLCAoZGF0YTogV29ybGQpID0+IHtcclxuICAgICAgICB3b3JsZCA9IGRhdGE7XHJcbiAgICAgICAgT2JqZWN0LmtleXMod29ybGQucGxheWVycykuZm9yRWFjaCgoaWQ6c3RyaW5nLCBpOm51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBpZihpZCA9PT0gc2VydmVyLmlkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHdvcmxkLnBsYXllcnNbaWRdLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICBjb25zdCB2ZWxvY2l0eSA9IHdvcmxkLnBsYXllcnNbaWRdLnZlbG9jaXR5O1xyXG4gICAgICAgICAgICBjcmVhdGVFbmVteShpZCwgcG9zLCB2ZWxvY2l0eSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIHNlcnZlci5vbigndXBkYXRlJywgKGlkOnN0cmluZywgcG9zOm51bWJlcltdLCB2ZWxvY2l0eTpudW1iZXJbXSkgPT4ge1xyXG4gICAgICAgIGlmKHN0YXJ0ZWQgJiYgd29ybGQucGxheWVyc1tpZF0pe1xyXG4gICAgICAgICAgICB3b3JsZC5wbGF5ZXJzW2lkXS5wb3NpdGlvbiA9IHBvcztcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tpZF0udmVsb2NpdHkgPSB2ZWxvY2l0eTtcclxuICAgICAgICAgICAgaWYoaWQgPT09IHNlcnZlci5pZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBzcGggPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGlkKTtcclxuICAgICAgICAgICAgY29uc3QgcGxhbmUgPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGAke2lkfS1wbGFuZWApO1xyXG4gICAgICAgICAgICBpZiAoc3BoICYmIHBsYW5lKSB7XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueCA9IHBvc1swXTtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi55ID0gcG9zWzFdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnogPSBwb3NbMl07XHJcbiAgICAgICAgICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjModmVsb2NpdHlbMF0sIHZlbG9jaXR5WzFdLCB2ZWxvY2l0eVsyXSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueCA9IHBvc1swXVxyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueSA9IHBvc1sxXSArIG5pY2tuYW1lT2Zmc2V0XHJcbiAgICAgICAgICAgICAgICBwbGFuZS5wb3NpdGlvbi56ID0gcG9zWzJdXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGVFbmVteShpZCwgcG9zLCB2ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHJlbW92ZVBsYXllciA9IChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCBzcGggPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGlkKTtcclxuICAgICAgICBjb25zdCBwbGFuZSA9IHNjZW5lLmdldE1lc2hCeU5hbWUoYCR7aWR9LXBsYW5lYCk7XHJcbiAgICAgICAgaWYgKHNwaCAmJiBwbGFuZSkge1xyXG4gICAgICAgICAgICBzcGguZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICBwbGFuZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2VydmVyLm9uKCdnYW1lT3ZlcicsIChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICByZW1vdmVQbGF5ZXIoaWQpO1xyXG4gICAgfSk7XHJcbiAgICBzZXJ2ZXIub24oJ2Rpc2Nvbm5lY3RlZCcsIChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICByZW1vdmVQbGF5ZXIoaWQpO1xyXG4gICAgICAgIGRlbGV0ZSB3b3JsZC5wbGF5ZXJzW2lkXTtcclxuICAgIH0pO1xyXG4gICAgc2VydmVyLm9uKCdvd25lckNoYW5nZWQnLCAod29ybGRJZDpzdHJpbmcsIG5ld093bmVySWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgaWYod29ybGQub3duZXJJZCAhPT0gd29ybGRJZCkgcmV0dXJuO1xyXG4gICAgICAgIHdvcmxkLm93bmVySWQgPSBuZXdPd25lcklkXHJcbiAgICB9KVxyXG59XHJcblxyXG5jb25zdCBtYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBuaWNrbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Lm5pY2tuYW1lJykgYXMgSFRNTElucHV0RWxlbWVudFxyXG5jb25zdCBzdGFydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5zdGFydCcpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHRleHR1cmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QudGV4dHVyZScpIGFzIEhUTUxTZWxlY3RFbGVtZW50XHJcblxyXG5jb25zdCByb29tcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb29tcycpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHBvcHVwQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLnBvcHVwJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYucG9wdXAnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBiYWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LmJhY2snKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucm9vbXMgPiAuY29udGFpbmVyJykgYXMgSFRNTERpdkVsZW1lbnRcclxuXHJcbmNvbnN0IGNyZWF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jcmVhdGUnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCByb29tbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0LnJvb21uYW1lJykgYXMgSFRNTElucHV0RWxlbWVudFxyXG5jb25zdCBtYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QubWFwJykgYXMgSFRNTFNlbGVjdEVsZW1lbnRcclxuY29uc3QgbWF4UGxheWVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0LnBsYXllcnMnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcblxyXG5jb25zdCBpblJvb20gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5Sb29tJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgaW5Sb29tQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluUm9vbSA+IC5jb250YWluZXInKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBzdGFydEdhbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uaW5pdC1nYW1lJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3QgcGxheWVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5wbGF5ZXJzQnRuJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3Qgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuc2V0dGluZ3NCdG4nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5cclxuY29uc3QgZW50ZXJHYW1lID0gKCkgPT4ge1xyXG4gICAgbWFpbi5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIHJvb21zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG59XHJcblxyXG5jb25zdCBvZmZQb3B1cCA9ICgpID0+IHtcclxuICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgYmFjay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxufVxyXG5cclxuY29uc3QgZW50ZXJSb29tID0gKCkgPT4ge1xyXG4gICAgcm9vbXMuY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICBpblJvb20uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbn1cclxuXHJcbnNlcnZlci5vbignY29ubmVjdCcsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQnKTtcclxuICAgIHNlcnZlci5lbWl0KCdkZWJ1ZycsIG5hdmlnYXRvci51c2VyQWdlbnQpXHJcblxyXG4gICAgLy8gZXZlbnRzXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICBpZiAoZS5rZXkgPT09ICdUYWInKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZS5jb2RlID09PSAnS2V5TCcgJiYgZS5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgc2VydmVyLmVtaXQoJ2xvZycpXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgbmlja25hbWUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgaWYoZS5rZXkgPT09ICdFbnRlcicpIHtcclxuICAgICAgICAgICAgZW50ZXJHYW1lKClcclxuICAgICAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgc3RhcnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgZW50ZXJHYW1lKClcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnZ2V0Um9vbXMnKVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgcG9wdXBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgcG9wdXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgYmFjay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIGJhY2suYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb2ZmUG9wdXApXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvZmZQb3B1cClcclxuXHJcbiAgICBjb25zdCBsb2FkUGxheWVycyA9ICgpID0+IHtcclxuICAgICAgICBPYmplY3Qua2V5cyhteVdvcmxkLnBsYXllcnMpLmZvckVhY2goKGlkOnN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBteVdvcmxkLnBsYXllcnNbaWRdXHJcbiAgICAgICAgICAgIGNvbnN0IHBsYXllckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIHBsYXllckRpdi5jbGFzc0xpc3QuYWRkKCdwbGF5ZXInKVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuaW5uZXJUZXh0ID0gcGxheWVyLm5pY2tuYW1lXHJcbiAgICAgICAgICAgIHBsYXllckRpdi5zdHlsZS5jb2xvciA9IHBsYXllci5jb2xvclxyXG4gICAgICAgICAgICBpblJvb21Db250YWluZXIuYXBwZW5kQ2hpbGQocGxheWVyRGl2KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2F2ZVJvb20gPSAoKSA9PiB7XHJcbiAgICAgICAgbXlXb3JsZC5ncmF2aXR5ID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZ3Jhdml0eVwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuc3BlZWQgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJzcGVlZFwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuanVtcEhlaWdodCA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImp1bXBIZWlnaHRcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmp1bXBDb29sdGltZSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImp1bXBDb29sdGltZVwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuZGFzaFBvd2VyID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZGFzaFBvd2VyXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5kYXNoQ29vbHRpbWUgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJkYXNoQ29vbHRpbWVcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmRhbXBpbmcgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJkYW1waW5nXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5yZXN0aXR1dGlvbiA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInJlc3RpdHV0aW9uXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5tYXhsaWZlID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwibWF4bGlmZVwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIHNlcnZlci5lbWl0KCd1cGRhdGVSb29tJywgbXlXb3JsZClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsb2FkU2V0dGluZ3MgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICBzZXQuY2xhc3NMaXN0LmFkZCgnc2V0dGluZ3MnKVxyXG4gICAgICAgIHNldC5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmF2aXR5XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZ3Jhdml0eVwiPkdyYXZpdHk8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImdyYXZpdHlcIiB2YWx1ZT1cIiR7bXlXb3JsZC5ncmF2aXR5fVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzcGVlZFwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInNwZWVkXCI+U3BlZWQ8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cInNwZWVkXCIgdmFsdWU9XCIke215V29ybGQuc3BlZWR9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImp1bXBIZWlnaHRcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJqdW1wSGVpZ2h0XCI+SnVtcCBIZWlnaHQ8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImp1bXBIZWlnaHRcIiB2YWx1ZT1cIiR7bXlXb3JsZC5qdW1wSGVpZ2h0fVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqdW1wQ29vbHRpbWVcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJqdW1wQ29vbHRpbWVcIj5KdW1wIENvb2x0aW1lPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJqdW1wQ29vbHRpbWVcIiB2YWx1ZT1cIiR7bXlXb3JsZC5qdW1wQ29vbHRpbWV9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hQb3dlclwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRhc2hQb3dlclwiPkRhc2ggUG93ZXI8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImRhc2hQb3dlclwiIHZhbHVlPVwiJHtteVdvcmxkLmRhc2hQb3dlcn1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaENvb2x0aW1lXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGFzaENvb2x0aW1lXCI+RGFzaCBDb29sdGltZTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwiZGFzaENvb2x0aW1lXCIgdmFsdWU9XCIke215V29ybGQuZGFzaENvb2x0aW1lfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYW1waW5nXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGFtcGluZ1wiPkRhbXBpbmc8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImRhbXBpbmdcIiB2YWx1ZT1cIiR7bXlXb3JsZC5kYW1waW5nfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZXN0aXR1dGlvblwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInJlc3RpdHV0aW9uXCI+UmVzdGl0dXRpb248L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cInJlc3RpdHV0aW9uXCIgdmFsdWU9XCIke215V29ybGQucmVzdGl0dXRpb259XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1heGxpZmVcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJtYXhsaWZlXCI+TWF4IExpZmU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cIm1heGxpZmVcIiB2YWx1ZT1cIiR7bXlXb3JsZC5tYXhsaWZlfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJzYXZlXCI+U2F2ZTwvYnV0dG9uPlxyXG4gICAgICAgIGBcclxuICAgICAgICBjb25zdCBzYXZlID0gc2V0LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5zYXZlJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuICAgICAgICBzYXZlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZVJvb20pXHJcbiAgICAgICAgaW5Sb29tQ29udGFpbmVyLmFwcGVuZChzZXQpXHJcbiAgICB9XHJcblxyXG4gICAgc2VydmVyLm9uKCdvd25lckNoYW5nZWQnLCAod29ybGRJZDpzdHJpbmcsIG5ld093bmVySWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgaWYobXlXb3JsZCl7XHJcbiAgICAgICAgICAgIGlmKG15V29ybGQub3duZXJJZCAhPT0gd29ybGRJZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBteVdvcmxkLm93bmVySWQgPSBuZXdPd25lcklkXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2dldFJvb21zJywgKHdvcmxkczpXb3JsZFtdKSA9PiB7XHJcbiAgICAgICAgaWYoIWluUm9vbS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGUnKSkge1xyXG4gICAgICAgICAgICBteVdvcmxkID0gd29ybGRzLmZpbmQod29ybGQgPT4gd29ybGQub3duZXJJZCA9PT0gbXlXb3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICBpZihteVdvcmxkKXtcclxuICAgICAgICAgICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgICAgICAgICAgbG9hZFBsYXllcnMoKVxyXG4gICAgICAgICAgICAgICAgaWYobXlXb3JsZC5vd25lcklkID09IHNlcnZlci5pZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRHYW1lLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0R2FtZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyLmVtaXQoJ3N0YXJ0R2FtZScsIG15V29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICByb29tcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIG15V29ybGQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnXHJcbiAgICAgICAgd29ybGRzLmZvckVhY2goKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHdvcmxkLnN0YXR1cyAhPT0gJ3dhaXRpbmcnKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICByb29tLmNsYXNzTGlzdC5hZGQoJ3Jvb20nKVxyXG4gICAgICAgICAgICByb29tLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYW1lXCI+JHt3b3JsZC5uYW1lfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcFwiPiR7d29ybGQubWFwfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBsYXllcnNcIj4ke09iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmxlbmd0aH0vJHt3b3JsZC5tYXhQbGF5ZXJzfTwvZGl2PlxyXG4gICAgICAgICAgICBgXHJcbiAgICAgICAgICAgIGNvbnN0IGpvaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxyXG4gICAgICAgICAgICBqb2luLmNsYXNzTGlzdC5hZGQoJ2pvaW4nKVxyXG4gICAgICAgICAgICBqb2luLmlubmVyVGV4dCA9ICdKb2luJ1xyXG4gICAgICAgICAgICBqb2luLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RoID49IHdvcmxkLm1heFBsYXllcnMpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHNlcnZlci5lbWl0KCdqb2luUm9vbScsIHdvcmxkLm93bmVySWQsIG5pY2tuYW1lLnZhbHVlLCB0ZXh0dXJlLnZhbHVlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByb29tLmFwcGVuZENoaWxkKGpvaW4pXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyb29tKVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHBsYXllcnMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgaW5Sb29tQ29udGFpbmVyLmlubmVySFRNTCA9ICcnXHJcbiAgICAgICAgbG9hZFBsYXllcnMoKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXR0aW5ncy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICBsb2FkU2V0dGluZ3MoKVxyXG4gICAgfSlcclxuXHJcbiAgICBjcmVhdGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2NyZWF0ZVJvb20nLCByb29tbmFtZS52YWx1ZSwgbWFwLnZhbHVlLCBOdW1iZXIobWF4UGxheWVycy52YWx1ZSkpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignY3JlYXRlZFJvb20nLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnam9pblJvb20nLCB3b3JsZC5vd25lcklkLCBuaWNrbmFtZS52YWx1ZSwgdGV4dHVyZS52YWx1ZSlcclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdqb2luZWRSb29tJywgKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgbXlXb3JsZCA9IHdvcmxkXHJcbiAgICAgICAgZW50ZXJSb29tKClcclxuICAgICAgICBpZihzZXJ2ZXIuaWQgPT0gd29ybGQub3duZXJJZCl7XHJcbiAgICAgICAgICAgIHN0YXJ0R2FtZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgc3RhcnRHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VydmVyLmVtaXQoJ3N0YXJ0R2FtZScsIHdvcmxkLm93bmVySWQpXHJcbiAgICAgICAgICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHNldHRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdnYW1lU3RhcnRlZCcsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIGlmKG15V29ybGQpe1xyXG4gICAgICAgICAgICBpZihteVdvcmxkLm93bmVySWQgPT09IHdvcmxkLm93bmVySWQpIHtcclxuICAgICAgICAgICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIG15V29ybGQgPSB3b3JsZFxyXG4gICAgICAgICAgICAgICAgaW5pdEdhbWUobXlXb3JsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdsb2cnLCAobG9nZ2VyOnN0cmluZ1tdKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2cobG9nZ2VyLmpvaW4oJ1xcbicpKVxyXG4gICAgfSlcclxufSkiLCJpbXBvcnQgKiBhcyBCQUJZTE9OIGZyb20gJ2JhYnlsb25qcydcclxuXHJcbmV4cG9ydCBjb25zdCBjb2xvcnMgPSB7XHJcbiAgICByZWQgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMCksXHJcbiAgICBncmVlbiA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAwKSxcclxuICAgIGJsdWUgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMSksXHJcbiAgICBhcXVhIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDEsIDEpLFxyXG4gICAgbWFnZW50YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygxLCAwLCAxKSxcclxuICAgIHllbGxvdyA6IG5ldyBCQUJZTE9OLkNvbG9yMygxLCAxLCAwKSxcclxuICAgIGJsYWNrIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApLFxyXG4gICAgd2hpdGUgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMSksXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRNZXRhbE1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IE1ldGFsU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnTWV0YWxTcGhlcmVNYXQnLCBzY2VuZSk7XHJcbiAgICBNZXRhbFNwaGVyZU1hdC5kaWZmdXNlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYmMuanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvbi5qcGcnLCBzY2VuZSlcclxuICAgIE1ldGFsU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvbS5qcGcnLCBzY2VuZSlcclxuICAgIE1ldGFsU3BoZXJlTWF0LnNwZWN1bGFyVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvbS5qcGcnLCBzY2VuZSlcclxuICAgIE1ldGFsU3BoZXJlTWF0LmFtYmllbnRUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9tZXRhbC9hby5qcGcnLCBzY2VuZSlcclxuICAgIHJldHVybiBNZXRhbFNwaGVyZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0R3Jhbml0ZU1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IEdyYW5pdGVTcGhlcmVNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdHcmFuaXRlU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5kaWZmdXNlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9iYy5wbmcnLCBzY2VuZSlcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL3IucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmFtYmllbnRUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL2EucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gR3Jhbml0ZVNwaGVyZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0U3F1YXJlVGlsZU1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IFNxdWFyZVRpbGVNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdTcXVhcmVUaWxlTWF0Jywgc2NlbmUpO1xyXG4gICAgU3F1YXJlVGlsZU1hdC5kaWZmdXNlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBTcXVhcmVUaWxlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9uLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL3IucG5nJywgc2NlbmUpXHJcbiAgICBTcXVhcmVUaWxlTWF0LmFtYmllbnRUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9hby5wbmcnLCBzY2VuZSlcclxuICAgIHJldHVybiBTcXVhcmVUaWxlTWF0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRDb2xvck1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lLCBjb2xvcjpzdHJpbmcpOkJBQllMT04uTWF0ZXJpYWwgPT4ge1xyXG4gICAgY29uc3QgQ29sb3JNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdDb2xvck1hdCcsIHNjZW5lKTtcclxuICAgIENvbG9yTWF0LmRpZmZ1c2VDb2xvciA9IGNvbG9yc1tjb2xvcl1cclxuICAgIHJldHVybiBDb2xvck1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWF0ZXJpYWwgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgbmFtZTpzdHJpbmcpOkJBQllMT04uTWF0ZXJpYWwgPT4ge1xyXG4gICAgc3dpdGNoKG5hbWUpe1xyXG4gICAgICAgIGNhc2UgJ21ldGFsJzogcmV0dXJuIGdldE1ldGFsTWF0KHNjZW5lKVxyXG4gICAgICAgIGNhc2UgJ2dyYW5pdGUnOiByZXR1cm4gZ2V0R3Jhbml0ZU1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdzcXVhcmVfdGlsZSc6IHJldHVybiBnZXRTcXVhcmVUaWxlTWF0KHNjZW5lKVxyXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBnZXRDb2xvck1hdChzY2VuZSwgbmFtZSlcclxuICAgIH1cclxufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==