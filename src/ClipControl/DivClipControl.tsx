import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {
    coordinateMapCartesianToScreen,
    coordinateMapScreenToCartesian,
    getHomogeneousTranslationMatrix,
    TransformData
} from "./Math";
import {RegionData} from "./ClipControl";
import CssModule from './DivClipControl.module.css'
import {
    calcAngleDegrees,
    menuIdCrop, menuIdCropBack, menuIdDone, menuIdFlipHorizontal, menuIdFlipVertical,
    menuIdPinp, menuIdPinpBack, menuIdPinpLeftBottom, menuIdPinpLeftTop, menuIdPinpRightBottom, menuIdPinpRightTop,
    menuStateLevel1,
    menuStateLevel2Crop,
    menuStateLevel2Pinp,
    menuStateNone
} from "./Utils";
import {Matrix} from "ml-matrix";
import {Box, Tooltip} from "@mui/material";
import { styled } from '@mui/material/styles'
import { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import { ReactComponent as ArrowBackSvg } from '@/assets/svg/clipControl/arrow_back.svg'
import { ReactComponent as CheckSvg } from '@/assets/svg/clipControl/check.svg'
import { ReactComponent as CropSvg } from '@/assets/svg/clipControl/crop.svg'
import { ReactComponent as FlipHorizontalSvg } from '@/assets/svg/clipControl/flip_horizontal.svg'
import { ReactComponent as FlipVerticalSvg } from '@/assets/svg/clipControl/flip_vertical.svg'
import { ReactComponent as PictureInPictureSvg } from '@/assets/svg/clipControl/picture_in_picture.svg'
import { ReactComponent as PinpLeftBottomSvg } from '@/assets/svg/clipControl/pinp_left_bottom.svg'
import { ReactComponent as PinpLeftTopSvg } from '@/assets/svg/clipControl/pinp_left_top.svg'
import { ReactComponent as PinpRightBottomSvg } from '@/assets/svg/clipControl/pinp_right_bottom.svg'
import { ReactComponent as PinpRightTopSvg } from '@/assets/svg/clipControl/pinp_right_top.svg'

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: '#414141',
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#414141',
    },
}))

export interface IDivClipControlProps {
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

let translationStartScreenX = 0
let translationStartScreenY = 0
let scaleStartScreenX = 0
let scaleStartScreenY = 0
let movementX = 0
let movementY = 0
let translating = false
let rotating = false
let scaling = false
let scaleAnchor = 0
let originTransX = 0
let originTransY = 0
let originRotation = 0
let originAngle = 0
let originScaleX = 1
let originScaleY = 1
let hypotenuse = 0
let newHypotenuse = 0
export interface IDivClipControlRef {
    updateCanvasInfo: (
        canvasWidth: number,
        canvasHeight: number,
        offsetX: number,
        offsetY: number,
    ) => void
    updateProps: (props: IDivClipControlProps) => void
    redraw: () => void
    getNDCPointsAfterCrop: (withRotation: boolean) => void
    startWorkflow: () => void
}

export const DivClipControl = forwardRef<IDivClipControlRef, IDivClipControlProps>(
    (props: IDivClipControlProps, ref) => {
        const [x, setX] = useState(0)
        const [y, setY] = useState(0)
        const [width, setWidth] = useState(0)
        const [height, setHeight] = useState(0)
        const [rotation, setRotation] = useState(0)
        const [scaleX, setScaleX] = useState(0)
        const [scaleY, setScaleY] = useState(0)
        const [transX, setTransX] = useState(0)
        const [transY, setTransY] = useState(0)
        const [liveWindowWidth, setLiveWindowWidth] = useState(0)
        const [liveWindowHeight, setLiveWindowHeight] = useState(0)
        const [screenX, setScreenX] = useState(0)
        const [screenY, setScreenY] = useState(0)
        const [canvasWidth, setCanvasWidth] = useState(0)
        const [canvasHeight, setCanvasHeight] = useState(0)
        const [canvasOffsetX, setCanvasOffsetX] = useState(0)
        const [canvasOffsetY, setCanvasOffsetY] = useState(0)
        const [keepRatio, setKeepRatio] = useState(true)
        const [showMenu, setShowMenu] = useState(true)
        const [menuState, setMenuState] = useState(menuStateLevel1)
        const [menuScreenX, setMenuScreenX] = useState(0)
        const [menuScreenY, setMenuScreenY] = useState(0)

        useEffect(() => {
            setX(props.x)
            setY(props.y)
            setWidth(props.width)
            setHeight(props.height)
            setRotation(props.rotation)
            setScaleX(props.scaleX)
            setScaleY(props.scaleY)
            setTransX(props.transX)
            setTransY(props.transY)
            setLiveWindowWidth(props.liveWindowWidth)
            setLiveWindowHeight(props.liveWindowHeight)
        }, []);

        useEffect(() => {
            let point = coordinateMapCartesianToScreen(canvasWidth, canvasHeight, x, y)
            setScreenX(point.get(0, 0))
            setScreenY(point.get(1, 0))
        }, [canvasWidth, canvasHeight, canvasOffsetX, canvasOffsetY]);

        useImperativeHandle(ref, () => ({
            updateCanvasInfo,
            updateProps,
            redraw,
            getNDCPointsAfterCrop,
            startWorkflow,
        }))

        const updateCanvasInfo = (
            width: number,
            height: number,
            offsetX: number,
            offsetY: number,
        ) => {
            setCanvasWidth(width)
            setCanvasHeight(height)
            setCanvasOffsetX(offsetX)
            setCanvasOffsetY(offsetY)
        }
        const updateProps = () => {
        }
        const redraw = () => {
        }
        const getNDCPointsAfterCrop = () => {
        }
        const startWorkflow = () => {
        }

        const onTranslateMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            translationStartScreenX = e.clientX
            translationStartScreenY = e.clientY
            translating = true
            originTransX = transX
            originTransY = transY
        }
        const onTranslateMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (translating) {
                movementX = e.clientX - translationStartScreenX
                movementY = e.clientY - translationStartScreenY

                setTransX(originTransX + movementX)
                setTransY(originTransY + movementY)
            }
        }
        const onTranslateMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            translating = false
        }

        const onRotateMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            rotating = true
            originRotation = rotation
            const mousePos = {
                x: e.clientX - canvasOffsetX,
                y: e.clientY - canvasOffsetY,
            }
            let point = coordinateMapScreenToCartesian(
                canvasWidth,
                canvasHeight,
                mousePos.x,
                mousePos.y,
            )

            let transM = getHomogeneousTranslationMatrix(-transX, -transY)
            point = transM.mmul(
                new Matrix([[point.get(0, 0)], [point.get(1, 0)], [1]]),
            )

            originAngle = calcAngleDegrees(point.get(0, 0), point.get(1, 0))
            e.stopPropagation()
        }

        const getTrimmedWidth = (movementX: number, movementY: number) => {
            let angleBetweenMovementAndHorizontalAxis = calcAngleDegrees(
                movementX,
                movementY,
            )
            let length = Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2))
            let trimmedWidth =
                length *
                Math.cos(
                    ((angleBetweenMovementAndHorizontalAxis + rotation) * Math.PI) /
                    180,
                )
            return trimmedWidth
        }

        const getTrimmedHeight = (movementX: number, movementY: number) => {
            let angleBetweenMovementAndHorizontalAxis = calcAngleDegrees(
                movementX,
                movementY,
            )
            let length = Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2))
            let trimmedHeight =
                length *
                Math.sin(
                    ((angleBetweenMovementAndHorizontalAxis + rotation) * Math.PI) /
                    180,
                )
            return trimmedHeight
        }

        const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (rotating) {
                const mousePos = {
                    x: e.clientX - canvasOffsetX,
                    y: e.clientY - canvasOffsetY,
                }
                let point = coordinateMapScreenToCartesian(
                    canvasWidth,
                    canvasHeight,
                    mousePos.x,
                    mousePos.y,
                )
                let transM = getHomogeneousTranslationMatrix(-transX, -transY)
                point = transM.mmul(
                    new Matrix([[point.get(0, 0)], [point.get(1, 0)], [1]]),
                )

                let angle = calcAngleDegrees(point.get(0, 0), point.get(1, 0))
                let tempRotation = angle - originAngle
                setRotation(originRotation + tempRotation)
                e.stopPropagation()
            }
            if (scaling) {
                movementX = e.clientX - scaleStartScreenX
                movementY = e.clientY - scaleStartScreenY

                let trimmedWidth = getTrimmedWidth(movementX, movementY)
                let trimmedHeight = getTrimmedHeight(movementX, movementY)
                let originWidth = width * originScaleX
                let originHeight = height * originScaleY
                let scaleX = 1
                let scaleY = 1
                if (scaleAnchor == 1) {
                    scaleX = (originWidth - 2 * trimmedWidth) / originWidth
                    scaleY = (originHeight - 2 * trimmedHeight) / originHeight
                    newHypotenuse = Math.sqrt(
                        Math.pow(originWidth - 2 * trimmedWidth, 2) +
                        Math.pow(originHeight - 2 * trimmedHeight, 2),
                    )
                } else if (scaleAnchor == 2) {
                    scaleX = (originWidth - 2 * trimmedWidth) / originWidth
                    scaleY = (originHeight + 2 * trimmedHeight) / originHeight
                    newHypotenuse = Math.sqrt(
                        Math.pow(originWidth - 2 * trimmedWidth, 2) +
                        Math.pow(originHeight + 2 * trimmedHeight, 2),
                    )
                } else if (scaleAnchor == 3) {
                    scaleX = (originWidth + 2 * trimmedWidth) / originWidth
                    scaleY = (originHeight + 2 * trimmedHeight) / originHeight
                    newHypotenuse = Math.sqrt(
                        Math.pow(originWidth + 2 * trimmedWidth, 2) +
                        Math.pow(originHeight + 2 * trimmedHeight, 2),
                    )
                } else if (scaleAnchor == 4) {
                    scaleX = (originWidth + 2 * trimmedWidth) / originWidth
                    scaleY = (originHeight - 2 * trimmedHeight) / originHeight
                    newHypotenuse = Math.sqrt(
                        Math.pow(originWidth + 2 * trimmedWidth, 2) +
                        Math.pow(originHeight - 2 * trimmedHeight, 2),
                    )
                }

                if (keepRatio) {
                    setScaleX(originScaleX * (newHypotenuse / hypotenuse))
                    setScaleY(originScaleY * (newHypotenuse / hypotenuse))
                } else {
                    setScaleX(originScaleX * scaleX)
                    setScaleY(originScaleY * scaleY)
                }
            }
        }

        const onMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (rotating) {
                rotating = false
                e.stopPropagation()
            }
            if (scaling) {
                scaling = false
                e.stopPropagation()
            }
        }

        const onScaleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, anchorIndex: number) => {
            scaling = true
            scaleAnchor = anchorIndex
            scaleStartScreenX = e.clientX
            scaleStartScreenY = e.clientY
            originScaleX = scaleX
            originScaleY = scaleY
            hypotenuse = Math.sqrt(
                Math.pow(width * originScaleX, 2) +
                Math.pow(height * originScaleY, 2),
            )
        }

        const onMenuClicked = (menuId: string) => {
            if (menuId == menuIdCrop) {
                setMenuState(menuStateLevel2Crop)
            } else if (menuId == menuIdPinp) {
                setMenuState(menuStateLevel2Pinp)
            } else if (menuId == menuIdFlipHorizontal) {

            } else if (menuId == menuIdFlipVertical) {

            } else if (menuId == menuIdCropBack) {
                setMenuState(menuStateLevel1)
            } else if (menuId == menuIdPinpBack) {
                setMenuState(menuStateLevel1)
            } else if (menuId == menuIdDone) {
                setMenuState(menuStateLevel1)
            } else if (
                menuId == menuIdPinpLeftTop ||
                menuId == menuIdPinpRightTop ||
                menuId == menuIdPinpLeftBottom ||
                menuId == menuIdPinpRightBottom
            ) {

            }
        }
        const getMenu = () => {
            if (menuState == menuStateNone) {
                return <></>
            } else if (menuState == menuStateLevel1) {
                return (
                    <>
                        <Box
                            className={CssModule.menu}
                            sx={{ left: menuScreenX, top: menuScreenY }}
                        >
                            <BootstrapTooltip title="Crop" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <CropSvg onClick={() => onMenuClicked(menuIdCrop)} />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip
                                title="Picture in picture"
                                placement="left"
                                arrow
                            >
                                <div className={CssModule.icon}>
                                    <PictureInPictureSvg
                                        onClick={() => onMenuClicked(menuIdPinp)}
                                    />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Flip horizontal" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <FlipHorizontalSvg
                                        onClick={() => onMenuClicked(menuIdFlipHorizontal)}
                                    />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Flip vertical" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <FlipVerticalSvg
                                        onClick={() => onMenuClicked(menuIdFlipVertical)}
                                    />
                                </div>
                            </BootstrapTooltip>
                        </Box>
                    </>
                )
            } else if (menuState == menuStateLevel2Crop) {
                return (
                    <>
                        <Box
                            className={CssModule.menu}
                            sx={{ left: menuScreenX, top: menuScreenY }}
                        >
                            <BootstrapTooltip title="Back" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <ArrowBackSvg onClick={() => onMenuClicked(menuIdCropBack)} />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Done" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <CheckSvg onClick={() => onMenuClicked(menuIdDone)} />
                                </div>
                            </BootstrapTooltip>
                        </Box>
                    </>
                )
            } else if (menuState == menuStateLevel2Pinp) {
                return (
                    <>
                        <Box
                            className={CssModule.menu}
                            sx={{ left: menuScreenX, top: menuScreenY }}
                        >
                            <BootstrapTooltip title="Back" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <ArrowBackSvg onClick={() => onMenuClicked(menuIdPinpBack)} />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Top left" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <PinpLeftTopSvg
                                        onClick={() => onMenuClicked(menuIdPinpLeftTop)}
                                    />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Top right" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <PinpRightTopSvg
                                        onClick={() => onMenuClicked(menuIdPinpRightTop)}
                                    />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Bottom left" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <PinpLeftBottomSvg
                                        onClick={() => onMenuClicked(menuIdPinpLeftBottom)}
                                    />
                                </div>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Bottom right" placement="left" arrow>
                                <div className={CssModule.icon}>
                                    <PinpRightBottomSvg
                                        onClick={() => onMenuClicked(menuIdPinpRightBottom)}
                                    />
                                </div>
                            </BootstrapTooltip>
                        </Box>
                    </>
                )
            }
        }

        const getTransformAnchors = () => {
            return (
                <>
                    <div className={CssModule.translateContainer}
                         onMouseDown={event => onTranslateMouseDown(event)}
                         onMouseMove={event => onTranslateMouseMove(event)}
                         onMouseUp={event => onTranslateMouseUp(event)}
                    ></div>
                    <div className={CssModule.rotateAnchor}
                         style={{
                             transform: `scale(${1 / scaleX}, ${1 / scaleY})`
                         }}
                         onMouseDown={event => onRotateMouseDown(event)}
                    ></div>
                    <div className={CssModule.scaleLeftTop}
                         style={{
                             transform: `scale(${1 / scaleX}, ${1 / scaleY})`
                         }}
                         onMouseDown={event => onScaleMouseDown(event, 1)}
                    >
                    </div>
                    <div className={CssModule.scaleLeftBottom}
                         style={{
                             transform: `scale(${1 / scaleX}, ${1 / scaleY})`
                         }}
                         onMouseDown={event => onScaleMouseDown(event, 2)}
                    >
                    </div>
                    <div className={CssModule.scaleRightBottom}
                         style={{
                             transform: `scale(${1 / scaleX}, ${1 / scaleY})`
                         }}
                         onMouseDown={event => onScaleMouseDown(event, 3)}
                    >
                    </div>
                    <div className={CssModule.scaleRightTop}
                         style={{
                             transform: `scale(${1 / scaleX}, ${1 / scaleY})`
                         }}
                         onMouseDown={event => onScaleMouseDown(event, 4)}
                    >
                    </div>
                </>
            )
        }

        const getCropAnchors = () => {
            return (
                <>
                    <div className={CssModule.leftTopCrop}></div>
                    <div className={CssModule.leftBottomCrop}></div>
                    <div className={CssModule.rightBottomCrop}></div>
                    <div className={CssModule.rightTopCrop}></div>
                    <div className={CssModule.leftCenterCrop}></div>
                    <div className={CssModule.bottomCenterCrop}></div>
                    <div className={CssModule.rightCenterCrop}></div>
                    <div className={CssModule.topCenterCrop}></div>
                </>
            )
        }

        return (
            <>
                <div className={CssModule.container}
                     onMouseMove={event => onMouseMove(event)}
                     onMouseUp={event => onMouseUp(event)}
                >
                    {showMenu ? getMenu() : null}
                    <div style={{
                        transform: `translate(${transX}px, ${transY}px) scale(${scaleX}, ${scaleY}) rotate(${-rotation}deg)`,
                        width: width + "px",
                        height: height + "px",
                        position: "absolute",
                        left: screenX + "px",
                        top: screenY + "px",
                        border: "1px solid yellow",
                        cursor: "move",
                        background: `${menuState == menuStateLevel2Crop ? "#ff00ff50" : "#80008080"}`,
                    }}>
                        {menuState == menuStateLevel1 ? getTransformAnchors() : null}
                        {menuState == menuStateLevel2Crop ? getCropAnchors() : null}
                    </div>
                </div>
            </>
        )

    }
)