import {useEffect, useState} from "react";
import {Matrix} from 'ml-matrix';
import {
    drawRect,
    drawRect2,
    drawAnchor,
    buttonWidth,
    buttonHeight,
    buttonImageOffsetX,
    buttonImageOffsetY,
    buttonImageOffsetStep,
    drawPath,
    drawCircle,
    cropPath,
    pinpPath,
    rotateRightPath,
    flipHorizontal,
    flipVertical,
    backPath,
    donePath,
    pinpLeftTopPath,
    pinpRightTopPath,
    pinpLeftBottomPath,
    pinpRightBottomPath,
    rotateAnchorOffset,
    anchorWidth,
    anchorHeight,
    setColorHash,
    createHitContext, Rect, rotatePath, rotationAnchorWidth, rotationAnchorHeight,
    calcAngleDegrees
} from "./Utils";
import {
    getRotationMatrix,
    getTranslationMatrix,
    getScaleMatrix,
    coordinateMapScreenToCartesian,
    coordinateMapCartesianToScreen,
    rotatePoint
} from "./Math"

// properties value measured in Cartesian coordinate
// rotation measured in degree, not radian
interface IProps {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX: number
    scaleY: number
    transX: number
    transY: number
    canvasId: string
}

export const ClipControl = (props: IProps) => {
    const {x, y, canvasId, width, height, rotation, scaleX, scaleY, transX, transY} = props
    let canvasWidth = 0
    let canvasHeight = 0
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

    let hitCtx: CanvasRenderingContext2D

    const onOuterMenuClicked = (action: string) => {
        if (action == "crop") {
            removeMenuListener()
            removeRotationListener()
            clearCtx()
            colorsHash.clear()

            drawCropMenu()
            addCropMenuListener()

            drawCropRects()
            addCropAnchorListener()

            drawBackgroundBoundRect()
            drawCropMask()
        } else if (action == "pinp") {

        } else if (action == "flipHorizontal") {

        } else if (action == "flipVertical") {

        } else {
            console.warn("action ", action)
        }
    }

    const onInnerMenuCropClicked = (action: string) => {
        if (action == "back" || action == "done") {
            if (action == "back") {
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
            } else if (action == "done") {
                menuX = newX + offsetX
                menuY = newY
                cropMenuX = newX + offsetX
                cropMenuY = newY
            } else {
                console.warn("action undefined")
                return
            }
            removeCropMenuListener()
            removeCropAnchorListener()
            clearCtx()
            colorsHash.clear()

            drawBoundRect()
            drawMenu()
            addMenuListener()

            drawRotationAnchor()
            addRotationListener()
        }
    }

    const onAnchorClicked = (action: string) => {
        if (action == "leftTop") {
            console.log('onAnchorClicked', action)
        }
    }

    const setupCanvasInfo = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvasWidth = canvas.width
        canvasHeight = canvas.height
        console.log('canvas info', canvas.width, canvas.height)
    }

    let once = true
    useEffect(() => {
        if (once) {
            setupCanvasInfo()
            setupInitPos()
            hitCtx = createHitContext()

            screenX = initScreenX
            screenY = initScreenY
            drawBoundRect()
            drawMenu()
            addMenuListener()

            drawRotationAnchor()
            addRotationListener()

            once = false
        }
    }, [])

    const setupInitPos = () => {
        let pos = coordinateMapCartesianToScreen(canvasWidth, canvasHeight, x, y)
        initScreenX = pos.get(0, 0)
        initScreenY = pos.get(1, 0)
    }

    const rotatePointAndMapToScreen = (cartesianX: number, cartesianY: number, rotation: number) => {
        let point = new Matrix([
            [cartesianX],
            [cartesianY]
        ])
        point = rotatePoint(point, rotation)
        point = coordinateMapCartesianToScreen(canvasWidth, canvasHeight, point.get(0, 0), point.get(1,0))
        return point
    }

    const rotatePointAndMapToCartesian = (screenX: number, screenY: number, rotation: number) => {
        let point = coordinateMapScreenToCartesian(canvasWidth, canvasHeight, screenX, screenY)
        point = rotatePoint(point, -rotation)
        return new Matrix([
            [point.get(0, 0)],
            [point.get(1, 0)],
        ])
    }

    let backgroundRect = {id: 'backgroundRect', x: newX, y: newY, width: newWidth, height: newHeight, colorKey: ''}

    const distanceBetweenCropRectAndBackgroundRect = () => {
        return Math.sqrt(Math.pow(backgroundRect.x - newX, 2) + Math.pow(backgroundRect.y - newY, 2))
    }

    const drawCropMask = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

        let backgroundPoint1 = rotatePointAndMapToScreen(backgroundRect.x, backgroundRect.y, newRotation)
        let backgroundPoint2 = rotatePointAndMapToScreen(backgroundRect.x, backgroundRect.y - backgroundRect.height, newRotation)
        let backgroundPoint3 = rotatePointAndMapToScreen(backgroundRect.x + backgroundRect.width, backgroundRect.y - backgroundRect.height, newRotation)
        let backgroundPoint4 = rotatePointAndMapToScreen(backgroundRect.x + backgroundRect.width, backgroundRect.y, newRotation)

        let cropPoint1 = rotatePointAndMapToScreen(newX, newY, newRotation)
        let cropPoint2 = rotatePointAndMapToScreen(newX, newY - newHeight, newRotation)
        let cropPoint3 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight, newRotation)
        let cropPoint4 = rotatePointAndMapToScreen(newX + newWidth, newY, newRotation)

        drawRect2(backgroundPoint1.get(0, 0), backgroundPoint1.get(1, 0), backgroundPoint2.get(0, 0), backgroundPoint2.get(1, 0),
            cropPoint2.get(0, 0), cropPoint2.get(1, 0), cropPoint1.get(0, 0), cropPoint1.get(1, 0),
            1, "#00000000", true, "#00000050", ctx)

        drawRect2(backgroundPoint2.get(0, 0), backgroundPoint2.get(1, 0), backgroundPoint3.get(0, 0), backgroundPoint3.get(1, 0),
            cropPoint3.get(0, 0), cropPoint3.get(1, 0), cropPoint2.get(0, 0), cropPoint2.get(1, 0),
            1, "#00000000", true, "#00000050", ctx)

        drawRect2(backgroundPoint3.get(0, 0), backgroundPoint3.get(1, 0), backgroundPoint4.get(0, 0), backgroundPoint4.get(1, 0),
            cropPoint4.get(0, 0), cropPoint4.get(1, 0), cropPoint3.get(0, 0), cropPoint3.get(1, 0),
            1, "#00000000", true, "#00000050", ctx)

        drawRect2(backgroundPoint4.get(0, 0), backgroundPoint4.get(1, 0), backgroundPoint1.get(0, 0), backgroundPoint1.get(1, 0),
            cropPoint1.get(0, 0), cropPoint1.get(1, 0), cropPoint4.get(0, 0), cropPoint4.get(1, 0),
            1, "#00000000", true, "#00000050", ctx)
    }

    const drawBackgroundBoundRect = () => {
        let anchorRadius = 6
        if (distanceBetweenCropRectAndBackgroundRect() < anchorRadius) {
            return
        }
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

        let point1 = rotatePointAndMapToScreen(backgroundRect.x, backgroundRect.y, newRotation)
        let point2 = rotatePointAndMapToScreen(backgroundRect.x, backgroundRect.y - backgroundRect.height, newRotation)
        let point3 = rotatePointAndMapToScreen(backgroundRect.x + backgroundRect.width, backgroundRect.y - backgroundRect.height, newRotation)
        let point4 = rotatePointAndMapToScreen(backgroundRect.x + backgroundRect.width, backgroundRect.y, newRotation)

        drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
            point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
            1, "#FBB500", false, "", ctx)

        drawAnchor(point1.get(0, 0), point1.get(1,0), anchorRadius, ctx)
        drawAnchor(point2.get(0, 0), point2.get(1,0), anchorRadius, ctx)
        drawAnchor(point3.get(0, 0), point3.get(1,0), anchorRadius, ctx)
        drawAnchor(point4.get(0, 0), point4.get(1,0), anchorRadius, ctx)
    }

    const drawBoundRect = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

        let point1 = rotatePointAndMapToScreen(newX, newY, newRotation)
        let point2 = rotatePointAndMapToScreen(newX, newY - newHeight, newRotation)
        let point3 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight, newRotation)
        let point4 = rotatePointAndMapToScreen(newX + newWidth, newY, newRotation)

        drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
            point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
            1, "#FBB500", false, "", ctx)

        drawAnchor(point1.get(0, 0), point1.get(1,0), 6, ctx)
        drawAnchor(point2.get(0, 0), point2.get(1,0), 6, ctx)
        drawAnchor(point3.get(0, 0), point3.get(1,0), 6, ctx)
        drawAnchor(point4.get(0, 0), point4.get(1,0), 6, ctx)
    }

    let outerMenuRects = [
        {id: 'crop', x: menuX, y: menuY, width: buttonWidth, height: buttonHeight, colorKey: ''},
        {
            id: 'pinp',
            x: menuX,
            y: menuY - buttonHeight,
            width: buttonWidth,
            height: buttonHeight,
            colorKey: ''
        },
        {
            id: 'flipHorizontal',
            x: menuX,
            y: menuY - 2 * buttonHeight,
            width: buttonWidth,
            height: buttonHeight,
            colorKey: ''
        },
        {
            id: 'flipVertical',
            x: menuX,
            y: menuY - 3 * buttonHeight,
            width: buttonWidth,
            height: buttonHeight,
            colorKey: ''
        },
    ]

    const updateOuterMenuRects = () => {
        outerMenuRects[0].x = menuX
        outerMenuRects[0].y = menuY

        outerMenuRects[1].x = menuX
        outerMenuRects[1].y = menuY - buttonHeight

        outerMenuRects[2].x = menuX
        outerMenuRects[2].y = menuY - 2 * buttonHeight

        outerMenuRects[3].x = menuX
        outerMenuRects[3].y = menuY - 3 * buttonHeight
    }

    let colorsHash = new Map<string, Rect>();


    const drawMenu = () => {
        updateOuterMenuRects()

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

        let point1 = rotatePointAndMapToScreen(menuX, menuY, rotation)
        let point2 = new Matrix([
            [point1.get(0, 0)],
            [point1.get(1, 0) + 120]
        ])
        let point3 = new Matrix([
            [point1.get(0, 0) + 28],
            [point1.get(1, 0) + 120]
        ])
        let point4 = new Matrix([
            [point1.get(0, 0) + 28],
            [point1.get(1, 0)]
        ])
        drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
            point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
            1, "#00000000", true, '#292929', ctx)

        drawPath(cropPath, point1.get(0, 0) + buttonImageOffsetX, point1.get(1, 0) + buttonImageOffsetY, ctx)
        drawPath(pinpPath, point1.get(0, 0) + buttonImageOffsetX, point1.get(1, 0) + buttonImageOffsetY + buttonImageOffsetStep, ctx)
        drawPath(flipHorizontal, point1.get(0, 0) + buttonImageOffsetX, point1.get(1, 0) + buttonImageOffsetY + 2 * buttonImageOffsetStep, ctx)
        drawPath(flipVertical, point1.get(0, 0) + buttonImageOffsetX, point1.get(1, 0) + buttonImageOffsetY + 3 * buttonImageOffsetStep, ctx)

        setColorHash(outerMenuRects, colorsHash)
        outerMenuRects.forEach(rect => {
            let point1 = rotatePointAndMapToScreen(rect.x, rect.y, rotation)
            let point2 = rotatePointAndMapToScreen(rect.x, rect.y - rect.height, rotation)
            let point3 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y - rect.height, rotation)
            let point4 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y, rotation)
            drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
                point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
                1, "#00000000", true, '#00000000', ctx)

            drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
                point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
                1, "#00000000", true, rect.colorKey, hitCtx)
        })
    }
    const menuClicked = (e: MouseEvent) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        console.log('color', mousePos, color, colorsHash, pixel)
        const shape = colorsHash.get(color);
        if (shape) {
            onOuterMenuClicked(shape.id)
        }
    }
    const addMenuListener = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvas.addEventListener('click', menuClicked);
    }
    const removeMenuListener = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvas.removeEventListener('click', menuClicked);
    }

    let cropMenuRects = [
        {id: 'back', x: cropMenuX, y: cropMenuY, width: buttonWidth, height: buttonHeight, colorKey: ''},
        {
            id: 'done',
            x: cropMenuX,
            y: cropMenuY - buttonHeight,
            width: buttonWidth,
            height: buttonHeight,
            colorKey: ''
        },
    ]

    const updateCropMenuRects = () => {
        cropMenuRects[0].x = cropMenuX;
        cropMenuRects[0].y = cropMenuY;

        cropMenuRects[1].x = cropMenuX
        cropMenuRects[1].y = cropMenuY - buttonHeight;
    }

    const drawCropMenu = () => {
        updateCropMenuRects()

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

        let point1 = rotatePointAndMapToScreen(cropMenuX, cropMenuY, rotation)
        let point2 = new Matrix([
            [point1.get(0, 0)],
            [point1.get(1, 0) + 64]
        ])
        let point3 = new Matrix([
            [point1.get(0, 0) + 28],
            [point1.get(1, 0) + 64]
        ])
        let point4 = new Matrix([
            [point1.get(0, 0) + 28],
            [point1.get(1, 0)]
        ])
        drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
            point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
            1, "#00000000", true, '#292929', ctx)

        drawPath(backPath, point1.get(0, 0) + buttonImageOffsetX, point1.get(1, 0) + buttonImageOffsetY, ctx)
        drawPath(donePath, point1.get(0, 0) + buttonImageOffsetX, point1.get(1, 0) + buttonImageOffsetY + buttonImageOffsetStep, ctx)

        setColorHash(cropMenuRects, colorsHash)

        cropMenuRects.forEach(rect => {
            let point1 = rotatePointAndMapToScreen(rect.x, rect.y, rotation)
            let point2 = rotatePointAndMapToScreen(rect.x, rect.y - rect.height, rotation)
            let point3 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y - rect.height, rotation)
            let point4 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y, rotation)
            drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
                point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
                1, "#292929", true, '#00000000', ctx)

            drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
                point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
                1, "#292929", true, rect.colorKey, hitCtx)
        })
    }

    const cropMenuClicked = (e: MouseEvent) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const shape = colorsHash.get(color);
        if (shape) {
            onInnerMenuCropClicked(shape.id)
        }
    }

    const addCropMenuListener = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvas.addEventListener('click', cropMenuClicked);
    }

    const removeCropMenuListener = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvas.removeEventListener('click', cropMenuClicked);
    }

    const innerMenuPinp = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

        drawRect(x, y, 28, 148, 0, "", true, '#292929', ctx)

        drawPath(backPath, x + buttonImageOffsetX, y + buttonImageOffsetY, ctx)
        drawPath(pinpLeftTopPath, x + buttonImageOffsetX, y + buttonImageOffsetY + buttonImageOffsetStep, ctx)
        drawPath(pinpRightTopPath, x + buttonImageOffsetX, y + buttonImageOffsetY + 2 * buttonImageOffsetStep, ctx)
        drawPath(pinpLeftBottomPath, x + buttonImageOffsetX, y + buttonImageOffsetY + 3 * buttonImageOffsetStep, ctx)
        drawPath(pinpRightBottomPath, x + buttonImageOffsetX, y + buttonImageOffsetY + 4 * buttonImageOffsetStep, ctx)
    }

    let cropAnchorRects = [
        {id: 'leftTop', x: newX, y: newY, width: anchorWidth, height: anchorHeight, colorKey: ''},
        {
            id: 'rightTop',
            x: newX + newWidth - anchorWidth,
            y: newY,
            width: anchorWidth,
            height: anchorHeight,
            colorKey: ''
        },
        {
            id: 'leftBottom',
            x: newX,
            y: newY - newHeight + anchorHeight,
            width: anchorWidth,
            height: anchorHeight,
            colorKey: ''
        },
        {
            id: 'rightBottom',
            x: newX + newWidth - anchorWidth,
            y: newY - newHeight + anchorHeight,
            width: anchorWidth,
            height: anchorHeight,
            colorKey: ''
        },
        {
            id: 'topCenter',
            x: newX + (newWidth - anchorWidth) / 2,
            y: newY,
            width: anchorWidth,
            height: anchorHeight,
            colorKey: ''
        },
        {
            id: 'bottomCenter',
            x: newX + (newWidth - anchorWidth) / 2,
            y: newY - newHeight + anchorHeight,
            width: anchorWidth,
            height: anchorHeight,
            colorKey: ''
        },
        {
            id: 'leftCenter',
            x: newX,
            y: newY + (newHeight - anchorHeight) / 2,
            width: anchorWidth,
            height: anchorHeight,
            colorKey: ''
        },
        {
            id: 'rightCenter',
            x: newX + newWidth - anchorWidth,
            y: newY - (newHeight - anchorHeight) / 2,
            width: anchorWidth,
            height: anchorHeight,
            colorKey: ''
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
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hitCtx.clearRect(0, 0, canvas.width, canvas.height);
        hitCtx.fillStyle = "green";
        hitCtx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const drawCropRects = () => {
        updateCropAnchorRects()

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;

        let point1 = rotatePointAndMapToScreen(newX, newY, newRotation)
        let point2 = rotatePointAndMapToScreen(newX, newY - newHeight, newRotation)
        let point3 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight, newRotation)
        let point4 = rotatePointAndMapToScreen(newX + newWidth, newY, newRotation)

        drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
            point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
            1, `#FBB500`, false, "", ctx)

        // left up anchor
        let leftUpRect1Point1 = rotatePointAndMapToScreen(newX, newY, newRotation)
        let leftUpRect1Point2 = rotatePointAndMapToScreen(newX, newY - 4, newRotation)
        let leftUpRect1Point3 = rotatePointAndMapToScreen(newX + 12, newY - 4, newRotation)
        let leftUpRect1Point4 = rotatePointAndMapToScreen(newX + 12, newY, newRotation)
        drawRect2(leftUpRect1Point1.get(0, 0), leftUpRect1Point1.get(1, 0), leftUpRect1Point2.get(0, 0), leftUpRect1Point2.get(1, 0),
            leftUpRect1Point3.get(0, 0), leftUpRect1Point3.get(1, 0), leftUpRect1Point4.get(0, 0), leftUpRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)

        let leftUpRect2Point1 = rotatePointAndMapToScreen(newX, newY, newRotation)
        let leftUpRect2Point2 = rotatePointAndMapToScreen(newX, newY - 12, newRotation)
        let leftUpRect2Point3 = rotatePointAndMapToScreen(newX + 4, newY - 12, newRotation)
        let leftUpRect2Point4 = rotatePointAndMapToScreen(newX + 4, newY, newRotation)
        drawRect2(leftUpRect2Point1.get(0, 0), leftUpRect2Point1.get(1, 0), leftUpRect2Point2.get(0, 0), leftUpRect2Point2.get(1, 0),
            leftUpRect2Point3.get(0, 0), leftUpRect2Point3.get(1, 0), leftUpRect2Point4.get(0, 0), leftUpRect2Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)

        // right up anchor
        let rightUpRect1Point1 = rotatePointAndMapToScreen(newX + newWidth -12, newY, newRotation)
        let rightUpRect1Point2 = rotatePointAndMapToScreen(newX + newWidth -12, newY - 4, newRotation)
        let rightUpRect1Point3 = rotatePointAndMapToScreen(newX + newWidth, newY - 4, newRotation)
        let rightUpRect1Point4 = rotatePointAndMapToScreen(newX + newWidth, newY, newRotation)
        drawRect2(rightUpRect1Point1.get(0, 0), rightUpRect1Point1.get(1, 0), rightUpRect1Point2.get(0, 0), rightUpRect1Point2.get(1, 0),
            rightUpRect1Point3.get(0, 0), rightUpRect1Point3.get(1, 0), rightUpRect1Point4.get(0, 0), rightUpRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)

        let rightUpRect2Point1 = rotatePointAndMapToScreen(newX + newWidth - 4, newY, newRotation)
        let rightUpRect2Point2 = rotatePointAndMapToScreen(newX + newWidth - 4, newY - 12, newRotation)
        let rightUpRect2Point3 = rotatePointAndMapToScreen(newX + newWidth, newY - 12, newRotation)
        let rightUpRect2Point4 = rotatePointAndMapToScreen(newX + newWidth, newY, newRotation)
        drawRect2(rightUpRect2Point1.get(0, 0), rightUpRect2Point1.get(1, 0), rightUpRect2Point2.get(0, 0), rightUpRect2Point2.get(1, 0),
            rightUpRect2Point3.get(0, 0), rightUpRect2Point3.get(1, 0), rightUpRect2Point4.get(0, 0), rightUpRect2Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)


        // left bottom anchor
        let leftBottomRect1Point1 = rotatePointAndMapToScreen(newX, newY - newHeight + 4, newRotation)
        let leftBottomRect1Point2 = rotatePointAndMapToScreen(newX, newY - newHeight, newRotation)
        let leftBottomRect1Point3 = rotatePointAndMapToScreen(newX + 12, newY - newHeight, newRotation)
        let leftBottomRect1Point4 = rotatePointAndMapToScreen(newX + 12, newY - newHeight + 4, newRotation)
        drawRect2(leftBottomRect1Point1.get(0, 0), leftBottomRect1Point1.get(1, 0), leftBottomRect1Point2.get(0, 0), leftBottomRect1Point2.get(1, 0),
            leftBottomRect1Point3.get(0, 0), leftBottomRect1Point3.get(1, 0), leftBottomRect1Point4.get(0, 0), leftBottomRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)

        let leftBottomRect2Point1 = rotatePointAndMapToScreen(newX, newY - newHeight + 12, newRotation)
        let leftBottomRect2Point2 = rotatePointAndMapToScreen(newX, newY - newHeight, newRotation)
        let leftBottomRect2Point3 = rotatePointAndMapToScreen(newX + 4, newY - newHeight, newRotation)
        let leftBottomRect2Point4 = rotatePointAndMapToScreen(newX + 4, newY - newHeight + 12, newRotation)
        drawRect2(leftBottomRect2Point1.get(0, 0), leftBottomRect2Point1.get(1, 0), leftBottomRect2Point2.get(0, 0), leftBottomRect2Point2.get(1, 0),
            leftBottomRect2Point3.get(0, 0), leftBottomRect2Point3.get(1, 0), leftBottomRect2Point4.get(0, 0), leftBottomRect2Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)


        // right bottom anchor
        let rightBottomRect1Point1 = rotatePointAndMapToScreen(newX + newWidth - 12, newY - newHeight + 4, newRotation)
        let rightBottomRect1Point2 = rotatePointAndMapToScreen(newX + newWidth - 12, newY - newHeight, newRotation)
        let rightBottomRect1Point3 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight, newRotation)
        let rightBottomRect1Point4 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight + 4, newRotation)
        drawRect2(rightBottomRect1Point1.get(0, 0), rightBottomRect1Point1.get(1, 0), rightBottomRect1Point2.get(0, 0), rightBottomRect1Point2.get(1, 0),
            rightBottomRect1Point3.get(0, 0), rightBottomRect1Point3.get(1, 0), rightBottomRect1Point4.get(0, 0), rightBottomRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)

        let rightBottomRect2Point1 = rotatePointAndMapToScreen(newX + newWidth - 4, newY - newHeight + 12, newRotation)
        let rightBottomRect2Point2 = rotatePointAndMapToScreen(newX + newWidth - 4, newY - newHeight, newRotation)
        let rightBottomRect2Point3 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight, newRotation)
        let rightBottomRect2Point4 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight + 12, newRotation)
        drawRect2(rightBottomRect2Point1.get(0, 0), rightBottomRect2Point1.get(1, 0), rightBottomRect2Point2.get(0, 0), rightBottomRect2Point2.get(1, 0),
            rightBottomRect2Point3.get(0, 0), rightBottomRect2Point3.get(1, 0), rightBottomRect2Point4.get(0, 0), rightBottomRect2Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)


        // up center anchor
        let upCenterRect1Point1 = rotatePointAndMapToScreen(newX + newWidth/2 - 6, newY, newRotation)
        let upCenterRect1Point2 = rotatePointAndMapToScreen(newX + newWidth/2 - 6, newY - 4, newRotation)
        let upCenterRect1Point3 = rotatePointAndMapToScreen(newX + newWidth/2 + 6, newY - 4, newRotation)
        let upCenterRect1Point4 = rotatePointAndMapToScreen(newX + newWidth/2 + 6, newY, newRotation)
        drawRect2(upCenterRect1Point1.get(0, 0), upCenterRect1Point1.get(1, 0), upCenterRect1Point2.get(0, 0), upCenterRect1Point2.get(1, 0),
            upCenterRect1Point3.get(0, 0), upCenterRect1Point3.get(1, 0), upCenterRect1Point4.get(0, 0), upCenterRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)


        // bottom center anchor
        let bottomCenterRect1Point1 = rotatePointAndMapToScreen(newX + newWidth/2 - 6, newY - newHeight + 4, newRotation)
        let bottomCenterRect1Point2 = rotatePointAndMapToScreen(newX + newWidth/2 - 6, newY - newHeight, newRotation)
        let bottomCenterRect1Point3 = rotatePointAndMapToScreen(newX + newWidth/2 + 6, newY - newHeight, newRotation)
        let bottomCenterRect1Point4 = rotatePointAndMapToScreen(newX + newWidth/2 + 6, newY - newHeight + 4, newRotation)
        drawRect2(bottomCenterRect1Point1.get(0, 0), bottomCenterRect1Point1.get(1, 0), bottomCenterRect1Point2.get(0, 0), bottomCenterRect1Point2.get(1, 0),
            bottomCenterRect1Point3.get(0, 0), bottomCenterRect1Point3.get(1, 0), bottomCenterRect1Point4.get(0, 0), bottomCenterRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)

        // left center anchor
        let leftCenterRect1Point1 = rotatePointAndMapToScreen(newX, newY - newHeight/2 + 6, newRotation)
        let leftCenterRect1Point2 = rotatePointAndMapToScreen(newX, newY - newHeight/2 - 6, newRotation)
        let leftCenterRect1Point3 = rotatePointAndMapToScreen(newX + 4, newY - newHeight/2 - 6, newRotation)
        let leftCenterRect1Point4 = rotatePointAndMapToScreen(newX + 4, newY - newHeight/2 + 6, newRotation)
        drawRect2(leftCenterRect1Point1.get(0, 0), leftCenterRect1Point1.get(1, 0), leftCenterRect1Point2.get(0, 0), leftCenterRect1Point2.get(1, 0),
            leftCenterRect1Point3.get(0, 0), leftCenterRect1Point3.get(1, 0), leftCenterRect1Point4.get(0, 0), leftCenterRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)


        // right center anchor
        let rightCenterRect1Point1 = rotatePointAndMapToScreen(newX + newWidth - 4, newY - newHeight/2 + 6, newRotation)
        let rightCenterRect1Point2 = rotatePointAndMapToScreen(newX + newWidth - 4, newY - newHeight/2 - 6, newRotation)
        let rightCenterRect1Point3 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight/2 - 6, newRotation)
        let rightCenterRect1Point4 = rotatePointAndMapToScreen(newX + newWidth, newY - newHeight/2 + 6, newRotation)
        drawRect2(rightCenterRect1Point1.get(0, 0), rightCenterRect1Point1.get(1, 0), rightCenterRect1Point2.get(0, 0), rightCenterRect1Point2.get(1, 0),
            rightCenterRect1Point3.get(0, 0), rightCenterRect1Point3.get(1, 0), rightCenterRect1Point4.get(0, 0), rightCenterRect1Point4.get(1, 0),
            1, `#ffffff`, true, `#ffffff`, ctx)


        setColorHash(cropAnchorRects, colorsHash)
        cropAnchorRects.forEach(rect => {
            let point1 = rotatePointAndMapToScreen(rect.x, rect.y, newRotation)
            let point2 = rotatePointAndMapToScreen(rect.x, rect.y - rect.height, newRotation)
            let point3 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y - rect.height, newRotation)
            let point4 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y, newRotation)
            drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
                point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
                1, "#292929", true, rect.colorKey, hitCtx)
        })
    }

    let transforming = false
    let movementX = 0
    let movementY = 0

    let rotationAnchorX = 0
    let rotationAnchorY = (height / 2) * scaleY + rotateAnchorOffset

    let rotationAnchorRects = [
        {id: 'rotation', x: rotationAnchorX - rotationAnchorWidth/2, y: rotationAnchorY + rotationAnchorHeight/2, width: rotationAnchorWidth, height: rotationAnchorHeight, colorKey: ''}
    ]

    const drawRotationAnchor = () => {
        let anchorCartesianX = 0
        let anchorCartesianY = (newHeight / 2) * scaleY + rotateAnchorOffset
        let anchorRotation = newRotation

        let anchorPoint = new Matrix([
            [anchorCartesianX],
            [anchorCartesianY]
        ])
        anchorPoint = rotatePoint(anchorPoint, anchorRotation)
        let anchorScreenPoint = coordinateMapCartesianToScreen(canvasWidth, canvasHeight, anchorPoint.get(0, 0), anchorPoint.get(1, 0))

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
        let radius = 8
        drawCircle(anchorScreenPoint.get(0, 0), anchorScreenPoint.get(1, 0), radius, 1, "#ffffff", true, "#ffffff", ctx)

        drawPath(rotatePath, anchorScreenPoint.get(0, 0) - radius, anchorScreenPoint.get(1, 0) - radius, ctx)

        rotationAnchorRects[0].x = anchorPoint.get(0, 0) - rotationAnchorWidth/2
        rotationAnchorRects[0].y = anchorPoint.get(1, 0) + rotationAnchorHeight/2
        setColorHash(rotationAnchorRects, colorsHash)
        rotationAnchorRects.forEach(rect => {
            let point1 = rotatePointAndMapToScreen(rect.x, rect.y, 0)
            let point2 = rotatePointAndMapToScreen(rect.x, rect.y - rect.height, 0)
            let point3 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y - rect.height, 0)
            let point4 = rotatePointAndMapToScreen(rect.x + rect.width, rect.y, 0)
            drawRect2(point1.get(0, 0), point1.get(1, 0), point2.get(0, 0), point2.get(1, 0),
                point3.get(0, 0), point3.get(1, 0), point4.get(0, 0), point4.get(1, 0),
                1, "#292929", true, rect.colorKey, hitCtx)
        })
    }

    let originAngle = 0
    let originRotation = rotation
    const rotationAnchorMouseDown = (e: MouseEvent) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const shape = colorsHash.get(color);
        if (shape) {
            console.log('mousedown', shape.id)
            transforming = true
            let point = coordinateMapScreenToCartesian(canvasWidth, canvasHeight, e.clientX, e.clientY)
            originAngle = calcAngleDegrees(point.get(0, 0), point.get(1, 0))
        }
    }

    const rotationAnchorMouseMove = (e: MouseEvent) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const shape = colorsHash.get(color);

        if (transforming) {
            let point = coordinateMapScreenToCartesian(canvasWidth, canvasHeight, e.clientX, e.clientY)
            let angle = calcAngleDegrees(point.get(0, 0), point.get(1, 0))
            let tempRotation = angle - originAngle
            newRotation = originRotation + tempRotation
            console.log("angle", angle, "originAngle", originAngle, "tempRotation", tempRotation, "originRotation",originRotation, "newRotation", newRotation)

            clearCtx()
            drawBoundRect()
            drawMenu()
            addMenuListener()

            drawRotationAnchor()
            addRotationListener()
        }
    }

    const rotationAnchorMouseUp = (e: MouseEvent) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };

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
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const shape = colorsHash.get(color);
        if (shape) {
            console.log('mousedown', shape.id)
            transforming = true
            cropStartScreenX = e.clientX
            cropStartScreenY = e.clientY
            cropStartWidth = newWidth
            cropStartHeight = newHeight

            let point = rotatePointAndMapToScreen(newX, newY, newRotation)
            cropLeftTopScreenX = point.get(0, 0)
            cropLeftTopScreenY = point.get(1, 0)

            leftTopPointMouseOffsetX = cropLeftTopScreenX - e.clientX
            leftTopPointMouseOffsetY = cropLeftTopScreenY - e.clientY
        }
    }

    const cropAnchorMouseMove = (e: MouseEvent) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };
        const pixel = hitCtx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const shape = colorsHash.get(color);

        if (transforming) {
            movementX = (e.clientX - cropStartScreenX)
            movementY = (e.clientY - cropStartScreenY)

            let angleBetweenMovementAndHorizontalAxis = calcAngleDegrees(movementX, -movementY)
            let length = Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2))
            let trimmedWidth = length * Math.cos((angleBetweenMovementAndHorizontalAxis - newRotation)*Math.PI/180)
            let trimmedHeight = length * Math.sin((angleBetweenMovementAndHorizontalAxis - newRotation)*Math.PI/180)
            trimmedWidth = Math.abs(trimmedWidth)
            trimmedHeight = Math.abs(trimmedHeight)
            console.log("angleBetweenMovementAndHorizontalAxis", angleBetweenMovementAndHorizontalAxis, newRotation, length, trimmedWidth, trimmedHeight)

            let newCropLeftTopScreenX = e.clientX + leftTopPointMouseOffsetX
            let newCropLeftTopScreenY = e.clientY + leftTopPointMouseOffsetY
            newWidth = cropStartWidth - 2 * trimmedWidth
            newHeight = cropStartHeight - 2 * trimmedHeight
            let point = rotatePointAndMapToCartesian(newCropLeftTopScreenX, newCropLeftTopScreenY, newRotation)
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
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        };

        transforming = false
        let point = coordinateMapCartesianToScreen(canvasWidth, canvasHeight, newX, newY)
        cropStartScreenX = point.get(0, 0)
        cropStartScreenY = point.get(1, 0)
        cropStartWidth = newWidth
        cropStartHeight = newHeight

        addCropMenuListener()
        addCropAnchorListener()
    }

    const addRotationListener = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        canvas.addEventListener('mousedown', rotationAnchorMouseDown)

        canvas.addEventListener('mousemove', rotationAnchorMouseMove)

        canvas.addEventListener('mouseup', rotationAnchorMouseUp)
    }

    const removeRotationListener = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        canvas.removeEventListener('mousedown', rotationAnchorMouseDown)

        canvas.removeEventListener('mousemove', rotationAnchorMouseMove)

        canvas.removeEventListener('mouseup', rotationAnchorMouseUp)
    }

    const addCropAnchorListener = () => {

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        canvas.addEventListener('mousedown', cropAnchorMouseDown)

        canvas.addEventListener('mousemove', cropAnchorMouseMove)

        canvas.addEventListener('mouseup', cropAnchorMouseUp)
    }

    const removeCropAnchorListener = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        canvas.removeEventListener('mousedown', cropAnchorMouseDown)

        canvas.removeEventListener('mousemove', cropAnchorMouseMove)

        canvas.removeEventListener('mouseup', cropAnchorMouseUp)
    }

    return (
        <>
        </>
    )
}
