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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDTCxDQUFDO0FBUFksbUJBQVcsZUFPdkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mcm9udC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mcm9udC8uL3NyYy90ZXh0dXJlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbywgU29ja2V0IH0gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XHJcbmltcG9ydCAqIGFzIEJBQllMT04gZnJvbSAnYmFieWxvbmpzJztcclxuaW1wb3J0ICogYXMgR1VJIGZyb20gJ2JhYnlsb25qcy1ndWknO1xyXG5pbXBvcnQgQ0FOTk9OIGZyb20gJ2Nhbm5vbidcclxuaW1wb3J0IHsgZ2V0R3Jhbml0ZU1hdCwgZ2V0TWF0ZXJpYWwsIGdldE1ldGFsTWF0LCBnZXRTcXVhcmVUaWxlTWF0IH0gZnJvbSAnLi90ZXh0dXJlcyc7XHJcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSAnLi90eXBlcydcclxuaW1wb3J0ICdiYWJ5bG9uanMtbG9hZGVycy9iYWJ5bG9uLm9iakZpbGVMb2FkZXInXHJcblxyXG5jb25zdCBzZXJ2ZXIgPSBpbygnLycpXHJcblxyXG53aW5kb3cuQ0FOTk9OID0gQ0FOTk9OXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIChlKSA9PiB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbn0pO1xyXG5cclxuY29uc3QgaXNNb2JpbGUgPSAoKTpib29sZWFuID0+IHtcclxuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdBbmRyb2lkJykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnaVBob25lJyk7XHJcbn07XHJcblxyXG5sZXQgbXlXb3JsZDpXb3JsZHxudWxsID0gbnVsbFxyXG5cclxuY29uc3QgaW5pdEdhbWUgPSBhc3luYyAodGhpc1dvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAvLyB2YXJpYWJsZXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGxldCBpbnB1dEtleXM6c3RyaW5nW10gPSBbXVxyXG4gICAgbGV0IHdvcmxkOldvcmxkID0gdGhpc1dvcmxkO1xyXG4gICAgbGV0IG1vdmluZ0FuZ2xlOm51bWJlcnxudWxsID0gbnVsbFxyXG4gICAgXHJcbiAgICBjb25zdCBnbG9iYWxEYW1waW5nID0gd29ybGQuZGFtcGluZztcclxuICAgIGNvbnN0IGdsb2JhbFJlc3RpdHV0aW9uID0gd29ybGQucmVzdGl0dXRpb247XHJcbiAgICBsZXQgY2FtUmFkaW91cyA9IGlzTW9iaWxlKCkgPyBpbm5lcldpZHRoID4gaW5uZXJIZWlnaHQgPyAxMyA6IDIwIDogMTA7XHJcbiAgICBjb25zdCBzcGVlZCA9IHdvcmxkLnNwZWVkKjAuMjtcclxuICAgIGNvbnN0IGp1bXBIZWlnaHQgPSB3b3JsZC5qdW1wSGVpZ2h0O1xyXG4gICAgY29uc3QganVtcENvb2xUaW1lID0gd29ybGQuanVtcENvb2x0aW1lO1xyXG4gICAgY29uc3QgZGFzaFBvd2VyID0gd29ybGQuZGFzaFBvd2VyXHJcbiAgICBjb25zdCBkYXNoQ29vbFRpbWUgPSB3b3JsZC5kYXNoQ29vbHRpbWVcclxuICAgIGNvbnN0IG5pY2tuYW1lT2Zmc2V0ID0gMS4yO1xyXG4gICAgXHJcbiAgICBsZXQgdGltZXIgPSAwO1xyXG5cclxuICAgIC8vIGVsZW1lbnRzIGluaXRpYWxpemF0aW9uXHJcbiAgICBjb25zdCBqdW1wID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmp1bXAnKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGNvbnN0IGRhc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGFzaCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAganVtcC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIGRhc2guY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBcclxuICAgIC8vIGdhbWUgaW5pdGlhbGl6YXRpb25cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW5kZXJDYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIGNhbnZhcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIGNvbnN0IGVuZ2luZSA9IG5ldyBCQUJZTE9OLkVuZ2luZShjYW52YXMsIHRydWUpO1xyXG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgQkFCWUxPTi5TY2VuZShlbmdpbmUpO1xyXG4gICAgc2NlbmUuZW5hYmxlUGh5c2ljcyhuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIHdvcmxkLmdyYXZpdHkqKC05LjgxKSwgMCksIG5ldyBCQUJZTE9OLkNhbm5vbkpTUGx1Z2luKCkpO1xyXG4gICAgXHJcbiAgICAvLyBteSBzcGhlcmVcclxuICAgIGNvbnN0IHNwaGVyZSA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKCdzcGhlcmUnLCB7ZGlhbWV0ZXI6MSwgc2VnbWVudHM6MTZ9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueCA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblswXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi55ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzFdO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnogPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMl07XHJcbiAgICBzcGhlcmUubWF0ZXJpYWwgPSBnZXRNYXRlcmlhbChzY2VuZSwgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmNvbG9yKTtcclxuICAgIGNvbnN0IHNwaGVyZUltcG9zdGVyID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKHNwaGVyZSwgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuU3BoZXJlSW1wb3N0b3IsIHsgbWFzczogMSwgcmVzdGl0dXRpb246IGdsb2JhbFJlc3RpdHV0aW9uLCBmcmljdGlvbjoxIH0sIHNjZW5lKTtcclxuICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IgPSBzcGhlcmVJbXBvc3RlcjtcclxuICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IucGh5c2ljc0JvZHkubGluZWFyRGFtcGluZyA9IGdsb2JhbERhbXBpbmc7XHJcblxyXG4gICAgLy8gY2FtZXJhXHJcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQkFCWUxPTi5BcmNSb3RhdGVDYW1lcmEoJ0NhbWVyYScsIDAsIDAsIDEwLCBzcGhlcmUucG9zaXRpb24sIHNjZW5lKTtcclxuICAgIGNhbWVyYS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjYW1lcmEuaW5lcnRpYSA9IGlzTW9iaWxlKCkgPyAwLjggOiAwLjU7XHJcbiAgICBjYW1lcmEudXBwZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBcclxuICAgIC8vZm9nXHJcbiAgICBzY2VuZS5mb2dNb2RlID0gQkFCWUxPTi5TY2VuZS5GT0dNT0RFX0VYUDtcclxuICAgIHNjZW5lLmZvZ0RlbnNpdHkgPSAwLjAwNTtcclxuICAgIHNjZW5lLmZvZ0NvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAuOSwgMC45LCAwLjkpO1xyXG4gICAgc2NlbmUuZm9nU3RhcnQgPSAyMC4wO1xyXG4gICAgc2NlbmUuZm9nRW5kID0gNjAuMDtcclxuICAgIFxyXG4gICAgLy9MaWdodFxyXG4gICAgc2NlbmUuYW1iaWVudENvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsMSwxKTtcclxuICAgIHZhciBsaWdodDEgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KFwibGlnaHQxXCIsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMSwxLDApLCBzY2VuZSk7XHJcbiAgICB2YXIgbGlnaHQyID0gbmV3IEJBQllMT04uUG9pbnRMaWdodChcImxpZ2h0MlwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDYwLDYwLDApLCBzY2VuZSk7XHJcbiAgICBsaWdodDEuaW50ZW5zaXR5ID0gMC41O1xyXG4gICAgbGlnaHQyLmludGVuc2l0eSA9IDAuNTtcclxuICAgIFxyXG4gICAgLy8gc2hhZG93XHJcbiAgICBjb25zdCBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgQkFCWUxPTi5TaGFkb3dHZW5lcmF0b3IoMTAyNCwgbGlnaHQyKTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci51c2VDb250YWN0SGFyZGVuaW5nU2hhZG93ID0gdHJ1ZTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoZXJlKTtcclxuICAgIFxyXG4gICAgLy8gbWFwXHJcbiAgICBsZXQgbmV3TWVzaGVzID0gKGF3YWl0IEJBQllMT04uU2NlbmVMb2FkZXIuSW1wb3J0TWVzaEFzeW5jKCcnLCAnb2JqLycsICd0ZXN0MS5vYmonLCBzY2VuZSkpLm1lc2hlcztcclxuICAgIGVuZ2luZS5oaWRlTG9hZGluZ1VJKClcclxuICAgIFxyXG4gICAgY29uc3QgbWFwT2Zmc2V0ID0gWzgsIDMsIDBdXHJcblxyXG4gICAgbmV3TWVzaGVzLmZvckVhY2goKG1lc2gpID0+IHtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKG1lc2gpO1xyXG4gICAgICAgIG1lc2gucmVjZWl2ZVNoYWRvd3MgPSB0cnVlO1xyXG4gICAgICAgIG1lc2gucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKG1lc2gsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLk1lc2hJbXBvc3RvciwgeyBtYXNzOiAwLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24vNSwgZnJpY3Rpb246MSwgZGFtcGluZzpnbG9iYWxEYW1waW5nIH0sIHNjZW5lKTtcclxuICAgICAgICBtZXNoLnBvc2l0aW9uLnggKz0gbWFwT2Zmc2V0WzBdO1xyXG4gICAgICAgIG1lc2gucG9zaXRpb24ueSArPSBtYXBPZmZzZXRbMV07XHJcbiAgICAgICAgbWVzaC5wb3NpdGlvbi56ICs9IG1hcE9mZnNldFsyXTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8ganVtcCB2YXJzXHJcbiAgICBjb25zdCBqdW1wRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmp1bXAgPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzSnVtcGluZyA9IHRydWU7XHJcbiAgICBsZXQganVtcFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gZGFzaCB2YXJzXHJcbiAgICBjb25zdCBkYXNoRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRhc2ggPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzRGFzaGluZyA9IHRydWU7XHJcbiAgICBsZXQgZGFzaFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gbG9vcFxyXG4gICAgZW5naW5lLnJ1blJlbmRlckxvb3AoKCkgPT4ge1xyXG4gICAgICAgIHRpbWVyKys7XHJcbiAgICAgICAgbGV0IGR4ID0gKGNhbWVyYS50YXJnZXQueCAtIGNhbWVyYS5wb3NpdGlvbi54KVxyXG4gICAgICAgIGxldCBkeiA9IChjYW1lcmEudGFyZ2V0LnogLSBjYW1lcmEucG9zaXRpb24ueilcclxuICAgICAgICBpZih3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNwZWN0YXRlQ2FtID0gc2NlbmUuZ2V0Q2FtZXJhQnlOYW1lKCdzcGVjdGF0ZUNhbScpIGFzIEJBQllMT04uRnJlZUNhbWVyYVxyXG4gICAgICAgICAgICBpZighc3BlY3RhdGVDYW0pIHJldHVybjtcclxuICAgICAgICAgICAgZHggPSBzcGVjdGF0ZUNhbS50YXJnZXQueCAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnhcclxuICAgICAgICAgICAgZHogPSBzcGVjdGF0ZUNhbS50YXJnZXQueiAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnpcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR6LCBkeClcclxuICAgICAgICBpZihpc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlKSBtb3ZpbmdBbmdsZSArPSBhbmdsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2EnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ2QnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnZCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3cnKSkge21vdmluZ0FuZ2xlID0gYW5nbGU7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygncycpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEk7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnYScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdkJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS8yO31cclxuICAgICAgICAgICAgZWxzZSB7bW92aW5nQW5nbGUgPSBudWxsO31cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPj0gMSl7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIDAsIHopLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW1lcmEuc2V0VGFyZ2V0KHNwaGVyZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmKCFpc0p1bXBpbmcgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCcgJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ZWwgPSBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KClcclxuICAgICAgICAgICAgICAgIHZlbC55ID0gMFxyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eSh2ZWwpO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMygwLCBqdW1wSGVpZ2h0LCAwKSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBpc0p1bXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAganVtcFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGp1bXBEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGltZXIgLSBqdW1wVGltZVN0YW1wID4ganVtcENvb2xUaW1lID8gMTAwIDogKHRpbWVyIC0ganVtcFRpbWVTdGFtcCkvanVtcENvb2xUaW1lKjEwMH0lYDtcclxuICAgICAgICAgICAgaWYoaXNKdW1waW5nICYmIHRpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSkge1xyXG4gICAgICAgICAgICAgICAgaXNKdW1waW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIWlzRGFzaGluZyAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ1NoaWZ0JykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBkYXNoUG93ZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBNYXRoLnNpbihhbmdsZSkgKiBkYXNoUG93ZXJcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMygwLDAsMCkpO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5hcHBseUltcHVsc2UobmV3IEJBQllMT04uVmVjdG9yMyh4LCAwLCB6KSwgc3BoZXJlLmdldEFic29sdXRlUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBpc0Rhc2hpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZGFzaFRpbWVTdGFtcCA9IHRpbWVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRhc2hEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGltZXIgLSBkYXNoVGltZVN0YW1wID4gZGFzaENvb2xUaW1lID8gMTAwIDogKHRpbWVyIC0gZGFzaFRpbWVTdGFtcCkvZGFzaENvb2xUaW1lKjEwMH0lYDtcclxuICAgICAgICAgICAgaWYoaXNEYXNoaW5nICYmIHRpbWVyIC0gZGFzaFRpbWVTdGFtcCA+IGRhc2hDb29sVGltZSkge1xyXG4gICAgICAgICAgICAgICAgaXNEYXNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VydmVyLmVtaXQoJ3VwZGF0ZScsIFtzcGhlcmUucG9zaXRpb24ueCwgc3BoZXJlLnBvc2l0aW9uLnksIHNwaGVyZS5wb3NpdGlvbi56XSwgW3NwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS54LCBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkueSwgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLnpdLCB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgc3BlY3RhdGVDYW0gPSBzY2VuZS5nZXRDYW1lcmFCeU5hbWUoJ3NwZWN0YXRlQ2FtJykgYXMgQkFCWUxPTi5GcmVlQ2FtZXJhXHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5wb3NpdGlvbi54ICs9IHhcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnogKz0gelxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnICcpKXtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnkgKz0gc3BlZWRcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnU2hpZnQnKSkge1xyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0ucG9zaXRpb24ueSAtPSBzcGVlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGlzTW9iaWxlKCkgJiYgbW92aW5nQW5nbGUgIT09IG51bGwpIHttb3ZpbmdBbmdsZSAtPSBhbmdsZTt9XHJcbiAgICAgICAgaWYoc3BoZXJlLnBvc2l0aW9uLnkgPCAtMTAgJiYgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPj0gMSkge1xyXG4gICAgICAgICAgICB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSAtPSAxO1xyXG4gICAgICAgICAgICBpZih3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnZ2FtZU92ZXInLCB3b3JsZC5vd25lcklkKVxyXG4gICAgICAgICAgICAgICAgLy8gZGVhdGggJiYgc3BlY3RhdGUgY2FtXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAganVtcERpdi5zdHlsZS5oZWlnaHQgPSAnMCUnO1xyXG4gICAgICAgICAgICAgICAgZGFzaERpdi5zdHlsZS5oZWlnaHQgPSAnMCUnO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY3RhdGVDYW0gPSBuZXcgQkFCWUxPTi5GcmVlQ2FtZXJhKCdzcGVjdGF0ZUNhbScsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMTAsIDApLCBzY2VuZSk7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5pbmVydGlhID0gaXNNb2JpbGUoKSA/IDAuOCA6IDAuNTtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnNldFRhcmdldChuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgICAgICAgIGNhbWVyYS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueSA9IDU7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucG9zaXRpb24ueiA9IDA7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLnNldExpbmVhclZlbG9jaXR5KG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwwLDApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzY2VuZS5yZW5kZXIoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGlucHV0IGV2ZW50XHJcbiAgICBjb25zdCBrZXlkb3duID0gKGU6S2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpbnB1dEtleXMuaW5jbHVkZXMoZS5rZXkpKSB7XHJcbiAgICAgICAgICAgIGlucHV0S2V5cy5wdXNoKGUua2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBrZXl1cCA9IChlOktleWJvYXJkRXZlbnQpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMgPSBpbnB1dEtleXMuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gZS5rZXkpO1xyXG4gICAgfVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleWRvd24pO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXl1cCk7XHJcbiAgICBcclxuICAgIC8vIHJlc2l6ZSBldmVudFxyXG4gICAgY29uc3QgcmVzaXplID0gKCkgPT4ge1xyXG4gICAgICAgIGVuZ2luZS5yZXNpemUoKVxyXG4gICAgICAgIGNhbVJhZGlvdXMgPSBpc01vYmlsZSgpID8gaW5uZXJXaWR0aCA+IGlubmVySGVpZ2h0ID8gMTMgOiAyMCA6IDEwO1xyXG4gICAgICAgIGNhbWVyYS51cHBlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgICAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplKTtcclxuICAgIFxyXG4gICAgLy8gcG9pbnRlciBsb2NrXHJcbiAgICBjb25zdCBwb2ludGVybG9ja2NoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICBjYW52YXMucmVxdWVzdFBvaW50ZXJMb2NrKCk7XHJcbiAgICAgICAgY2FudmFzLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBvaW50ZXJsb2NrY2hhbmdlKTtcclxuICAgIFxyXG4gICAgLy8gbW9iaWxlIGNvbnRyb2xcclxuICAgIGNvbnN0IG1vYmlsZUxheW91dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2JpbGUtbGF5b3V0JykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBqb3lzdGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3lzdGljaycpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgY29uc3Qgam95c3RpY2tCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuam95c3RpY2stYnV0dG9uJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBpZihpc01vYmlsZSgpKSBtb2JpbGVMYXlvdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBsZXQgc3RhcnRQb2ludCA9IFswLDBdXHJcbiAgICBcclxuICAgIGNvbnN0IGdldFRvdWNoZXNYWSA9IChldmVudDpUb3VjaEV2ZW50KTpbbnVtYmVyLCBudW1iZXJdID0+IHtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WFxyXG4gICAgICAgIGxldCB5ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgICAgZm9yKGxldCBpPTE7IGk8ZXZlbnQudG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBjb25kID0gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRYIDwgeFxyXG4gICAgICAgICAgICB4ID0gY29uZCA/IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WCA6IHhcclxuICAgICAgICAgICAgeSA9IGNvbmQgPyBldmVudC50b3VjaGVzW2ldLmNsaWVudFkgOiB5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbeCwgeV1cclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QganVtcF90b3VjaHN0YXJ0ID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMucHVzaCgnICcpXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywganVtcF90b3VjaHN0YXJ0KVxyXG4gICAgY29uc3QganVtcF90b3VjaGVuZCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICcgJyk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGp1bXBfdG91Y2hlbmQpXHJcblxyXG4gICAgY29uc3QgZGFzaF90b3VjaHN0YXJ0ID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBpbnB1dEtleXMucHVzaCgnU2hpZnQnKVxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuICAgIGRhc2guYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRhc2hfdG91Y2hzdGFydClcclxuICAgIGNvbnN0IGRhc2hfdG91Y2hlbmQgPSAoZXZlbnQ6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cyA9IGlucHV0S2V5cy5maWx0ZXIoKGtleSkgPT4ga2V5ICE9PSAnU2hpZnQnKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcbiAgICBkYXNoLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGFzaF90b3VjaGVuZClcclxuICAgIFxyXG4gICAgY29uc3Qgam95c3RpY2tfdG91Y2hzdGFydCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgW3gsIHldID0gZ2V0VG91Y2hlc1hZKGV2ZW50KVxyXG4gICAgICAgIGpveXN0aWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLmxlZnQgPSBgJHt4fXB4YFxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRvcCA9IGAke3l9cHhgXHJcbiAgICAgICAgc3RhcnRQb2ludCA9IFt4LCB5XVxyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLmxlZnQgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGpveXN0aWNrX3RvdWNoc3RhcnQpO1xyXG4gICAgY29uc3Qgam95c3RpY2tfdG91Y2htb3ZlID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBsZXQgW2R4LCBkeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgZHggLT0gc3RhcnRQb2ludFswXVxyXG4gICAgICAgIGR5IC09IHN0YXJ0UG9pbnRbMV1cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXHJcbiAgICAgICAgY29uc3QgbWF4RGlzdGFuY2UgPSA1MFxyXG4gICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgY29uc3QgeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKGRpc3RhbmNlLCBtYXhEaXN0YW5jZSlcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS5sZWZ0ID0gYCR7eCs1MH1weGBcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSBgJHt5KzUwfXB4YFxyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gKC1hbmdsZSkgLSBNYXRoLlBJLzI7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgam95c3RpY2tfdG91Y2htb3ZlKTtcclxuICAgIGNvbnN0IGpveXN0aWNrX3RvdWNoZW5kID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBqb3lzdGljay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC41cydcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqb3lzdGlja190b3VjaGVuZCk7XHJcbiAgICBcclxuICAgIC8vIGVuZW15IGNyZWF0aW9uXHJcbiAgICBjb25zdCBjcmVhdGVFbmVteSA9IChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBjb25zdCBzcGggPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZShgJHtpZH1gLCB7ZGlhbWV0ZXI6MSwgc2VnbWVudHM6MzJ9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnkgPSBwb3NbMV07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnogPSBwb3NbMl07XHJcbiAgICAgICAgY29uc3Qgc3BoSW1wb3N0ZXIgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3Ioc3BoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3RvciwgeyBtYXNzOiAxLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24sIGZyaWN0aW9uOjEgfSwgc2NlbmUpO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IgPSBzcGhJbXBvc3RlcjtcclxuICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMyh2ZWxvY2l0eVswXSwgdmVsb2NpdHlbMV0sIHZlbG9jaXR5WzJdKSk7XHJcbiAgICAgICAgc3BoLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbaWRdLmNvbG9yKTtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaCk7XHJcbiAgICAgICAgY29uc3QgbmljayA9IHdvcmxkLnBsYXllcnNbaWRdLm5pY2tuYW1lXHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKGAke2lkfS1wbGFuZWAsIHt3aWR0aDogbmljay5sZW5ndGgsIGhlaWdodDogNX0sIHNjZW5lKTtcclxuICAgICAgICBwbGFuZS5iaWxsYm9hcmRNb2RlID0gQkFCWUxPTi5NZXNoLkJJTExCT0FSRE1PREVfQUxMO1xyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi55ID0gcG9zWzFdICsgbmlja25hbWVPZmZzZXRcclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi56ID0gcG9zWzJdXHJcbiAgICAgICAgY29uc3Qgbmlja1RleHR1cmUgPSBHVUkuQWR2YW5jZWREeW5hbWljVGV4dHVyZS5DcmVhdGVGb3JNZXNoKHBsYW5lKTtcclxuICAgICAgICBjb25zdCBuaWNrVGV4dCA9IG5ldyBHVUkuVGV4dEJsb2NrKCk7XHJcbiAgICAgICAgbmlja1RleHQudGV4dCA9IG5pY2s7XHJcbiAgICAgICAgbmlja1RleHQuY29sb3IgPSAnd2hpdGUnO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRTaXplID0gMTAwO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udEZhbWlseSA9ICdBcmlhbCc7XHJcbiAgICAgICAgbmlja1RleHR1cmUuYWRkQ29udHJvbChuaWNrVGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vIHNvY2tldC5pb1xyXG4gICAgc2VydmVyLmVtaXQoJ2luaXQnLCB3b3JsZC5vd25lcklkKVxyXG4gICAgc2VydmVyLm9uKCdpbml0JywgKGRhdGE6IFdvcmxkKSA9PiB7XHJcbiAgICAgICAgd29ybGQgPSBkYXRhO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmZvckVhY2goKGlkOnN0cmluZywgaTpudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgaWYoaWQgPT09IHNlcnZlci5pZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB3b3JsZC5wbGF5ZXJzW2lkXS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgY29uc3QgdmVsb2NpdHkgPSB3b3JsZC5wbGF5ZXJzW2lkXS52ZWxvY2l0eTtcclxuICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBzZXJ2ZXIub24oJ3VwZGF0ZScsIChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBpZihzdGFydGVkICYmIHdvcmxkLnBsYXllcnNbaWRdKXtcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tpZF0ucG9zaXRpb24gPSBwb3M7XHJcbiAgICAgICAgICAgIHdvcmxkLnBsYXllcnNbaWRdLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGlmKGlkID09PSBzZXJ2ZXIuaWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBsYW5lID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShgJHtpZH0tcGxhbmVgKTtcclxuICAgICAgICAgICAgaWYgKHNwaCAmJiBwbGFuZSkge1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi56ID0gcG9zWzJdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueiA9IHBvc1syXVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCByZW1vdmVQbGF5ZXIgPSAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGAke2lkfS1wbGFuZWApO1xyXG4gICAgICAgIGlmIChzcGggJiYgcGxhbmUpIHtcclxuICAgICAgICAgICAgc3BoLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgcGxhbmUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNlcnZlci5vbignZ2FtZU92ZXInLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgIH0pO1xyXG4gICAgc2VydmVyLm9uKCdkaXNjb25uZWN0ZWQnLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgICAgICBkZWxldGUgd29ybGQucGxheWVyc1tpZF07XHJcbiAgICB9KTtcclxuICAgIHNlcnZlci5vbignZ2FtZUVuZCcsICh3aW5uZXJJZDpzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCB3aW5uZXIgPSB3b3JsZC5wbGF5ZXJzW3dpbm5lcklkXVxyXG4gICAgICAgIGNvbnN0IHdpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgd2lubmVyRGl2LmNsYXNzTGlzdC5hZGQoJ3dpbm5lcicpXHJcbiAgICAgICAgd2lubmVyRGl2LmlubmVyVGV4dCA9IGAke3dpbm5lci5uaWNrbmFtZX0gV2luIWBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHdpbm5lckRpdilcclxuICAgICAgICBlbmdpbmUuc3RvcFJlbmRlckxvb3AoKVxyXG4gICAgICAgIGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpXHJcbiAgICAgICAgc2VydmVyLm9mZigndXBkYXRlJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdnYW1lT3ZlcicpXHJcbiAgICAgICAgc2VydmVyLm9mZignZGlzY29ubmVjdGVkJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdnYW1lRW5kJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdpbml0JylcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bik7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXl1cCk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcbiAgICAgICAgbW9iaWxlTGF5b3V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBqb3lzdGlja190b3VjaHN0YXJ0KTtcclxuICAgICAgICBtb2JpbGVMYXlvdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgam95c3RpY2tfdG91Y2htb3ZlKTtcclxuICAgICAgICBtb2JpbGVMYXlvdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqb3lzdGlja190b3VjaGVuZCk7XHJcbiAgICAgICAganVtcC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywganVtcF90b3VjaHN0YXJ0KVxyXG4gICAgICAgIGp1bXAucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqdW1wX3RvdWNoZW5kKVxyXG4gICAgICAgIGRhc2gucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRhc2hfdG91Y2hzdGFydClcclxuICAgICAgICBkYXNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGFzaF90b3VjaGVuZClcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgd2lubmVyRGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAganVtcC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgZGFzaC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICBlbmdpbmUuZGlzcG9zZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfSwgMzAwMClcclxuICAgIH0pXHJcbn1cclxuXHJcbmNvbnN0IG1haW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IG5pY2tuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQubmlja25hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IHN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLnN0YXJ0JykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3QgdGV4dHVyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC50ZXh0dXJlJykgYXMgSFRNTFNlbGVjdEVsZW1lbnRcclxuXHJcbmNvbnN0IHJvb21zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb21zJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgcG9wdXBCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24ucG9wdXAnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5wb3B1cCcpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGJhY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuYmFjaycpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb29tcyA+IC5jb250YWluZXInKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5cclxuY29uc3QgY3JlYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmNyZWF0ZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHJvb21uYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucm9vbW5hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IG1hcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC5tYXAnKSBhcyBIVE1MU2VsZWN0RWxlbWVudFxyXG5jb25zdCBtYXhQbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucGxheWVycycpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuXHJcbmNvbnN0IGluUm9vbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pblJvb20nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBpblJvb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5Sb29tID4gLmNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHN0YXJ0R2FtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5pbml0LWdhbWUnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBwbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnBsYXllcnNCdG4nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5zZXR0aW5nc0J0bicpIGFzIEhUTUxEaXZFbGVtZW50XHJcblxyXG5jb25zdCBlbnRlckdhbWUgPSAoKSA9PiB7XHJcbiAgICBtYWluLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgcm9vbXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbn1cclxuXHJcbmNvbnN0IG9mZlBvcHVwID0gKCkgPT4ge1xyXG4gICAgcG9wdXAuY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICBiYWNrLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG59XHJcblxyXG5jb25zdCBlbnRlclJvb20gPSAoKSA9PiB7XHJcbiAgICByb29tcy5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIGluUm9vbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxufVxyXG5cclxuc2VydmVyLm9uKCdjb25uZWN0JywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCcpO1xyXG4gICAgc2VydmVyLmVtaXQoJ2RlYnVnJywgbmF2aWdhdG9yLnVzZXJBZ2VudClcclxuXHJcbiAgICAvLyBldmVudHNcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLmtleSA9PT0gJ1RhYicpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLmNvZGUgPT09ICdLZXlMJyAmJiBlLmN0cmxLZXkgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT0gJ2RldmVsb3BtZW50Jykge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdsb2cnKVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG5pY2tuYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIHBvcHVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9mZlBvcHVwKVxyXG4gICAgYmFjay5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb2ZmUG9wdXApXHJcblxyXG4gICAgY29uc3QgbG9hZFBsYXllcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobXlXb3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gbXlXb3JsZC5wbGF5ZXJzW2lkXVxyXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuY2xhc3NMaXN0LmFkZCgncGxheWVyJylcclxuICAgICAgICAgICAgcGxheWVyRGl2LmlubmVyVGV4dCA9IHBsYXllci5uaWNrbmFtZVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuc3R5bGUuY29sb3IgPSBwbGF5ZXIuY29sb3JcclxuICAgICAgICAgICAgaW5Sb29tQ29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXllckRpdilcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNhdmVSb29tID0gKCkgPT4ge1xyXG4gICAgICAgIG15V29ybGQuZ3Jhdml0eSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImdyYXZpdHlcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLnNwZWVkID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwic3BlZWRcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmp1bXBIZWlnaHQgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJqdW1wSGVpZ2h0XCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5qdW1wQ29vbHRpbWUgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJqdW1wQ29vbHRpbWVcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmRhc2hQb3dlciA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImRhc2hQb3dlclwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuZGFzaENvb2x0aW1lID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZGFzaENvb2x0aW1lXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5kYW1waW5nID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZGFtcGluZ1wiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQucmVzdGl0dXRpb24gPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJyZXN0aXR1dGlvblwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQubWF4bGlmZSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cIm1heGxpZmVcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgndXBkYXRlUm9vbScsIG15V29ybGQpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbG9hZFNldHRpbmdzID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgc2V0LmNsYXNzTGlzdC5hZGQoJ3NldHRpbmdzJylcclxuICAgICAgICBzZXQuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3Jhdml0eVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImdyYXZpdHlcIj5HcmF2aXR5PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJncmF2aXR5XCIgdmFsdWU9XCIke215V29ybGQuZ3Jhdml0eX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BlZWRcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzcGVlZFwiPlNwZWVkPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJzcGVlZFwiIHZhbHVlPVwiJHtteVdvcmxkLnNwZWVkfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqdW1wSGVpZ2h0XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwianVtcEhlaWdodFwiPkp1bXAgSGVpZ2h0PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJqdW1wSGVpZ2h0XCIgdmFsdWU9XCIke215V29ybGQuanVtcEhlaWdodH1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVtcENvb2x0aW1lXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwianVtcENvb2x0aW1lXCI+SnVtcCBDb29sdGltZTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwianVtcENvb2x0aW1lXCIgdmFsdWU9XCIke215V29ybGQuanVtcENvb2x0aW1lfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoUG93ZXJcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJkYXNoUG93ZXJcIj5EYXNoIFBvd2VyPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJkYXNoUG93ZXJcIiB2YWx1ZT1cIiR7bXlXb3JsZC5kYXNoUG93ZXJ9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hDb29sdGltZVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRhc2hDb29sdGltZVwiPkRhc2ggQ29vbHRpbWU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImRhc2hDb29sdGltZVwiIHZhbHVlPVwiJHtteVdvcmxkLmRhc2hDb29sdGltZX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFtcGluZ1wiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRhbXBpbmdcIj5EYW1waW5nPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJkYW1waW5nXCIgdmFsdWU9XCIke215V29ybGQuZGFtcGluZ31cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVzdGl0dXRpb25cIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJyZXN0aXR1dGlvblwiPlJlc3RpdHV0aW9uPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJyZXN0aXR1dGlvblwiIHZhbHVlPVwiJHtteVdvcmxkLnJlc3RpdHV0aW9ufVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXhsaWZlXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibWF4bGlmZVwiPk1heCBMaWZlPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJtYXhsaWZlXCIgdmFsdWU9XCIke215V29ybGQubWF4bGlmZX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic2F2ZVwiPlNhdmU8L2J1dHRvbj5cclxuICAgICAgICBgXHJcbiAgICAgICAgY29uc3Qgc2F2ZSA9IHNldC5xdWVyeVNlbGVjdG9yKCdidXR0b24uc2F2ZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbiAgICAgICAgc2F2ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVSb29tKVxyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5hcHBlbmQoc2V0KVxyXG4gICAgfVxyXG5cclxuICAgIHNlcnZlci5vbignb3duZXJDaGFuZ2VkJywgKHdvcmxkSWQ6c3RyaW5nLCBuZXdPd25lcklkOnN0cmluZykgPT4ge1xyXG4gICAgICAgIGlmKG15V29ybGQpe1xyXG4gICAgICAgICAgICBpZihteVdvcmxkLm93bmVySWQgIT09IHdvcmxkSWQpIHJldHVybjtcclxuICAgICAgICAgICAgbXlXb3JsZC5vd25lcklkID0gbmV3T3duZXJJZFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdnZXRSb29tcycsICh3b3JsZHM6V29ybGRbXSkgPT4ge1xyXG4gICAgICAgIGlmKCFpblJvb20uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpIHtcclxuICAgICAgICAgICAgbXlXb3JsZCA9IHdvcmxkcy5maW5kKHdvcmxkID0+IHdvcmxkLm93bmVySWQgPT09IG15V29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgaWYobXlXb3JsZCl7XHJcbiAgICAgICAgICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgICAgIGxvYWRQbGF5ZXJzKClcclxuICAgICAgICAgICAgICAgIGlmKG15V29ybGQub3duZXJJZCA9PSBzZXJ2ZXIuaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0R2FtZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIHJvb21zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgbXlXb3JsZCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICB3b3JsZHMuZm9yRWFjaCgod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICAgICAgaWYod29ybGQuc3RhdHVzICE9PSAnd2FpdGluZycpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIHJvb20uY2xhc3NMaXN0LmFkZCgncm9vbScpXHJcbiAgICAgICAgICAgIHJvb20uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hbWVcIj4ke3dvcmxkLm5hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFwXCI+JHt3b3JsZC5tYXB9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGxheWVyc1wiPiR7T2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RofS8ke3dvcmxkLm1heFBsYXllcnN9PC9kaXY+XHJcbiAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgY29uc3Qgam9pbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXHJcbiAgICAgICAgICAgIGpvaW4uY2xhc3NMaXN0LmFkZCgnam9pbicpXHJcbiAgICAgICAgICAgIGpvaW4uaW5uZXJUZXh0ID0gJ0pvaW4nXHJcbiAgICAgICAgICAgIGpvaW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuZW1pdCgnam9pblJvb20nLCB3b3JsZC5vd25lcklkLCBuaWNrbmFtZS52YWx1ZSwgdGV4dHVyZS52YWx1ZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMod29ybGQucGxheWVycykubGVuZ3RoIDwgd29ybGQubWF4UGxheWVycykgcm9vbS5hcHBlbmRDaGlsZChqb2luKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJvb20pXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcblxyXG4gICAgcGxheWVycy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICBsb2FkUGxheWVycygpXHJcbiAgICB9KVxyXG5cclxuICAgIHNldHRpbmdzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIGxvYWRTZXR0aW5ncygpXHJcbiAgICB9KVxyXG5cclxuICAgIGNyZWF0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBzZXJ2ZXIuZW1pdCgnY3JlYXRlUm9vbScsIHJvb21uYW1lLnZhbHVlLCBtYXAudmFsdWUsIE51bWJlcihtYXhQbGF5ZXJzLnZhbHVlKSlcclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdjcmVhdGVkUm9vbScsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIHNlcnZlci5lbWl0KCdqb2luUm9vbScsIHdvcmxkLm93bmVySWQsIG5pY2tuYW1lLnZhbHVlLCB0ZXh0dXJlLnZhbHVlKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2pvaW5lZFJvb20nLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICBlbnRlclJvb20oKVxyXG4gICAgICAgIGlmKHNlcnZlci5pZCA9PSB3b3JsZC5vd25lcklkKXtcclxuICAgICAgICAgICAgc3RhcnRHYW1lLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgc3RhcnRHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGlmKCFteVdvcmxkKSByZXR1cm47XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ3N0YXJ0R2FtZScsIG15V29ybGQub3duZXJJZClcclxuICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignZ2FtZVN0YXJ0ZWQnLCAod29ybGQ6V29ybGQpID0+IHtcclxuICAgICAgICBpZihteVdvcmxkKXtcclxuICAgICAgICAgICAgaWYobXlXb3JsZC5vd25lcklkID09PSB3b3JsZC5vd25lcklkKSB7XHJcbiAgICAgICAgICAgICAgICBpblJvb20uY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICBteVdvcmxkID0gd29ybGRcclxuICAgICAgICAgICAgICAgIGluaXRHYW1lKG15V29ybGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignbG9nJywgKGxvZ2dlcjpzdHJpbmdbXSkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGxvZ2dlci5qb2luKCdcXG4nKSlcclxuICAgIH0pXHJcbn0pIiwiaW1wb3J0ICogYXMgQkFCWUxPTiBmcm9tICdiYWJ5bG9uanMnXHJcblxyXG5leHBvcnQgY29uc3QgY29sb3JzID0ge1xyXG4gICAgcmVkIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDAsIDApLFxyXG4gICAgZ3JlZW4gOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMSwgMCksXHJcbiAgICBibHVlIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDEpLFxyXG4gICAgYXF1YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAxKSxcclxuICAgIG1hZ2VudGEgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMSksXHJcbiAgICB5ZWxsb3cgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMCksXHJcbiAgICBibGFjayA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKSxcclxuICAgIHdoaXRlIDogbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWV0YWxNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBNZXRhbFNwaGVyZU1hdCA9IG5ldyBCQUJZTE9OLlN0YW5kYXJkTWF0ZXJpYWwoJ01ldGFsU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgTWV0YWxTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL2JjLmpwZycsIHNjZW5lKVxyXG4gICAgTWV0YWxTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL24uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5zcGVjdWxhclRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL21ldGFsL20uanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYW8uanBnJywgc2NlbmUpXHJcbiAgICByZXR1cm4gTWV0YWxTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEdyYW5pdGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBHcmFuaXRlU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnR3Jhbml0ZVNwaGVyZU1hdCcsIHNjZW5lKTtcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL24ucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9hLnBuZycsIHNjZW5lKVxyXG4gICAgcmV0dXJuIEdyYW5pdGVTcGhlcmVNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFNxdWFyZVRpbGVNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSk6QkFCWUxPTi5NYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBTcXVhcmVUaWxlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnU3F1YXJlVGlsZU1hdCcsIHNjZW5lKTtcclxuICAgIFNxdWFyZVRpbGVNYXQuZGlmZnVzZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL2JjLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIFNxdWFyZVRpbGVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9yLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5hbWJpZW50VGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYW8ucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gU3F1YXJlVGlsZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q29sb3JNYXQgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgY29sb3I6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IENvbG9yTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnQ29sb3JNYXQnLCBzY2VuZSk7XHJcbiAgICBDb2xvck1hdC5kaWZmdXNlQ29sb3IgPSBjb2xvcnNbY29sb3JdXHJcbiAgICByZXR1cm4gQ29sb3JNYXRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldE1hdGVyaWFsID0gKHNjZW5lOkJBQllMT04uU2NlbmUsIG5hbWU6c3RyaW5nKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIHN3aXRjaChuYW1lKXtcclxuICAgICAgICBjYXNlICdtZXRhbCc6IHJldHVybiBnZXRNZXRhbE1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdncmFuaXRlJzogcmV0dXJuIGdldEdyYW5pdGVNYXQoc2NlbmUpXHJcbiAgICAgICAgY2FzZSAnc3F1YXJlX3RpbGUnOiByZXR1cm4gZ2V0U3F1YXJlVGlsZU1hdChzY2VuZSlcclxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gZ2V0Q29sb3JNYXQoc2NlbmUsIG5hbWUpXHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=