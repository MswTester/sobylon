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
    const mapOffset = [0, 0, 0];
    newMeshes.forEach((mesh) => {
        mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, []);
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
            if (inputKeys.includes('KeyW') && inputKeys.includes('KeyA')) {
                movingAngle = angle + Math.PI / 4;
            }
            else if (inputKeys.includes('KeyW') && inputKeys.includes('KeyD')) {
                movingAngle = angle - Math.PI / 4;
            }
            else if (inputKeys.includes('KeyS') && inputKeys.includes('KeyA')) {
                movingAngle = angle + Math.PI / 4 * 3;
            }
            else if (inputKeys.includes('KeyS') && inputKeys.includes('KeyD')) {
                movingAngle = angle - Math.PI / 4 * 3;
            }
            else if (inputKeys.includes('KeyW')) {
                movingAngle = angle;
            }
            else if (inputKeys.includes('KeyS')) {
                movingAngle = angle + Math.PI;
            }
            else if (inputKeys.includes('KeyA')) {
                movingAngle = angle + Math.PI / 2;
            }
            else if (inputKeys.includes('KeyD')) {
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
            if (!isJumping && inputKeys.includes('Space')) {
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
            if (!isDashing && inputKeys.includes('ShiftLeft')) {
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
            if (inputKeys.includes('Space')) {
                spectateCam.position.y += speed;
            }
            else if (inputKeys.includes('ShiftLeft')) {
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
        if (e.code === 'Escape') {
            e.preventDefault();
            document.exitPointerLock();
        }
        if (!inputKeys.includes(e.code)) {
            inputKeys.push(e.code);
        }
    };
    const keyup = (e) => {
        inputKeys = inputKeys.filter((key) => key !== e.code);
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
        inputKeys.push('Space');
        event.preventDefault();
    };
    jump.addEventListener('touchstart', jump_touchstart);
    const jump_touchend = (event) => {
        inputKeys = inputKeys.filter((key) => key !== 'Space');
        event.preventDefault();
    };
    jump.addEventListener('touchend', jump_touchend);
    const dash_touchstart = (event) => {
        inputKeys.push('ShiftLeft');
        event.preventDefault();
    };
    dash.addEventListener('touchstart', dash_touchstart);
    const dash_touchend = (event) => {
        inputKeys = inputKeys.filter((key) => key !== 'ShiftLeft');
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
    let isSettings = false;
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
            <div class="blank"></div>
        `;
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
                isSettings = false;
                startGame.textContent = 'Start';
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
        isSettings = false;
        startGame.textContent = 'Start';
    });
    settings.addEventListener('click', () => {
        inRoomContainer.innerHTML = '';
        loadSettings();
        isSettings = true;
        startGame.textContent = 'Save';
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
        if (isSettings) {
            saveRoom();
        }
        else {
            server.emit('startGame', myWorld.ownerId);
            inRoom.classList.add('hide');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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UUFDUixLQUFLLE9BQU8sQ0FBQyxDQUFDLE9BQU8sdUJBQVcsRUFBQyxLQUFLLENBQUM7UUFDdkMsS0FBSyxTQUFTLENBQUMsQ0FBQyxPQUFPLHlCQUFhLEVBQUMsS0FBSyxDQUFDO1FBQzNDLEtBQUssYUFBYSxDQUFDLENBQUMsT0FBTyw0QkFBZ0IsRUFBQyxLQUFLLENBQUM7UUFDbEQsT0FBTyxDQUFDLENBQUMsT0FBTyx1QkFBVyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7S0FDM0M7QUFDTCxDQUFDO0FBUFksbUJBQVcsZUFPdkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mcm9udC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mcm9udC8uL3NyYy90ZXh0dXJlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbywgU29ja2V0IH0gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XHJcbmltcG9ydCAqIGFzIEJBQllMT04gZnJvbSAnYmFieWxvbmpzJztcclxuaW1wb3J0ICogYXMgR1VJIGZyb20gJ2JhYnlsb25qcy1ndWknO1xyXG5pbXBvcnQgQ0FOTk9OIGZyb20gJ2Nhbm5vbidcclxuaW1wb3J0IHsgZ2V0R3Jhbml0ZU1hdCwgZ2V0TWF0ZXJpYWwsIGdldE1ldGFsTWF0LCBnZXRTcXVhcmVUaWxlTWF0IH0gZnJvbSAnLi90ZXh0dXJlcyc7XHJcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSAnLi90eXBlcydcclxuaW1wb3J0ICdiYWJ5bG9uanMtbG9hZGVycy9iYWJ5bG9uLm9iakZpbGVMb2FkZXInXHJcblxyXG5jb25zdCBzZXJ2ZXIgPSBpbygnLycpXHJcblxyXG53aW5kb3cuQ0FOTk9OID0gQ0FOTk9OXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIChlKSA9PiB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbn0pO1xyXG5cclxuY29uc3QgaXNNb2JpbGUgPSAoKTpib29sZWFuID0+IHtcclxuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdBbmRyb2lkJykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnaVBob25lJyk7XHJcbn07XHJcblxyXG5sZXQgbXlXb3JsZDpXb3JsZHxudWxsID0gbnVsbFxyXG5cclxuY29uc3QgaW5pdEdhbWUgPSBhc3luYyAodGhpc1dvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAvLyB2YXJpYWJsZXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGxldCBpbnB1dEtleXM6c3RyaW5nW10gPSBbXVxyXG4gICAgbGV0IHdvcmxkOldvcmxkID0gdGhpc1dvcmxkO1xyXG4gICAgbGV0IG1vdmluZ0FuZ2xlOm51bWJlcnxudWxsID0gbnVsbFxyXG4gICAgXHJcbiAgICBjb25zdCBnbG9iYWxEYW1waW5nID0gd29ybGQuZGFtcGluZztcclxuICAgIGNvbnN0IGdsb2JhbFJlc3RpdHV0aW9uID0gd29ybGQucmVzdGl0dXRpb247XHJcbiAgICBsZXQgY2FtUmFkaW91cyA9IGlzTW9iaWxlKCkgPyBpbm5lcldpZHRoID4gaW5uZXJIZWlnaHQgPyAxMyA6IDIwIDogMTA7XHJcbiAgICBjb25zdCBzcGVlZCA9IHdvcmxkLnNwZWVkKjAuMjtcclxuICAgIGNvbnN0IGp1bXBIZWlnaHQgPSB3b3JsZC5qdW1wSGVpZ2h0O1xyXG4gICAgY29uc3QganVtcENvb2xUaW1lID0gd29ybGQuanVtcENvb2x0aW1lO1xyXG4gICAgY29uc3QgZGFzaFBvd2VyID0gd29ybGQuZGFzaFBvd2VyXHJcbiAgICBjb25zdCBkYXNoQ29vbFRpbWUgPSB3b3JsZC5kYXNoQ29vbHRpbWVcclxuICAgIGNvbnN0IG5pY2tuYW1lT2Zmc2V0ID0gMS4yO1xyXG4gICAgXHJcbiAgICBsZXQgdGltZXIgPSAwO1xyXG5cclxuICAgIC8vIGVsZW1lbnRzIGluaXRpYWxpemF0aW9uXHJcbiAgICBjb25zdCBqdW1wID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmp1bXAnKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGNvbnN0IGRhc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGFzaCcpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAganVtcC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIGRhc2guY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICBcclxuICAgIC8vIGdhbWUgaW5pdGlhbGl6YXRpb25cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW5kZXJDYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIGNhbnZhcy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIGNvbnN0IGVuZ2luZSA9IG5ldyBCQUJZTE9OLkVuZ2luZShjYW52YXMsIHRydWUpO1xyXG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgQkFCWUxPTi5TY2VuZShlbmdpbmUpO1xyXG4gICAgc2NlbmUuZW5hYmxlUGh5c2ljcyhuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIHdvcmxkLmdyYXZpdHkqKC05LjgxKSwgMCksIG5ldyBCQUJZTE9OLkNhbm5vbkpTUGx1Z2luKCkpO1xyXG4gICAgXHJcbiAgICAvLyBteSBzcGhlcmVcclxuICAgIGNvbnN0IHNwaGVyZSA9IEJBQllMT04uTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlKCdzcGhlcmUnLCB7ZGlhbWV0ZXI6MSwgc2VnbWVudHM6MTZ9LCBzY2VuZSk7XHJcbiAgICBzcGhlcmUucG9zaXRpb24ueCA9IHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5wb3NpdGlvblswXTtcclxuICAgIHNwaGVyZS5wb3NpdGlvbi55ID0gd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLnBvc2l0aW9uWzFdO1xyXG4gICAgc3BoZXJlLnBvc2l0aW9uLnogPSB3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ucG9zaXRpb25bMl07XHJcbiAgICBzcGhlcmUubWF0ZXJpYWwgPSBnZXRNYXRlcmlhbChzY2VuZSwgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmNvbG9yKTtcclxuICAgIGNvbnN0IHNwaGVyZUltcG9zdGVyID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKHNwaGVyZSwgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3IuU3BoZXJlSW1wb3N0b3IsIHsgbWFzczogMSwgcmVzdGl0dXRpb246IGdsb2JhbFJlc3RpdHV0aW9uLCBmcmljdGlvbjoxIH0sIHNjZW5lKTtcclxuICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IgPSBzcGhlcmVJbXBvc3RlcjtcclxuICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IucGh5c2ljc0JvZHkubGluZWFyRGFtcGluZyA9IGdsb2JhbERhbXBpbmc7XHJcblxyXG4gICAgLy8gY2FtZXJhXHJcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQkFCWUxPTi5BcmNSb3RhdGVDYW1lcmEoJ0NhbWVyYScsIDAsIDAsIDEwLCBzcGhlcmUucG9zaXRpb24sIHNjZW5lKTtcclxuICAgIGNhbWVyYS5hdHRhY2hDb250cm9sKGNhbnZhcywgdHJ1ZSk7XHJcbiAgICBjYW1lcmEuaW5lcnRpYSA9IGlzTW9iaWxlKCkgPyAwLjggOiAwLjU7XHJcbiAgICBjYW1lcmEudXBwZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IGNhbVJhZGlvdXM7XHJcbiAgICBcclxuICAgIC8vZm9nXHJcbiAgICBzY2VuZS5mb2dNb2RlID0gQkFCWUxPTi5TY2VuZS5GT0dNT0RFX0VYUDtcclxuICAgIHNjZW5lLmZvZ0RlbnNpdHkgPSAwLjAwNTtcclxuICAgIHNjZW5lLmZvZ0NvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAuOSwgMC45LCAwLjkpO1xyXG4gICAgc2NlbmUuZm9nU3RhcnQgPSAyMC4wO1xyXG4gICAgc2NlbmUuZm9nRW5kID0gNjAuMDtcclxuICAgIFxyXG4gICAgLy9MaWdodFxyXG4gICAgc2NlbmUuYW1iaWVudENvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsMSwxKTtcclxuICAgIHZhciBsaWdodDEgPSBuZXcgQkFCWUxPTi5IZW1pc3BoZXJpY0xpZ2h0KFwibGlnaHQxXCIsIG5ldyBCQUJZTE9OLlZlY3RvcjMoMSwxLDApLCBzY2VuZSk7XHJcbiAgICB2YXIgbGlnaHQyID0gbmV3IEJBQllMT04uUG9pbnRMaWdodChcImxpZ2h0MlwiLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDYwLDYwLDApLCBzY2VuZSk7XHJcbiAgICBsaWdodDEuaW50ZW5zaXR5ID0gMC41O1xyXG4gICAgbGlnaHQyLmludGVuc2l0eSA9IDAuNTtcclxuICAgIFxyXG4gICAgLy8gc2hhZG93XHJcbiAgICBjb25zdCBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgQkFCWUxPTi5TaGFkb3dHZW5lcmF0b3IoMTAyNCwgbGlnaHQyKTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci51c2VDb250YWN0SGFyZGVuaW5nU2hhZG93ID0gdHJ1ZTtcclxuICAgIHNoYWRvd0dlbmVyYXRvci5nZXRTaGFkb3dNYXAoKS5yZW5kZXJMaXN0LnB1c2goc3BoZXJlKTtcclxuICAgIFxyXG4gICAgLy8gbWFwXHJcbiAgICBsZXQgbmV3TWVzaGVzID0gKGF3YWl0IEJBQllMT04uU2NlbmVMb2FkZXIuSW1wb3J0TWVzaEFzeW5jKCcnLCAnb2JqLycsIGAke3dvcmxkLm1hcH0ub2JqYCwgc2NlbmUpKS5tZXNoZXM7XHJcbiAgICBlbmdpbmUuaGlkZUxvYWRpbmdVSSgpXHJcbiAgICBcclxuICAgIGNvbnN0IG1hcE9mZnNldCA9IFswLCAwLCAwXVxyXG5cclxuICAgIG5ld01lc2hlcy5mb3JFYWNoKChtZXNoKSA9PiB7XHJcbiAgICAgICAgbWVzaC5zZXRWZXJ0aWNlc0RhdGEoQkFCWUxPTi5WZXJ0ZXhCdWZmZXIuVVZLaW5kLCBbXSlcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKG1lc2gpO1xyXG4gICAgICAgIG1lc2gucmVjZWl2ZVNoYWRvd3MgPSB0cnVlO1xyXG4gICAgICAgIG1lc2gucGh5c2ljc0ltcG9zdG9yID0gbmV3IEJBQllMT04uUGh5c2ljc0ltcG9zdG9yKG1lc2gsIEJBQllMT04uUGh5c2ljc0ltcG9zdG9yLk1lc2hJbXBvc3RvciwgeyBtYXNzOiAwLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24vNSwgZnJpY3Rpb246MSwgZGFtcGluZzpnbG9iYWxEYW1waW5nIH0sIHNjZW5lKTtcclxuICAgICAgICBtZXNoLnBvc2l0aW9uLnggKz0gbWFwT2Zmc2V0WzBdO1xyXG4gICAgICAgIG1lc2gucG9zaXRpb24ueSArPSBtYXBPZmZzZXRbMV07XHJcbiAgICAgICAgbWVzaC5wb3NpdGlvbi56ICs9IG1hcE9mZnNldFsyXTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8ganVtcCB2YXJzXHJcbiAgICBjb25zdCBqdW1wRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmp1bXAgPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzSnVtcGluZyA9IHRydWU7XHJcbiAgICBsZXQganVtcFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gZGFzaCB2YXJzXHJcbiAgICBjb25zdCBkYXNoRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRhc2ggPiBkaXYnKSBhcyBIVE1MRGl2RWxlbWVudFxyXG4gICAgbGV0IGlzRGFzaGluZyA9IHRydWU7XHJcbiAgICBsZXQgZGFzaFRpbWVTdGFtcCA9IDA7XHJcblxyXG4gICAgLy8gbG9vcFxyXG4gICAgZW5naW5lLnJ1blJlbmRlckxvb3AoKCkgPT4ge1xyXG4gICAgICAgIHRpbWVyKys7XHJcbiAgICAgICAgbGV0IGR4ID0gKGNhbWVyYS50YXJnZXQueCAtIGNhbWVyYS5wb3NpdGlvbi54KVxyXG4gICAgICAgIGxldCBkeiA9IChjYW1lcmEudGFyZ2V0LnogLSBjYW1lcmEucG9zaXRpb24ueilcclxuICAgICAgICBpZih3b3JsZC5wbGF5ZXJzW3NlcnZlci5pZF0ubGlmZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNwZWN0YXRlQ2FtID0gc2NlbmUuZ2V0Q2FtZXJhQnlOYW1lKCdzcGVjdGF0ZUNhbScpIGFzIEJBQllMT04uRnJlZUNhbWVyYVxyXG4gICAgICAgICAgICBpZighc3BlY3RhdGVDYW0pIHJldHVybjtcclxuICAgICAgICAgICAgZHggPSBzcGVjdGF0ZUNhbS50YXJnZXQueCAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnhcclxuICAgICAgICAgICAgZHogPSBzcGVjdGF0ZUNhbS50YXJnZXQueiAtIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnpcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGR6LCBkeClcclxuICAgICAgICBpZihpc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlKSBtb3ZpbmdBbmdsZSArPSBhbmdsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihpbnB1dEtleXMuaW5jbHVkZXMoJ0tleVcnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ0tleUEnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgKyBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ0tleVcnKSAmJiBpbnB1dEtleXMuaW5jbHVkZXMoJ0tleUQnKSkge21vdmluZ0FuZ2xlID0gYW5nbGUgLSBNYXRoLlBJLzQ7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnS2V5UycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnS2V5QScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnS2V5UycpICYmIGlucHV0S2V5cy5pbmNsdWRlcygnS2V5RCcpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSAtIE1hdGguUEkvNCAqIDM7fVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ0tleVcnKSkge21vdmluZ0FuZ2xlID0gYW5nbGU7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnS2V5UycpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEk7fVxyXG4gICAgICAgICAgICBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnS2V5QScpKSB7bW92aW5nQW5nbGUgPSBhbmdsZSArIE1hdGguUEkvMjt9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdLZXlEJykpIHttb3ZpbmdBbmdsZSA9IGFuZ2xlIC0gTWF0aC5QSS8yO31cclxuICAgICAgICAgICAgZWxzZSB7bW92aW5nQW5nbGUgPSBudWxsO31cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPj0gMSl7XHJcbiAgICAgICAgICAgIGlmKG1vdmluZ0FuZ2xlICE9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhtb3ZpbmdBbmdsZSkgKiBzcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIDAsIHopLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW1lcmEuc2V0VGFyZ2V0KHNwaGVyZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmKCFpc0p1bXBpbmcgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdTcGFjZScpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmVsID0gc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpXHJcbiAgICAgICAgICAgICAgICB2ZWwueSA9IDBcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkodmVsKTtcclxuICAgICAgICAgICAgICAgIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuYXBwbHlJbXB1bHNlKG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwganVtcEhlaWdodCwgMCksIHNwaGVyZS5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgaXNKdW1waW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGp1bXBUaW1lU3RhbXAgPSB0aW1lcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBqdW1wRGl2LnN0eWxlLmhlaWdodCA9IGAke3RpbWVyIC0ganVtcFRpbWVTdGFtcCA+IGp1bXBDb29sVGltZSA/IDEwMCA6ICh0aW1lciAtIGp1bXBUaW1lU3RhbXApL2p1bXBDb29sVGltZSoxMDB9JWA7XHJcbiAgICAgICAgICAgIGlmKGlzSnVtcGluZyAmJiB0aW1lciAtIGp1bXBUaW1lU3RhbXAgPiBqdW1wQ29vbFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIGlzSnVtcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKCFpc0Rhc2hpbmcgJiYgaW5wdXRLZXlzLmluY2x1ZGVzKCdTaGlmdExlZnQnKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeCA9IE1hdGguY29zKGFuZ2xlKSAqIGRhc2hQb3dlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IE1hdGguc2luKGFuZ2xlKSAqIGRhc2hQb3dlclxyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKDAsMCwwKSk7XHJcbiAgICAgICAgICAgICAgICBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmFwcGx5SW1wdWxzZShuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIDAsIHopLCBzcGhlcmUuZ2V0QWJzb2x1dGVQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgIGlzRGFzaGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkYXNoVGltZVN0YW1wID0gdGltZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGFzaERpdi5zdHlsZS5oZWlnaHQgPSBgJHt0aW1lciAtIGRhc2hUaW1lU3RhbXAgPiBkYXNoQ29vbFRpbWUgPyAxMDAgOiAodGltZXIgLSBkYXNoVGltZVN0YW1wKS9kYXNoQ29vbFRpbWUqMTAwfSVgO1xyXG4gICAgICAgICAgICBpZihpc0Rhc2hpbmcgJiYgdGltZXIgLSBkYXNoVGltZVN0YW1wID4gZGFzaENvb2xUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpc0Rhc2hpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXJ2ZXIuZW1pdCgndXBkYXRlJywgW3NwaGVyZS5wb3NpdGlvbi54LCBzcGhlcmUucG9zaXRpb24ueSwgc3BoZXJlLnBvc2l0aW9uLnpdLCBbc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5nZXRMaW5lYXJWZWxvY2l0eSgpLngsIHNwaGVyZS5waHlzaWNzSW1wb3N0b3IuZ2V0TGluZWFyVmVsb2NpdHkoKS55LCBzcGhlcmUucGh5c2ljc0ltcG9zdG9yLmdldExpbmVhclZlbG9jaXR5KCkuel0sIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5saWZlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzcGVjdGF0ZUNhbSA9IHNjZW5lLmdldENhbWVyYUJ5TmFtZSgnc3BlY3RhdGVDYW0nKSBhcyBCQUJZTE9OLkZyZWVDYW1lcmFcclxuICAgICAgICAgICAgaWYobW92aW5nQW5nbGUgIT09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeCA9IE1hdGguY29zKG1vdmluZ0FuZ2xlKSAqIHNwZWVkXHJcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gTWF0aC5zaW4obW92aW5nQW5nbGUpICogc3BlZWRcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnggKz0geFxyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0ucG9zaXRpb24ueiArPSB6XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoaW5wdXRLZXlzLmluY2x1ZGVzKCdTcGFjZScpKXtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnkgKz0gc3BlZWRcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGlucHV0S2V5cy5pbmNsdWRlcygnU2hpZnRMZWZ0JykpIHtcclxuICAgICAgICAgICAgICAgIHNwZWN0YXRlQ2FtLnBvc2l0aW9uLnkgLT0gc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihpc01vYmlsZSgpICYmIG1vdmluZ0FuZ2xlICE9PSBudWxsKSB7bW92aW5nQW5nbGUgLT0gYW5nbGU7fVxyXG4gICAgICAgIGlmKHNwaGVyZS5wb3NpdGlvbi55IDwgLTEwICYmIHdvcmxkLnBsYXllcnNbc2VydmVyLmlkXS5saWZlID49IDEpIHtcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgLT0gMTtcclxuICAgICAgICAgICAgaWYod29ybGQucGxheWVyc1tzZXJ2ZXIuaWRdLmxpZmUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VydmVyLmVtaXQoJ2dhbWVPdmVyJywgd29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgICAgIC8vIGRlYXRoICYmIHNwZWN0YXRlIGNhbVxyXG4gICAgICAgICAgICAgICAgc3BoZXJlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIGp1bXBEaXYuc3R5bGUuaGVpZ2h0ID0gJzAlJztcclxuICAgICAgICAgICAgICAgIGRhc2hEaXYuc3R5bGUuaGVpZ2h0ID0gJzAlJztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwZWN0YXRlQ2FtID0gbmV3IEJBQllMT04uRnJlZUNhbWVyYSgnc3BlY3RhdGVDYW0nLCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDEwLCAwKSwgc2NlbmUpO1xyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0uYXR0YWNoQ29udHJvbChjYW52YXMsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgc3BlY3RhdGVDYW0uaW5lcnRpYSA9IGlzTW9iaWxlKCkgPyAwLjggOiAwLjU7XHJcbiAgICAgICAgICAgICAgICBzcGVjdGF0ZUNhbS5zZXRUYXJnZXQobmV3IEJBQllMT04uVmVjdG9yMygwLCAwLCAwKSk7XHJcbiAgICAgICAgICAgICAgICBjYW1lcmEuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnggPSAwO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnkgPSA1O1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBvc2l0aW9uLnogPSAwO1xyXG4gICAgICAgICAgICAgICAgc3BoZXJlLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKDAsMCwwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc2NlbmUucmVuZGVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBpbnB1dCBldmVudFxyXG4gICAgY29uc3Qga2V5ZG93biA9IChlOktleWJvYXJkRXZlbnQpID0+IHtcclxuICAgICAgICBpZiAoZS5jb2RlID09PSAnRXNjYXBlJykge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWlucHV0S2V5cy5pbmNsdWRlcyhlLmNvZGUpKSB7XHJcbiAgICAgICAgICAgIGlucHV0S2V5cy5wdXNoKGUuY29kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3Qga2V5dXAgPSAoZTpLZXlib2FyZEV2ZW50KSA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09IGUuY29kZSk7XHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bik7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGtleXVwKTtcclxuICAgIFxyXG4gICAgLy8gcmVzaXplIGV2ZW50XHJcbiAgICBjb25zdCByZXNpemUgPSAoKSA9PiB7XHJcbiAgICAgICAgZW5naW5lLnJlc2l6ZSgpXHJcbiAgICAgICAgY2FtUmFkaW91cyA9IGlzTW9iaWxlKCkgPyBpbm5lcldpZHRoID4gaW5uZXJIZWlnaHQgPyAxMyA6IDIwIDogMTA7XHJcbiAgICAgICAgY2FtZXJhLnVwcGVyUmFkaXVzTGltaXQgPSBjYW1SYWRpb3VzO1xyXG4gICAgICAgIGNhbWVyYS5sb3dlclJhZGl1c0xpbWl0ID0gY2FtUmFkaW91cztcclxuICAgIH1cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemUpO1xyXG4gICAgXHJcbiAgICAvLyBwb2ludGVyIGxvY2tcclxuICAgIGNvbnN0IHBvaW50ZXJsb2NrY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgIGNhbnZhcy5yZXF1ZXN0UG9pbnRlckxvY2soKTtcclxuICAgICAgICBjYW52YXMuZm9jdXMoKTtcclxuICAgIH1cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcG9pbnRlcmxvY2tjaGFuZ2UpO1xyXG4gICAgXHJcbiAgICAvLyBtb2JpbGUgY29udHJvbFxyXG4gICAgY29uc3QgbW9iaWxlTGF5b3V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1vYmlsZS1sYXlvdXQnKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGNvbnN0IGpveXN0aWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpveXN0aWNrJykgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICBjb25zdCBqb3lzdGlja0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qb3lzdGljay1idXR0b24nKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgIGlmKGlzTW9iaWxlKCkpIG1vYmlsZUxheW91dC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxuICAgIGxldCBzdGFydFBvaW50ID0gWzAsMF1cclxuICAgIFxyXG4gICAgY29uc3QgZ2V0VG91Y2hlc1hZID0gKGV2ZW50OlRvdWNoRXZlbnQpOltudW1iZXIsIG51bWJlcl0gPT4ge1xyXG4gICAgICAgIGxldCB4ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYXHJcbiAgICAgICAgbGV0IHkgPSBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgICBmb3IobGV0IGk9MTsgaTxldmVudC50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbmQgPSBldmVudC50b3VjaGVzW2ldLmNsaWVudFggPCB4XHJcbiAgICAgICAgICAgIHggPSBjb25kID8gZXZlbnQudG91Y2hlc1tpXS5jbGllbnRYIDogeFxyXG4gICAgICAgICAgICB5ID0gY29uZCA/IGV2ZW50LnRvdWNoZXNbaV0uY2xpZW50WSA6IHlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt4LCB5XVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCBqdW1wX3RvdWNoc3RhcnQgPSAoZXZlbnQ6VG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgIGlucHV0S2V5cy5wdXNoKCdTcGFjZScpXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG4gICAganVtcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywganVtcF90b3VjaHN0YXJ0KVxyXG4gICAgY29uc3QganVtcF90b3VjaGVuZCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICdTcGFjZScpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuICAgIGp1bXAuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqdW1wX3RvdWNoZW5kKVxyXG5cclxuICAgIGNvbnN0IGRhc2hfdG91Y2hzdGFydCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzLnB1c2goJ1NoaWZ0TGVmdCcpXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG4gICAgZGFzaC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZGFzaF90b3VjaHN0YXJ0KVxyXG4gICAgY29uc3QgZGFzaF90b3VjaGVuZCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgaW5wdXRLZXlzID0gaW5wdXRLZXlzLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICdTaGlmdExlZnQnKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcbiAgICBkYXNoLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGFzaF90b3VjaGVuZClcclxuICAgIFxyXG4gICAgY29uc3Qgam95c3RpY2tfdG91Y2hzdGFydCA9IChldmVudDpUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgW3gsIHldID0gZ2V0VG91Y2hlc1hZKGV2ZW50KVxyXG4gICAgICAgIGpveXN0aWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLmxlZnQgPSBgJHt4fXB4YFxyXG4gICAgICAgIGpveXN0aWNrLnN0eWxlLnRvcCA9IGAke3l9cHhgXHJcbiAgICAgICAgc3RhcnRQb2ludCA9IFt4LCB5XVxyXG4gICAgICAgIGpveXN0aWNrQnV0dG9uLnN0eWxlLmxlZnQgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSAnNTBweCdcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgam95c3RpY2suc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGpveXN0aWNrX3RvdWNoc3RhcnQpO1xyXG4gICAgY29uc3Qgam95c3RpY2tfdG91Y2htb3ZlID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBsZXQgW2R4LCBkeV0gPSBnZXRUb3VjaGVzWFkoZXZlbnQpXHJcbiAgICAgICAgZHggLT0gc3RhcnRQb2ludFswXVxyXG4gICAgICAgIGR5IC09IHN0YXJ0UG9pbnRbMV1cclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXHJcbiAgICAgICAgY29uc3QgbWF4RGlzdGFuY2UgPSA1MFxyXG4gICAgICAgIGNvbnN0IHggPSBNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLm1pbihkaXN0YW5jZSwgbWF4RGlzdGFuY2UpXHJcbiAgICAgICAgY29uc3QgeSA9IE1hdGguc2luKGFuZ2xlKSAqIE1hdGgubWluKGRpc3RhbmNlLCBtYXhEaXN0YW5jZSlcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS5sZWZ0ID0gYCR7eCs1MH1weGBcclxuICAgICAgICBqb3lzdGlja0J1dHRvbi5zdHlsZS50b3AgPSBgJHt5KzUwfXB4YFxyXG4gICAgICAgIG1vdmluZ0FuZ2xlID0gKC1hbmdsZSkgLSBNYXRoLlBJLzI7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgam95c3RpY2tfdG91Y2htb3ZlKTtcclxuICAgIGNvbnN0IGpveXN0aWNrX3RvdWNoZW5kID0gKGV2ZW50OlRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICBqb3lzdGljay5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICBqb3lzdGljay5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC41cydcclxuICAgICAgICBtb3ZpbmdBbmdsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBtb2JpbGVMYXlvdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqb3lzdGlja190b3VjaGVuZCk7XHJcbiAgICBcclxuICAgIC8vIGVuZW15IGNyZWF0aW9uXHJcbiAgICBjb25zdCBjcmVhdGVFbmVteSA9IChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBjb25zdCBzcGggPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZShgJHtpZH1gLCB7ZGlhbWV0ZXI6MSwgc2VnbWVudHM6MzJ9LCBzY2VuZSk7XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnkgPSBwb3NbMV07XHJcbiAgICAgICAgc3BoLnBvc2l0aW9uLnogPSBwb3NbMl07XHJcbiAgICAgICAgY29uc3Qgc3BoSW1wb3N0ZXIgPSBuZXcgQkFCWUxPTi5QaHlzaWNzSW1wb3N0b3Ioc3BoLCBCQUJZTE9OLlBoeXNpY3NJbXBvc3Rvci5TcGhlcmVJbXBvc3RvciwgeyBtYXNzOiAxLCByZXN0aXR1dGlvbjogZ2xvYmFsUmVzdGl0dXRpb24sIGZyaWN0aW9uOjEgfSwgc2NlbmUpO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3IgPSBzcGhJbXBvc3RlcjtcclxuICAgICAgICBzcGgucGh5c2ljc0ltcG9zdG9yLnBoeXNpY3NCb2R5LmxpbmVhckRhbXBpbmcgPSBnbG9iYWxEYW1waW5nO1xyXG4gICAgICAgIHNwaC5waHlzaWNzSW1wb3N0b3Iuc2V0TGluZWFyVmVsb2NpdHkobmV3IEJBQllMT04uVmVjdG9yMyh2ZWxvY2l0eVswXSwgdmVsb2NpdHlbMV0sIHZlbG9jaXR5WzJdKSk7XHJcbiAgICAgICAgc3BoLm1hdGVyaWFsID0gZ2V0TWF0ZXJpYWwoc2NlbmUsIHdvcmxkLnBsYXllcnNbaWRdLmNvbG9yKTtcclxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuZ2V0U2hhZG93TWFwKCkucmVuZGVyTGlzdC5wdXNoKHNwaCk7XHJcbiAgICAgICAgY29uc3QgbmljayA9IHdvcmxkLnBsYXllcnNbaWRdLm5pY2tuYW1lXHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBCQUJZTE9OLk1lc2hCdWlsZGVyLkNyZWF0ZVBsYW5lKGAke2lkfS1wbGFuZWAsIHt3aWR0aDogbmljay5sZW5ndGgsIGhlaWdodDogNX0sIHNjZW5lKTtcclxuICAgICAgICBwbGFuZS5iaWxsYm9hcmRNb2RlID0gQkFCWUxPTi5NZXNoLkJJTExCT0FSRE1PREVfQUxMO1xyXG4gICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi55ID0gcG9zWzFdICsgbmlja25hbWVPZmZzZXRcclxuICAgICAgICBwbGFuZS5wb3NpdGlvbi56ID0gcG9zWzJdXHJcbiAgICAgICAgY29uc3Qgbmlja1RleHR1cmUgPSBHVUkuQWR2YW5jZWREeW5hbWljVGV4dHVyZS5DcmVhdGVGb3JNZXNoKHBsYW5lKTtcclxuICAgICAgICBjb25zdCBuaWNrVGV4dCA9IG5ldyBHVUkuVGV4dEJsb2NrKCk7XHJcbiAgICAgICAgbmlja1RleHQudGV4dCA9IG5pY2s7XHJcbiAgICAgICAgbmlja1RleHQuY29sb3IgPSAnd2hpdGUnO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRTaXplID0gMTAwO1xyXG4gICAgICAgIG5pY2tUZXh0LmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgICAgbmlja1RleHQuZm9udEZhbWlseSA9ICdBcmlhbCc7XHJcbiAgICAgICAgbmlja1RleHR1cmUuYWRkQ29udHJvbChuaWNrVGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIC8vIHNvY2tldC5pb1xyXG4gICAgc2VydmVyLmVtaXQoJ2luaXQnLCB3b3JsZC5vd25lcklkKVxyXG4gICAgc2VydmVyLm9uKCdpbml0JywgKGRhdGE6IFdvcmxkKSA9PiB7XHJcbiAgICAgICAgd29ybGQgPSBkYXRhO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHdvcmxkLnBsYXllcnMpLmZvckVhY2goKGlkOnN0cmluZywgaTpudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgaWYoaWQgPT09IHNlcnZlci5pZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB3b3JsZC5wbGF5ZXJzW2lkXS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgY29uc3QgdmVsb2NpdHkgPSB3b3JsZC5wbGF5ZXJzW2lkXS52ZWxvY2l0eTtcclxuICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBzZXJ2ZXIub24oJ3VwZGF0ZScsIChpZDpzdHJpbmcsIHBvczpudW1iZXJbXSwgdmVsb2NpdHk6bnVtYmVyW10pID0+IHtcclxuICAgICAgICBpZihzdGFydGVkICYmIHdvcmxkLnBsYXllcnNbaWRdKXtcclxuICAgICAgICAgICAgd29ybGQucGxheWVyc1tpZF0ucG9zaXRpb24gPSBwb3M7XHJcbiAgICAgICAgICAgIHdvcmxkLnBsYXllcnNbaWRdLnZlbG9jaXR5ID0gdmVsb2NpdHk7XHJcbiAgICAgICAgICAgIGlmKGlkID09PSBzZXJ2ZXIuaWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBsYW5lID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShgJHtpZH0tcGxhbmVgKTtcclxuICAgICAgICAgICAgaWYgKHNwaCAmJiBwbGFuZSkge1xyXG4gICAgICAgICAgICAgICAgc3BoLnBvc2l0aW9uLnggPSBwb3NbMF07XHJcbiAgICAgICAgICAgICAgICBzcGgucG9zaXRpb24ueSA9IHBvc1sxXTtcclxuICAgICAgICAgICAgICAgIHNwaC5wb3NpdGlvbi56ID0gcG9zWzJdO1xyXG4gICAgICAgICAgICAgICAgc3BoLnBoeXNpY3NJbXBvc3Rvci5zZXRMaW5lYXJWZWxvY2l0eShuZXcgQkFCWUxPTi5WZWN0b3IzKHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnggPSBwb3NbMF1cclxuICAgICAgICAgICAgICAgIHBsYW5lLnBvc2l0aW9uLnkgPSBwb3NbMV0gKyBuaWNrbmFtZU9mZnNldFxyXG4gICAgICAgICAgICAgICAgcGxhbmUucG9zaXRpb24ueiA9IHBvc1syXVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlRW5lbXkoaWQsIHBvcywgdmVsb2NpdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCByZW1vdmVQbGF5ZXIgPSAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BoID0gc2NlbmUuZ2V0TWVzaEJ5TmFtZShpZCk7XHJcbiAgICAgICAgY29uc3QgcGxhbmUgPSBzY2VuZS5nZXRNZXNoQnlOYW1lKGAke2lkfS1wbGFuZWApO1xyXG4gICAgICAgIGlmIChzcGggJiYgcGxhbmUpIHtcclxuICAgICAgICAgICAgc3BoLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgcGxhbmUuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNlcnZlci5vbignZ2FtZU92ZXInLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgIH0pO1xyXG4gICAgc2VydmVyLm9uKCdkaXNjb25uZWN0ZWQnLCAoaWQ6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmVtb3ZlUGxheWVyKGlkKTtcclxuICAgICAgICBkZWxldGUgd29ybGQucGxheWVyc1tpZF07XHJcbiAgICB9KTtcclxuICAgIHNlcnZlci5vbignZ2FtZUVuZCcsICh3aW5uZXJJZDpzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCB3aW5uZXIgPSB3b3JsZC5wbGF5ZXJzW3dpbm5lcklkXVxyXG4gICAgICAgIGNvbnN0IHdpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgd2lubmVyRGl2LmNsYXNzTGlzdC5hZGQoJ3dpbm5lcicpXHJcbiAgICAgICAgd2lubmVyRGl2LmlubmVyVGV4dCA9IGAke3dpbm5lci5uaWNrbmFtZX0gV2luIWBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHdpbm5lckRpdilcclxuICAgICAgICBlbmdpbmUuc3RvcFJlbmRlckxvb3AoKVxyXG4gICAgICAgIGRvY3VtZW50LmV4aXRQb2ludGVyTG9jaygpXHJcbiAgICAgICAgc2VydmVyLm9mZigndXBkYXRlJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdnYW1lT3ZlcicpXHJcbiAgICAgICAgc2VydmVyLm9mZignZGlzY29ubmVjdGVkJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdnYW1lRW5kJylcclxuICAgICAgICBzZXJ2ZXIub2ZmKCdpbml0JylcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bik7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXl1cCk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwb2ludGVybG9ja2NoYW5nZSk7XHJcbiAgICAgICAgbW9iaWxlTGF5b3V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBqb3lzdGlja190b3VjaHN0YXJ0KTtcclxuICAgICAgICBtb2JpbGVMYXlvdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgam95c3RpY2tfdG91Y2htb3ZlKTtcclxuICAgICAgICBtb2JpbGVMYXlvdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqb3lzdGlja190b3VjaGVuZCk7XHJcbiAgICAgICAganVtcC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywganVtcF90b3VjaHN0YXJ0KVxyXG4gICAgICAgIGp1bXAucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBqdW1wX3RvdWNoZW5kKVxyXG4gICAgICAgIGRhc2gucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRhc2hfdG91Y2hzdGFydClcclxuICAgICAgICBkYXNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZGFzaF90b3VjaGVuZClcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgd2lubmVyRGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAganVtcC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgZGFzaC5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICBlbmdpbmUuZGlzcG9zZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfSwgMzAwMClcclxuICAgIH0pXHJcbn1cclxuXHJcbmNvbnN0IG1haW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IG5pY2tuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQubmlja25hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IHN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLnN0YXJ0JykgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcclxuY29uc3QgdGV4dHVyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC50ZXh0dXJlJykgYXMgSFRNTFNlbGVjdEVsZW1lbnRcclxuXHJcbmNvbnN0IHJvb21zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvb21zJykgYXMgSFRNTERpdkVsZW1lbnRcclxuY29uc3QgcG9wdXBCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24ucG9wdXAnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5wb3B1cCcpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGJhY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXYuYmFjaycpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb29tcyA+IC5jb250YWluZXInKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5cclxuY29uc3QgY3JlYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmNyZWF0ZScpIGFzIEhUTUxCdXR0b25FbGVtZW50XHJcbmNvbnN0IHJvb21uYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucm9vbW5hbWUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XHJcbmNvbnN0IG1hcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC5tYXAnKSBhcyBIVE1MU2VsZWN0RWxlbWVudFxyXG5jb25zdCBtYXhQbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQucGxheWVycycpIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuXHJcbmNvbnN0IGluUm9vbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pblJvb20nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBpblJvb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5Sb29tID4gLmNvbnRhaW5lcicpIGFzIEhUTUxEaXZFbGVtZW50XHJcbmNvbnN0IHN0YXJ0R2FtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5pbml0LWdhbWUnKSBhcyBIVE1MQnV0dG9uRWxlbWVudFxyXG5jb25zdCBwbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2LnBsYXllcnNCdG4nKSBhcyBIVE1MRGl2RWxlbWVudFxyXG5jb25zdCBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5zZXR0aW5nc0J0bicpIGFzIEhUTUxEaXZFbGVtZW50XHJcblxyXG5jb25zdCBlbnRlckdhbWUgPSAoKSA9PiB7XHJcbiAgICBtYWluLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgcm9vbXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbn1cclxuXHJcbmNvbnN0IG9mZlBvcHVwID0gKCkgPT4ge1xyXG4gICAgcG9wdXAuY2xhc3NMaXN0LmFkZCgnaGlkZScpXHJcbiAgICBiYWNrLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG59XHJcblxyXG5jb25zdCBlbnRlclJvb20gPSAoKSA9PiB7XHJcbiAgICByb29tcy5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgIGluUm9vbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcclxufVxyXG5cclxuc2VydmVyLm9uKCdjb25uZWN0JywgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCcpO1xyXG4gICAgc2VydmVyLmVtaXQoJ2RlYnVnJywgbmF2aWdhdG9yLnVzZXJBZ2VudClcclxuXHJcbiAgICAvLyBldmVudHNcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLmtleSA9PT0gJ1RhYicpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLmNvZGUgPT09ICdLZXlMJyAmJiBlLmN0cmxLZXkgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT0gJ2RldmVsb3BtZW50Jykge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdsb2cnKVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG5pY2tuYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgIGlmKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgICAgIHNlcnZlci5lbWl0KCdnZXRSb29tcycpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGVudGVyR2FtZSgpXHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2dldFJvb21zJylcclxuICAgIH0pXHJcbiAgICBcclxuICAgIHBvcHVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBiYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9mZlBvcHVwKVxyXG4gICAgYmFjay5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb2ZmUG9wdXApXHJcblxyXG4gICAgY29uc3QgbG9hZFBsYXllcnMgPSAoKSA9PiB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobXlXb3JsZC5wbGF5ZXJzKS5mb3JFYWNoKChpZDpzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcGxheWVyID0gbXlXb3JsZC5wbGF5ZXJzW2lkXVxyXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuY2xhc3NMaXN0LmFkZCgncGxheWVyJylcclxuICAgICAgICAgICAgcGxheWVyRGl2LmlubmVyVGV4dCA9IHBsYXllci5uaWNrbmFtZVxyXG4gICAgICAgICAgICBwbGF5ZXJEaXYuc3R5bGUuY29sb3IgPSBwbGF5ZXIuY29sb3JcclxuICAgICAgICAgICAgaW5Sb29tQ29udGFpbmVyLmFwcGVuZENoaWxkKHBsYXllckRpdilcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBpc1NldHRpbmdzID0gZmFsc2VcclxuXHJcbiAgICBjb25zdCBzYXZlUm9vbSA9ICgpID0+IHtcclxuICAgICAgICBteVdvcmxkLmdyYXZpdHkgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJncmF2aXR5XCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5zcGVlZCA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInNwZWVkXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5qdW1wSGVpZ2h0ID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwianVtcEhlaWdodFwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuanVtcENvb2x0aW1lID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwianVtcENvb2x0aW1lXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgbXlXb3JsZC5kYXNoUG93ZXIgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJkYXNoUG93ZXJcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLmRhc2hDb29sdGltZSA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImRhc2hDb29sdGltZVwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKVxyXG4gICAgICAgIG15V29ybGQuZGFtcGluZyA9IE51bWJlcigoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImRhbXBpbmdcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLnJlc3RpdHV0aW9uID0gTnVtYmVyKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicmVzdGl0dXRpb25cIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSlcclxuICAgICAgICBteVdvcmxkLm1heGxpZmUgPSBOdW1iZXIoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJtYXhsaWZlXCJdJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpXHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ3VwZGF0ZVJvb20nLCBteVdvcmxkKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvYWRTZXR0aW5ncyA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIHNldC5jbGFzc0xpc3QuYWRkKCdzZXR0aW5ncycpXHJcbiAgICAgICAgc2V0LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyYXZpdHlcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJncmF2aXR5XCI+R3Jhdml0eTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwiZ3Jhdml0eVwiIHZhbHVlPVwiJHtteVdvcmxkLmdyYXZpdHl9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwZWVkXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwic3BlZWRcIj5TcGVlZDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwic3BlZWRcIiB2YWx1ZT1cIiR7bXlXb3JsZC5zcGVlZH1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVtcEhlaWdodFwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImp1bXBIZWlnaHRcIj5KdW1wIEhlaWdodDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwianVtcEhlaWdodFwiIHZhbHVlPVwiJHtteVdvcmxkLmp1bXBIZWlnaHR9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImp1bXBDb29sdGltZVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImp1bXBDb29sdGltZVwiPkp1bXAgQ29vbHRpbWU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwicm9vbS1zZXRcIiB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImp1bXBDb29sdGltZVwiIHZhbHVlPVwiJHtteVdvcmxkLmp1bXBDb29sdGltZX1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaFBvd2VyXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGFzaFBvd2VyXCI+RGFzaCBQb3dlcjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwiZGFzaFBvd2VyXCIgdmFsdWU9XCIke215V29ybGQuZGFzaFBvd2VyfVwiIHN0ZXA9XCIwLjFcIj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoQ29vbHRpbWVcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJkYXNoQ29vbHRpbWVcIj5EYXNoIENvb2x0aW1lPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInJvb20tc2V0XCIgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJkYXNoQ29vbHRpbWVcIiB2YWx1ZT1cIiR7bXlXb3JsZC5kYXNoQ29vbHRpbWV9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhbXBpbmdcIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJkYW1waW5nXCI+RGFtcGluZzwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwiZGFtcGluZ1wiIHZhbHVlPVwiJHtteVdvcmxkLmRhbXBpbmd9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlc3RpdHV0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwicmVzdGl0dXRpb25cIj5SZXN0aXR1dGlvbjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwicmVzdGl0dXRpb25cIiB2YWx1ZT1cIiR7bXlXb3JsZC5yZXN0aXR1dGlvbn1cIiBzdGVwPVwiMC4xXCI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWF4bGlmZVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cIm1heGxpZmVcIj5NYXggTGlmZTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJyb29tLXNldFwiIHR5cGU9XCJudW1iZXJcIiBuYW1lPVwibWF4bGlmZVwiIHZhbHVlPVwiJHtteVdvcmxkLm1heGxpZmV9XCIgc3RlcD1cIjAuMVwiPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJsYW5rXCI+PC9kaXY+XHJcbiAgICAgICAgYFxyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5hcHBlbmQoc2V0KVxyXG4gICAgfVxyXG5cclxuICAgIHNlcnZlci5vbignb3duZXJDaGFuZ2VkJywgKHdvcmxkSWQ6c3RyaW5nLCBuZXdPd25lcklkOnN0cmluZykgPT4ge1xyXG4gICAgICAgIGlmKG15V29ybGQpe1xyXG4gICAgICAgICAgICBpZihteVdvcmxkLm93bmVySWQgIT09IHdvcmxkSWQpIHJldHVybjtcclxuICAgICAgICAgICAgbXlXb3JsZC5vd25lcklkID0gbmV3T3duZXJJZFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdnZXRSb29tcycsICh3b3JsZHM6V29ybGRbXSkgPT4ge1xyXG4gICAgICAgIGlmKCFpblJvb20uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpIHtcclxuICAgICAgICAgICAgbXlXb3JsZCA9IHdvcmxkcy5maW5kKHdvcmxkID0+IHdvcmxkLm93bmVySWQgPT09IG15V29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgaWYobXlXb3JsZCl7XHJcbiAgICAgICAgICAgICAgICBpblJvb21Db250YWluZXIuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgICAgIGxvYWRQbGF5ZXJzKClcclxuICAgICAgICAgICAgICAgIGlzU2V0dGluZ3MgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgc3RhcnRHYW1lLnRleHRDb250ZW50ID0gJ1N0YXJ0J1xyXG4gICAgICAgICAgICAgICAgaWYobXlXb3JsZC5vd25lcklkID09IHNlcnZlci5pZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRHYW1lLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgICAgICAgICAgcm9vbXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgICAgICAgICBteVdvcmxkID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIHdvcmxkcy5mb3JFYWNoKCh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgICAgICBpZih3b3JsZC5zdGF0dXMgIT09ICd3YWl0aW5nJykgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCByb29tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgcm9vbS5jbGFzc0xpc3QuYWRkKCdyb29tJylcclxuICAgICAgICAgICAgcm9vbS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmFtZVwiPiR7d29ybGQubmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXBcIj4ke3dvcmxkLm1hcH08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwbGF5ZXJzXCI+JHtPYmplY3Qua2V5cyh3b3JsZC5wbGF5ZXJzKS5sZW5ndGh9LyR7d29ybGQubWF4UGxheWVyc308L2Rpdj5cclxuICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICBjb25zdCBqb2luID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcclxuICAgICAgICAgICAgam9pbi5jbGFzc0xpc3QuYWRkKCdqb2luJylcclxuICAgICAgICAgICAgam9pbi5pbm5lclRleHQgPSAnSm9pbidcclxuICAgICAgICAgICAgam9pbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNlcnZlci5lbWl0KCdqb2luUm9vbScsIHdvcmxkLm93bmVySWQsIG5pY2tuYW1lLnZhbHVlLCB0ZXh0dXJlLnZhbHVlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpZihPYmplY3Qua2V5cyh3b3JsZC5wbGF5ZXJzKS5sZW5ndGggPCB3b3JsZC5tYXhQbGF5ZXJzKSByb29tLmFwcGVuZENoaWxkKGpvaW4pO1xyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocm9vbSlcclxuICAgICAgICB9KVxyXG4gICAgfSlcclxuXHJcbiAgICBwbGF5ZXJzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIGxvYWRQbGF5ZXJzKClcclxuICAgICAgICBpc1NldHRpbmdzID0gZmFsc2VcclxuICAgICAgICBzdGFydEdhbWUudGV4dENvbnRlbnQgPSAnU3RhcnQnXHJcbiAgICB9KVxyXG5cclxuICAgIHNldHRpbmdzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIGluUm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIGxvYWRTZXR0aW5ncygpXHJcbiAgICAgICAgaXNTZXR0aW5ncyA9IHRydWVcclxuICAgICAgICBzdGFydEdhbWUudGV4dENvbnRlbnQgPSAnU2F2ZSdcclxuICAgIH0pXHJcblxyXG4gICAgY3JlYXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHNlcnZlci5lbWl0KCdjcmVhdGVSb29tJywgcm9vbW5hbWUudmFsdWUsIG1hcC52YWx1ZSwgTnVtYmVyKG1heFBsYXllcnMudmFsdWUpKVxyXG4gICAgfSlcclxuXHJcbiAgICBzZXJ2ZXIub24oJ2NyZWF0ZWRSb29tJywgKHdvcmxkOldvcmxkKSA9PiB7XHJcbiAgICAgICAgc2VydmVyLmVtaXQoJ2pvaW5Sb29tJywgd29ybGQub3duZXJJZCwgbmlja25hbWUudmFsdWUsIHRleHR1cmUudmFsdWUpXHJcbiAgICB9KVxyXG5cclxuICAgIHNlcnZlci5vbignam9pbmVkUm9vbScsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIG15V29ybGQgPSB3b3JsZFxyXG4gICAgICAgIGVudGVyUm9vbSgpXHJcbiAgICAgICAgaWYoc2VydmVyLmlkID09IHdvcmxkLm93bmVySWQpe1xyXG4gICAgICAgICAgICBzdGFydEdhbWUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXHJcbiAgICAgICAgICAgIHNldHRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICBzdGFydEdhbWUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgaWYoIW15V29ybGQpIHJldHVybjtcclxuICAgICAgICBpZihpc1NldHRpbmdzKSB7c2F2ZVJvb20oKX1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VydmVyLmVtaXQoJ3N0YXJ0R2FtZScsIG15V29ybGQub3duZXJJZClcclxuICAgICAgICAgICAgaW5Sb29tLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdnYW1lU3RhcnRlZCcsICh3b3JsZDpXb3JsZCkgPT4ge1xyXG4gICAgICAgIGlmKG15V29ybGQpe1xyXG4gICAgICAgICAgICBpZihteVdvcmxkLm93bmVySWQgPT09IHdvcmxkLm93bmVySWQpIHtcclxuICAgICAgICAgICAgICAgIGluUm9vbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcclxuICAgICAgICAgICAgICAgIG15V29ybGQgPSB3b3JsZFxyXG4gICAgICAgICAgICAgICAgaW5pdEdhbWUobXlXb3JsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgc2VydmVyLm9uKCdsb2cnLCAobG9nZ2VyOnN0cmluZ1tdKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2cobG9nZ2VyLmpvaW4oJ1xcbicpKVxyXG4gICAgfSlcclxufSkiLCJpbXBvcnQgKiBhcyBCQUJZTE9OIGZyb20gJ2JhYnlsb25qcydcclxuXHJcbmV4cG9ydCBjb25zdCBjb2xvcnMgPSB7XHJcbiAgICByZWQgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMCksXHJcbiAgICBncmVlbiA6IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAxLCAwKSxcclxuICAgIGJsdWUgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMSksXHJcbiAgICBhcXVhIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDEsIDEpLFxyXG4gICAgbWFnZW50YSA6IG5ldyBCQUJZTE9OLkNvbG9yMygxLCAwLCAxKSxcclxuICAgIHllbGxvdyA6IG5ldyBCQUJZTE9OLkNvbG9yMygxLCAxLCAwKSxcclxuICAgIGJsYWNrIDogbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApLFxyXG4gICAgd2hpdGUgOiBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMSksXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRNZXRhbE1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IE1ldGFsU3BoZXJlTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbCgnTWV0YWxTcGhlcmVNYXQnLCBzY2VuZSk7XHJcbiAgICBNZXRhbFNwaGVyZU1hdC5kaWZmdXNlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvYmMuanBnJywgc2NlbmUpXHJcbiAgICBNZXRhbFNwaGVyZU1hdC5idW1wVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvbi5qcGcnLCBzY2VuZSlcclxuICAgIE1ldGFsU3BoZXJlTWF0LmVtaXNzaXZlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvbS5qcGcnLCBzY2VuZSlcclxuICAgIE1ldGFsU3BoZXJlTWF0LnNwZWN1bGFyVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvbWV0YWwvbS5qcGcnLCBzY2VuZSlcclxuICAgIE1ldGFsU3BoZXJlTWF0LmFtYmllbnRUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9tZXRhbC9hby5qcGcnLCBzY2VuZSlcclxuICAgIHJldHVybiBNZXRhbFNwaGVyZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0R3Jhbml0ZU1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IEdyYW5pdGVTcGhlcmVNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdHcmFuaXRlU3BoZXJlTWF0Jywgc2NlbmUpO1xyXG4gICAgR3Jhbml0ZVNwaGVyZU1hdC5kaWZmdXNlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvZ3Jhbml0ZS9iYy5wbmcnLCBzY2VuZSlcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuYnVtcFRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL2dyYW5pdGUvbi5wbmcnLCBzY2VuZSlcclxuICAgIEdyYW5pdGVTcGhlcmVNYXQuZW1pc3NpdmVUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL3IucG5nJywgc2NlbmUpXHJcbiAgICBHcmFuaXRlU3BoZXJlTWF0LmFtYmllbnRUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9ncmFuaXRlL2EucG5nJywgc2NlbmUpXHJcbiAgICByZXR1cm4gR3Jhbml0ZVNwaGVyZU1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0U3F1YXJlVGlsZU1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lKTpCQUJZTE9OLk1hdGVyaWFsID0+IHtcclxuICAgIGNvbnN0IFNxdWFyZVRpbGVNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdTcXVhcmVUaWxlTWF0Jywgc2NlbmUpO1xyXG4gICAgU3F1YXJlVGlsZU1hdC5kaWZmdXNlVGV4dHVyZSA9IG5ldyBCQUJZTE9OLlRleHR1cmUoJ3RleHR1cmUvc3F1YXJlX3RpbGUvYmMucG5nJywgc2NlbmUpXHJcbiAgICBTcXVhcmVUaWxlTWF0LmJ1bXBUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9uLnBuZycsIHNjZW5lKVxyXG4gICAgU3F1YXJlVGlsZU1hdC5lbWlzc2l2ZVRleHR1cmUgPSBuZXcgQkFCWUxPTi5UZXh0dXJlKCd0ZXh0dXJlL3NxdWFyZV90aWxlL3IucG5nJywgc2NlbmUpXHJcbiAgICBTcXVhcmVUaWxlTWF0LmFtYmllbnRUZXh0dXJlID0gbmV3IEJBQllMT04uVGV4dHVyZSgndGV4dHVyZS9zcXVhcmVfdGlsZS9hby5wbmcnLCBzY2VuZSlcclxuICAgIHJldHVybiBTcXVhcmVUaWxlTWF0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRDb2xvck1hdCA9IChzY2VuZTpCQUJZTE9OLlNjZW5lLCBjb2xvcjpzdHJpbmcpOkJBQllMT04uTWF0ZXJpYWwgPT4ge1xyXG4gICAgY29uc3QgQ29sb3JNYXQgPSBuZXcgQkFCWUxPTi5TdGFuZGFyZE1hdGVyaWFsKCdDb2xvck1hdCcsIHNjZW5lKTtcclxuICAgIENvbG9yTWF0LmRpZmZ1c2VDb2xvciA9IGNvbG9yc1tjb2xvcl1cclxuICAgIHJldHVybiBDb2xvck1hdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWF0ZXJpYWwgPSAoc2NlbmU6QkFCWUxPTi5TY2VuZSwgbmFtZTpzdHJpbmcpOkJBQllMT04uTWF0ZXJpYWwgPT4ge1xyXG4gICAgc3dpdGNoKG5hbWUpe1xyXG4gICAgICAgIGNhc2UgJ21ldGFsJzogcmV0dXJuIGdldE1ldGFsTWF0KHNjZW5lKVxyXG4gICAgICAgIGNhc2UgJ2dyYW5pdGUnOiByZXR1cm4gZ2V0R3Jhbml0ZU1hdChzY2VuZSlcclxuICAgICAgICBjYXNlICdzcXVhcmVfdGlsZSc6IHJldHVybiBnZXRTcXVhcmVUaWxlTWF0KHNjZW5lKVxyXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBnZXRDb2xvck1hdChzY2VuZSwgbmFtZSlcclxuICAgIH1cclxufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==