import { io, Socket } from 'socket.io-client';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import CANNON from 'cannon'
import { getGraniteMat, getMaterial, getMetalMat, getSquareTileMat } from './textures';
import { World } from './types'
import 'babylonjs-loaders/babylon.objFileLoader'

const server = io('/')

window.CANNON = CANNON

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

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
    const speed = world.speed*0.3;
    const jumpHeight = world.jumpHeight;
    const jumpCoolTime = world.jumpCooltime;
    const dashPower = world.dashPower
    const dashCoolTime = world.dashCooltime
    const nicknameOffset = 1.2;
    
    let timer = 0;

    // elements initialization
    const jump = document.querySelector('.jump') as HTMLDivElement;
    const dash = document.querySelector('.dash') as HTMLDivElement;
    jump.classList.remove('hide')
    dash.classList.remove('hide')
    
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
    let newMeshes = (await BABYLON.SceneLoader.ImportMeshAsync('', 'obj/', `${world.map}.obj`, scene)).meshes;
    engine.hideLoadingUI()
    
    const mapOffset = [0, 0, 0]

    newMeshes.forEach((mesh) => {
        mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, [])
        shadowGenerator.getShadowMap().renderList.push(mesh);
        mesh.receiveShadows = true;
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: globalRestitution/5, friction:1, damping:globalDamping }, scene);
        mesh.position.x += mapOffset[0];
        mesh.position.y += mapOffset[1];
        mesh.position.z += mapOffset[2];
    })

    // jump vars
    const jumpDiv = document.querySelector('.jump > div') as HTMLDivElement
    let isJumping = true;
    let jumpTimeStamp = 0;

    // dash vars
    const dashDiv = document.querySelector('.dash > div') as HTMLDivElement
    let isDashing = true;
    let dashTimeStamp = 0;

    // loop
    engine.runRenderLoop(() => {
        timer++;
        let dx = (camera.target.x - camera.position.x)
        let dz = (camera.target.z - camera.position.z)
        if(world.players[server.id].life <= 0) {
            const spectateCam = scene.getCameraByName('spectateCam') as BABYLON.FreeCamera
            if(!spectateCam) return;
            dx = spectateCam.target.x - spectateCam.position.x
            dz = spectateCam.target.z - spectateCam.position.z
        }
        const angle = Math.atan2(dz, dx)
        if(isMobile()) {
            if(movingAngle) movingAngle += angle;
        } else {
            if(inputKeys.includes('KeyW') && inputKeys.includes('KeyA')) {movingAngle = angle + Math.PI/4;}
            else if (inputKeys.includes('KeyW') && inputKeys.includes('KeyD')) {movingAngle = angle - Math.PI/4;}
            else if(inputKeys.includes('KeyS') && inputKeys.includes('KeyA')) {movingAngle = angle + Math.PI/4 * 3;}
            else if(inputKeys.includes('KeyS') && inputKeys.includes('KeyD')) {movingAngle = angle - Math.PI/4 * 3;}
            else if (inputKeys.includes('KeyW')) {movingAngle = angle;}
            else if(inputKeys.includes('KeyS')) {movingAngle = angle + Math.PI;}
            else if(inputKeys.includes('KeyA')) {movingAngle = angle + Math.PI/2;}
            else if(inputKeys.includes('KeyD')) {movingAngle = angle - Math.PI/2;}
            else {movingAngle = null;}
        }
        if(world.players[server.id].life >= 1){
            if(movingAngle !== null){
                const x = Math.cos(movingAngle) * speed
                const z = Math.sin(movingAngle) * speed
                sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(x, 0, z), sphere.getAbsolutePosition());
            }
            camera.setTarget(sphere.position);
            if(!isJumping && inputKeys.includes('Space')) {
                let vel = sphere.physicsImpostor.getLinearVelocity()
                vel.y = 0
                sphere.physicsImpostor.setLinearVelocity(vel);
                sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, jumpHeight, 0), sphere.getAbsolutePosition());
                isJumping = true;
                jumpTimeStamp = timer;
            }
            jumpDiv.style.height = `${timer - jumpTimeStamp > jumpCoolTime ? 100 : (timer - jumpTimeStamp)/jumpCoolTime*100}%`;
            if(isJumping && timer - jumpTimeStamp > jumpCoolTime) {
                isJumping = false;
            }
            if(!isDashing && inputKeys.includes('ShiftLeft')) {
                const x = Math.cos(angle) * dashPower
                const z = Math.sin(angle) * dashPower
                sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,0));
                sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(x, 0, z), sphere.getAbsolutePosition());
                isDashing = true;
                dashTimeStamp = timer;
            }
            dashDiv.style.height = `${timer - dashTimeStamp > dashCoolTime ? 100 : (timer - dashTimeStamp)/dashCoolTime*100}%`;
            if(isDashing && timer - dashTimeStamp > dashCoolTime) {
                isDashing = false;
            }
            server.emit('update', [sphere.position.x, sphere.position.y, sphere.position.z], [sphere.physicsImpostor.getLinearVelocity().x, sphere.physicsImpostor.getLinearVelocity().y, sphere.physicsImpostor.getLinearVelocity().z], world.players[server.id].life);
        } else {
            const spectateCam = scene.getCameraByName('spectateCam') as BABYLON.FreeCamera
            if(movingAngle !== null){
                const x = Math.cos(movingAngle) * speed
                const z = Math.sin(movingAngle) * speed
                spectateCam.position.x += x
                spectateCam.position.z += z
            }
            if(inputKeys.includes('Space')){
                spectateCam.position.y += speed
            } else if(inputKeys.includes('ShiftLeft')) {
                spectateCam.position.y -= speed
            }
        }
        if(isMobile() && movingAngle !== null) {movingAngle -= angle;}
        if(sphere.position.y < -10 && world.players[server.id].life >= 1) {
            world.players[server.id].life -= 1;
            if(world.players[server.id].life <= 0) {
                server.emit('gameOver', world.ownerId)
                // death && spectate cam
                sphere.dispose();
                jumpDiv.style.height = '0%';
                dashDiv.style.height = '0%';
                const spectateCam = new BABYLON.FreeCamera('spectateCam', new BABYLON.Vector3(0, 10, 0), scene);
                spectateCam.attachControl(canvas, true);
                spectateCam.inertia = isMobile() ? 0.8 : 0.5;
                spectateCam.setTarget(new BABYLON.Vector3(0, 0, 0));
                camera.dispose();
            } else {
                sphere.position.x = 0;
                sphere.position.y = 5;
                sphere.position.z = 0;
                sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,0));
            }
        }
        scene.render();
    });

    // input event
    const keydown = (e:KeyboardEvent) => {
        if (e.code === 'Escape') {
            e.preventDefault();
            document.exitPointerLock();
        }
        if (!inputKeys.includes(e.code)) {
            inputKeys.push(e.code);
        }
    }
    const keyup = (e:KeyboardEvent) => {
        inputKeys = inputKeys.filter((key) => key !== e.code);
    }
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    
    // resize event
    const resize = () => {
        engine.resize()
        camRadious = isMobile() ? innerWidth > innerHeight ? 13 : 20 : 10;
        camera.upperRadiusLimit = camRadious;
        camera.lowerRadiusLimit = camRadious;
    }
    window.addEventListener('resize', resize);
    
    // pointer lock
    const pointerlockchange = () => {
        canvas.requestPointerLock();
        canvas.focus();
    }
    document.addEventListener('click', pointerlockchange);
    
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
    
    const jump_touchstart = (event:TouchEvent) => {
        inputKeys.push('Space')
        event.preventDefault()
    }
    jump.addEventListener('touchstart', jump_touchstart)
    const jump_touchend = (event:TouchEvent) => {
        inputKeys = inputKeys.filter((key) => key !== 'Space');
        event.preventDefault()
    }
    jump.addEventListener('touchend', jump_touchend)

    const dash_touchstart = (event:TouchEvent) => {
        inputKeys.push('ShiftLeft')
        event.preventDefault()
    }
    dash.addEventListener('touchstart', dash_touchstart)
    const dash_touchend = (event:TouchEvent) => {
        inputKeys = inputKeys.filter((key) => key !== 'ShiftLeft');
        event.preventDefault()
    }
    dash.addEventListener('touchend', dash_touchend)
    
    const joystick_touchstart = (event:TouchEvent) => {
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
    }
    mobileLayout.addEventListener('touchstart', joystick_touchstart);
    const joystick_touchmove = (event:TouchEvent) => {
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
    }
    mobileLayout.addEventListener('touchmove', joystick_touchmove);
    const joystick_touchend = (event:TouchEvent) => {
        joystick.classList.add('hide')
        joystick.style.transition = 'opacity 0.5s'
        movingAngle = null;
    }
    mobileLayout.addEventListener('touchend', joystick_touchend);
    
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
    const removePlayer = (id:string) => {
        const sph = scene.getMeshByName(id);
        const plane = scene.getMeshByName(`${id}-plane`);
        if (sph && plane) {
            sph.dispose();
            plane.dispose();
        }
    }
    server.on('gameOver', (id:string) => {
        removePlayer(id);
    });
    server.on('disconnected', (id:string) => {
        removePlayer(id);
        delete world.players[id];
    });
    server.on('gameEnd', (winnerId:string) => {
        const winner = world.players[winnerId]
        const winnerDiv = document.createElement('div')
        winnerDiv.classList.add('winner')
        winnerDiv.innerText = `${winner.nickname} Win!`
        document.body.appendChild(winnerDiv)
        engine.stopRenderLoop()
        document.exitPointerLock()
        server.off('update')
        server.off('gameOver')
        server.off('disconnected')
        server.off('gameEnd')
        server.off('init')
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
        window.removeEventListener('resize', resize);
        document.removeEventListener('click', pointerlockchange);
        mobileLayout.removeEventListener('touchstart', joystick_touchstart);
        mobileLayout.removeEventListener('touchmove', joystick_touchmove);
        mobileLayout.removeEventListener('touchend', joystick_touchend);
        jump.removeEventListener('touchstart', jump_touchstart)
        jump.removeEventListener('touchend', jump_touchend)
        dash.removeEventListener('touchstart', dash_touchstart)
        dash.removeEventListener('touchend', dash_touchend)
        setTimeout(() => {
            winnerDiv.remove()
            canvas.classList.add('hide')
            jump.classList.add('hide')
            dash.classList.add('hide')
            inRoom.classList.remove('hide')
            engine.dispose()
            server.emit('getRooms')
        }, 3000)
    })
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
    server.emit('debug', navigator.userAgent)

    // events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
        }
        if(e.code === 'KeyL' && e.ctrlKey && process.env.NODE_ENV == 'development') {
            e.preventDefault();
            server.emit('log')
        }
    });

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

    let isSettings = false

    const saveRoom = () => {
        myWorld.map = (document.querySelector('select[name="map"]') as HTMLSelectElement).value
        myWorld.gravity = Number((document.querySelector('input[name="gravity"]') as HTMLInputElement).value)
        myWorld.speed = Number((document.querySelector('input[name="speed"]') as HTMLInputElement).value)
        myWorld.jumpHeight = Number((document.querySelector('input[name="jumpHeight"]') as HTMLInputElement).value)
        myWorld.jumpCooltime = Number((document.querySelector('input[name="jumpCooltime"]') as HTMLInputElement).value)
        myWorld.dashPower = Number((document.querySelector('input[name="dashPower"]') as HTMLInputElement).value)
        myWorld.dashCooltime = Number((document.querySelector('input[name="dashCooltime"]') as HTMLInputElement).value)
        myWorld.damping = Number((document.querySelector('input[name="damping"]') as HTMLInputElement).value)
        myWorld.restitution = Number((document.querySelector('input[name="restitution"]') as HTMLInputElement).value)
        myWorld.maxlife = Number((document.querySelector('input[name="maxlife"]') as HTMLInputElement).value)
        server.emit('updateRoom', myWorld)
    }

    const loadSettings = () => {
        const set = document.createElement('div')
        set.classList.add('settings')
        set.innerHTML = `
            <div class="map">
                <label for="map">Map</label>
                <select class="room-set" name="map">
                    <option value="spintower">Spin Tower</option>
                    <option value="bridge">Bridge</option>
                    <option value="thefield">The Field</option>
                    <option value="blackhole">Black Hole</option>
                    <option value="space">Space</option>
                    <option value="donut">Donut</option>
                </select>
            </div>
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
        `
        inRoomContainer.append(set)
    }

    server.on('ownerChanged', (worldId:string, newOwnerId:string) => {
        if(myWorld){
            if(myWorld.ownerId !== worldId) return;
            myWorld.ownerId = newOwnerId
        }
    })

    server.on('getRooms', (worlds:World[]) => {
        if(!inRoom.classList.contains('hide')) {
            myWorld = worlds.find(world => world.ownerId === myWorld.ownerId)
            if(myWorld){
                inRoomContainer.innerHTML = ''
                loadPlayers()
                isSettings = false
                startGame.textContent = 'Start'
                if(myWorld.ownerId == server.id){
                    startGame.classList.remove('hide')
                    settings.classList.remove('hide')
                }
            } else {
                inRoom.classList.add('hide')
                rooms.classList.remove('hide')
                myWorld = null
            }
        }
        container.innerHTML = ''
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
                server.emit('joinRoom', world.ownerId, nickname.value, texture.value)
            })
            if(Object.keys(world.players).length < world.maxPlayers) room.appendChild(join);
            container.appendChild(room)
        })
    })

    players.addEventListener('click', () => {
        inRoomContainer.innerHTML = ''
        loadPlayers()
        isSettings = false
        startGame.textContent = 'Start'
    })

    settings.addEventListener('click', () => {
        inRoomContainer.innerHTML = ''
        loadSettings()
        isSettings = true
        startGame.textContent = 'Save'
    })

    create.addEventListener('click', () => {
        server.emit('createRoom', roomname.value, map.value, Number(maxPlayers.value))
    })

    server.on('createdRoom', (world:World) => {
        server.emit('joinRoom', world.ownerId, nickname.value, texture.value)
    })

    server.on('joinedRoom', (world:World) => {
        myWorld = world
        enterRoom()
        if(server.id == world.ownerId){
            startGame.classList.remove('hide')
            settings.classList.remove('hide')
        }
    })
    startGame.addEventListener('click', () => {
        if(!myWorld) return;
        if(isSettings) {saveRoom()}
        else {
            server.emit('startGame', myWorld.ownerId)
            inRoom.classList.add('hide')
        }
    })

    server.on('gameStarted', (world:World) => {
        if(myWorld){
            if(myWorld.ownerId === world.ownerId) {
                inRoom.classList.add('hide')
                myWorld = world
                initGame(myWorld)
            }
        }
    })

    server.on('log', (logger:string[]) => {
        console.log(logger.join('\n'))
    })
})