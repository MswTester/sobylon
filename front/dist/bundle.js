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
            if (!spectateCam)
                return;
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
            settings.classList.remove('hide');
        }
    });
    startGame.addEventListener('click', () => {
        if (!myWorld)
            return;
        server.emit('startGame', myWorld.ownerId);
        inRoom.classList.add('hide');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxDQUFDLE9BQU8sdUJBQVcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0tBQzNDO0FBQ0wsQ0FBQztBQVBZLG1CQUFXLGVBT3ZCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnJvbnQvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnJvbnQvLi9zcmMvdGV4dHVyZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW8sIFNvY2tldCB9IGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xyXG5pbXBvcnQgKiBhcyBCQUJZTE9OIGZyb20gJ2JhYnlsb25qcyc7XHJcbmltcG9ydCAqIGFzIEdVSSBmcm9tICdiYWJ5bG9uanMtZ3VpJztcclxuaW1wb3J0IENBTk5PTiBmcm9tICdjYW5ub24nXHJcbmltcG9ydCB7IGdldEdyYW5pdGVNYXQsIGdldE1hdGVyaWFsLCBnZXRNZXRhbE1hdCwgZ2V0U3F1YXJlVGlsZU1hdCB9IGZyb20gJy4vdGV4dHVyZXMnO1xyXG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4vdHlwZXMnXHJcbmltcG9ydCAnYmFieWxvbmpzLWxvYWRlcnMvYmFieWxvbi5vYmpGaWxlTG9hZGVyJ1xyXG5cclxuY29uc3Qgc2VydmVyID0gaW8oJy8nKVxyXG5cclxud2luZG93LkNBTk5PTiA9IENBTk5PTlxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4ge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG59KTtcclxuXHJcbmNvbnN0IGlzTW9iaWxlID0gKCk6Ym9vbGVhbiA9PiB7XHJcbiAgICByZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnQW5kcm9pZCcpIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ2lQaG9uZScpO1xyXG59O1xyXG5cclxubGV0IG15V29ybGQ6V29ybGR8bnVsbCA9IG51bGxcclxuXHJcbmNvbnN0IGluaXRHYW1lID0gYXN5bmMgKHRoaXNXb3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgLy8gdmFyaWFibGVzIGluaXRpYWxpemF0aW9uXHJcbiAgICBsZXQgaW5wdXRLZXlzOnN0cmluZ1tdID0gW11cclxuICAgIGxldCB3b3JsZDpXb3JsZCA9IHRoaXNXb3JsZDtcclxuICAgIGxldCBtb3ZpbmdBbmdsZTpudW1iZXJ8bnVsbCA9IG51bGxcclxuICAgIFxyXG4gICAgY29uc3QgZ2xvYmFsRGFtcGluZyA9IHdvcmxkLmRhbXBpbmc7XHJcbiAgICBjb25zdCBnbG9iYWxSZXN0aXR1dGlvbiA9IHdvcmxkLnJlc3RpdHV0aW9uO1xyXG4gICAgbGV0IGNhbVJhZGlvdXMgPSBpc01vYmlsZSgpID8gaW5uZXJXaWR0aCA+IGlubmVySGVpZ2h0ID8gMTMgOiAyMCA6IDEwO1xyXG4gICAgY29uc3Qgc3BlZWQgPSB3b3JsZC5zcGVlZCowLjI7XHJcbiAgICBjb25zdCBqdW1wSGVpZ2h0ID0gd29ybGQuanVtcEhlaWdodDtcclxuICAgIGNvbnN0IGp1bXBDb29sVGltZSA9IHdvcmxkLmp1bXBDb29sdGltZTtcclxuICAgIGNvbnN0IGRhc2hQb3dlciA9IHdvcmxkLmRhc2hQb3dlclxyXG4gICAgY29uc3QgZGFzaENvb2xUaW1lID0gd29ybGQuZGFzaENvb2x0aW1lXHJcbiAgICBjb25zdCBuaWNrbmFtZU9mZnNldCA9IDEuMjtcclxuICAgIFxyXG4gICAgbGV0IHRpbWVyID0gMDtcclxuXHJcbiAgICAvLyBlbGVtZW50cyBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QganVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qdW1wJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBkYXNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRhc2gnKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGp1bXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBkYXNoLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgXHJcbiAgICAvLyBnYW1lIGluaXRpYWxpemF0aW9uXHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVuZGVyQ2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBjb25zdCBlbmdpbmUgPSBuZXcgQkFCWUxPTi5FbmdpbmUoY2FudmFzLCB0cnVlKTtcclxuICAgIGNvbnN0IHNjZW5lID0gbmV3IEJBQllMT04uU2NlbmUoZW5naW5lKTtcclxuICAgIHNjZW5lLmVuYWJsZVBoeXNpY3MobmV3IEJBQllMT04uVmVjdG9yMygwLCB3b3JsZC5ncmF2aXR5KigtOS44MSksIDApLCBuZXcgQkFCWUxPTi5DYW5ub25KU1BsdWdpbigpKTtcclxuICAgIFxyXG4gICAgLy8gbXkgc3BoZXJlXHJcbiAgICBjb25zdCBzcGhlcmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSgnc3BoZXJlJywge2RpYW1ldGVyOjEsIHNlZ21lbnRzOjE2fSwgc2NlbmUpO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnggPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMF07XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueSA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblsxXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi56ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzJdO1xyXG4gICAgc3BoZXJlLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5jb2xvcik7XHJcbiAgICBjb25zdCBzcGhlcmVJbXBvc3RlciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihzcGhlcmUsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLlNwaGVyZUltcG9zdG9yLCB7IG1hc3M6IDEsIHJlc3RpdHV0aW9uOiBnbG9iYWxSZXN0aXR1dGlvbiwgZnJpY3Rpb246MSB9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yID0gc3BoZXJlSW1wb3N0ZXI7XHJcbiAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG5cclxuICAgIC8vIGNhbWVyYVxyXG4gICAgY29uc3QgY2FtZXJhID0gbmV3IEJBQllMT04uQXJjUm90YXRlQ2FtZXJhKCdDYW1lcmEnLCAwLCAwLCAxMCwgc3BoZXJlLnBvc2l0aW9uLCBzY2VuZSk7XHJcbiAgICBjYW1lcmEuYXR0YWNoQ29udHJvbChjYW52YXMsIHRydWUpO1xyXG4gICAgY2FtZXJhLmluZXJ0aWEgPSBpc01vYmlsZSgpID8gMC44IDogMC41O1xyXG4gICAgY2FtZXJhLnVwcGVyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgY2FtZXJhLmxvd2VyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgXHJcbiAgICAvL2ZvZ1xyXG4gICAgc2NlbmUuZm9nTW9kZSA9IEJBQllMT04uU2NlbmUuRk9HTU9ERV9FWFA7XHJcbiAgICBzY2VuZS5mb2dEZW5zaXR5ID0gMC4wMDU7XHJcbiAgICBzY2VuZS5mb2dDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLjksIDAuOSwgMC45KTtcclxuICAgIHNjZW5lLmZvZ1N0YXJ0ID0gMjAuMDtcclxuICAgIHNjZW5lLmZvZ0VuZCA9IDYwLjA7XHJcbiAgICBcclxuICAgIC8vTGlnaHRcclxuICAgIHNjZW5lLmFtYmllbnRDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygxLDEsMSk7XHJcbiAgICB2YXIgbGlnaHQxID0gbmV3IEJBQllMT04uSGVtaXNwaGVyaWNMaWdodChcImxpZ2h0MVwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDEsMSwwKSwgc2NlbmUpO1xyXG4gICAgdmFyIGxpZ2h0MiA9IG5ldyBCQUJZTE9OLlBvaW50TGlnaHQoXCJsaWdodDJcIiwgbmV3IEJBQllMT04uVmVjdG9yMyg2MCw2MCwwKSwgc2NlbmUpO1xyXG4gICAgbGlnaHQxLmludGVuc2l0eSA9IDAuNTtcclxuICAgIGxpZ2h0Mi5pbnRlbnNpdHkgPSAwLjU7XHJcbiAgICBcclxuICAgIC8vIHNoYWRvd1xyXG4gICAgY29uc3Qgc2hhZG93R2VuZXJhdG9yID0gbmV3IEJBQllMT04uU2hhZG93R2VuZXJhdG9yKDEwMjQsIGxpZ2h0Mik7XHJcbiAgICBzaGFkb3dHZW5lcmF0b3IudXNlQ29udGFjdEhhcmRlbmluZ1NoYWRvdyA9IHRydWU7XHJcbiAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaGVyZSk7XHJcbiAgICBcclxuICAgIC8vIG1hcFxyXG4gICAgbGV0IG5ld01lc2hlcyA9IChhd2FpdCBCQUJZTE9OLlNjZW5lTG9hZGVyLkltcG9ydE1lc2hBc3luYygnJywgJ29iai8nLCAndGVzdDEub2JqJywgc2NlbmUpKS5tZXNoZXM7XHJcbiAgICBlbmdpbmUuaGlkZUxvYWRpbmdVSSgpXHJcbiAgICBcclxuICAgIGNvbnN0IG1hcE9mZnNldCA9IFs4LCAzLCAwXVxyXG5cclxuICAgIG5ld01lc2hlcy5mb3JFYWNoKChtZXNoKSA9PiB7XHJcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlbmRlckxpc3QucHVzaChtZXNoKTtcclxuICAgICAgICBtZXNoLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZTtcclxuICAgICAgICBtZXNoLnBoeXNpY3NJbXBvc3RvciA9IG5ldyBCQUJZTE9OLlBoeXNpY3NJbXBvc3RvcihtZXNoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5NZXNoSW1wb3N0b3IsIHsgbWFzczogMCwgcmVzdGl0dXRpb246IGdsb2JhbFJlc3RpdHV0aW9uLzUsIGZyaWN0aW9uOjEsIGRhbXBpbmc6Z2xvYmFsRGFtcGluZyB9LCBzY2VuZSk7XHJcbiAgICAgICAgbWVzaC5wb3NpdGlvbi54ICs9IG1hcE9mZnNldFswXTtcclxuICAgICAgICBtZXNoLnBvc2l0aW9uLnkgKz0gbWFwT2Zmc2V0WzFdO1xyXG4gICAgICAgIG1lc2gucG9zaXRpb24ueiArPSBtYXBPZmZzZXRbMl07XHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGp1bXAgdmFyc1xyXG4gICAgY29uc3QganVtcERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qdW1wID4gZGl2JykgYXMgSFRNTERpdkVsZW1lbnRcclxuICAgIGxldCBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgbGV0IGp1bXBUaW1lU3RhbXAgPSAwO1xyXG5cclxuICAgIC8vIGRhc2ggdmFyc1xyXG4gICAgY29uc3QgZGFzaERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kYXNoID4gZGl2JykgYXMgSFRNTERpdkVsZW1lbnRcclxuICAgIGxldCBpc0Rhc2hpbmcgPSB0cnVlO1xyXG4gICAgbGV0IGRhc2hUaW1lU3RhbXAgPSAwO1xyXG5cclxuICAgIC8vIGxvb3BcclxuICAgIGVuZ2luZS5ydW5SZW5kZXJMb29wKCgpID0+IHtcclxuICAgICAgICB0aW1lcisrO1xyXG4gICAgICAgIGxldCBkeCA9IChjYW1lcmEudGFyZ2V0LnggLSBjYW1lcmEucG9zaXRpb24ueClcclxuICAgICAgICBsZXQgZHogPSAoY2FtZXJhLnRhcmdldC56IC0gY2FtZXJhLnBvc2l0aW9uLnopXHJcbiAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPD0gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBzcGVjdGF0ZUNhbSA9IHNjZW5lLmdldENhbWVyYUJ5TmFtZSgnc3BlY3RhdGVDYW0nKSBhcyBCQUJZTE9OLkZyZWVDYW1lcmFcclxuICAgICAgICAgICAgaWYoIXNwZWN0YXRlQ2FtKSByZXR1cm47XHJcbiAgICAgICAgICAgIGR4ID0gc3BlY3RhdGVDYW0udGFyZ2V0LnggLSBzcGVjdGF0ZUNhbS5wb3NpdGlvbi54XHJcbiAgICAgICAgICAgIGR6ID0gc3BlY3RhdGVDYW0udGFyZ2V0LnogLSBzcGVjdGF0ZUNhbS5wb3NpdGlvbi56XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeiwgZHgpXHJcbiAgICAgICAgaWYoaXNNb2JpbGUoKSkge1xyXG4gICAgICAgICAgICBpZihtb3ZpbmdBbmdsZSkgbW92aW5nQW5nbGUgKz0gYW5nbGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdhJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlICsgTWF0aC5QSS80O31cclxuICAgICAgICAgICAgZWxzZSBpZiAoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS80O31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQgKiAzO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQgKiAzO31cclxuICAgICAgICAgICAgZWxzZSBpZiAoaW5wdXRLZXlzLmluY2x1ZGVzKCd3JykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3MnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJO31cclxuICAgICAgICAgICAgZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzI7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2Uge21vdmluZ0FuZ2xlID0gbnVsbDt9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5saWZlID49IDEpe1xyXG4gICAgICAgICAgICBpZihtb3ZpbmdBbmdsZSAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5jb3MobW92aW5nQW5nbGUpICogc3BlZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBNYXRoLnNpbihtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMyh4LCAwLCB6KSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FtZXJhLnNldFRhcmdldChzcGhlcmUucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBpZighaXNKdW1waW5nICYmIGlucHV0S2V5cy5pbmNsdWRlcygnICcpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmVsID0gc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpXHJcbiAgICAgICAgICAgICAgICB2ZWwueSA9IDBcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkodmVsKTtcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuYXBwbHlJbXB1bHNlKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwganVtcEhlaWdodCwgMCksIHNwaGVyZS5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgaXNKdW1waW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGp1bXBUaW1lU3RhbXAgPSB0aW1lcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBqdW1wRGl2LnN0eWxlLmhlaWdodCA9IGAke3RpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSA/IDEwMCA6ICh0aW1lciAtIGp1bXBUaW1lU3RhbXApL2p1bXBDb29sVGltZSoxMDB9JWA7XHJcbiAgICAgICAgICAgIGlmKGlzSnVtcGluZyAmJiB0aW1lciAtIGp1bXBUaW1lU3RhbXAgPiBqdW1wQ29vbFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIGlzSnVtcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKCFpc0Rhc2hpbmcgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdTaGlmdCcpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5jb3MoYW5nbGUpICogZGFzaFBvd2VyXHJcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gTWF0aC5zaW4oYW5nbGUpICogZGFzaFBvd2VyXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwwLDApKTtcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuYXBwbHlJbXB1bHNlKG5ldyBCQUJZTE9OLlZlY3RvcjMoeCwgMCwgeiksIHNwaGVyZS5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgaXNEYXNoaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGRhc2hUaW1lU3RhbXAgPSB0aW1lcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkYXNoRGl2LnN0eWxlLmhlaWdodCA9IGAke3RpbWVyIC0gZGFzaFRpbWVTdGFtcCA+IGRhc2hDb29sVGltZSA/IDEwMCA6ICh0aW1lciAtIGRhc2hUaW1lU3RhbXApL2Rhc2hDb29sVGltZSoxMDB9JWA7XHJcbiAgICAgICAgICAgIGlmKGlzRGFzaGluZyAmJiB0aW1lciAtIGRhc2hUaW1lU3RhbXAgPiBkYXNoQ29vbFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIGlzRGFzaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCd1cGRhdGUnLCBbc3BoZXJlLnBvc2l0aW9uLngsIHNwaGVyZS5wb3NpdGlvbi55LCBzcGhlcmUucG9zaXRpb24uel0sIFtzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkueCwgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLnksIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS56XSwgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNwZWN0YXRlQ2FtID0gc2NlbmUuZ2V0Q2FtZXJhQnlOYW1lKCdzcGVjdGF0ZUNhbScpIGFzIEJBQllMT04uRnJlZUNhbWVyYVxyXG4gICAgICAgICAgICBpZihtb3ZpbmdBbmdsZSAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5jb3MobW92aW5nQW5nbGUpICogc3BlZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBNYXRoLnNpbihtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0ucG9zaXRpb24ueCArPSB4XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5wb3NpdGlvbi56ICs9IHpcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihpbnB1dEtleXMuaW5jbHVkZXMoJyAnKSl7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5wb3NpdGlvbi55ICs9IHNwZWVkXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ1NoaWZ0JykpIHtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnkgLT0gc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihpc01vYmlsZSgpICYmIG1vdmluZ0FuZ2xlICE9PSBudWxsKSB7bW92aW5nQW5nbGUgLT0gYW5nbGU7fVxyXG4gICAgICAgIGlmKHNwaGVyZS5wb3NpdGlvbi55IDwgLTEwICYmIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5saWZlID49IDEpIHtcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgLT0gMTtcclxuICAgICAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VydmVyLmVtaXQoJ2dhbWVPdmVyJywgd29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgICAgIC8vIGRlYXRoICYmIHNwZWN0YXRlIGNhbVxyXG4gICAgICAgICAgICAgICAgc3BoZXJlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIGp1bXBEaXYuc3R5bGUuaGVpZ2h0ID0gJzAlJztcclxuICAgICAgICAgICAgICAgIGRhc2hEaXYuc3R5bGUuaGVpZ2h0ID0gJzAlJztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwZWN0YXRlQ2FtID0gbmV3IEJBQllMT04uRnJlZUNhbWVyYSgnc3BlY3RhdGVDYW0nLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDEwLCAwKSwgc2NlbmUpO1xyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0uYXR0YWNoQ29udHJvbChjYW52YXMsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0uaW5lcnRpYSA9IGlzTW9iaWxlKCkgPyAwLjggOiAwLjU7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5zZXRUYXJnZXQobmV3IEJBQllMT04uVmVjdG9yMygwLCAwLCAwKSk7XHJcbiAgICAgICAgICAgICAgICBjYW1lcmEuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnggPSAwO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnkgPSA1O1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnogPSAwO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKDAsMCwwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc2NlbmUucmVuZGVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBpbnB1dCBldmVudFxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKCFpbnB1dEtleXMuaW5jbHVkZXMoZS5rZXkpKSB7XHJcbiAgICAgICAgICAgIGlucHV0S2V5cy5wdXNoKGUua2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gZS5rZXkpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIHJlc2l6ZSBldmVudFxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICBlbmdpbmUucmVzaXplKClcclxuICAgICAgICBjYW1SYWRpb3VzID0gaXNNb2JpbGUoKSA/IGlubmVyV2lkdGggPiBpbm5lckhlaWdodCA/IDEzIDogMjAgOiAxMDtcclxuICAgICAgICBjYW1lcmEudXBwZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICAgICAgY2FtZXJhLmxvd2VyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIHBvaW50ZXIgbG9ja1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY2FudmFzLnJlcXVlc3RQb2ludGVyTG9jaygpO1xyXG4gICAgICAgIGNhbnZhcy5mb2N1cygpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIG1vYmlsZSBjb250cm9sXHJcbiAgICBjb25zdCBtb2JpbGVMYXlvdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubW9iaWxlLWxheW91dCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3Qgam95c3RpY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuam95c3RpY2snKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGNvbnN0IGpveXN0aWNrQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpveXN0aWNrLWJ1dHRvbicpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgaWYoaXNNb2JpbGUoKSkgbW9iaWxlTGF5b3V0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgbGV0IHN0YXJ0UG9pbnQgPSBbMCwwXVxyXG4gICAgXHJcbiAgICBjb25zdCBnZXRUb3VjaGVzWFkgPSAoZXZlbnQ6VG91Y2hFdmVudCk6W251bWJlciwgbnVtYmVyXSA9PiB7XHJcbiAgICAgICAgbGV0IHggPSBldmVudC50b3VjaGVzWzBdLmNsaWVudFhcclxuICAgICAgICBsZXQgeSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICAgIGZvcihsZXQgaT0xOyBpPGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY29uZCA9IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WCA8IHhcclxuICAgICAgICAgICAgeCA9IGNvbmQgPyBldmVudC50b3VjaGVzW2ldLmNsaWVudFggOiB4XHJcbiAgICAgICAgICAgIHkgPSBjb25kID8gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRZIDogeVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3gsIHldXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGp1bXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBpbnB1dEtleXMucHVzaCgnICcpXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfSlcclxuICAgIGp1bXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICcgJyk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfSlcclxuXHJcbiAgICBkYXNoLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzLnB1c2goJ1NoaWZ0JylcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9KVxyXG4gICAgZGFzaC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGV2ZW50ID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ1NoaWZ0Jyk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgbW9iaWxlTGF5b3V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgW3gsIHldID0gZ2V0VG91Y2hlc1hZKGV2ZW50KVxyXG4gICAgICAgIGpveXN0aWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLmxlZnQgPSBgJHt4fXB4YFxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRvcCA9IGAke3l9cHhgXHJcbiAgICAgICAgc3RhcnRQb2ludCA9IFt4LCB5XVxyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLmxlZnQgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIG1vYmlsZUxheW91dC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBldmVudCA9PiB7XHJcbiAgICAgICAgbGV0IFtkeCwgZHldID0gZ2V0VG91Y2hlc1hZKGV2ZW50KVxyXG4gICAgICAgIGR4IC09IHN0YXJ0UG9pbnRbMF1cclxuICAgICAgICBkeSAtPSBzdGFydFBvaW50WzFdXHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcclxuICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxyXG4gICAgICAgIGNvbnN0IG1heERpc3RhbmNlID0gNTBcclxuICAgICAgICBjb25zdCB4ID0gTWF0aC5jb3MoYW5nbGUpICogTWF0aC5taW4oZGlzdGFuY2UsIG1heERpc3RhbmNlKVxyXG4gICAgICAgIGNvbnN0IHkgPSBNYXRoLnNpbihhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUubGVmdCA9IGAke3grNTB9cHhgXHJcbiAgICAgICAgam95c3RpY2tCdXR0b24uc3R5bGUudG9wID0gYCR7eSs1MH1weGBcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9ICgtYW5nbGUpIC0gTWF0aC5QSS8yO1xyXG4gICAgfSk7XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBldmVudCA9PiB7XHJcbiAgICAgICAgam95c3RpY2suY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuNXMnXHJcbiAgICAgICAgbW92aW5nQW5nbGUgPSBudWxsO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIGVuZW15IGNyZWF0aW9uXHJcbiAgICBjb25zdCBjcmVhdGVFbmVteSA9IChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBjb25zdCBzcGggPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZShgJHtpZH1gLCB7ZGlhbWV0ZXI6MSwgc2VnbWVudHM6MzJ9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnkgPSBwb3NbMV07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnogPSBwb3NbMl07XHJcbiAgICAgICAgY29uc3Qgc3BoSW1wb3N0ZXIgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3Ioc3BoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3RvciwgeyBtYXNzOiAxLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24sIGZyaWN0aW9uOjEgfSwgc2NlbmUpO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IgPSBzcGhJbXBvc3RlcjtcclxuICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMyh2ZWxvY2l0eVswXSwgdmVsb2NpdHlbMV0sIHZlbG9jaXR5WzJdKSk7XHJcbiAgICAgICAgc3BoLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbaWRdLmNvbG9yKTtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaCk7XHJcbiAgICAgICAgY29uc3QgbmljayA9IHdvcmxkLnBsYXllcnNbaWRdLm5pY2tuYW1lXHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKGAke2lkfS1wbGFuZWAsIHt3aWR0aDogbmljay5sZW5ndGgsIGhlaWdodDogNX0sIHNjZW5lKTtcclxuICAgICAgICBwbGFuZS5iaWxsYm9hcmRNb2RlID0gQkFCWUxPTi5NZXNoLkJJTExCT0FSRE1PREVfQUxMO1xyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi55ID0gcG9zWzFdICsgbmlja25hbWVPZmZzZXRcclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi56ID0gcG9zWzJdXHJcbiAgICAgICAgY29uc3Qgbmlja1RleHR1cmUgPSBHVUkuQWR2YW5jZWREeW5hbWljVGV4dHVyZS5DcmVhdGVGb3JNZXNoKHBsYW5lKTtcclxuICAgICAgICBjb25zdCBuaWNrVGV4dCA9IG5ldyBHVUkuVGV4dEJsb2NrKCk7XHJcbiAgICAgICAgbmlja1RleHQudGV4dCA9IG5pY2s7XHJcbiAgICAgICAgbmlja1RleHQuY29sb3IgPSAnd2hpdGUnO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRTaXplID0gMTAwO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udEZhbWlseSA9ICdBcmlhbCc7XHJcbiAgICAgICAgbmlja1RleHR1cmUuYWRkQ29udHJvbChuaWNrVGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vIHNvY2tldC5pb1xyXG4gICAgc2VydmVyLmVtaXQoJ2luaXQnLCB3b3JsZC5vd25lcklkKVxyXG4gICAgc2VydmVyLm9uKCdpbml0JywgKGRhdGE6IFdvcmxkKSA9PiB7XHJcbiAgICAgICAgd29ybGQgPSBkYXRhO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmZvckVhY2goKGlkOnN0cmluZywgaTpudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgaWYoaWQgPT09IHNlcnZlci5pZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB3b3JsZC5wbGF5ZXJzW2lkXS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgY29uc3QgdmVsb2NpdHkgPSB3b3JsZC5wbGF5ZXJzW2lkXS52ZWxvY2l0eTtcclxuICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBzZXJ2ZXIub24oJ3VwZGF0ZScsIChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBpZihzdGFydGVkICYmIHdvcmxkLnBsYXllcnNbaWRdKXtcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tpZF0ucG9zaXRpb24gPSBwb3M7XHJcbiAgICAgICAgICAgIHdvcmxkLnBsYXllcnNbaWRdLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGlmKGlkID09PSBzZXJ2ZXIuaWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBsYW5lID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShgJHtpZH0tcGxhbmVgKTtcclxuICAgICAgICAgICAgaWYgKHNwaCAmJiBwbGFuZSkge1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi56ID0gcG9zWzJdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueiA9IHBvc1syXVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCByZW1vdmVQbGF5ZXIgPSAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGAke2lkfS1wbGFuZWApO1xyXG4gICAgICAgIGlmIChzcGggJiYgcGxhbmUpIHtcclxuICAgICAgICAgICAgc3BoLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgcGxhbmUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNlcnZlci5vbignZ2FtZU92ZXInLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgIH0pO1xyXG4gICAgc2VydmVyLm9uKCdkaXNjb25uZWN0ZWQnLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgICAgICBkZWxldGUgd29ybGQucGxheWVyc1tpZF07XHJcbiAgICB9KTtcclxuICAgIHNlcnZlci5vbignb3duZXJDaGFuZ2VkJywgKHdvcmxkSWQ6c3RyaW5nLCBuZXdPd25lcklkOnN0cmluZykgPT4ge1xyXG4gICAgICAgIGlmKHdvcmxkLm93bmVySWQgIT09IHdvcmxkSWQpIHJldHVybjtcclxuICAgICAgICB3b3JsZC5vd25lcklkID0gbmV3T3duZXJJZFxyXG4gICAgfSlcclxufVxyXG5cclxuY29uc3QgbWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3Qgbmlja25hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5uaWNrbmFtZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3Qgc3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uc3RhcnQnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCB0ZXh0dXJlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0LnRleHR1cmUnKSBhcyBIVE1MU2VsZWN0RWxlbWVudFxyXG5cclxuY29uc3Qgcm9vbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucm9vbXMnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBwb3B1cEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5wb3B1cCcpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnBvcHVwJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgYmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5iYWNrJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb21zID4gLmNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50XHJcblxyXG5jb25zdCBjcmVhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY3JlYXRlJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3Qgcm9vbW5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5yb29tbmFtZScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuY29uc3QgbWFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0Lm1hcCcpIGFzIEhUTUxTZWxlY3RFbGVtZW50XHJcbmNvbnN0IG1heFBsYXllcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dC5wbGF5ZXJzJykgYXMgSFRNTElucHV0RWxlbWVudFxyXG5cclxuY29uc3QgaW5Sb29tID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmluUm9vbScpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGluUm9vbUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pblJvb20gPiAuY29udGFpbmVyJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3Qgc3RhcnRHYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmluaXQtZ2FtZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHBsYXllcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYucGxheWVyc0J0bicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHNldHRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnNldHRpbmdzQnRuJykgYXMgSFRNTERpdkVsZW1lbnRcclxuXHJcbmNvbnN0IGVudGVyR2FtZSA9ICgpID0+IHtcclxuICAgIG1haW4uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICByb29tcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxufVxyXG5cclxuY29uc3Qgb2ZmUG9wdXAgPSAoKSA9PiB7XHJcbiAgICBwb3B1cC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIGJhY2suY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbn1cclxuXHJcbmNvbnN0IGVudGVyUm9vbSA9ICgpID0+IHtcclxuICAgIHJvb21zLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgaW5Sb29tLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG59XHJcblxyXG5zZXJ2ZXIub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnY29ubmVjdGVkJyk7XHJcbiAgICBzZXJ2ZXIuZW1pdCgnZGVidWcnLCBuYXZpZ2F0b3IudXNlckFnZW50KVxyXG5cclxuICAgIC8vIGV2ZW50c1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKGUua2V5ID09PSAnVGFiJykge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGUuY29kZSA9PT0gJ0tleUwnICYmIGUuY3RybEtleSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdsb2cnKVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG5pY2tuYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIHBvcHVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9mZlBvcHVwKVxyXG4gICAgYmFjay5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb2ZmUG9wdXApXHJcblxyXG4gICAgY29uc3QgbG9hZFBsYXllcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobXlXb3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gbXlXb3JsZC5wbGF5ZXJzW2lkXVxyXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuY2xhc3NMaXN0LmFkZCgncGxheWVyJylcclxuICAgICAgICAgICAgcGxheWVyRGl2LmlubmVyVGV4dCA9IHBsYXllci5uaWNrbmFtZVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuc3R5bGUuY29sb3IgPSBwbGF5ZXIuY29sb3JcclxuICAgICAgICAgICAgaW5Sb29tQ29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXllckRpdilcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNhdmVSb29tID0gKCkgPT4ge1xyXG4gICAgICAgIG15V29ybGQuZ3Jhdml0eSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdyYXZpdHlcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLnNwZWVkID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwic3BlZWRcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmp1bXBIZWlnaHQgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJqdW1wSGVpZ2h0XCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5qdW1wQ29vbHRpbWUgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJqdW1wQ29vbHRpbWVcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmRhc2hQb3dlciA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImRhc2hQb3dlclwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuZGFzaENvb2x0aW1lID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZGFzaENvb2x0aW1lXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5kYW1waW5nID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZGFtcGluZ1wiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQucmVzdGl0dXRpb24gPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJyZXN0aXR1dGlvblwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQubWF4bGlmZSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cIm1heGxpZmVcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgndXBkYXRlUm9vbScsIG15V29ybGQpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9hZFNldHRpbmdzID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgc2V0LmNsYXNzTGlzdC5hZGQoJ3NldHRpbmdzJylcclxuICAgICAgICBzZXQuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3Jhdml0eVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImdyYXZpdHlcIj5HcmF2aXR5PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJncmF2aXR5XCIgdmFsdWU9XCIke215V29ybGQuZ3Jhdml0eX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BlZWRcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzcGVlZFwiPlNwZWVkPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJzcGVlZFwiIHZhbHVlPVwiJHtteVdvcmxkLnNwZWVkfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqdW1wSGVpZ2h0XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwianVtcEhlaWdodFwiPkp1bXAgSGVpZ2h0PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJqdW1wSGVpZ2h0XCIgdmFsdWU9XCIke215V29ybGQuanVtcEhlaWdodH1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVtcENvb2x0aW1lXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwianVtcENvb2x0aW1lXCI+SnVtcCBDb29sdGltZTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwianVtcENvb2x0aW1lXCIgdmFsdWU9XCIke215V29ybGQuanVtcENvb2x0aW1lfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoUG93ZXJcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJkYXNoUG93ZXJcIj5EYXNoIFBvd2VyPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJkYXNoUG93ZXJcIiB2YWx1ZT1cIiR7bXlXb3JsZC5kYXNoUG93ZXJ9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hDb29sdGltZVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRhc2hDb29sdGltZVwiPkRhc2ggQ29vbHRpbWU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImRhc2hDb29sdGltZVwiIHZhbHVlPVwiJHtteVdvcmxkLmRhc2hDb29sdGltZX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFtcGluZ1wiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRhbXBpbmdcIj5EYW1waW5nPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJkYW1waW5nXCIgdmFsdWU9XCIke215V29ybGQuZGFtcGluZ31cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdGl0dXRpb25cIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJyZXN0aXR1dGlvblwiPlJlc3RpdHV0aW9uPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJyZXN0aXR1dGlvblwiIHZhbHVlPVwiJHtteVdvcmxkLnJlc3RpdHV0aW9ufVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXhsaWZlXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibWF4bGlmZVwiPk1heCBMaWZlPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJtYXhsaWZlXCIgdmFsdWU9XCIke215V29ybGQubWF4bGlmZX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic2F2ZVwiPlNhdmU8L2J1dHRvbj5cclxuICAgICAgICBgXHJcbiAgICAgICAgY29uc3Qgc2F2ZSA9IHNldC5xdWVyeVNlbGVjdG9yKCdidXR0b24uc2F2ZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbiAgICAgICAgc2F2ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVSb29tKVxyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5hcHBlbmQoc2V0KVxyXG4gICAgfVxyXG5cclxuICAgIHNlcnZlci5vbignb3duZXJDaGFuZ2VkJywgKHdvcmxkSWQ6c3RyaW5nLCBuZXdPd25lcklkOnN0cmluZykgPT4ge1xyXG4gICAgICAgIGlmKG15V29ybGQpe1xyXG4gICAgICAgICAgICBpZihteVdvcmxkLm93bmVySWQgIT09IHdvcmxkSWQpIHJldHVybjtcclxuICAgICAgICAgICAgbXlXb3JsZC5vd25lcklkID0gbmV3T3duZXJJZFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdnZXRSb29tcycsICh3b3JsZHM6V29ybGRbXSkgPT4ge1xyXG4gICAgICAgIGlmKCFpblJvb20uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpIHtcclxuICAgICAgICAgICAgbXlXb3JsZCA9IHdvcmxkcy5maW5kKHdvcmxkID0+IHdvcmxkLm93bmVySWQgPT09IG15V29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgaWYobXlXb3JsZCl7XHJcbiAgICAgICAgICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgICAgIGxvYWRQbGF5ZXJzKClcclxuICAgICAgICAgICAgICAgIGlmKG15V29ybGQub3duZXJJZCA9PSBzZXJ2ZXIuaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0R2FtZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIHJvb21zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgbXlXb3JsZCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICB3b3JsZHMuZm9yRWFjaCgod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICAgICAgaWYod29ybGQuc3RhdHVzICE9PSAnd2FpdGluZycpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIHJvb20uY2xhc3NMaXN0LmFkZCgncm9vbScpXHJcbiAgICAgICAgICAgIHJvb20uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hbWVcIj4ke3dvcmxkLm5hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFwXCI+JHt3b3JsZC5tYXB9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGxheWVyc1wiPiR7T2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RofS8ke3dvcmxkLm1heFBsYXllcnN9PC9kaXY+XHJcbiAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgY29uc3Qgam9pbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXHJcbiAgICAgICAgICAgIGpvaW4uY2xhc3NMaXN0LmFkZCgnam9pbicpXHJcbiAgICAgICAgICAgIGpvaW4uaW5uZXJUZXh0ID0gJ0pvaW4nXHJcbiAgICAgICAgICAgIGpvaW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZihPYmplY3Qua2V5cyh3b3JsZC5wbGF5ZXJzKS5sZW5ndGggPj0gd29ybGQubWF4UGxheWVycykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgc2VydmVyLmVtaXQoJ2pvaW5Sb29tJywgd29ybGQub3duZXJJZCwgbmlja25hbWUudmFsdWUsIHRleHR1cmUudmFsdWUpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJvb20uYXBwZW5kQ2hpbGQoam9pbilcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJvb20pXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcblxyXG4gICAgcGxheWVycy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICBsb2FkUGxheWVycygpXHJcbiAgICB9KVxyXG5cclxuICAgIHNldHRpbmdzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIGxvYWRTZXR0aW5ncygpXHJcbiAgICB9KVxyXG5cclxuICAgIGNyZWF0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnY3JlYXRlUm9vbScsIHJvb21uYW1lLnZhbHVlLCBtYXAudmFsdWUsIE51bWJlcihtYXhQbGF5ZXJzLnZhbHVlKSlcclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdjcmVhdGVkUm9vbScsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIHNlcnZlci5lbWl0KCdqb2luUm9vbScsIHdvcmxkLm93bmVySWQsIG5pY2tuYW1lLnZhbHVlLCB0ZXh0dXJlLnZhbHVlKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2pvaW5lZFJvb20nLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICBlbnRlclJvb20oKVxyXG4gICAgICAgIGlmKHNlcnZlci5pZCA9PSB3b3JsZC5vd25lcklkKXtcclxuICAgICAgICAgICAgc3RhcnRHYW1lLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgc3RhcnRHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGlmKCFteVdvcmxkKSByZXR1cm47XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ3N0YXJ0R2FtZScsIG15V29ybGQub3duZXJJZClcclxuICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignZ2FtZVN0YXJ0ZWQnLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBpZihteVdvcmxkKXtcclxuICAgICAgICAgICAgaWYobXlXb3JsZC5vd25lcklkID09PSB3b3JsZC5vd25lcklkKSB7XHJcbiAgICAgICAgICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICAgICAgICAgIGluaXRHYW1lKG15V29ybGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignbG9nJywgKGxvZ2dlcjpzdHJpbmdbXSkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGxvZ2dlci5qb2luKCdcXG4nKSlcclxuICAgIH0pXHJcbn0pIiwiaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnXHJcblxyXG5leHBvcnQgY29uc3QgY29sb3JzID0ge1xyXG4gICAgcmVkIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDApLFxyXG4gICAgZ3JlZW4gOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMSwgMCksXHJcbiAgICBibHVlIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDEpLFxyXG4gICAgYXF1YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAxKSxcclxuICAgIG1hZ2VudGEgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMSksXHJcbiAgICB5ZWxsb3cgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMCksXHJcbiAgICBibGFjayA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKSxcclxuICAgIHdoaXRlIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWV0YWxNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBNZXRhbFNwaGVyZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ01ldGFsU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgTWV0YWxTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL2JjLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL24uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5zcGVjdWxhclRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYW8uanBnJywgc2NlbmUpXHJcbiAgICByZXR1cm4gTWV0YWxTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEdyYW5pdGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBHcmFuaXRlU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnR3Jhbml0ZVNwaGVyZU1hdCcsIHNjZW5lKTtcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL24ucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9hLnBuZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIEdyYW5pdGVTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNxdWFyZVRpbGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBTcXVhcmVUaWxlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnU3F1YXJlVGlsZU1hdCcsIHNjZW5lKTtcclxuICAgIFNxdWFyZVRpbGVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL2JjLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYW8ucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gU3F1YXJlVGlsZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q29sb3JNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgY29sb3I6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IENvbG9yTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnQ29sb3JNYXQnLCBzY2VuZSk7XHJcbiAgICBDb2xvck1hdC5kaWZmdXNlQ29sb3IgPSBjb2xvcnNbY29sb3JdXHJcbiAgICByZXR1cm4gQ29sb3JNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1hdGVyaWFsID0gKHNjZW5lOkJBQllMT04uU2NlbmUsIG5hbWU6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIHN3aXRjaChuYW1lKXtcclxuICAgICAgICBjYXNlICdtZXRhbCc6IHJldHVybiBnZXRNZXRhbE1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdncmFuaXRlJzogcmV0dXJuIGdldEdyYW5pdGVNYXQoc2NlbmUpXHJcbiAgICAgICAgY2FzZSAnc3F1YXJlX3RpbGUnOiByZXR1cm4gZ2V0U3F1YXJlVGlsZU1hdChzY2VuZSlcclxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gZ2V0Q29sb3JNYXQoc2NlbmUsIG5hbWUpXHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=