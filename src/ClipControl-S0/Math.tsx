import {Matrix} from "ml-matrix";

export const rotatePoint = (point: Matrix, rotation: number) => {
    let rotation2 = degreesToRadians(rotation)
    return getRotationMatrix(rotation2).mmul(point)
}

export const getRotationMatrix = (rotation: number) => {
    return new Matrix([
        [Math.cos(rotation), -Math.sin(rotation)],
        [Math.sin(rotation), Math.cos(rotation)]
    ])
}

export const getTranslationMatrix = (transX: number, transY: number) => {
    return new Matrix([
        [transX],
        [transY]
    ])
}

export const getScaleMatrix = (scaleX: number, scaleY: number) => {
    return new Matrix([
        [scaleX, 0],
        [0, scaleY],
    ])
}

export const getHomogeneousRotationMatrix = (rotation: number) => {
    return new Matrix([
        [Math.cos(rotation), -Math.sin(rotation), 0],
        [Math.sin(rotation), Math.cos(rotation), 0],
        [0, 0, 1],
    ])
}

export const getHomogeneousTranslationMatrix = (transX: number, transY: number) => {
    return new Matrix([
        [1, 0, transX],
        [0, 1, transY],
        [0, 0, 1]
    ])
}

export const getHomogeneousScaleMatrix = (scaleX: number, scaleY: number) => {
    return new Matrix([
        [scaleX, 0, 0],
        [0, scaleY, 0],
        [0, 0, 1],
    ])
}

export const coordinateMapScreenToCartesian = (canvasWidth: number, canvasHeight: number, screenX: number, screenY: number) => {
    let screenPos = new Matrix([
        [screenX],
        [screenY]
    ])
    let flipY = new Matrix([
        [1, 0],
        [0,  -1]
    ])
    let trans = new Matrix([
        [-canvasWidth/2],
        [canvasHeight/2]
    ])

    return flipY.mmul(screenPos).add(trans)
}

export const coordinateMapCartesianToScreen = (canvasWidth: number, canvasHeight: number, cartesianX: number, cartesianY: number) => {
    let cartesianPos = new Matrix([
        [cartesianX],
        [cartesianY]
    ])
    let trans = new Matrix([
        [canvasWidth/2],
        [-canvasHeight/2]
    ])
    let flipY = new Matrix([
        [1, 0],
        [0, -1]
    ])
    return flipY.mmul(cartesianPos.add(trans))
}

export const degreesToRadians = (deg: number) => (deg * Math.PI) / 180.0
