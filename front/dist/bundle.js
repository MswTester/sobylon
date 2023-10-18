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
    let newMeshes = (await BABYLON.SceneLoader.ImportMeshAsync('', 'obj/', `${world.map}.obj`, scene)).meshes;
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
    const keydown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            document.exitPointerLock();
        }
        if (!inputKeys.includes(e.key)) {
            inputKeys.push(e.key);
        }
    };
    const keyup = (e) => {
        inputKeys = inputKeys.filter((key) => key !== e.key);
    };
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    // resize event
    const resize = () => {
        engine.resize();
        camRadious = isMobile() ? innerWidth > innerHeight ? 13 : 20 : 10;
        camera.upperRadiusLimit = camRadious;
        camera.lowerRadiusLimit = camRadious;
    };
    window.addEventListener('resize', resize);
    // pointer lock
    const pointerlockchange = () => {
        canvas.requestPointerLock();
        canvas.focus();
    };
    document.addEventListener('click', pointerlockchange);
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
    const jump_touchstart = (event) => {
        inputKeys.push(' ');
        event.preventDefault();
    };
    jump.addEventListener('touchstart', jump_touchstart);
    const jump_touchend = (event) => {
        inputKeys = inputKeys.filter((key) => key !== ' ');
        event.preventDefault();
    };
    jump.addEventListener('touchend', jump_touchend);
    const dash_touchstart = (event) => {
        inputKeys.push('Shift');
        event.preventDefault();
    };
    dash.addEventListener('touchstart', dash_touchstart);
    const dash_touchend = (event) => {
        inputKeys = inputKeys.filter((key) => key !== 'Shift');
        event.preventDefault();
    };
    dash.addEventListener('touchend', dash_touchend);
    const joystick_touchstart = (event) => {
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
    };
    mobileLayout.addEventListener('touchstart', joystick_touchstart);
    const joystick_touchmove = (event) => {
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
    };
    mobileLayout.addEventListener('touchmove', joystick_touchmove);
    const joystick_touchend = (event) => {
        joystick.classList.add('hide');
        joystick.style.transition = 'opacity 0.5s';
        movingAngle = null;
    };
    mobileLayout.addEventListener('touchend', joystick_touchend);
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
    server.on('gameEnd', (winnerId) => {
        const winner = world.players[winnerId];
        const winnerDiv = document.createElement('div');
        winnerDiv.classList.add('winner');
        winnerDiv.innerText = `${winner.nickname} Win!`;
        document.body.appendChild(winnerDiv);
        engine.stopRenderLoop();
        document.exitPointerLock();
        server.off('update');
        server.off('gameOver');
        server.off('disconnected');
        server.off('gameEnd');
        server.off('init');
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
        window.removeEventListener('resize', resize);
        document.removeEventListener('click', pointerlockchange);
        mobileLayout.removeEventListener('touchstart', joystick_touchstart);
        mobileLayout.removeEventListener('touchmove', joystick_touchmove);
        mobileLayout.removeEventListener('touchend', joystick_touchend);
        jump.removeEventListener('touchstart', jump_touchstart);
        jump.removeEventListener('touchend', jump_touchend);
        dash.removeEventListener('touchstart', dash_touchstart);
        dash.removeEventListener('touchend', dash_touchend);
        setTimeout(() => {
            winnerDiv.remove();
            canvas.classList.add('hide');
            jump.classList.add('hide');
            dash.classList.add('hide');
            inRoom.classList.remove('hide');
            engine.dispose();
            server.emit('getRooms');
        }, 3000);
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
        if (e.code === 'KeyL' && e.ctrlKey && "development" == 'development') {
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
                server.emit('joinRoom', world.ownerId, nickname.value, texture.value);
            });
            if (Object.keys(world.players).length < world.maxPlayers)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2SEFBOEM7QUFDOUMsMEdBQXFDO0FBQ3JDLGtIQUFxQztBQUNyQyw2R0FBMkI7QUFDM0IsOEVBQXVGO0FBRXZGLGdJQUFnRDtBQUVoRCxNQUFNLE1BQU0sR0FBRyx5QkFBRSxFQUFDLEdBQUcsQ0FBQztBQUV0QixNQUFNLENBQUMsTUFBTSxHQUFHLGdCQUFNO0FBRXRCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUMzQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLFFBQVEsR0FBRyxHQUFXLEVBQUU7SUFDMUIsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3RixDQUFDLENBQUM7QUFFRixJQUFJLE9BQU8sR0FBYyxJQUFJO0FBRTdCLE1BQU0sUUFBUSxHQUFHLEtBQUssRUFBRSxTQUFlLEVBQUUsRUFBRTtJQUN2QywyQkFBMkI7SUFDM0IsSUFBSSxTQUFTLEdBQVksRUFBRTtJQUMzQixJQUFJLEtBQUssR0FBUyxTQUFTLENBQUM7SUFDNUIsSUFBSSxXQUFXLEdBQWUsSUFBSTtJQUVsQyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQ3BDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUM1QyxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN0RSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFDLEdBQUcsQ0FBQztJQUM5QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO0lBQ3BDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDeEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVM7SUFDakMsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVk7SUFDdkMsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0lBRTNCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVkLDBCQUEwQjtJQUMxQixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBbUIsQ0FBQztJQUMvRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBbUIsQ0FBQztJQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBRTdCLHNCQUFzQjtJQUN0QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBc0IsQ0FBQztJQUM1RSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFFcEcsWUFBWTtJQUNaLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUUsUUFBUSxFQUFDLEVBQUUsRUFBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVGLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sQ0FBQyxRQUFRLEdBQUcsMEJBQVcsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckUsTUFBTSxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuSyxNQUFNLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztJQUN4QyxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBRWpFLFNBQVM7SUFDVCxNQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdkYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkMsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDeEMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztJQUNyQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO0lBRXJDLEtBQUs7SUFDTCxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBQzFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbkQsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDdEIsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFFcEIsT0FBTztJQUNQLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZGLElBQUksTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkYsTUFBTSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFDdkIsTUFBTSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFFdkIsU0FBUztJQUNULE1BQU0sZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEUsZUFBZSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztJQUNqRCxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV2RCxNQUFNO0lBQ04sSUFBSSxTQUFTLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDMUcsTUFBTSxDQUFDLGFBQWEsRUFBRTtJQUV0QixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTNCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN2QixlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsR0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBRSxPQUFPLEVBQUMsYUFBYSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEwsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDO0lBRUYsWUFBWTtJQUNaLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFtQjtJQUN2RSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDckIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBRXRCLFlBQVk7SUFDWixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBbUI7SUFDdkUsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztJQUV0QixPQUFPO0lBQ1AsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7UUFDdEIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUMsSUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO1lBQ25DLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUF1QjtZQUM5RSxJQUFHLENBQUMsV0FBVztnQkFBRSxPQUFPO1lBQ3hCLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsRUFBRSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNyRDtRQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNoQyxJQUFHLFFBQVEsRUFBRSxFQUFFO1lBQ1gsSUFBRyxXQUFXO2dCQUFFLFdBQVcsSUFBSSxLQUFLLENBQUM7U0FDeEM7YUFBTTtZQUNILElBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7YUFBQztpQkFDcEYsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQzthQUFDO2lCQUMxRixJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBQyxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUFDO2lCQUM3RixJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBQyxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUFDO2lCQUM3RixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQzthQUFDO2lCQUNuRCxJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQUMsV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO2FBQUM7aUJBQzVELElBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBQyxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO2FBQUM7aUJBQzlELElBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBQyxXQUFXLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO2FBQUM7aUJBQzlEO2dCQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7YUFBQztTQUM3QjtRQUNELElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBQztZQUNsQyxJQUFHLFdBQVcsS0FBSyxJQUFJLEVBQUM7Z0JBQ3BCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSztnQkFDdkMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxLQUFLO2dCQUN2QyxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2FBQ25HO1lBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEMsSUFBRyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFO2dCQUNwRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ1QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztnQkFDekcsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDakIsYUFBYSxHQUFHLEtBQUssQ0FBQzthQUN6QjtZQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLGFBQWEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEdBQUMsWUFBWSxHQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ25ILElBQUcsU0FBUyxJQUFJLEtBQUssR0FBRyxhQUFhLEdBQUcsWUFBWSxFQUFFO2dCQUNsRCxTQUFTLEdBQUcsS0FBSyxDQUFDO2FBQ3JCO1lBQ0QsSUFBRyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVM7Z0JBQ3JDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUztnQkFDckMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRSxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixhQUFhLEdBQUcsS0FBSyxDQUFDO2FBQ3pCO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxLQUFLLEdBQUcsYUFBYSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsR0FBQyxZQUFZLEdBQUMsR0FBRyxHQUFHLENBQUM7WUFDbkgsSUFBRyxTQUFTLElBQUksS0FBSyxHQUFHLGFBQWEsR0FBRyxZQUFZLEVBQUU7Z0JBQ2xELFNBQVMsR0FBRyxLQUFLLENBQUM7YUFDckI7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9QO2FBQU07WUFDSCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBdUI7WUFDOUUsSUFBRyxXQUFXLEtBQUssSUFBSSxFQUFDO2dCQUNwQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEtBQUs7Z0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSztnQkFDdkMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDM0IsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQzthQUM5QjtZQUNELElBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBQztnQkFDdkIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksS0FBSzthQUNsQztpQkFBTSxJQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25DLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEtBQUs7YUFDbEM7U0FDSjtRQUNELElBQUcsUUFBUSxFQUFFLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtZQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7U0FBQztRQUM5RCxJQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUU7WUFDOUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUNuQyxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUU7Z0JBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUM7Z0JBQ3RDLHdCQUF3QjtnQkFDeEIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDNUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDaEcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUM3QyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNwQjtpQkFBTTtnQkFDSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEU7U0FDSjtRQUNELEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNuQixDQUFDLENBQUMsQ0FBQztJQUVILGNBQWM7SUFDZCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQWUsRUFBRSxFQUFFO1FBQ2hDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUM5QjtRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM1QixTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjtJQUNMLENBQUM7SUFDRCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQWUsRUFBRSxFQUFFO1FBQzlCLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFDRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFMUMsZUFBZTtJQUNmLE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtRQUNoQixNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2YsVUFBVSxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2xFLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7UUFDckMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztJQUN6QyxDQUFDO0lBQ0QsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUUxQyxlQUFlO0lBQ2YsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7UUFDM0IsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDNUIsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFDRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFFdEQsaUJBQWlCO0lBQ2pCLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQW1CLENBQUM7SUFDaEYsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQW1CLENBQUM7SUFDdkUsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBbUIsQ0FBQztJQUNwRixJQUFHLFFBQVEsRUFBRTtRQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNwRCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFFdEIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxLQUFnQixFQUFtQixFQUFFO1FBQ3ZELElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNoQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDaEMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7WUFDekMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUM7UUFDRCxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBTSxlQUFlLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7UUFDekMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbkIsS0FBSyxDQUFDLGNBQWMsRUFBRTtJQUMxQixDQUFDO0lBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxlQUFlLENBQUM7SUFDcEQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7UUFDdkMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsY0FBYyxFQUFFO0lBQzFCLENBQUM7SUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQztJQUVoRCxNQUFNLGVBQWUsR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtRQUN6QyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2QixLQUFLLENBQUMsY0FBYyxFQUFFO0lBQzFCLENBQUM7SUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQztJQUNwRCxNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtRQUN2QyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxjQUFjLEVBQUU7SUFDMUIsQ0FBQztJQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDO0lBRWhELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxLQUFnQixFQUFFLEVBQUU7UUFDN0MsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ2xDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSTtRQUM5QixRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSTtRQUM3QixVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU07UUFDbEMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTTtRQUNqQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNO1FBQ2xDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLHVCQUF1QjtRQUNsRCxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDakUsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtRQUM1QyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFDbEMsRUFBRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbkIsRUFBRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUMsRUFBRSxHQUFHLEVBQUUsR0FBQyxFQUFFLENBQUM7UUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sV0FBVyxHQUFHLEVBQUU7UUFDdEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7UUFDM0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7UUFDM0QsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUMsRUFBRSxJQUFJO1FBQ3ZDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFDLEVBQUUsSUFBSTtRQUN0QyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDL0QsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLEtBQWdCLEVBQUUsRUFBRTtRQUMzQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDOUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsY0FBYztRQUMxQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFFN0QsaUJBQWlCO0lBQ2pCLE1BQU0sV0FBVyxHQUFHLENBQUMsRUFBUyxFQUFFLEdBQVksRUFBRSxRQUFpQixFQUFFLEVBQUU7UUFDL0QsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUUsUUFBUSxFQUFDLEVBQUUsRUFBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hGLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0osR0FBRyxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUM7UUFDbEMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUM5RCxHQUFHLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEcsR0FBRyxDQUFDLFFBQVEsR0FBRywwQkFBVyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNELGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUTtRQUN2QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JHLEtBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUNyRCxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjO1FBQzFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRSxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNyQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixRQUFRLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztRQUN6QixRQUFRLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUN4QixRQUFRLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUM3QixRQUFRLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztRQUM5QixXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDcEIsWUFBWTtJQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDbEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFXLEVBQUUsRUFBRTtRQUM5QixLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBUyxFQUFFLENBQVEsRUFBRSxFQUFFO1lBQ3ZELElBQUcsRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUFFO2dCQUFFLE9BQU87WUFDNUIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDdkMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDNUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFTLEVBQUUsR0FBWSxFQUFFLFFBQWlCLEVBQUUsRUFBRTtRQUMvRCxJQUFHLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFDO1lBQzVCLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNqQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDdEMsSUFBRyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUU7Z0JBQUUsT0FBTztZQUM1QixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2pELElBQUksR0FBRyxJQUFJLEtBQUssRUFBRTtnQkFDZCxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixHQUFHLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjO2dCQUMxQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzVCO2lCQUFNO2dCQUNILFdBQVcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sWUFBWSxHQUFHLENBQUMsRUFBUyxFQUFFLEVBQUU7UUFDL0IsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUU7WUFDZCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDbkI7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFTLEVBQUUsRUFBRTtRQUNoQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQVMsRUFBRSxFQUFFO1FBQ3BDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQWUsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1FBQy9DLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxTQUFTLENBQUMsU0FBUyxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsT0FBTztRQUMvQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7UUFDcEMsTUFBTSxDQUFDLGNBQWMsRUFBRTtRQUN2QixRQUFRLENBQUMsZUFBZSxFQUFFO1FBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ2xCLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakQsUUFBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUN6RCxZQUFZLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDcEUsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xFLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQztRQUN2RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQztRQUNuRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQztRQUN2RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQztRQUNuRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNsQixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUMxQixNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDL0IsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDLEVBQUUsSUFBSSxDQUFDO0lBQ1osQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUVELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFtQjtBQUM5RCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFxQjtBQUM3RSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBc0I7QUFDekUsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBc0I7QUFFN0UsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQW1CO0FBQ2hFLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFzQjtBQUM1RSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBbUI7QUFDbkUsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQW1CO0FBQ2pFLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQW1CO0FBRWpGLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFzQjtBQUMzRSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFxQjtBQUM3RSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBc0I7QUFDckUsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQXFCO0FBRTlFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFtQjtBQUNsRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFtQjtBQUN4RixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFzQjtBQUNqRixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFtQjtBQUMxRSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFtQjtBQUU1RSxNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7SUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQzFCLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNsQyxDQUFDO0FBRUQsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO0lBQ2xCLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFBRTtJQUNuQixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDM0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7SUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDO0lBRXpDLFNBQVM7SUFDVCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDdkMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEtBQUssRUFBRTtZQUNqQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDdEI7UUFDRCxJQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksYUFBb0IsSUFBSSxhQUFhLEVBQUU7WUFDeEUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ3JCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDdkMsSUFBRyxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTtZQUNsQixTQUFTLEVBQUU7WUFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUMxQjtJQUNMLENBQUMsQ0FBQztJQUNGLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLFNBQVMsRUFBRTtRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUMsQ0FBQztJQUVGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDakMsQ0FBQyxDQUFDO0lBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7SUFDNUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFN0MsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFO1FBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQVMsRUFBRSxFQUFFO1lBQy9DLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBQy9DLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxTQUFTLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRO1lBQ3JDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO1lBQ3BDLGVBQWUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBQzFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRCxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7UUFDbEIsT0FBTyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDckcsT0FBTyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDakcsT0FBTyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDM0csT0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyw0QkFBNEIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDL0csT0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDekcsT0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyw0QkFBNEIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDL0csT0FBTyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDckcsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDN0csT0FBTyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDckcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUU7UUFDdEIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDekMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxTQUFTLEdBQUc7Ozs4RUFHc0QsT0FBTyxDQUFDLE9BQU87Ozs7NEVBSWpCLE9BQU8sQ0FBQyxLQUFLOzs7O2lGQUlSLE9BQU8sQ0FBQyxVQUFVOzs7O21GQUloQixPQUFPLENBQUMsWUFBWTs7OztnRkFJdkIsT0FBTyxDQUFDLFNBQVM7Ozs7bUZBSWQsT0FBTyxDQUFDLFlBQVk7Ozs7OEVBSXpCLE9BQU8sQ0FBQyxPQUFPOzs7O2tGQUlYLE9BQU8sQ0FBQyxXQUFXOzs7OzhFQUl2QixPQUFPLENBQUMsT0FBTzs7O1NBR3BGO1FBQ0QsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQXNCO1FBQ2xFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO1FBQ3hDLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQWMsRUFBRSxVQUFpQixFQUFFLEVBQUU7UUFDNUQsSUFBRyxPQUFPLEVBQUM7WUFDUCxJQUFHLE9BQU8sQ0FBQyxPQUFPLEtBQUssT0FBTztnQkFBRSxPQUFPO1lBQ3ZDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBVTtTQUMvQjtJQUNMLENBQUMsQ0FBQztJQUVGLE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBYyxFQUFFLEVBQUU7UUFDckMsSUFBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ25DLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ2pFLElBQUcsT0FBTyxFQUFDO2dCQUNQLGVBQWUsQ0FBQyxTQUFTLEdBQUcsRUFBRTtnQkFDOUIsV0FBVyxFQUFFO2dCQUNiLElBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFDO29CQUM1QixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7b0JBQ2xDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztpQkFDcEM7YUFDSjtpQkFBTTtnQkFDSCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzVCLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDOUIsT0FBTyxHQUFHLElBQUk7YUFDakI7U0FDSjtRQUNELFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRTtRQUN4QixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBVyxFQUFFLEVBQUU7WUFDM0IsSUFBRyxLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVM7Z0JBQUUsT0FBTztZQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztZQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRztvQ0FDTyxLQUFLLENBQUMsSUFBSTttQ0FDWCxLQUFLLENBQUMsR0FBRzt1Q0FDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVU7YUFDL0U7WUFDRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztZQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNO1lBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUN6RSxDQUFDLENBQUM7WUFDRixJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVTtnQkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hGLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQy9CLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQztJQUVGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ25DLGVBQWUsQ0FBQyxTQUFTLEdBQUcsRUFBRTtRQUM5QixXQUFXLEVBQUU7SUFDakIsQ0FBQyxDQUFDO0lBRUYsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDcEMsZUFBZSxDQUFDLFNBQVMsR0FBRyxFQUFFO1FBQzlCLFlBQVksRUFBRTtJQUNsQixDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRixDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQVcsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3pFLENBQUMsQ0FBQztJQUVGLE1BQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBVyxFQUFFLEVBQUU7UUFDcEMsT0FBTyxHQUFHLEtBQUs7UUFDZixTQUFTLEVBQUU7UUFDWCxJQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBQztZQUMxQixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1NBQ3BDO0lBQ0wsQ0FBQyxDQUFDO0lBQ0YsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDckMsSUFBRyxDQUFDLE9BQU87WUFBRSxPQUFPO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDekMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ2hDLENBQUMsQ0FBQztJQUVGLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBVyxFQUFFLEVBQUU7UUFDckMsSUFBRyxPQUFPLEVBQUM7WUFDUCxJQUFHLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDbEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUM1QixPQUFPLEdBQUcsS0FBSztnQkFDZixRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ3BCO1NBQ0o7SUFDTCxDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFO1FBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNscEJGLDBHQUFvQztBQUV2QixjQUFNLEdBQUc7SUFDbEIsR0FBRyxFQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQyxLQUFLLEVBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLElBQUksRUFBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEMsSUFBSSxFQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQyxPQUFPLEVBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sRUFBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEMsS0FBSyxFQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuQyxLQUFLLEVBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RDO0FBRU0sTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFtQixFQUFtQixFQUFFO0lBQ2hFLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdFLGNBQWMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQztJQUNsRixjQUFjLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUM7SUFDOUUsY0FBYyxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDO0lBQ2xGLGNBQWMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQztJQUNsRixjQUFjLENBQUMsY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUM7SUFDbEYsT0FBTyxjQUFjO0FBQ3pCLENBQUM7QUFSWSxtQkFBVyxlQVF2QjtBQUVNLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBbUIsRUFBbUIsRUFBRTtJQUNsRSxNQUFNLGdCQUFnQixHQUFHLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pGLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDO0lBQ3RGLGdCQUFnQixDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDO0lBQ2xGLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDO0lBQ3RGLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDO0lBQ3JGLE9BQU8sZ0JBQWdCO0FBQzNCLENBQUM7QUFQWSxxQkFBYSxpQkFPekI7QUFFTSxNQUFNLGdCQUFnQixHQUFHLENBQUMsS0FBbUIsRUFBbUIsRUFBRTtJQUNyRSxNQUFNLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0UsYUFBYSxDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO0lBQ3ZGLGFBQWEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLEtBQUssQ0FBQztJQUNuRixhQUFhLENBQUMsZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUM7SUFDdkYsYUFBYSxDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDO0lBQ3ZGLE9BQU8sYUFBYTtBQUN4QixDQUFDO0FBUFksd0JBQWdCLG9CQU81QjtBQUVNLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBbUIsRUFBRSxLQUFZLEVBQW1CLEVBQUU7SUFDOUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLFFBQVEsQ0FBQyxZQUFZLEdBQUcsY0FBTSxDQUFDLEtBQUssQ0FBQztJQUNyQyxPQUFPLFFBQVE7QUFDbkIsQ0FBQztBQUpZLG1CQUFXLGVBSXZCO0FBRU0sTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFtQixFQUFFLElBQVcsRUFBbUIsRUFBRTtJQUM3RSxRQUFPLElBQUksRUFBQztRQUNSLEtBQUssT0FBTyxDQUFDLENBQUMsT0FBTyx1QkFBVyxFQUFDLEtBQUssQ0FBQztRQUN2QyxLQUFLLFNBQVMsQ0FBQyxDQUFDLE9BQU8seUJBQWEsRUFBQyxLQUFLLENBQUM7UUFDM0MsS0FBSyxhQUFhLENBQUMsQ0FBQyxPQUFPLDRCQUFnQixFQUFDLEtBQUssQ0FBQztRQUNsRCxPQUFPLENBQUMsQ0FBQyxPQUFPLHVCQUFXLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQztLQUMzQztBQUNMLENBQUM7QUFQWSxtQkFBVyxlQU92QiIsInNvdXJjZXMiOlsid2VicGFjazovL2Zyb250Ly4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2Zyb250Ly4vc3JjL3RleHR1cmVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlvLCBTb2NrZXQgfSBmcm9tICdzb2NrZXQuaW8tY2xpZW50JztcclxuaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnO1xyXG5pbXBvcnQgKiBhcyBHVUkgZnJvbSAnYmFieWxvbmpzLWd1aSc7XHJcbmltcG9ydCBDQU5OT04gZnJvbSAnY2Fubm9uJ1xyXG5pbXBvcnQgeyBnZXRHcmFuaXRlTWF0LCBnZXRNYXRlcmlhbCwgZ2V0TWV0YWxNYXQsIGdldFNxdWFyZVRpbGVNYXQgfSBmcm9tICcuL3RleHR1cmVzJztcclxuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuL3R5cGVzJ1xyXG5pbXBvcnQgJ2JhYnlsb25qcy1sb2FkZXJzL2JhYnlsb24ub2JqRmlsZUxvYWRlcidcclxuXHJcbmNvbnN0IHNlcnZlciA9IGlvKCcvJylcclxuXHJcbndpbmRvdy5DQU5OT04gPSBDQU5OT05cclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGUpID0+IHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxufSk7XHJcblxyXG5jb25zdCBpc01vYmlsZSA9ICgpOmJvb2xlYW4gPT4ge1xyXG4gICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ0FuZHJvaWQnKSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdpUGhvbmUnKTtcclxufTtcclxuXHJcbmxldCBteVdvcmxkOldvcmxkfG51bGwgPSBudWxsXHJcblxyXG5jb25zdCBpbml0R2FtZSA9IGFzeW5jICh0aGlzV29ybGQ6V29ybGQpID0+IHtcclxuICAgIC8vIHZhcmlhYmxlcyBpbml0aWFsaXphdGlvblxyXG4gICAgbGV0IGlucHV0S2V5czpzdHJpbmdbXSA9IFtdXHJcbiAgICBsZXQgd29ybGQ6V29ybGQgPSB0aGlzV29ybGQ7XHJcbiAgICBsZXQgbW92aW5nQW5nbGU6bnVtYmVyfG51bGwgPSBudWxsXHJcbiAgICBcclxuICAgIGNvbnN0IGdsb2JhbERhbXBpbmcgPSB3b3JsZC5kYW1waW5nO1xyXG4gICAgY29uc3QgZ2xvYmFsUmVzdGl0dXRpb24gPSB3b3JsZC5yZXN0aXR1dGlvbjtcclxuICAgIGxldCBjYW1SYWRpb3VzID0gaXNNb2JpbGUoKSA/IGlubmVyV2lkdGggPiBpbm5lckhlaWdodCA/IDEzIDogMjAgOiAxMDtcclxuICAgIGNvbnN0IHNwZWVkID0gd29ybGQuc3BlZWQqMC4yO1xyXG4gICAgY29uc3QganVtcEhlaWdodCA9IHdvcmxkLmp1bXBIZWlnaHQ7XHJcbiAgICBjb25zdCBqdW1wQ29vbFRpbWUgPSB3b3JsZC5qdW1wQ29vbHRpbWU7XHJcbiAgICBjb25zdCBkYXNoUG93ZXIgPSB3b3JsZC5kYXNoUG93ZXJcclxuICAgIGNvbnN0IGRhc2hDb29sVGltZSA9IHdvcmxkLmRhc2hDb29sdGltZVxyXG4gICAgY29uc3Qgbmlja25hbWVPZmZzZXQgPSAxLjI7XHJcbiAgICBcclxuICAgIGxldCB0aW1lciA9IDA7XHJcblxyXG4gICAgLy8gZWxlbWVudHMgaW5pdGlhbGl6YXRpb25cclxuICAgIGNvbnN0IGp1bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanVtcCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3QgZGFzaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kYXNoJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBqdW1wLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgZGFzaC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIFxyXG4gICAgLy8gZ2FtZSBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlbmRlckNhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgY29uc3QgZW5naW5lID0gbmV3IEJBQllMT04uRW5naW5lKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBCQUJZTE9OLlNjZW5lKGVuZ2luZSk7XHJcbiAgICBzY2VuZS5lbmFibGVQaHlzaWNzKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgd29ybGQuZ3Jhdml0eSooLTkuODEpLCAwKSwgbmV3IEJBQllMT04uQ2Fubm9uSlNQbHVnaW4oKSk7XHJcbiAgICBcclxuICAgIC8vIG15IHNwaGVyZVxyXG4gICAgY29uc3Qgc3BoZXJlID0gQkFCWUxPTi5NZXNoQnVpbGRlci5DcmVhdGVTcGhlcmUoJ3NwaGVyZScsIHtkaWFtZXRlcjoxLCBzZWdtZW50czoxNn0sIHNjZW5lKTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi54ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzBdO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnkgPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMV07XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueiA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblsyXTtcclxuICAgIHNwaGVyZS5tYXRlcmlhbCA9IGdldE1hdGVyaWFsKHNjZW5lLCB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0uY29sb3IpO1xyXG4gICAgY29uc3Qgc3BoZXJlSW1wb3N0ZXIgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3Ioc3BoZXJlLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3RvciwgeyBtYXNzOiAxLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24sIGZyaWN0aW9uOjEgfSwgc2NlbmUpO1xyXG4gICAgc3BoZXJlLnBoeXNpY3NJbXBvc3RvciA9IHNwaGVyZUltcG9zdGVyO1xyXG4gICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5waHlzaWNzQm9keS5saW5lYXJEYW1waW5nID0gZ2xvYmFsRGFtcGluZztcclxuXHJcbiAgICAvLyBjYW1lcmFcclxuICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBCQUJZTE9OLkFyY1JvdGF0ZUNhbWVyYSgnQ2FtZXJhJywgMCwgMCwgMTAsIHNwaGVyZS5wb3NpdGlvbiwgc2NlbmUpO1xyXG4gICAgY2FtZXJhLmF0dGFjaENvbnRyb2woY2FudmFzLCB0cnVlKTtcclxuICAgIGNhbWVyYS5pbmVydGlhID0gaXNNb2JpbGUoKSA/IDAuOCA6IDAuNTtcclxuICAgIGNhbWVyYS51cHBlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgIGNhbWVyYS5sb3dlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgIFxyXG4gICAgLy9mb2dcclxuICAgIHNjZW5lLmZvZ01vZGUgPSBCQUJZTE9OLlNjZW5lLkZPR01PREVfRVhQO1xyXG4gICAgc2NlbmUuZm9nRGVuc2l0eSA9IDAuMDA1O1xyXG4gICAgc2NlbmUuZm9nQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMC45LCAwLjksIDAuOSk7XHJcbiAgICBzY2VuZS5mb2dTdGFydCA9IDIwLjA7XHJcbiAgICBzY2VuZS5mb2dFbmQgPSA2MC4wO1xyXG4gICAgXHJcbiAgICAvL0xpZ2h0XHJcbiAgICBzY2VuZS5hbWJpZW50Q29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMSwxLDEpO1xyXG4gICAgdmFyIGxpZ2h0MSA9IG5ldyBCQUJZTE9OLkhlbWlzcGhlcmljTGlnaHQoXCJsaWdodDFcIiwgbmV3IEJBQllMT04uVmVjdG9yMygxLDEsMCksIHNjZW5lKTtcclxuICAgIHZhciBsaWdodDIgPSBuZXcgQkFCWUxPTi5Qb2ludExpZ2h0KFwibGlnaHQyXCIsIG5ldyBCQUJZTE9OLlZlY3RvcjMoNjAsNjAsMCksIHNjZW5lKTtcclxuICAgIGxpZ2h0MS5pbnRlbnNpdHkgPSAwLjU7XHJcbiAgICBsaWdodDIuaW50ZW5zaXR5ID0gMC41O1xyXG4gICAgXHJcbiAgICAvLyBzaGFkb3dcclxuICAgIGNvbnN0IHNoYWRvd0dlbmVyYXRvciA9IG5ldyBCQUJZTE9OLlNoYWRvd0dlbmVyYXRvcigxMDI0LCBsaWdodDIpO1xyXG4gICAgc2hhZG93R2VuZXJhdG9yLnVzZUNvbnRhY3RIYXJkZW5pbmdTaGFkb3cgPSB0cnVlO1xyXG4gICAgc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlbmRlckxpc3QucHVzaChzcGhlcmUpO1xyXG4gICAgXHJcbiAgICAvLyBtYXBcclxuICAgIGxldCBuZXdNZXNoZXMgPSAoYXdhaXQgQkFCWUxPTi5TY2VuZUxvYWRlci5JbXBvcnRNZXNoQXN5bmMoJycsICdvYmovJywgYCR7d29ybGQubWFwfS5vYmpgLCBzY2VuZSkpLm1lc2hlcztcclxuICAgIGVuZ2luZS5oaWRlTG9hZGluZ1VJKClcclxuICAgIFxyXG4gICAgY29uc3QgbWFwT2Zmc2V0ID0gWzgsIDMsIDBdXHJcblxyXG4gICAgbmV3TWVzaGVzLmZvckVhY2goKG1lc2gpID0+IHtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKG1lc2gpO1xyXG4gICAgICAgIG1lc2gucmVjZWl2ZVNoYWRvd3MgPSB0cnVlO1xyXG4gICAgICAgIG1lc2gucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKG1lc2gsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLk1lc2hJbXBvc3RvciwgeyBtYXNzOiAwLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24vNSwgZnJpY3Rpb246MSwgZGFtcGluZzpnbG9iYWxEYW1waW5nIH0sIHNjZW5lKTtcclxuICAgICAgICBtZXNoLnBvc2l0aW9uLnggKz0gbWFwT2Zmc2V0WzBdO1xyXG4gICAgICAgIG1lc2gucG9zaXRpb24ueSArPSBtYXBPZmZzZXRbMV07XHJcbiAgICAgICAgbWVzaC5wb3NpdGlvbi56ICs9IG1hcE9mZnNldFsyXTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8ganVtcCB2YXJzXHJcbiAgICBjb25zdCBqdW1wRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmp1bXAgPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzSnVtcGluZyA9IHRydWU7XHJcbiAgICBsZXQganVtcFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gZGFzaCB2YXJzXHJcbiAgICBjb25zdCBkYXNoRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRhc2ggPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzRGFzaGluZyA9IHRydWU7XHJcbiAgICBsZXQgZGFzaFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gbG9vcFxyXG4gICAgZW5naW5lLnJ1blJlbmRlckxvb3AoKCkgPT4ge1xyXG4gICAgICAgIHRpbWVyKys7XHJcbiAgICAgICAgbGV0IGR4ID0gKGNhbWVyYS50YXJnZXQueCAtIGNhbWVyYS5wb3NpdGlvbi54KVxyXG4gICAgICAgIGxldCBkeiA9IChjYW1lcmEudGFyZ2V0LnogLSBjYW1lcmEucG9zaXRpb24ueilcclxuICAgICAgICBpZih3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNwZWN0YXRlQ2FtID0gc2NlbmUuZ2V0Q2FtZXJhQnlOYW1lKCdzcGVjdGF0ZUNhbScpIGFzIEJBQllMT04uRnJlZUNhbWVyYVxyXG4gICAgICAgICAgICBpZighc3BlY3RhdGVDYW0pIHJldHVybjtcclxuICAgICAgICAgICAgZHggPSBzcGVjdGF0ZUNhbS50YXJnZXQueCAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnhcclxuICAgICAgICAgICAgZHogPSBzcGVjdGF0ZUNhbS50YXJnZXQueiAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnpcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR6LCBkeClcclxuICAgICAgICBpZihpc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlKSBtb3ZpbmdBbmdsZSArPSBhbmdsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSkge21vdmluZ0FuZ2xlID0gYW5nbGU7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEk7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS8yO31cclxuICAgICAgICAgICAgZWxzZSB7bW92aW5nQW5nbGUgPSBudWxsO31cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPj0gMSl7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIDAsIHopLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW1lcmEuc2V0VGFyZ2V0KHNwaGVyZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmKCFpc0p1bXBpbmcgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCcgJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ZWwgPSBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KClcclxuICAgICAgICAgICAgICAgIHZlbC55ID0gMFxyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eSh2ZWwpO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMygwLCBqdW1wSGVpZ2h0LCAwKSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAganVtcFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGp1bXBEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGltZXIgLSBqdW1wVGltZVN0YW1wID4ganVtcENvb2xUaW1lID8gMTAwIDogKHRpbWVyIC0ganVtcFRpbWVTdGFtcCkvanVtcENvb2xUaW1lKjEwMH0lYDtcclxuICAgICAgICAgICAgaWYoaXNKdW1waW5nICYmIHRpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSkge1xyXG4gICAgICAgICAgICAgICAgaXNKdW1waW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIWlzRGFzaGluZyAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ1NoaWZ0JykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBkYXNoUG93ZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBNYXRoLnNpbihhbmdsZSkgKiBkYXNoUG93ZXJcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMygwLDAsMCkpO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMyh4LCAwLCB6KSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBpc0Rhc2hpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZGFzaFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRhc2hEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGltZXIgLSBkYXNoVGltZVN0YW1wID4gZGFzaENvb2xUaW1lID8gMTAwIDogKHRpbWVyIC0gZGFzaFRpbWVTdGFtcCkvZGFzaENvb2xUaW1lKjEwMH0lYDtcclxuICAgICAgICAgICAgaWYoaXNEYXNoaW5nICYmIHRpbWVyIC0gZGFzaFRpbWVTdGFtcCA+IGRhc2hDb29sVGltZSkge1xyXG4gICAgICAgICAgICAgICAgaXNEYXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VydmVyLmVtaXQoJ3VwZGF0ZScsIFtzcGhlcmUucG9zaXRpb24ueCwgc3BoZXJlLnBvc2l0aW9uLnksIHNwaGVyZS5wb3NpdGlvbi56XSwgW3NwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS54LCBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkueSwgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLnpdLCB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgc3BlY3RhdGVDYW0gPSBzY2VuZS5nZXRDYW1lcmFCeU5hbWUoJ3NwZWN0YXRlQ2FtJykgYXMgQkFCWUxPTi5GcmVlQ2FtZXJhXHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5wb3NpdGlvbi54ICs9IHhcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnogKz0gelxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnICcpKXtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnkgKz0gc3BlZWRcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnU2hpZnQnKSkge1xyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0ucG9zaXRpb24ueSAtPSBzcGVlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGlzTW9iaWxlKCkgJiYgbW92aW5nQW5nbGUgIT09IG51bGwpIHttb3ZpbmdBbmdsZSAtPSBhbmdsZTt9XHJcbiAgICAgICAgaWYoc3BoZXJlLnBvc2l0aW9uLnkgPCAtMTAgJiYgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPj0gMSkge1xyXG4gICAgICAgICAgICB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSAtPSAxO1xyXG4gICAgICAgICAgICBpZih3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnZ2FtZU92ZXInLCB3b3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICAgICAgLy8gZGVhdGggJiYgc3BlY3RhdGUgY2FtXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAganVtcERpdi5zdHlsZS5oZWlnaHQgPSAnMCUnO1xyXG4gICAgICAgICAgICAgICAgZGFzaERpdi5zdHlsZS5oZWlnaHQgPSAnMCUnO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY3RhdGVDYW0gPSBuZXcgQkFCWUxPTi5GcmVlQ2FtZXJhKCdzcGVjdGF0ZUNhbScsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMTAsIDApLCBzY2VuZSk7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5pbmVydGlhID0gaXNNb2JpbGUoKSA/IDAuOCA6IDAuNTtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnNldFRhcmdldChuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgICAgICAgIGNhbWVyYS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueSA9IDU7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueiA9IDA7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwwLDApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzY2VuZS5yZW5kZXIoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGlucHV0IGV2ZW50XHJcbiAgICBjb25zdCBrZXlkb3duID0gKGU6S2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpbnB1dEtleXMuaW5jbHVkZXMoZS5rZXkpKSB7XHJcbiAgICAgICAgICAgIGlucHV0S2V5cy5wdXNoKGUua2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBrZXl1cCA9IChlOktleWJvYXJkRXZlbnQpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gZS5rZXkpO1xyXG4gICAgfVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleWRvd24pO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXl1cCk7XHJcbiAgICBcclxuICAgIC8vIHJlc2l6ZSBldmVudFxyXG4gICAgY29uc3QgcmVzaXplID0gKCkgPT4ge1xyXG4gICAgICAgIGVuZ2luZS5yZXNpemUoKVxyXG4gICAgICAgIGNhbVJhZGlvdXMgPSBpc01vYmlsZSgpID8gaW5uZXJXaWR0aCA+IGlubmVySGVpZ2h0ID8gMTMgOiAyMCA6IDEwO1xyXG4gICAgICAgIGNhbWVyYS51cHBlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgICAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplKTtcclxuICAgIFxyXG4gICAgLy8gcG9pbnRlciBsb2NrXHJcbiAgICBjb25zdCBwb2ludGVybG9ja2NoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgY2FudmFzLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuICAgIFxyXG4gICAgLy8gbW9iaWxlIGNvbnRyb2xcclxuICAgIGNvbnN0IG1vYmlsZUxheW91dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtbGF5b3V0JykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBqb3lzdGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3lzdGljaycpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3Qgam95c3RpY2tCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuam95c3RpY2stYnV0dG9uJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBpZihpc01vYmlsZSgpKSBtb2JpbGVMYXlvdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBsZXQgc3RhcnRQb2ludCA9IFswLDBdXHJcbiAgICBcclxuICAgIGNvbnN0IGdldFRvdWNoZXNYWSA9IChldmVudDpUb3VjaEV2ZW50KTpbbnVtYmVyLCBudW1iZXJdID0+IHtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WFxyXG4gICAgICAgIGxldCB5ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgICAgZm9yKGxldCBpPTE7IGk8ZXZlbnQudG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25kID0gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRYIDwgeFxyXG4gICAgICAgICAgICB4ID0gY29uZCA/IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WCA6IHhcclxuICAgICAgICAgICAgeSA9IGNvbmQgPyBldmVudC50b3VjaGVzW2ldLmNsaWVudFkgOiB5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbeCwgeV1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QganVtcF90b3VjaHN0YXJ0ID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMucHVzaCgnICcpXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywganVtcF90b3VjaHN0YXJ0KVxyXG4gICAgY29uc3QganVtcF90b3VjaGVuZCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICcgJyk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGp1bXBfdG91Y2hlbmQpXHJcblxyXG4gICAgY29uc3QgZGFzaF90b3VjaHN0YXJ0ID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMucHVzaCgnU2hpZnQnKVxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuICAgIGRhc2guYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRhc2hfdG91Y2hzdGFydClcclxuICAgIGNvbnN0IGRhc2hfdG91Y2hlbmQgPSAoZXZlbnQ6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cyA9IGlucHV0S2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSAnU2hpZnQnKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcbiAgICBkYXNoLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGFzaF90b3VjaGVuZClcclxuICAgIFxyXG4gICAgY29uc3Qgam95c3RpY2tfdG91Y2hzdGFydCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgW3gsIHldID0gZ2V0VG91Y2hlc1hZKGV2ZW50KVxyXG4gICAgICAgIGpveXN0aWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLmxlZnQgPSBgJHt4fXB4YFxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRvcCA9IGAke3l9cHhgXHJcbiAgICAgICAgc3RhcnRQb2ludCA9IFt4LCB5XVxyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLmxlZnQgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGpveXN0aWNrX3RvdWNoc3RhcnQpO1xyXG4gICAgY29uc3Qgam95c3RpY2tfdG91Y2htb3ZlID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBsZXQgW2R4LCBkeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgZHggLT0gc3RhcnRQb2ludFswXVxyXG4gICAgICAgIGR5IC09IHN0YXJ0UG9pbnRbMV1cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXHJcbiAgICAgICAgY29uc3QgbWF4RGlzdGFuY2UgPSA1MFxyXG4gICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgY29uc3QgeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKGRpc3RhbmNlLCBtYXhEaXN0YW5jZSlcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS5sZWZ0ID0gYCR7eCs1MH1weGBcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSBgJHt5KzUwfXB4YFxyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gKC1hbmdsZSkgLSBNYXRoLlBJLzI7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgam95c3RpY2tfdG91Y2htb3ZlKTtcclxuICAgIGNvbnN0IGpveXN0aWNrX3RvdWNoZW5kID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBqb3lzdGljay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC41cydcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqb3lzdGlja190b3VjaGVuZCk7XHJcbiAgICBcclxuICAgIC8vIGVuZW15IGNyZWF0aW9uXHJcbiAgICBjb25zdCBjcmVhdGVFbmVteSA9IChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBjb25zdCBzcGggPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZShgJHtpZH1gLCB7ZGlhbWV0ZXI6MSwgc2VnbWVudHM6MzJ9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnkgPSBwb3NbMV07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnogPSBwb3NbMl07XHJcbiAgICAgICAgY29uc3Qgc3BoSW1wb3N0ZXIgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3Ioc3BoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3RvciwgeyBtYXNzOiAxLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24sIGZyaWN0aW9uOjEgfSwgc2NlbmUpO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IgPSBzcGhJbXBvc3RlcjtcclxuICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMyh2ZWxvY2l0eVswXSwgdmVsb2NpdHlbMV0sIHZlbG9jaXR5WzJdKSk7XHJcbiAgICAgICAgc3BoLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbaWRdLmNvbG9yKTtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaCk7XHJcbiAgICAgICAgY29uc3QgbmljayA9IHdvcmxkLnBsYXllcnNbaWRdLm5pY2tuYW1lXHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKGAke2lkfS1wbGFuZWAsIHt3aWR0aDogbmljay5sZW5ndGgsIGhlaWdodDogNX0sIHNjZW5lKTtcclxuICAgICAgICBwbGFuZS5iaWxsYm9hcmRNb2RlID0gQkFCWUxPTi5NZXNoLkJJTExCT0FSRE1PREVfQUxMO1xyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi55ID0gcG9zWzFdICsgbmlja25hbWVPZmZzZXRcclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi56ID0gcG9zWzJdXHJcbiAgICAgICAgY29uc3Qgbmlja1RleHR1cmUgPSBHVUkuQWR2YW5jZWREeW5hbWljVGV4dHVyZS5DcmVhdGVGb3JNZXNoKHBsYW5lKTtcclxuICAgICAgICBjb25zdCBuaWNrVGV4dCA9IG5ldyBHVUkuVGV4dEJsb2NrKCk7XHJcbiAgICAgICAgbmlja1RleHQudGV4dCA9IG5pY2s7XHJcbiAgICAgICAgbmlja1RleHQuY29sb3IgPSAnd2hpdGUnO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRTaXplID0gMTAwO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udEZhbWlseSA9ICdBcmlhbCc7XHJcbiAgICAgICAgbmlja1RleHR1cmUuYWRkQ29udHJvbChuaWNrVGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vIHNvY2tldC5pb1xyXG4gICAgc2VydmVyLmVtaXQoJ2luaXQnLCB3b3JsZC5vd25lcklkKVxyXG4gICAgc2VydmVyLm9uKCdpbml0JywgKGRhdGE6IFdvcmxkKSA9PiB7XHJcbiAgICAgICAgd29ybGQgPSBkYXRhO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmZvckVhY2goKGlkOnN0cmluZywgaTpudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgaWYoaWQgPT09IHNlcnZlci5pZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB3b3JsZC5wbGF5ZXJzW2lkXS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgY29uc3QgdmVsb2NpdHkgPSB3b3JsZC5wbGF5ZXJzW2lkXS52ZWxvY2l0eTtcclxuICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBzZXJ2ZXIub24oJ3VwZGF0ZScsIChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBpZihzdGFydGVkICYmIHdvcmxkLnBsYXllcnNbaWRdKXtcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tpZF0ucG9zaXRpb24gPSBwb3M7XHJcbiAgICAgICAgICAgIHdvcmxkLnBsYXllcnNbaWRdLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGlmKGlkID09PSBzZXJ2ZXIuaWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBsYW5lID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShgJHtpZH0tcGxhbmVgKTtcclxuICAgICAgICAgICAgaWYgKHNwaCAmJiBwbGFuZSkge1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi56ID0gcG9zWzJdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueiA9IHBvc1syXVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCByZW1vdmVQbGF5ZXIgPSAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGAke2lkfS1wbGFuZWApO1xyXG4gICAgICAgIGlmIChzcGggJiYgcGxhbmUpIHtcclxuICAgICAgICAgICAgc3BoLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgcGxhbmUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNlcnZlci5vbignZ2FtZU92ZXInLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgIH0pO1xyXG4gICAgc2VydmVyLm9uKCdkaXNjb25uZWN0ZWQnLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgICAgICBkZWxldGUgd29ybGQucGxheWVyc1tpZF07XHJcbiAgICB9KTtcclxuICAgIHNlcnZlci5vbignZ2FtZUVuZCcsICh3aW5uZXJJZDpzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCB3aW5uZXIgPSB3b3JsZC5wbGF5ZXJzW3dpbm5lcklkXVxyXG4gICAgICAgIGNvbnN0IHdpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgd2lubmVyRGl2LmNsYXNzTGlzdC5hZGQoJ3dpbm5lcicpXHJcbiAgICAgICAgd2lubmVyRGl2LmlubmVyVGV4dCA9IGAke3dpbm5lci5uaWNrbmFtZX0gV2luIWBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHdpbm5lckRpdilcclxuICAgICAgICBlbmdpbmUuc3RvcFJlbmRlckxvb3AoKVxyXG4gICAgICAgIGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpXHJcbiAgICAgICAgc2VydmVyLm9mZigndXBkYXRlJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdnYW1lT3ZlcicpXHJcbiAgICAgICAgc2VydmVyLm9mZignZGlzY29ubmVjdGVkJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdnYW1lRW5kJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdpbml0JylcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bik7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXl1cCk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcbiAgICAgICAgbW9iaWxlTGF5b3V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBqb3lzdGlja190b3VjaHN0YXJ0KTtcclxuICAgICAgICBtb2JpbGVMYXlvdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgam95c3RpY2tfdG91Y2htb3ZlKTtcclxuICAgICAgICBtb2JpbGVMYXlvdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqb3lzdGlja190b3VjaGVuZCk7XHJcbiAgICAgICAganVtcC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywganVtcF90b3VjaHN0YXJ0KVxyXG4gICAgICAgIGp1bXAucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqdW1wX3RvdWNoZW5kKVxyXG4gICAgICAgIGRhc2gucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRhc2hfdG91Y2hzdGFydClcclxuICAgICAgICBkYXNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGFzaF90b3VjaGVuZClcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgd2lubmVyRGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAganVtcC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgZGFzaC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICBlbmdpbmUuZGlzcG9zZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfSwgMzAwMClcclxuICAgIH0pXHJcbn1cclxuXHJcbmNvbnN0IG1haW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IG5pY2tuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQubmlja25hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IHN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLnN0YXJ0JykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3QgdGV4dHVyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC50ZXh0dXJlJykgYXMgSFRNTFNlbGVjdEVsZW1lbnRcclxuXHJcbmNvbnN0IHJvb21zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb21zJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgcG9wdXBCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24ucG9wdXAnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5wb3B1cCcpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGJhY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuYmFjaycpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb29tcyA+IC5jb250YWluZXInKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5cclxuY29uc3QgY3JlYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmNyZWF0ZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHJvb21uYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucm9vbW5hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IG1hcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC5tYXAnKSBhcyBIVE1MU2VsZWN0RWxlbWVudFxyXG5jb25zdCBtYXhQbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucGxheWVycycpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuXHJcbmNvbnN0IGluUm9vbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pblJvb20nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBpblJvb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5Sb29tID4gLmNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHN0YXJ0R2FtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5pbml0LWdhbWUnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBwbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnBsYXllcnNCdG4nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5zZXR0aW5nc0J0bicpIGFzIEhUTUxEaXZFbGVtZW50XHJcblxyXG5jb25zdCBlbnRlckdhbWUgPSAoKSA9PiB7XHJcbiAgICBtYWluLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgcm9vbXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbn1cclxuXHJcbmNvbnN0IG9mZlBvcHVwID0gKCkgPT4ge1xyXG4gICAgcG9wdXAuY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICBiYWNrLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG59XHJcblxyXG5jb25zdCBlbnRlclJvb20gPSAoKSA9PiB7XHJcbiAgICByb29tcy5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIGluUm9vbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxufVxyXG5cclxuc2VydmVyLm9uKCdjb25uZWN0JywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCcpO1xyXG4gICAgc2VydmVyLmVtaXQoJ2RlYnVnJywgbmF2aWdhdG9yLnVzZXJBZ2VudClcclxuXHJcbiAgICAvLyBldmVudHNcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLmtleSA9PT0gJ1RhYicpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLmNvZGUgPT09ICdLZXlMJyAmJiBlLmN0cmxLZXkgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT0gJ2RldmVsb3BtZW50Jykge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdsb2cnKVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG5pY2tuYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIHBvcHVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9mZlBvcHVwKVxyXG4gICAgYmFjay5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb2ZmUG9wdXApXHJcblxyXG4gICAgY29uc3QgbG9hZFBsYXllcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobXlXb3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gbXlXb3JsZC5wbGF5ZXJzW2lkXVxyXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuY2xhc3NMaXN0LmFkZCgncGxheWVyJylcclxuICAgICAgICAgICAgcGxheWVyRGl2LmlubmVyVGV4dCA9IHBsYXllci5uaWNrbmFtZVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuc3R5bGUuY29sb3IgPSBwbGF5ZXIuY29sb3JcclxuICAgICAgICAgICAgaW5Sb29tQ29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXllckRpdilcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNhdmVSb29tID0gKCkgPT4ge1xyXG4gICAgICAgIG15V29ybGQuZ3Jhdml0eSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdyYXZpdHlcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLnNwZWVkID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwic3BlZWRcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmp1bXBIZWlnaHQgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJqdW1wSGVpZ2h0XCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5qdW1wQ29vbHRpbWUgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJqdW1wQ29vbHRpbWVcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmRhc2hQb3dlciA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImRhc2hQb3dlclwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuZGFzaENvb2x0aW1lID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZGFzaENvb2x0aW1lXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5kYW1waW5nID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZGFtcGluZ1wiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQucmVzdGl0dXRpb24gPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJyZXN0aXR1dGlvblwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQubWF4bGlmZSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cIm1heGxpZmVcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgndXBkYXRlUm9vbScsIG15V29ybGQpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9hZFNldHRpbmdzID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgc2V0LmNsYXNzTGlzdC5hZGQoJ3NldHRpbmdzJylcclxuICAgICAgICBzZXQuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3Jhdml0eVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImdyYXZpdHlcIj5HcmF2aXR5PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJncmF2aXR5XCIgdmFsdWU9XCIke215V29ybGQuZ3Jhdml0eX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BlZWRcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzcGVlZFwiPlNwZWVkPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJzcGVlZFwiIHZhbHVlPVwiJHtteVdvcmxkLnNwZWVkfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqdW1wSGVpZ2h0XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwianVtcEhlaWdodFwiPkp1bXAgSGVpZ2h0PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJqdW1wSGVpZ2h0XCIgdmFsdWU9XCIke215V29ybGQuanVtcEhlaWdodH1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVtcENvb2x0aW1lXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwianVtcENvb2x0aW1lXCI+SnVtcCBDb29sdGltZTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwianVtcENvb2x0aW1lXCIgdmFsdWU9XCIke215V29ybGQuanVtcENvb2x0aW1lfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoUG93ZXJcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJkYXNoUG93ZXJcIj5EYXNoIFBvd2VyPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJkYXNoUG93ZXJcIiB2YWx1ZT1cIiR7bXlXb3JsZC5kYXNoUG93ZXJ9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hDb29sdGltZVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRhc2hDb29sdGltZVwiPkRhc2ggQ29vbHRpbWU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImRhc2hDb29sdGltZVwiIHZhbHVlPVwiJHtteVdvcmxkLmRhc2hDb29sdGltZX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFtcGluZ1wiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRhbXBpbmdcIj5EYW1waW5nPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJkYW1waW5nXCIgdmFsdWU9XCIke215V29ybGQuZGFtcGluZ31cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdGl0dXRpb25cIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJyZXN0aXR1dGlvblwiPlJlc3RpdHV0aW9uPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJyZXN0aXR1dGlvblwiIHZhbHVlPVwiJHtteVdvcmxkLnJlc3RpdHV0aW9ufVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXhsaWZlXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibWF4bGlmZVwiPk1heCBMaWZlPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJtYXhsaWZlXCIgdmFsdWU9XCIke215V29ybGQubWF4bGlmZX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic2F2ZVwiPlNhdmU8L2J1dHRvbj5cclxuICAgICAgICBgXHJcbiAgICAgICAgY29uc3Qgc2F2ZSA9IHNldC5xdWVyeVNlbGVjdG9yKCdidXR0b24uc2F2ZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbiAgICAgICAgc2F2ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVSb29tKVxyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5hcHBlbmQoc2V0KVxyXG4gICAgfVxyXG5cclxuICAgIHNlcnZlci5vbignb3duZXJDaGFuZ2VkJywgKHdvcmxkSWQ6c3RyaW5nLCBuZXdPd25lcklkOnN0cmluZykgPT4ge1xyXG4gICAgICAgIGlmKG15V29ybGQpe1xyXG4gICAgICAgICAgICBpZihteVdvcmxkLm93bmVySWQgIT09IHdvcmxkSWQpIHJldHVybjtcclxuICAgICAgICAgICAgbXlXb3JsZC5vd25lcklkID0gbmV3T3duZXJJZFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdnZXRSb29tcycsICh3b3JsZHM6V29ybGRbXSkgPT4ge1xyXG4gICAgICAgIGlmKCFpblJvb20uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpIHtcclxuICAgICAgICAgICAgbXlXb3JsZCA9IHdvcmxkcy5maW5kKHdvcmxkID0+IHdvcmxkLm93bmVySWQgPT09IG15V29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgaWYobXlXb3JsZCl7XHJcbiAgICAgICAgICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgICAgIGxvYWRQbGF5ZXJzKClcclxuICAgICAgICAgICAgICAgIGlmKG15V29ybGQub3duZXJJZCA9PSBzZXJ2ZXIuaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0R2FtZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIHJvb21zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgbXlXb3JsZCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICB3b3JsZHMuZm9yRWFjaCgod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICAgICAgaWYod29ybGQuc3RhdHVzICE9PSAnd2FpdGluZycpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIHJvb20uY2xhc3NMaXN0LmFkZCgncm9vbScpXHJcbiAgICAgICAgICAgIHJvb20uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hbWVcIj4ke3dvcmxkLm5hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFwXCI+JHt3b3JsZC5tYXB9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGxheWVyc1wiPiR7T2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RofS8ke3dvcmxkLm1heFBsYXllcnN9PC9kaXY+XHJcbiAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgY29uc3Qgam9pbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXHJcbiAgICAgICAgICAgIGpvaW4uY2xhc3NMaXN0LmFkZCgnam9pbicpXHJcbiAgICAgICAgICAgIGpvaW4uaW5uZXJUZXh0ID0gJ0pvaW4nXHJcbiAgICAgICAgICAgIGpvaW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnam9pblJvb20nLCB3b3JsZC5vd25lcklkLCBuaWNrbmFtZS52YWx1ZSwgdGV4dHVyZS52YWx1ZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RoIDwgd29ybGQubWF4UGxheWVycykgcm9vbS5hcHBlbmRDaGlsZChqb2luKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJvb20pXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcblxyXG4gICAgcGxheWVycy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICBsb2FkUGxheWVycygpXHJcbiAgICB9KVxyXG5cclxuICAgIHNldHRpbmdzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIGxvYWRTZXR0aW5ncygpXHJcbiAgICB9KVxyXG5cclxuICAgIGNyZWF0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnY3JlYXRlUm9vbScsIHJvb21uYW1lLnZhbHVlLCBtYXAudmFsdWUsIE51bWJlcihtYXhQbGF5ZXJzLnZhbHVlKSlcclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdjcmVhdGVkUm9vbScsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIHNlcnZlci5lbWl0KCdqb2luUm9vbScsIHdvcmxkLm93bmVySWQsIG5pY2tuYW1lLnZhbHVlLCB0ZXh0dXJlLnZhbHVlKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2pvaW5lZFJvb20nLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICBlbnRlclJvb20oKVxyXG4gICAgICAgIGlmKHNlcnZlci5pZCA9PSB3b3JsZC5vd25lcklkKXtcclxuICAgICAgICAgICAgc3RhcnRHYW1lLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgc3RhcnRHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGlmKCFteVdvcmxkKSByZXR1cm47XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ3N0YXJ0R2FtZScsIG15V29ybGQub3duZXJJZClcclxuICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignZ2FtZVN0YXJ0ZWQnLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBpZihteVdvcmxkKXtcclxuICAgICAgICAgICAgaWYobXlXb3JsZC5vd25lcklkID09PSB3b3JsZC5vd25lcklkKSB7XHJcbiAgICAgICAgICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICAgICAgICAgIGluaXRHYW1lKG15V29ybGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignbG9nJywgKGxvZ2dlcjpzdHJpbmdbXSkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGxvZ2dlci5qb2luKCdcXG4nKSlcclxuICAgIH0pXHJcbn0pIiwiaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnXHJcblxyXG5leHBvcnQgY29uc3QgY29sb3JzID0ge1xyXG4gICAgcmVkIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDApLFxyXG4gICAgZ3JlZW4gOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMSwgMCksXHJcbiAgICBibHVlIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDEpLFxyXG4gICAgYXF1YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAxKSxcclxuICAgIG1hZ2VudGEgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMSksXHJcbiAgICB5ZWxsb3cgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMCksXHJcbiAgICBibGFjayA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKSxcclxuICAgIHdoaXRlIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWV0YWxNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBNZXRhbFNwaGVyZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ01ldGFsU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgTWV0YWxTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL2JjLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL24uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5zcGVjdWxhclRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYW8uanBnJywgc2NlbmUpXHJcbiAgICByZXR1cm4gTWV0YWxTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEdyYW5pdGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBHcmFuaXRlU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnR3Jhbml0ZVNwaGVyZU1hdCcsIHNjZW5lKTtcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL24ucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9hLnBuZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIEdyYW5pdGVTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNxdWFyZVRpbGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBTcXVhcmVUaWxlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnU3F1YXJlVGlsZU1hdCcsIHNjZW5lKTtcclxuICAgIFNxdWFyZVRpbGVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL2JjLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYW8ucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gU3F1YXJlVGlsZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q29sb3JNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgY29sb3I6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IENvbG9yTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnQ29sb3JNYXQnLCBzY2VuZSk7XHJcbiAgICBDb2xvck1hdC5kaWZmdXNlQ29sb3IgPSBjb2xvcnNbY29sb3JdXHJcbiAgICByZXR1cm4gQ29sb3JNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1hdGVyaWFsID0gKHNjZW5lOkJBQllMT04uU2NlbmUsIG5hbWU6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIHN3aXRjaChuYW1lKXtcclxuICAgICAgICBjYXNlICdtZXRhbCc6IHJldHVybiBnZXRNZXRhbE1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdncmFuaXRlJzogcmV0dXJuIGdldEdyYW5pdGVNYXQoc2NlbmUpXHJcbiAgICAgICAgY2FzZSAnc3F1YXJlX3RpbGUnOiByZXR1cm4gZ2V0U3F1YXJlVGlsZU1hdChzY2VuZSlcclxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gZ2V0Q29sb3JNYXQoc2NlbmUsIG5hbWUpXHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=