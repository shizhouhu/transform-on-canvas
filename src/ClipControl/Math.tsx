// @ts-ignore
import {Matrix, inverse} from 'ml-matrix'

export interface TransformData {
    rotation: number
    scaleX: number
    scaleY: number
    transX: number
    transY: number
}

export const rotatePoint = (point: Matrix, rotation: number) => {
    let rotation2 = degreesToRadians(rotation)
    return getRotationMatrix(rotation2).mmul(point)
}

export const getRotationMatrix = (rotation: number) => {
    return new Matrix([
        [Math.cos(rotation), -Math.sin(rotation)],
        [Math.sin(rotation), Math.cos(rotation)],
    ])
}

export const getTranslationMatrix = (transX: number, transY: number) => {
    return new Matrix([[transX], [transY]])
}

export const getScaleMatrix = (scaleX: number, scaleY: number) => {
    return new Matrix([
        [scaleX, 0],
        [0, scaleY],
    ])
}

export const getHomogeneousRotationMatrix = (rotation: number) => {
    let rotation2 = degreesToRadians(rotation)
    return new Matrix([
        [Math.cos(rotation2), -Math.sin(rotation2), 0],
        [Math.sin(rotation2), Math.cos(rotation2), 0],
        [0, 0, 1],
    ])
}

export const getHomogeneousTranslationMatrix = (
    transX: number,
    transY: number,
) => {
    return new Matrix([
        [1, 0, transX],
        [0, 1, transY],
        [0, 0, 1],
    ])
}

export const getHomogeneousScaleMatrix = (scaleX: number, scaleY: number) => {
    return new Matrix([
        [scaleX, 0, 0],
        [0, scaleY, 0],
        [0, 0, 1],
    ])
}

export const coordinateMapNDCToViewport = (
    ndcX: number,
    ndcY: number,
    viewportMinX: number,
    viewportMinY: number,
    viewportMaxX: number,
    viewportMaxY: number,
) => {
    let viewportX =
        ((ndcX - -1) / 2.0) * (viewportMaxX - viewportMinX) + viewportMinX
    let viewportY =
        ((ndcY - -1) / 2.0) * (viewportMaxY - viewportMinY) + viewportMinY
    return new Matrix([[viewportX], [viewportY]])
}

export const coordinateMapViewportToNDC = (
    viewportX: number,
    viewportY: number,
    viewportMinX: number,
    viewportMinY: number,
    viewportMaxX: number,
    viewportMaxY: number,
) => {
    let ndcX =
        ((viewportX - viewportMinX) / (viewportMaxX - viewportMinX)) * 2 - 1
    let ndcY =
        ((viewportY - viewportMinY) / (viewportMaxY - viewportMinY)) * 2 - 1
    return new Matrix([[ndcX], [ndcY]])
}

export const coordinateMapScreenToCartesian = (
    canvasWidth: number,
    canvasHeight: number,
    screenX: number,
    screenY: number,
) => {
    let screenPos = new Matrix([[screenX], [screenY]])
    let flipY = new Matrix([
        [1, 0],
        [0, -1],
    ])
    let trans = new Matrix([[-canvasWidth / 2], [canvasHeight / 2]])

    return flipY.mmul(screenPos).add(trans)
}

export const coordinateMapCartesianToScreen = (
    canvasWidth: number,
    canvasHeight: number,
    cartesianX: number,
    cartesianY: number,
) => {
    let cartesianPos = new Matrix([[cartesianX], [cartesianY]])
    let trans = new Matrix([[canvasWidth / 2], [-canvasHeight / 2]])
    let flipY = new Matrix([
        [1, 0],
        [0, -1],
    ])
    return flipY.mmul(cartesianPos.add(trans))
}

export const degreesToRadians = (deg: number) => (deg * Math.PI) / 180.0

export const transformPoint = (
    cartesianX: number,
    cartesianY: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    transX: number,
    transY: number
) => {
    let rotationM = getHomogeneousRotationMatrix(rotation)
    let scaleM = getHomogeneousScaleMatrix(scaleX, scaleY)
    let transM = getHomogeneousTranslationMatrix(transX, transY)
    let m = transM.mmul(scaleM.mmul(rotationM))
    let point = new Matrix([[cartesianX], [cartesianY], [1]])
    point = m.mmul(point)
    return new Matrix([[point.get(0, 0)], [point.get(1, 0)]])
}

export const transformPointAndMapToScreen = (
    canvasWidth: number,
    canvasHeight: number,
    cartesianX: number,
    cartesianY: number,
    transform: TransformData
) => {
    let rotationM = getHomogeneousRotationMatrix(transform.rotation)
    let scaleM = getHomogeneousScaleMatrix(transform.scaleX, transform.scaleY)
    let transM = getHomogeneousTranslationMatrix(transform.transX, transform.transY)
    let m = transM.mmul(scaleM.mmul(rotationM))
    let point = new Matrix([[cartesianX], [cartesianY], [1]])
    point = m.mmul(point)

    point = coordinateMapCartesianToScreen(
        canvasWidth,
        canvasHeight,
        point.get(0, 0),
        point.get(1, 0),
    )
    return point
}

export const transformPointAndMapToCartesian = (
    canvasWidth: number,
    canvasHeight: number,
    screenX: number,
    screenY: number,
    transform: TransformData
) => {
    let point = new Matrix([[screenX], [screenY]])
    point = coordinateMapScreenToCartesian(
        canvasWidth,
        canvasHeight,
        point.get(0, 0),
        point.get(1, 0),
    )

    let rotationM = getHomogeneousRotationMatrix(transform.rotation)
    let scaleM = getHomogeneousScaleMatrix(transform.scaleX, transform.scaleY)
    let transM = getHomogeneousTranslationMatrix(transform.transX, transform.transY)
    let m = transM.mmul(scaleM.mmul(rotationM))
    m = inverse(m)

    point = m.mmul(new Matrix([[point.get(0, 0)], [point.get(1, 0)], [1]]))
    return new Matrix([[point.get(0, 0)], [point.get(1, 0)]])
}

const rotatePointAndMapToScreen = (
    canvasWidth: number,
    canvasHeight: number,
    cartesianX: number,
    cartesianY: number,
    rotation: number,
) => {
    let point = new Matrix([[cartesianX], [cartesianY]])
    point = rotatePoint(point, rotation)
    point = coordinateMapCartesianToScreen(
        canvasWidth,
        canvasHeight,
        point.get(0, 0),
        point.get(1, 0),
    )
    return point
}

const rotatePointAndMapToCartesian = (
    canvasWidth: number,
    canvasHeight: number,
    screenX: number,
    screenY: number,
    rotation: number,
) => {
    let point = coordinateMapScreenToCartesian(
        canvasWidth,
        canvasHeight,
        screenX,
        screenY,
    )
    point = rotatePoint(point, -rotation)
    return new Matrix([[point.get(0, 0)], [point.get(1, 0)]])
}
