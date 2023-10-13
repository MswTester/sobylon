import { io, Socket } from 'socket.io-client';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import CANNON from 'cannon'
import { getGraniteMat, getMaterial, getMetalMat, getSquareTileMat } from './textures';
import { World } from './types'
import 'babylonjs-loaders/babylon.objFileLoader'

const server = io('/')

window.CANNON = CANNON

const isMobile = ():boolean => {
    return navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone');
};

let myWorld:World|null = null

const initGame = async (thisWorld:World) => {
    // variables initialization
    let inputKeys:string[] = []
    let world:World = thisWorld;
    let movingAngle:number|null = null
    
    const globalDamping = world.damping;
    const globalRestitution = world.restitution;
    let camRadious = isMobile() ? innerWidth > innerHeight ? 13 : 20 : 10;
    const speed = world.speed*0.2;
    const jumpHeight = world.jumpHeight;
    const jumpCoolTime = world.jumpCooltime;
    const nicknameOffset = 1.2;
    
    let timer = 0;

    // elements initialization
    const jump = document.querySelector('.jump') as HTMLDivElement;
    jump.classList.remove('hide')
    
    // game initialization
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    canvas.classList.remove('hide')
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, world.gravity*(-9.81), 0), new BABYLON.CannonJSPlugin());
    
    // my sphere
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter:1, segments:16}, scene);
    sphere.position.x = world.players[server.id].position[0];
    sphere.position.y = world.players[server.id].position[1];
    sphere.position.z = world.players[server.id].position[2];
    sphere.material = getMaterial(scene, world.players[server.id].color);
    const sphereImposter = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: globalRestitution, friction:1 }, scene);
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
    scene.ambientColor = new BABYLON.Color3(1,1,1);
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1,1,0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(60,60,0), scene);
    light1.intensity = 0.5;
    light2.intensity = 0.5;
    
    // shadow
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.useContactHardeningShadow = true;
    shadowGenerator.getShadowMap().renderList.push(sphere);
    
    // map
    let newMeshes = (await BABYLON.SceneLoader.ImportMeshAsync('', 'obj/', 'test1.obj', scene)).meshes;
    engine.hideLoadingUI()
    
    newMeshes.forEach((mesh) => {
        shadowGenerator.getShadowMap().renderList.push(mesh);
        mesh.receiveShadows = true;
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: globalRestitution/5, friction:1, damping:globalDamping }, scene);
    })

    // jump vars
    const jumpDiv = document.querySelector('.jump > div') as HTMLDivElement
    let isJumping = true;
    let jumpTimeStamp = 0;

    // loop
    engine.runRenderLoop(() => {
        timer++;
        camera.setTarget(sphere.position);
        const dx = (camera.target.x - camera.position.x)
        const dz = (camera.target.z - camera.position.z)
        const angle = Math.atan2(dz, dx)
        if(isMobile()) {
            if(movingAngle) movingAngle += angle;
        } else {
            if(inputKeys.includes('w') && inputKeys.includes('a')) {movingAngle = angle + Math.PI/4;}
            else if (inputKeys.includes('w') && inputKeys.includes('d')) {movingAngle = angle - Math.PI/4;}
            else if(inputKeys.includes('s') && inputKeys.includes('a')) {movingAngle = angle + Math.PI/4 * 3;}
            else if(inputKeys.includes('s') && inputKeys.includes('d')) {movingAngle = angle - Math.PI/4 * 3;}
            else if (inputKeys.includes('w')) {movingAngle = angle;}
            else if(inputKeys.includes('s')) {movingAngle = angle + Math.PI;}
            else if(inputKeys.includes('a')) {movingAngle = angle + Math.PI/2;}
            else if(inputKeys.includes('d')) {movingAngle = angle - Math.PI/2;}
            else {movingAngle = null;}
        }
        if(movingAngle !== null){
            const x = Math.cos(movingAngle) * speed
            const z = Math.sin(movingAngle) * speed
            sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(x, 0, z), sphere.getAbsolutePosition());
        }
        if(isMobile() && movingAngle !== null) {movingAngle -= angle;}
        if(sphere.position.y < -10) {
            sphere.position.x = 0;
            sphere.position.y = 5;
            sphere.position.z = 0;
            sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,0));
        }
        if(!isJumping && inputKeys.includes(' ')) {
            sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, jumpHeight, 0), sphere.getAbsolutePosition());
            isJumping = true;
            jumpTimeStamp = timer;
        }
        jumpDiv.style.height = `${timer - jumpTimeStamp > jumpCoolTime ? 100 : (timer - jumpTimeStamp)/jumpCoolTime*100}%`;
        if(isJumping && timer - jumpTimeStamp > jumpCoolTime) {
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
        engine.resize()
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
    const mobileLayout = document.querySelector('.mobile-layout') as HTMLDivElement;
    const joystick = document.querySelector('.joystick') as HTMLDivElement;
    const joystickButton = document.querySelector('.joystick-button') as HTMLDivElement;
    if(isMobile()) mobileLayout.classList.remove('hide')
    let startPoint = [0,0]
    
    const getTouchesXY = (event:TouchEvent):[number, number] => {
        let x = event.touches[0].clientX
        let y = event.touches[0].clientY
        for(let i=1; i<event.touches.length; i++) {
            const cond = event.touches[i].clientX < x
            x = cond ? event.touches[i].clientX : x
            y = cond ? event.touches[i].clientY : y
        }
        return [x, y]
    }
    
    jump.addEventListener('touchstart', event => {
        inputKeys.push(' ')
        event.preventDefault()
    })
    jump.addEventListener('touchend', event => {
        inputKeys = inputKeys.filter((key) => key !== ' ');
        event.preventDefault()
    })
    
    mobileLayout.addEventListener('touchstart', event => {
        const [x, y] = getTouchesXY(event)
        joystick.classList.remove('hide')
        joystick.style.left = `${x}px`
        joystick.style.top = `${y}px`
        startPoint = [x, y]
        joystickButton.style.left = '50px'
        joystickButton.style.top = '50px'
        joystick.style.transition = 'none'
        joystick.style.transform = 'translate(-50%, -50%)'
        movingAngle = null;
    });
    mobileLayout.addEventListener('touchmove', event => {
        let [dx, dy] = getTouchesXY(event)
        dx -= startPoint[0]
        dy -= startPoint[1]
        const distance = Math.sqrt(dx*dx + dy*dy)
        const angle = Math.atan2(dy, dx)
        const maxDistance = 50
        const x = Math.cos(angle) * Math.min(distance, maxDistance)
        const y = Math.sin(angle) * Math.min(distance, maxDistance)
        joystickButton.style.left = `${x+50}px`
        joystickButton.style.top = `${y+50}px`
        movingAngle = (-angle) - Math.PI/2;
    });
    mobileLayout.addEventListener('touchend', event => {
        joystick.classList.add('hide')
        joystick.style.transition = 'opacity 0.5s'
        movingAngle = null;
    });
    
    // enemy creation
    const createEnemy = (id:string, pos:number[], velocity:number[]) => {
        const sph = BABYLON.MeshBuilder.CreateSphere(`${id}`, {diameter:1, segments:32}, scene);
        sph.position.x = pos[0];
        sph.position.y = pos[1];
        sph.position.z = pos[2];
        const sphImposter = new BABYLON.PhysicsImpostor(sph, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: globalRestitution, friction:1 }, scene);
        sph.physicsImpostor = sphImposter;
        sph.physicsImpostor.physicsBody.linearDamping = globalDamping;
        sph.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocity[0], velocity[1], velocity[2]));
        sph.material = getMaterial(scene, world.players[id].color);
        shadowGenerator.getShadowMap().renderList.push(sph);
        const nick = world.players[id].nickname
        const plane = BABYLON.MeshBuilder.CreatePlane(`${id}-plane`, {width: nick.length, height: 5}, scene);
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        plane.position.x = pos[0]
        plane.position.y = pos[1] + nicknameOffset
        plane.position.z = pos[2]
        const nickTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        const nickText = new GUI.TextBlock();
        nickText.text = nick;
        nickText.color = 'white';
        nickText.fontSize = 100;
        nickText.fontWeight = 'bold';
        nickText.fontFamily = 'Arial';
        nickTexture.addControl(nickText);
    }

    let started = false;
    // socket.io
    server.emit('init', world.ownerId)
    server.on('init', (data: World) => {
        world = data;
        Object.keys(world.players).forEach((id:string, i:number) => {
            if(id === server.id) return;
            const pos = world.players[id].position;
            const velocity = world.players[id].velocity;
            createEnemy(id, pos, velocity);
        });
        started = true;
    });
    console.log(world)
    server.on('update', (id:string, pos:number[], velocity:number[]) => {
        if(started && world.players[id]){
            world.players[id].position = pos;
            world.players[id].velocity = velocity;
            if(id === server.id) return;
            const sph = scene.getMeshByName(id);
            const plane = scene.getMeshByName(`${id}-plane`);
            if (sph && plane) {
                sph.position.x = pos[0];
                sph.position.y = pos[1];
                sph.position.z = pos[2];
                sph.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(velocity[0], velocity[1], velocity[2]));
                plane.position.x = pos[0]
                plane.position.y = pos[1] + nicknameOffset
                plane.position.z = pos[2]
            } else {
                createEnemy(id, pos, velocity);
            }
        }
    });
    server.on('disconnected', (id:string) => {
        const sph = scene.getMeshByName(id);
        const plane = scene.getMeshByName(`${id}-plane`);
        if (sph && plane) {
            sph.dispose();
            plane.dispose();
        }
        delete world.players[id];
    });
}

const main = document.querySelector('.main') as HTMLDivElement
const nickname = document.querySelector('input.nickname') as HTMLInputElement
const start = document.querySelector('button.start') as HTMLButtonElement
const texture = document.querySelector('select.texture') as HTMLSelectElement

const rooms = document.querySelector('.rooms') as HTMLDivElement
const popupBtn = document.querySelector('button.popup') as HTMLButtonElement
const popup = document.querySelector('div.popup') as HTMLDivElement
const back = document.querySelector('div.back') as HTMLDivElement
const container = document.querySelector('.rooms > .container') as HTMLDivElement

const create = document.querySelector('button.create') as HTMLButtonElement
const roomname = document.querySelector('input.roomname') as HTMLInputElement
const map = document.querySelector('select.map') as HTMLSelectElement
const maxPlayers = document.querySelector('input.players') as HTMLInputElement

const inRoom = document.querySelector('.inRoom') as HTMLDivElement
const inRoomContainer = document.querySelector('.inRoom > .container') as HTMLDivElement
const startGame = document.querySelector('button.init-game') as HTMLButtonElement
const players = document.querySelector('div.playersBtn') as HTMLDivElement
const settings = document.querySelector('div.settingsBtn') as HTMLDivElement

const enterGame = () => {
    main.classList.add('hide')
    rooms.classList.remove('hide')
}

const offPopup = () => {
    popup.classList.add('hide')
    back.classList.add('hide')
}

const enterRoom = () => {
    rooms.classList.add('hide')
    inRoom.classList.remove('hide')
}

server.on('connect', () => {
    console.log('connected');
    
    // events
    nickname.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            enterGame()
            server.emit('getRooms')
        }
    })
    start.addEventListener('click', () => {
        enterGame()
        server.emit('getRooms')
    })
    
    popupBtn.addEventListener('click', () => {
        popup.classList.remove('hide')
        back.classList.remove('hide')
    })
    
    back.addEventListener('mousedown', offPopup)
    back.addEventListener('touchstart', offPopup)

    const loadPlayers = () => {
        Object.keys(myWorld.players).forEach((id:string) => {
            const player = myWorld.players[id]
            const playerDiv = document.createElement('div')
            playerDiv.classList.add('player')
            playerDiv.innerText = player.nickname
            playerDiv.style.color = player.color
            inRoomContainer.appendChild(playerDiv)
        })
    }

    const loadSettings = () => {
        const set = document.createElement('div')
        set.classList.add('settings')
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
        `
        inRoomContainer.append(set)
    }

    server.on('getRooms', (worlds:World[]) => {
        if(inRoom.classList.contains('hide')){
            container.innerHTML = ''
            console.log(worlds)
            worlds.forEach((world:World) => {
                if(world.status !== 'waiting') return;
                const room = document.createElement('div')
                room.classList.add('room')
                room.innerHTML = `
                    <div class="name">${world.name}</div>
                    <div class="map">${world.map}</div>
                    <div class="players">${Object.keys(world.players).length}/${world.maxPlayers}</div>
                `
                const join = document.createElement('button')
                join.classList.add('join')
                join.innerText = 'Join'
                join.addEventListener('click', () => {
                    if(Object.keys(world.players).length >= world.maxPlayers) return;
                    server.emit('joinRoom', world.ownerId, nickname.value, texture.value)
                })
                room.appendChild(join)
                container.appendChild(room)
            })
        } else {
            myWorld = worlds.find(world => world.ownerId === myWorld.ownerId)
            if(myWorld){
                inRoomContainer.innerHTML = ''
                loadPlayers()
            } else {
                inRoom.classList.add('hide')
                rooms.classList.remove('hide')
                myWorld = null
            }
        }
    })

    players.addEventListener('click', () => {
        inRoomContainer.innerHTML = ''
        loadPlayers()
    })

    settings.addEventListener('click', () => {
        inRoomContainer.innerHTML = ''
        loadSettings()
    })

    create.addEventListener('click', () => {
        server.emit('createRoom', roomname.value, map.value, Number(maxPlayers.value))
    })

    server.on('createdRoom', (world:World) => {
        server.emit('joinRoom', world.ownerId, nickname.value, texture.value)
    })

    server.on('joinedRoom', (world:World) => {
        console.log(world)
        myWorld = world
        enterRoom()
        if(server.id == world.ownerId){
            startGame.classList.remove('hide')
            startGame.addEventListener('click', () => {
                server.emit('startGame', world.ownerId)
                inRoom.classList.add('hide')
            })
            settings.classList.remove('hide')
        }
    })

    server.on('gameStarted', (world:World) => {
        inRoom.classList.add('hide')
        myWorld = world
        initGame(myWorld)
    })
})