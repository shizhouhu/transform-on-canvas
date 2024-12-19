// import WorkFlow from '@/pages/editor/component/LiveWindow/layerWorkFlow'
// import { useAppDispatch } from '@/store/hooks'
// import { projectActions } from '@/store/project'
import { Matrix } from 'ml-matrix'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import {
    coordinateMapCartesianToScreen,
    coordinateMapScreenToCartesian,
    coordinateMapViewportToNDC, getHomogeneousTranslationMatrix, getTranslationMatrix,
    rotatePoint,
    TransformData,
    transformPoint,
    transformPointAndMapToCartesian,
    transformPointAndMapToScreen,
} from './Math'
import {
    anchorHeight,
    anchorIdBackgroundRect,
    anchorIdBottomCenter,
    anchorIdLeftBottom,
    anchorIdLeftCenter,
    anchorIdLeftTop,
    anchorIdRightBottom,
    anchorIdRightTop,
    anchorIdRotation,
    anchorIdTopCenter,
    anchorIdTranslationRect,
    anchorWidth,
    buttonHeight,
    buttonImageOffsetStep,
    buttonImageOffsetX,
    buttonImageOffsetY,
    buttonWidth,
    calcAngleDegrees,
    clipMenuPaths,
    cropMenuPaths,
    drawAnchor,
    drawCircle,
    drawPath,
    drawRect3,
    menuIdBack,
    menuIdCrop,
    menuIdDone,
    menuIdFlipHorizontal,
    menuIdFlipVertical,
    menuIdPinp,
    menuIdPinpLeftBottom,
    menuIdPinpLeftTop,
    menuIdPinpRightBottom,
    menuIdPinpRightTop,
    pinpMenuPaths,
    pinpScale,
    Rect,
    rotateAnchorOffset,
    rotatePath,
    rotationAnchorHeight,
    rotationAnchorWidth,
    setColorHash,
} from './Utils'

// properties value measured in Cartesian coordinate
// rotation measured in degree, not radian
export interface IClipControlProps {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX: number
    scaleY: number
    transX: number
    transY: number
    liveWindowWidth: number
    liveWindowHeight: number
    canvasId: string
    hitCanvasId: string
    doCrop: (region: RegionData) => void | null
    onCropClicked: () => void | null
    doTransform: (transform: TransformData) => void | null
}

export interface RegionData {
    x1: number
    y1: number
    x2: number
    y2: number
    x3: number
    y3: number
    x4: number
    y4: number
}

export interface MenuData {
    id: string
    x: number
    y: number
    width: number
    height: number
    colorKey: string
}

export interface IClipControlRef {
    updateCanvasInfo: (
        canvasWidth: number,
        canvasHeight: number,
        offsetX: number,
        offsetY: number,
    ) => void
    updateProps: (props: IClipControlProps) => void
    redraw: () => void
    getNDCPointsAfterCrop: (withRotation: boolean) => void
    startWorkflow: () => void
}

let canvasWidth = 0
let canvasHeight = 0
let canvasOffsetX = 0
let canvasOffsetY = 0

export const ClipControl = forwardRef<IClipControlRef, IClipControlProps>(
    (props: IClipControlProps, ref) => {
        const {
            x,
            y,
            canvasId,
            hitCanvasId,
            width,
            height,
            rotation,
            scaleX,
            scaleY,
            transX,
            transY,
            liveWindowWidth,
            liveWindowHeight,
            doCrop,
            onCropClicked,
            doTransform,
        } = props

        let initScreenX = 0
        let initScreenY = 0
        let initWidth = width
        let initHeight = height
        let screenX = 0
        let screenY = 0
        let newX = x
        let newY = y
        let newWidth = width
        let newHeight = height
        let newRotation = rotation
        let newScaleX = scaleX
        let newScaleY = scaleY
        let newTransX = transX
        let newTransY = transY

        let centerX = x + width / 2
        let centerY = y + height / 2

        const offsetX = -36
        let menuX = newX + offsetX
        let menuY = newY
        let cropMenuX = newX + offsetX
        let cropMenuY = newY

        useImperativeHandle(ref, () => ({
            updateCanvasInfo,
            updateProps,
            redraw,
            getNDCPointsAfterCrop,
            startWorkflow,
        }))

        const startWorkflow = () => {
            // if (workflow) {
            //     workflow.bindEvents()
            // }
        }

        const updateProps = (props: IClipControlProps) => {
            newX = props.x
            newY = props.y
            newWidth = props.width
            newHeight = props.height
            newRotation = props.rotation
            newScaleX = props.scaleX
            newScaleY = props.scaleY
            newTransX = props.transX
            newTransY = props.transY

            menuX = newX + offsetX
            menuY = newY
            cropMenuX = newX + offsetX
            cropMenuY = newY
        }

        const redraw = () => {
            console.log('ClipControl redraw')
            clearCanvas()

            drawBoundRect()
            addTranslationListener()
            drawMenu()
            addMenuListener()

            drawRotationAnchor()
            addRotationListener()
        }

        const updateCanvasInfo = (
            width: number,
            height: number,
            offsetX: number,
            offsetY: number,
        ) => {
            console.log(
                'ClipControl updateCanvasInfo',
                width,
                height,
                offsetX,
                offsetY,
            )
            canvasWidth = width
            canvasHeight = height
            canvasOffsetX = offsetX
            canvasOffsetY = offsetY

            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            canvas.width = width
            canvas.height = height

            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            hitCanvas.width = width
            hitCanvas.height = height
        }

        const getNDCPointsAfterCrop = (withRotation: boolean) => {
            let viewportMinX = x
            let viewportMinY = y - height
            let viewportMaxX = x + width
            let viewportMaxY = y

            let p1X = newX
            let p1Y = newY
            let p1 = rotatePoint(
                new Matrix([[p1X], [p1Y]]),
                withRotation ? newRotation : 0,
            )
            let point1 = coordinateMapViewportToNDC(
                p1.get(0, 0),
                p1.get(1, 0),
                viewportMinX,
                viewportMinY,
                viewportMaxX,
                viewportMaxY,
            )

            let p2X = newX
            let p2Y = newY - newHeight
            let p2 = rotatePoint(
                new Matrix([[p2X], [p2Y]]),
                withRotation ? newRotation : 0,
            )
            let point2 = coordinateMapViewportToNDC(
                p2.get(0, 0),
                p2.get(1, 0),
                viewportMinX,
                viewportMinY,
                viewportMaxX,
                viewportMaxY,
            )

            let p3X = newX + newWidth
            let p3Y = newY - newHeight
            let p3 = rotatePoint(
                new Matrix([[p3X], [p3Y]]),
                withRotation ? newRotation : 0,
            )
            let point3 = coordinateMapViewportToNDC(
                p3.get(0, 0),
                p3.get(1, 0),
                viewportMinX,
                viewportMinY,
                viewportMaxX,
                viewportMaxY,
            )

            let p4X = newX + newWidth
            let p4Y = newY
            let p4 = rotatePoint(
                new Matrix([[p4X], [p4Y]]),
                withRotation ? newRotation : 0,
            )
            let point4 = coordinateMapViewportToNDC(
                p4.get(0, 0),
                p4.get(1, 0),
                viewportMinX,
                viewportMinY,
                viewportMaxX,
                viewportMaxY,
            )

            return {
                x1: point1.get(0, 0),
                y1: point1.get(1, 0),
                x2: point2.get(0, 0),
                y2: point2.get(1, 0),
                x3: point3.get(0, 0),
                y3: point3.get(1, 0),
                x4: point4.get(0, 0),
                y4: point4.get(1, 0),
            }
        }

        const onOuterMenuClicked = (action: string) => {
            if (action == menuIdCrop) {
                clearCanvas()

                drawCropMenu()
                addCropMenuListener()

                drawCropRects()
                addCropAnchorListener()

                drawBackgroundBoundRect()
                drawCropMask()

                onCropClicked()
            } else if (action == menuIdPinp) {
                clearCanvas()

                drawPinpMenu()
                addPinpMenuListener()

                drawBoundRect()
                addTranslationListener()

                drawRotationAnchor()
                addRotationListener()
            } else if (action == menuIdFlipHorizontal) {
                // todo
            } else if (action == menuIdFlipVertical) {
                // todo
            } else {
                console.warn('ClipControl action ', action)
            }
        }

        let pinpMenuX = newX + offsetX
        let pinpMenuY = newY
        let pinpMenuRects: MenuData[] = []
        pinpMenuPaths.forEach((item, index) => {
            pinpMenuRects.push({
                id: item.id,
                x: pinpMenuX,
                y: pinpMenuY - index * buttonHeight,
                width: buttonWidth,
                height: buttonHeight,
                colorKey: '',
            })
        })

        const updatePinpMenuRects = () => {
            pinpMenuRects.forEach((item, index) => {
                pinpMenuRects[index].x = pinpMenuX
                pinpMenuRects[index].y = pinpMenuY - index * buttonHeight
            })
        }

        const getTransform = (
            rotation: number,
            scaleX: number,
            scaleY: number,
            transX: number,
            transY: number,
        ) => {
            let transform: TransformData = {
                rotation: rotation,
                scaleX: scaleX,
                scaleY: scaleY,
                transX: transX,
                transY: transY,
            }
            return transform
        }

        const drawPinpMenu = () => {
            updatePinpMenuRects()

            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D

            let transform = getTransform(rotation, scaleX, scaleY, transX, transY)
            let point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                pinpMenuX,
                pinpMenuY,
                transform,
            )
            let point2 = new Matrix([[point1.get(0, 0)], [point1.get(1, 0) + 148]])
            let point3 = new Matrix([
                [point1.get(0, 0) + 28],
                [point1.get(1, 0) + 148],
            ])
            let point4 = new Matrix([[point1.get(0, 0) + 28], [point1.get(1, 0)]])
            let points = [point1, point2, point3, point4]
            drawRect3(points, 1, '#00000000', true, '#292929', ctx)

            pinpMenuPaths.forEach((item, index) => {
                drawPath(
                    item.path,
                    point1.get(0, 0) + buttonImageOffsetX,
                    point1.get(1, 0) + buttonImageOffsetY + index * buttonImageOffsetStep,
                    ctx,
                )
            })

            setColorHash(pinpMenuRects, colorsHash)
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            pinpMenuRects.forEach(rect => {
                let transform = getTransform(rotation, scaleX, scaleY, transX, transY)
                let point1 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y,
                    transform,
                )
                let point2 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y - rect.height,
                    transform,
                )
                let point3 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y - rect.height,
                    transform,
                )
                let point4 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y,
                    transform,
                )

                let points = [point1, point2, point3, point4]
                drawRect3(points, 1, '#292929', true, rect.colorKey, hitCtx)
            })
        }

        const addPinpMenuListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            canvas.addEventListener('click', pinpMenuClicked)
        }

        const removePinpMenuListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            canvas.removeEventListener('click', pinpMenuClicked)
        }

        const pinpMenuClicked = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)
            if (shape) {
                onInnerMenuPinpClicked(shape.id)
            }
        }

        const onInnerMenuPinpClicked = (action: string) => {
            if (
                action == menuIdBack ||
                action == menuIdPinpLeftTop ||
                action == menuIdPinpRightTop ||
                action == menuIdPinpLeftBottom ||
                action == menuIdPinpRightBottom
            ) {
                if (action == menuIdBack) {
                    newX = x
                    newY = y
                    newWidth = width
                    newHeight = height
                    menuX = newX + offsetX
                    menuY = newY
                    pinpMenuX = newX + offsetX
                    pinpMenuY = newY
                    initWidth = width
                    initHeight = height
                    setupInitPos()

                    clearCanvas()
                    drawBoundRect()
                    addTranslationListener()
                    drawMenu()
                    addMenuListener()

                    drawRotationAnchor()
                    addRotationListener()
                } else if (
                    action == menuIdPinpLeftTop ||
                    action == menuIdPinpRightTop ||
                    action == menuIdPinpLeftBottom ||
                    action == menuIdPinpRightBottom
                ) {
                    menuX = newX + offsetX
                    menuY = newY
                    pinpMenuX = newX + offsetX
                    pinpMenuY = newY

                    newScaleX = pinpScale
                    newScaleY = pinpScale
                    if (action == menuIdPinpLeftTop) {
                        newTransX = -(
                            liveWindowWidth / 2 -
                            (liveWindowWidth * pinpScale) / 2
                        )
                        newTransY =
                            liveWindowHeight / 2 - (liveWindowHeight * pinpScale) / 2
                    } else if (action == menuIdPinpRightTop) {
                        newTransX = liveWindowWidth / 2 - (liveWindowWidth * pinpScale) / 2
                        newTransY =
                            liveWindowHeight / 2 - (liveWindowHeight * pinpScale) / 2
                    } else if (action == menuIdPinpLeftBottom) {
                        newTransX = -(
                            liveWindowWidth / 2 -
                            (liveWindowWidth * pinpScale) / 2
                        )
                        newTransY = -(
                            liveWindowHeight / 2 -
                            (liveWindowHeight * pinpScale) / 2
                        )
                    } else if (action == menuIdPinpRightBottom) {
                        newTransX = liveWindowWidth / 2 - (liveWindowWidth * pinpScale) / 2
                        newTransY = -(
                            liveWindowHeight / 2 -
                            (liveWindowHeight * pinpScale) / 2
                        )
                    }

                    clearCanvas()

                    drawPinpMenu()
                    addPinpMenuListener()

                    drawBoundRect()
                    addTranslationListener()

                    drawRotationAnchor()
                    addRotationListener()

                    let transform: TransformData = {
                        rotation: newRotation,
                        scaleX: newScaleX,
                        scaleY: newScaleY,
                        transX: newTransX,
                        transY: newTransY,
                    }
                    doTransform(transform)
                } else {
                    console.warn('ClipControl action undefined', action)
                    return
                }
            }
        }

        const onInnerMenuCropClicked = (action: string) => {
            if (action == menuIdBack || action == menuIdDone) {
                if (action == menuIdBack) {
                    newX = x
                    newY = y
                    newWidth = width
                    newHeight = height
                    menuX = newX + offsetX
                    menuY = newY
                    cropMenuX = newX + offsetX
                    cropMenuY = newY
                    initWidth = width
                    initHeight = height
                    setupInitPos()
                } else if (action == menuIdDone) {
                    menuX = newX + offsetX
                    menuY = newY
                    cropMenuX = newX + offsetX
                    cropMenuY = newY
                } else {
                    console.warn('action undefined')
                    return
                }
                clearCanvas()

                drawBoundRect()
                addTranslationListener()
                drawMenu()
                addMenuListener()

                drawRotationAnchor()
                addRotationListener()

                let cropRegion = getNDCPointsAfterCrop(false)
                doCrop(cropRegion)
            }
        }

        const clearCanvas = () => {
            removeMenuListener()
            removeCropAnchorListener()
            removeCropMenuListener()
            removeRotationListener()
            removePinpMenuListener()
            removeTranslationListener()
            clearCtx()
            colorsHash.clear()
        }

        const setupInitPos = () => {
            let pos = coordinateMapCartesianToScreen(canvasWidth, canvasHeight, x, y)
            initScreenX = pos.get(0, 0)
            initScreenY = pos.get(1, 0)
        }

        let backgroundRect = {
            id: anchorIdBackgroundRect,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            colorKey: '',
        }

        const distanceBetweenCropRectAndBackgroundRect = () => {
            return Math.sqrt(
                Math.pow(backgroundRect.x - newX, 2) +
                Math.pow(backgroundRect.y - newY, 2),
            )
        }

        const drawCropMask = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D

            let transform = getTransform(
                newRotation,
                newScaleX,
                newScaleY,
                newTransX,
                newTransY,
            )
            let backgroundPoint1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x,
                backgroundRect.y,
                transform,
            )
            let backgroundPoint2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x,
                backgroundRect.y - backgroundRect.height,
                transform,
            )
            let backgroundPoint3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x + backgroundRect.width,
                backgroundRect.y - backgroundRect.height,
                transform,
            )
            let backgroundPoint4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x + backgroundRect.width,
                backgroundRect.y,
                transform,
            )

            let cropPoint1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY,
                transform,
            )
            let cropPoint2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight,
                transform,
            )
            let cropPoint3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight,
                transform,
            )
            let cropPoint4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY,
                transform,
            )

            let points = [backgroundPoint1, backgroundPoint2, cropPoint2, cropPoint1]
            drawRect3(points, 1, '#00000000', true, '#00000050', ctx)

            points = [backgroundPoint2, backgroundPoint3, cropPoint3, cropPoint2]
            drawRect3(points, 1, '#00000000', true, '#00000050', ctx)

            points = [backgroundPoint3, backgroundPoint4, cropPoint4, cropPoint3]
            drawRect3(points, 1, '#00000000', true, '#00000050', ctx)

            points = [backgroundPoint4, backgroundPoint1, cropPoint1, cropPoint4]
            drawRect3(points, 1, '#00000000', true, '#00000050', ctx)
        }

        const drawBackgroundBoundRect = () => {
            let anchorRadius = 6
            if (distanceBetweenCropRectAndBackgroundRect() < anchorRadius) {
                return
            }
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D

            let transform = getTransform(
                newRotation,
                newScaleX,
                newScaleY,
                newTransX,
                newTransY,
            )
            let point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x,
                backgroundRect.y,
                transform,
            )
            let point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x,
                backgroundRect.y - backgroundRect.height,
                transform,
            )
            let point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x + backgroundRect.width,
                backgroundRect.y - backgroundRect.height,
                transform,
            )
            let point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                backgroundRect.x + backgroundRect.width,
                backgroundRect.y,
                transform,
            )

            let points = [point1, point2, point3, point4]
            drawRect3(points, 1, '#FBB500', false, '', ctx)

            drawAnchor(point1.get(0, 0), point1.get(1, 0), anchorRadius, ctx)
            drawAnchor(point2.get(0, 0), point2.get(1, 0), anchorRadius, ctx)
            drawAnchor(point3.get(0, 0), point3.get(1, 0), anchorRadius, ctx)
            drawAnchor(point4.get(0, 0), point4.get(1, 0), anchorRadius, ctx)
        }

        let gap = 12
        let translationRect = [
            {
                id: anchorIdTranslationRect,
                x: newX + gap,
                y: newY - gap,
                width: newWidth - 2 * gap,
                height: newHeight - 2 * gap,
                colorKey: '',
            },
        ]
        const drawBoundRect = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D

            let transform = getTransform(
                newRotation,
                newScaleX,
                newScaleY,
                newTransX,
                newTransY,
            )
            let point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY,
                transform,
            )
            let point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight,
                transform,
            )
            let point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight,
                transform,
            )
            let point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY,
                transform,
            )

            let points = [point1, point2, point3, point4]
            drawRect3(points, 1, '#FBB500', false, '', ctx)

            drawAnchor(point1.get(0, 0), point1.get(1, 0), 6, ctx)
            drawAnchor(point2.get(0, 0), point2.get(1, 0), 6, ctx)
            drawAnchor(point3.get(0, 0), point3.get(1, 0), 6, ctx)
            drawAnchor(point4.get(0, 0), point4.get(1, 0), 6, ctx)

            setColorHash(translationRect, colorsHash)
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            translationRect.forEach((rect, index) => {
                let p1 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y,
                    transform,
                )
                let p2 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y - rect.height,
                    transform,
                )
                let p3 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y - rect.height,
                    transform,
                )
                let p4 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y,
                    transform,
                )
                let points = [p1, p2, p3, p4]
                drawRect3(points, 1, '#00000000', true, rect.colorKey, hitCtx)
            })
        }

        let outerMenuRects: MenuData[] = []
        clipMenuPaths.forEach((item, index) => {
            outerMenuRects.push({
                id: item.id,
                x: menuX,
                y: menuY - index * buttonHeight,
                width: buttonWidth,
                height: buttonHeight,
                colorKey: '',
            })
        })

        const updateOuterMenuRects = () => {
            outerMenuRects.forEach((item, index) => {
                outerMenuRects[index].x = menuX
                outerMenuRects[index].y = menuY - index * buttonHeight
            })
        }

        let colorsHash = new Map<string, Rect>()

        const drawMenu = () => {
            updateOuterMenuRects()

            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D

            let transform = getTransform(rotation, scaleX, scaleY, transX, transY)
            let point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                menuX,
                menuY,
                transform,
            )
            let point2 = new Matrix([[point1.get(0, 0)], [point1.get(1, 0) + 120]])
            let point3 = new Matrix([
                [point1.get(0, 0) + 28],
                [point1.get(1, 0) + 120],
            ])
            let point4 = new Matrix([[point1.get(0, 0) + 28], [point1.get(1, 0)]])

            let points = [point1, point2, point3, point4]
            drawRect3(points, 1, '#00000000', true, '#292929', ctx)

            clipMenuPaths.forEach((item, index) => {
                drawPath(
                    item.path,
                    point1.get(0, 0) + buttonImageOffsetX,
                    point1.get(1, 0) + buttonImageOffsetY + index * buttonImageOffsetStep,
                    ctx,
                )
            })

            setColorHash(outerMenuRects, colorsHash)

            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            outerMenuRects.forEach((rect, index) => {
                let p1 = new Matrix([
                    [point1.get(0, 0)],
                    [point1.get(1, 0) + index * rect.height],
                ])
                let p2 = new Matrix([[p1.get(0, 0)], [p1.get(1, 0) + rect.height]])
                let p3 = new Matrix([
                    [p1.get(0, 0) + rect.width],
                    [p1.get(1, 0) + rect.height],
                ])
                let p4 = new Matrix([[p1.get(0, 0) + rect.width], [p1.get(1, 0)]])

                let points = [p1, p2, p3, p4]
                drawRect3(points, 1, '#00000000', true, rect.colorKey, hitCtx)
            })
        }
        const menuClicked = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)
            if (shape) {
                onOuterMenuClicked(shape.id)
            }
        }
        const addMenuListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            canvas.addEventListener('click', menuClicked)
        }
        const removeMenuListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            canvas.removeEventListener('click', menuClicked)
        }

        let cropMenuRects: MenuData[] = []
        cropMenuPaths.forEach((item, index) => {
            cropMenuRects.push({
                id: item.id,
                x: cropMenuX,
                y: cropMenuY - index * buttonHeight,
                width: buttonWidth,
                height: buttonHeight,
                colorKey: '',
            })
        })

        const updateCropMenuRects = () => {
            cropMenuRects.forEach((item, index) => {
                cropMenuRects[index].x = cropMenuX
                cropMenuRects[index].y = cropMenuY - index * buttonHeight
            })
        }

        const drawCropMenu = () => {
            updateCropMenuRects()

            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D

            let transform = getTransform(rotation, scaleX, scaleY, transX, transY)
            let point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                cropMenuX,
                cropMenuY,
                transform,
            )
            let point2 = new Matrix([[point1.get(0, 0)], [point1.get(1, 0) + 64]])
            let point3 = new Matrix([
                [point1.get(0, 0) + 28],
                [point1.get(1, 0) + 64],
            ])
            let point4 = new Matrix([[point1.get(0, 0) + 28], [point1.get(1, 0)]])

            let points = [point1, point2, point3, point4]
            drawRect3(points, 1, '#00000000', true, '#292929', ctx)

            cropMenuPaths.forEach((item, index) => {
                drawPath(
                    item.path,
                    point1.get(0, 0) + buttonImageOffsetX,
                    point1.get(1, 0) + buttonImageOffsetY + index * buttonImageOffsetStep,
                    ctx,
                )
            })

            setColorHash(cropMenuRects, colorsHash)
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            cropMenuRects.forEach(rect => {
                let point1 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y,
                    transform,
                )
                let point2 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y - rect.height,
                    transform,
                )
                let point3 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y - rect.height,
                    transform,
                )
                let point4 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y,
                    transform,
                )

                let points = [point1, point2, point3, point4]
                drawRect3(points, 1, '#292929', true, rect.colorKey, hitCtx)
            })
        }

        const cropMenuClicked = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)
            if (shape) {
                onInnerMenuCropClicked(shape.id)
            }
        }

        const addCropMenuListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            canvas.addEventListener('click', cropMenuClicked)
        }

        const removeCropMenuListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            canvas.removeEventListener('click', cropMenuClicked)
        }

        let cropAnchorRects = [
            {
                id: anchorIdLeftTop,
                x: newX,
                y: newY,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
            {
                id: anchorIdRightTop,
                x: newX + newWidth - anchorWidth,
                y: newY,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
            {
                id: anchorIdLeftBottom,
                x: newX,
                y: newY - newHeight + anchorHeight,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
            {
                id: anchorIdRightBottom,
                x: newX + newWidth - anchorWidth,
                y: newY - newHeight + anchorHeight,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
            {
                id: anchorIdTopCenter,
                x: newX + (newWidth - anchorWidth) / 2,
                y: newY,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
            {
                id: anchorIdBottomCenter,
                x: newX + (newWidth - anchorWidth) / 2,
                y: newY - newHeight + anchorHeight,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
            {
                id: anchorIdLeftCenter,
                x: newX,
                y: newY + (newHeight - anchorHeight) / 2,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
            {
                id: anchorIdRightTop,
                x: newX + newWidth - anchorWidth,
                y: newY - (newHeight - anchorHeight) / 2,
                width: anchorWidth,
                height: anchorHeight,
                colorKey: '',
            },
        ]

        const updateCropAnchorRects = () => {
            cropAnchorRects[0].x = newX
            cropAnchorRects[0].y = newY

            cropAnchorRects[1].x = newX + newWidth - anchorWidth
            cropAnchorRects[1].y = newY

            cropAnchorRects[2].x = newX
            cropAnchorRects[2].y = newY - newHeight + anchorHeight

            cropAnchorRects[3].x = newX + newWidth - anchorWidth
            cropAnchorRects[3].y = newY - newHeight + anchorHeight

            cropAnchorRects[4].x = newX + (newWidth - anchorWidth) / 2
            cropAnchorRects[4].y = newY

            cropAnchorRects[5].x = newX + (newWidth - anchorWidth) / 2
            cropAnchorRects[5].y = newY - newHeight + anchorHeight

            cropAnchorRects[6].x = newX
            cropAnchorRects[6].y = newY - (newHeight - anchorHeight) / 2

            cropAnchorRects[7].x = newX + newWidth - anchorWidth
            cropAnchorRects[7].y = newY - (newHeight - anchorHeight) / 2
        }

        const clearCtx = () => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            hitCtx.clearRect(0, 0, canvas.width, canvas.height)
            hitCtx.fillStyle = '#00000000'
            hitCtx.fillRect(0, 0, canvas.width, canvas.height)
            console.log('ClipControl clearCtx')
        }

        const drawCropRects = () => {
            updateCropAnchorRects()

            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D

            let transform = getTransform(
                newRotation,
                newScaleX,
                newScaleY,
                newTransX,
                newTransY,
            )
            let point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY,
                transform,
            )
            let point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight,
                transform,
            )
            let point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight,
                transform,
            )
            let point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY,
                transform,
            )

            let points = [point1, point2, point3, point4]
            drawRect3(points, 1, `#FBB500`, false, '', ctx)

            // left up anchor
            let leftUpRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY,
                transform,
            )
            let leftUpRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - 4,
                transform,
            )
            let leftUpRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 12,
                newY - 4,
                transform,
            )
            let leftUpRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 12,
                newY,
                transform,
            )

            points = [
                leftUpRect1Point1,
                leftUpRect1Point2,
                leftUpRect1Point3,
                leftUpRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            let leftUpRect2Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY,
                transform,
            )
            let leftUpRect2Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - 12,
                transform,
            )
            let leftUpRect2Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 4,
                newY - 12,
                transform,
            )
            let leftUpRect2Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 4,
                newY,
                transform,
            )

            points = [
                leftUpRect2Point1,
                leftUpRect2Point2,
                leftUpRect2Point3,
                leftUpRect2Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            // right up anchor
            let rightUpRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 12,
                newY,
                transform,
            )
            let rightUpRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 12,
                newY - 4,
                transform,
            )
            let rightUpRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - 4,
                transform,
            )
            let rightUpRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY,
                transform,
            )

            points = [
                rightUpRect1Point1,
                rightUpRect1Point2,
                rightUpRect1Point3,
                rightUpRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            let rightUpRect2Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 4,
                newY,
                transform,
            )
            let rightUpRect2Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 4,
                newY - 12,
                transform,
            )
            let rightUpRect2Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - 12,
                transform,
            )
            let rightUpRect2Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY,
                transform,
            )

            points = [
                rightUpRect2Point1,
                rightUpRect2Point2,
                rightUpRect2Point3,
                rightUpRect2Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            // left bottom anchor
            let leftBottomRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight + 4,
                transform,
            )
            let leftBottomRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight,
                transform,
            )
            let leftBottomRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 12,
                newY - newHeight,
                transform,
            )
            let leftBottomRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 12,
                newY - newHeight + 4,
                transform,
            )

            points = [
                leftBottomRect1Point1,
                leftBottomRect1Point2,
                leftBottomRect1Point3,
                leftBottomRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            let leftBottomRect2Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight + 12,
                transform,
            )
            let leftBottomRect2Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight,
                transform,
            )
            let leftBottomRect2Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 4,
                newY - newHeight,
                transform,
            )
            let leftBottomRect2Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 4,
                newY - newHeight + 12,
                transform,
            )

            points = [
                leftBottomRect2Point1,
                leftBottomRect2Point2,
                leftBottomRect2Point3,
                leftBottomRect2Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            // right bottom anchor
            let rightBottomRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 12,
                newY - newHeight + 4,
                transform,
            )
            let rightBottomRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 12,
                newY - newHeight,
                transform,
            )
            let rightBottomRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight,
                transform,
            )
            let rightBottomRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight + 4,
                transform,
            )

            points = [
                rightBottomRect1Point1,
                rightBottomRect1Point2,
                rightBottomRect1Point3,
                rightBottomRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            let rightBottomRect2Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 4,
                newY - newHeight + 12,
                transform,
            )
            let rightBottomRect2Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 4,
                newY - newHeight,
                transform,
            )
            let rightBottomRect2Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight,
                transform,
            )
            let rightBottomRect2Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight + 12,
                transform,
            )

            points = [
                rightBottomRect2Point1,
                rightBottomRect2Point2,
                rightBottomRect2Point3,
                rightBottomRect2Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            // up center anchor
            let upCenterRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 - 6,
                newY,
                transform,
            )
            let upCenterRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 - 6,
                newY - 4,
                transform,
            )
            let upCenterRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 + 6,
                newY - 4,
                transform,
            )
            let upCenterRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 + 6,
                newY,
                transform,
            )

            points = [
                upCenterRect1Point1,
                upCenterRect1Point2,
                upCenterRect1Point3,
                upCenterRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            // bottom center anchor
            let bottomCenterRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 - 6,
                newY - newHeight + 4,
                transform,
            )
            let bottomCenterRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 - 6,
                newY - newHeight,
                transform,
            )
            let bottomCenterRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 + 6,
                newY - newHeight,
                transform,
            )
            let bottomCenterRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth / 2 + 6,
                newY - newHeight + 4,
                transform,
            )

            points = [
                bottomCenterRect1Point1,
                bottomCenterRect1Point2,
                bottomCenterRect1Point3,
                bottomCenterRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            // left center anchor
            let leftCenterRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight / 2 + 6,
                transform,
            )
            let leftCenterRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY - newHeight / 2 - 6,
                transform,
            )
            let leftCenterRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 4,
                newY - newHeight / 2 - 6,
                transform,
            )
            let leftCenterRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + 4,
                newY - newHeight / 2 + 6,
                transform,
            )

            points = [
                leftCenterRect1Point1,
                leftCenterRect1Point2,
                leftCenterRect1Point3,
                leftCenterRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            // right center anchor
            let rightCenterRect1Point1 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 4,
                newY - newHeight / 2 + 6,
                transform,
            )
            let rightCenterRect1Point2 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth - 4,
                newY - newHeight / 2 - 6,
                transform,
            )
            let rightCenterRect1Point3 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight / 2 - 6,
                transform,
            )
            let rightCenterRect1Point4 = transformPointAndMapToScreen(
                canvasWidth,
                canvasHeight,
                newX + newWidth,
                newY - newHeight / 2 + 6,
                transform,
            )
            points = [
                rightCenterRect1Point1,
                rightCenterRect1Point2,
                rightCenterRect1Point3,
                rightCenterRect1Point4,
            ]
            drawRect3(points, 1, `#ffffff`, true, `#ffffff`, ctx)

            setColorHash(cropAnchorRects, colorsHash)
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            cropAnchorRects.forEach(rect => {
                let point1 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y,
                    transform,
                )
                let point2 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x,
                    rect.y - rect.height,
                    transform,
                )
                let point3 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y - rect.height,
                    transform,
                )
                let point4 = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    rect.x + rect.width,
                    rect.y,
                    transform,
                )

                points = [point1, point2, point3, point4]
                drawRect3(points, 1, '#292929', true, rect.colorKey, hitCtx)
            })
        }

        let transforming = false
        let movementX = 0
        let movementY = 0

        let rotationAnchorX = 0
        let rotationAnchorY = (height / 2) * scaleY + rotateAnchorOffset

        let rotationAnchorRects = [
            {
                id: anchorIdRotation,
                x: rotationAnchorX - rotationAnchorWidth / 2,
                y: rotationAnchorY + rotationAnchorHeight / 2,
                width: rotationAnchorWidth,
                height: rotationAnchorHeight,
                colorKey: '',
            },
        ]

        const drawRotationAnchor = () => {
            let anchorPoint = transformPoint(
                0,
                newHeight / 2 + rotateAnchorOffset/newScaleY,
                newRotation,
                newScaleX,
                newScaleY,
                newTransX,
                newTransY,
            )
            let anchorScreenPoint = coordinateMapCartesianToScreen(
                canvasWidth,
                canvasHeight,
                anchorPoint.get(0, 0),
                anchorPoint.get(1, 0),
            )
            anchorScreenPoint.set(
                1,
                0,
                anchorScreenPoint.get(1, 0),
            )

            const canvas = document.getElementById(canvasId) as HTMLCanvasElement
            const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D
            let radius = 8
            drawCircle(
                anchorScreenPoint.get(0, 0),
                anchorScreenPoint.get(1, 0),
                radius,
                1,
                '#ffffff',
                true,
                '#ffffff',
                ctx,
            )

            drawPath(
                rotatePath,
                anchorScreenPoint.get(0, 0) - radius,
                anchorScreenPoint.get(1, 0) - radius,
                ctx,
            )

            setColorHash(rotationAnchorRects, colorsHash)
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            rotationAnchorRects.forEach(rect => {
                let point1 = new Matrix([
                    [anchorScreenPoint.get(0, 0) - rotationAnchorWidth / 2],
                    [anchorScreenPoint.get(1, 0) - rotationAnchorHeight / 2],
                ])
                let point2 = new Matrix([
                    [anchorScreenPoint.get(0, 0) - rotationAnchorWidth / 2],
                    [anchorScreenPoint.get(1, 0) + rotationAnchorHeight / 2],
                ])
                let point3 = new Matrix([
                    [anchorScreenPoint.get(0, 0) + rotationAnchorWidth / 2],
                    [anchorScreenPoint.get(1, 0) + rotationAnchorHeight / 2],
                ])
                let point4 = new Matrix([
                    [anchorScreenPoint.get(0, 0) + rotationAnchorWidth / 2],
                    [anchorScreenPoint.get(1, 0) - rotationAnchorHeight / 2],
                ])
                let points = [point1, point2, point3, point4]
                drawRect3(points, 1, '#292929', true, rect.colorKey, hitCtx)
            })
        }

        let translationStartScreenX = 0
        let translationStartScreenY = 0
        let originTransX = 0
        let originTransY = 0
        let translation = false
        const translationAnchorMouseDown = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)
            if (shape && shape.id == anchorIdTranslationRect) {
                console.log('ClipControl mousedown', shape.id)
                translationStartScreenX = e.clientX
                translationStartScreenY = e.clientY
                originTransX = newTransX
                originTransY = newTransY
                translation = true
            }
        }

        const translationAnchorMouseMove = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)

            if (translation) {
                movementX = e.clientX - translationStartScreenX
                movementY = e.clientY - translationStartScreenY

                newTransX = originTransX + movementX
                newTransY = originTransY - movementY
                clearCtx()
                drawBoundRect()
                addTranslationListener()
                drawMenu()
                addMenuListener()

                drawRotationAnchor()
                addRotationListener()

                let transform: TransformData = {
                    rotation: newRotation,
                    scaleX: newScaleX,
                    scaleY: newScaleY,
                    transX: newTransX,
                    transY: newTransY,
                }
                doTransform(transform)
            }
        }

        const translationAnchorMouseUp = (e: MouseEvent) => {
            translation = false
        }

        const addTranslationListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement

            canvas.addEventListener('mousedown', translationAnchorMouseDown)

            canvas.addEventListener('mousemove', translationAnchorMouseMove)

            canvas.addEventListener('mouseup', translationAnchorMouseUp)
        }

        const removeTranslationListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement

            canvas.removeEventListener('mousedown', translationAnchorMouseDown)

            canvas.removeEventListener('mousemove', translationAnchorMouseMove)

            canvas.removeEventListener('mouseup', translationAnchorMouseUp)
        }

        let originAngle = 0
        let originRotation = rotation
        const rotationAnchorMouseDown = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)
            if (shape && shape.id == anchorIdRotation) {
                console.log('ClipControl mousedown', shape.id, newTransX, newTransY)
                transforming = true
                let point = coordinateMapScreenToCartesian(
                    canvasWidth,
                    canvasHeight,
                    mousePos.x,
                    mousePos.y,
                )

                let transM = getHomogeneousTranslationMatrix(-newTransX, -newTransY)
                point = transM.mmul(new Matrix([[point.get(0, 0)], [point.get(1, 0)], [1]]))

                originAngle = calcAngleDegrees(point.get(0, 0), point.get(1, 0))
            }
        }

        const rotationAnchorMouseMove = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)

            if (transforming) {
                let point = coordinateMapScreenToCartesian(
                    canvasWidth,
                    canvasHeight,
                    mousePos.x,
                    mousePos.y,
                )
                let transM = getHomogeneousTranslationMatrix(-newTransX, -newTransY)
                point = transM.mmul(new Matrix([[point.get(0, 0)], [point.get(1, 0)], [1]]))

                let angle = calcAngleDegrees(point.get(0, 0), point.get(1, 0))
                let tempRotation = angle - originAngle
                newRotation = originRotation + tempRotation
                console.log('ClipControl ', 'newRotation', newRotation, newTransX, newTransY)

                clearCtx()
                drawBoundRect()
                addTranslationListener()
                drawMenu()
                addMenuListener()

                drawRotationAnchor()
                addRotationListener()

                let transform: TransformData = {
                    rotation: newRotation,
                    scaleX: newScaleX,
                    scaleY: newScaleY,
                    transX: newTransX,
                    transY: newTransY,
                }
                doTransform(transform)
            }
        }

        const rotationAnchorMouseUp = (e: MouseEvent) => {
            const canvas = document.getElementById(hitCanvasId) as HTMLCanvasElement
            const mousePos = {
                x: e.clientX - canvas.offsetLeft,
                y: e.clientY - canvas.offsetTop,
            }

            transforming = false
            originRotation = newRotation
        }

        let cropStartScreenX = 0
        let cropStartScreenY = 0
        let cropStartWidth = 0
        let cropStartHeight = 0
        let cropLeftTopScreenX = 0
        let cropLeftTopScreenY = 0
        let leftTopPointMouseOffsetX = 0
        let leftTopPointMouseOffsetY = 0

        const cropAnchorMouseDown = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)
            if (shape && shape.id == 'leftTop') {
                transforming = true
                cropStartScreenX = e.clientX
                cropStartScreenY = e.clientY
                cropStartWidth = newWidth
                cropStartHeight = newHeight

                let transform = getTransform(
                    newRotation,
                    newScaleX,
                    newScaleY,
                    newTransX,
                    newTransY,
                )
                let point = transformPointAndMapToScreen(
                    canvasWidth,
                    canvasHeight,
                    newX,
                    newY,
                    transform,
                )
                cropLeftTopScreenX = point.get(0, 0)
                cropLeftTopScreenY = point.get(1, 0)

                leftTopPointMouseOffsetX = cropLeftTopScreenX - e.clientX
                leftTopPointMouseOffsetY = cropLeftTopScreenY - e.clientY
            }
        }

        const cropAnchorMouseMove = (e: MouseEvent) => {
            const hitCanvas = document.getElementById(
                hitCanvasId,
            ) as HTMLCanvasElement
            const hitCtx = hitCanvas?.getContext('2d') as CanvasRenderingContext2D
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data
            const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
            const shape = colorsHash.get(color)

            if (transforming) {
                movementX = e.clientX - cropStartScreenX
                movementY = e.clientY - cropStartScreenY

                let angleBetweenMovementAndHorizontalAxis = calcAngleDegrees(
                    movementX,
                    -movementY,
                )
                let length = Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2))
                let trimmedWidth =
                    length *
                    Math.cos(
                        ((angleBetweenMovementAndHorizontalAxis - newRotation) * Math.PI) /
                        180,
                    )
                let trimmedHeight =
                    length *
                    Math.sin(
                        ((angleBetweenMovementAndHorizontalAxis - newRotation) * Math.PI) /
                        180,
                    )
                trimmedWidth = Math.abs(trimmedWidth)
                trimmedHeight = Math.abs(trimmedHeight)

                let newCropLeftTopScreenX = e.clientX + leftTopPointMouseOffsetX
                let newCropLeftTopScreenY = e.clientY + leftTopPointMouseOffsetY
                newWidth = cropStartWidth - 2 * trimmedWidth
                newHeight = cropStartHeight - 2 * trimmedHeight
                let transform = getTransform(
                    newRotation,
                    newScaleX,
                    newScaleY,
                    newTransX,
                    newTransY,
                )
                let point = transformPointAndMapToCartesian(
                    canvasWidth,
                    canvasHeight,
                    newCropLeftTopScreenX,
                    newCropLeftTopScreenY,
                    transform,
                )
                newX = point.get(0, 0)
                newY = point.get(1, 0)
                cropMenuX = newX + offsetX
                cropMenuY = newY

                clearCtx()

                drawCropRects()
                drawCropMenu()

                drawBackgroundBoundRect()
                drawCropMask()
            }
        }

        const cropAnchorMouseUp = (e: MouseEvent) => {
            const canvas = document.getElementById(hitCanvasId) as HTMLCanvasElement
            const mousePos = {
                x: e.clientX - canvas.offsetLeft,
                y: e.clientY - canvas.offsetTop,
            }

            transforming = false
            let point = coordinateMapCartesianToScreen(
                canvasWidth,
                canvasHeight,
                newX,
                newY,
            )
            cropStartScreenX = point.get(0, 0)
            cropStartScreenY = point.get(1, 0)
            cropStartWidth = newWidth
            cropStartHeight = newHeight

            addCropMenuListener()
            addCropAnchorListener()
        }

        const addRotationListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement

            canvas.addEventListener('mousedown', rotationAnchorMouseDown)

            canvas.addEventListener('mousemove', rotationAnchorMouseMove)

            canvas.addEventListener('mouseup', rotationAnchorMouseUp)
        }

        const removeRotationListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement

            canvas.removeEventListener('mousedown', rotationAnchorMouseDown)

            canvas.removeEventListener('mousemove', rotationAnchorMouseMove)

            canvas.removeEventListener('mouseup', rotationAnchorMouseUp)
        }

        const addCropAnchorListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement

            canvas.addEventListener('mousedown', cropAnchorMouseDown)

            canvas.addEventListener('mousemove', cropAnchorMouseMove)

            canvas.addEventListener('mouseup', cropAnchorMouseUp)
        }

        const removeCropAnchorListener = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement

            canvas.removeEventListener('mousedown', cropAnchorMouseDown)

            canvas.removeEventListener('mousemove', cropAnchorMouseMove)

            canvas.removeEventListener('mouseup', cropAnchorMouseUp)
        }

        // const workflow = new WorkFlow({
        //     containerId: 'monitorLayer',
        // })
        // const dispatch = useAppDispatch()
        // useEffect(() => {
        //     workflow.bindEvents()
        //     dispatch(projectActions.updateWorkFlow(workflow))
        //     return () => {
        //         workflow.destroy()
        //     }
        // }, [])

        return <></>
    },
)
