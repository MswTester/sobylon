import * as BABYLON from 'babylonjs'

export const colors = {
    red : new BABYLON.Color3(1, 0, 0),
    green : new BABYLON.Color3(0, 1, 0),
    blue : new BABYLON.Color3(0, 0, 1),
    aqua : new BABYLON.Color3(0, 1, 1),
    magenta : new BABYLON.Color3(1, 0, 1),
    yellow : new BABYLON.Color3(1, 1, 0),
    black : new BABYLON.Color3(0, 0, 0),
    white : new BABYLON.Color3(1, 1, 1),
}

export const getMetalMat = (scene:BABYLON.Scene):BABYLON.Material => {
    const MetalSphereMat = new BABYLON.StandardMaterial('MetalSphereMat', scene);
    MetalSphereMat.diffuseTexture = new BABYLON.Texture('texture/metal/bc.jpg', scene)
    MetalSphereMat.bumpTexture = new BABYLON.Texture('texture/metal/n.jpg', scene)
    MetalSphereMat.emissiveTexture = new BABYLON.Texture('texture/metal/m.jpg', scene)
    MetalSphereMat.specularTexture = new BABYLON.Texture('texture/metal/m.jpg', scene)
    MetalSphereMat.ambientTexture = new BABYLON.Texture('texture/metal/ao.jpg', scene)
    return MetalSphereMat
}

export const getGraniteMat = (scene:BABYLON.Scene):BABYLON.Material => {
    const GraniteSphereMat = new BABYLON.StandardMaterial('GraniteSphereMat', scene);
    GraniteSphereMat.diffuseTexture = new BABYLON.Texture('texture/granite/bc.png', scene)
    GraniteSphereMat.bumpTexture = new BABYLON.Texture('texture/granite/n.png', scene)
    GraniteSphereMat.emissiveTexture = new BABYLON.Texture('texture/granite/r.png', scene)
    GraniteSphereMat.ambientTexture = new BABYLON.Texture('texture/granite/a.png', scene)
    return GraniteSphereMat
}

export const getSquareTileMat = (scene:BABYLON.Scene):BABYLON.Material => {
    const SquareTileMat = new BABYLON.StandardMaterial('SquareTileMat', scene);
    SquareTileMat.diffuseTexture = new BABYLON.Texture('texture/square_tile/bc.png', scene)
    SquareTileMat.bumpTexture = new BABYLON.Texture('texture/square_tile/n.png', scene)
    SquareTileMat.emissiveTexture = new BABYLON.Texture('texture/square_tile/r.png', scene)
    SquareTileMat.ambientTexture = new BABYLON.Texture('texture/square_tile/ao.png', scene)
    return SquareTileMat
}

export const getColorMat = (scene:BABYLON.Scene, color:string):BABYLON.Material => {
    const ColorMat = new BABYLON.StandardMaterial('ColorMat', scene);
    ColorMat.diffuseColor = colors[color]
    return ColorMat
}

export const getMaterial = (scene:BABYLON.Scene, name:string):BABYLON.Material => {
    switch(name){
        case 'metal': return getMetalMat(scene)
        case 'granite': return getGraniteMat(scene)
        case 'square_tile': return getSquareTileMat(scene)
        default: return getColorMat(scene, name)
    }
}