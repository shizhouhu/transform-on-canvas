import CssModule from "./index.module.css";
import React, {useEffect, useRef, useState} from "react";
import {ClipControl, IClipControlProps, IClipControlRef, RegionData} from "./ClipControl/ClipControl";
import { Allotment } from 'allotment'
import "allotment/dist/style.css";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {editorActions} from "./store/editor";
import {TransformData} from "./ClipControl/Math";

let width = 1280
let height = 720

const App = () => {
    const [showClipControl, setShowClipControl] = useState(false)
    const clipControlRef = useRef<IClipControlRef>(null)
    const liveWindowContainerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        clipControlRef.current?.updateCanvasInfo(
            liveWindowContainerRef.current?.clientWidth as number,
            liveWindowContainerRef.current?.clientHeight as number,
            liveWindowContainerRef.current?.getBoundingClientRect().x as number,
            liveWindowContainerRef.current?.getBoundingClientRect().y as number,
        )
        setShowClipControl(true)
        console.log("window.screen.width", window.screen.width, "window.screen.height", window.screen.height)
    }, [liveWindowContainerRef.current])

    const doRotate = () => {

    }
    const doCrop = () => {

    }
    const onCropClicked = () => {

    }

    const doClipControlRotate = (rotation: number) => {
    }

    const dispatch = useAppDispatch()
    const doClipControlCrop = (region: RegionData) => {
        dispatch(editorActions.updateCurrentCropRegion(region))
    }
    const doClipControlTransform = (transform: TransformData) => {
        console.log('doClipControlTransform', transform)
    }
    const { clipControlProps } = useAppSelector(state => state.editor)

    const updateClipControlRectInfo = () => {
        let liveWindowContainerX =
            liveWindowContainerRef.current?.getBoundingClientRect().x as number
        let liveWindowContainerY =
            liveWindowContainerRef.current?.getBoundingClientRect().y as number
        let liveWindowContainerWidth =
            liveWindowContainerRef.current?.getBoundingClientRect().width as number
        let liveWindowContainerHeight =
            liveWindowContainerRef.current?.getBoundingClientRect().height as number
        let liveWindowX = liveWindowRef.current?.getBoundingClientRect().x as number
        let liveWindowY = liveWindowRef.current?.getBoundingClientRect().y as number
        let liveWindowWidth = liveWindowRef.current?.getBoundingClientRect()
            .width as number
        let liveWindowHeight = liveWindowRef.current?.getBoundingClientRect()
            .height as number

        clipControlRef.current?.updateCanvasInfo(
            liveWindowContainerWidth,
            liveWindowContainerHeight,
            liveWindowContainerX,
            liveWindowContainerY,
        )

        if (clipControlProps == null) {
            // todo: position and size should modify according to clip type: video, sticker, caption, etc.
            let props: IClipControlProps = {
                x: liveWindowX - liveWindowContainerX - liveWindowContainerWidth / 2,
                y: liveWindowContainerHeight / 2 - (liveWindowY - liveWindowContainerY),
                width: liveWindowWidth,
                height: liveWindowHeight,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                transX: 0,
                transY: 0,
                canvasId: 'clipControlCanvas',
                hitCanvasId: 'clipControlHitCanvas',
                liveWindowWidth: liveWindowWidth,
                liveWindowHeight: liveWindowHeight,
                doCrop: (region: RegionData) => doClipControlCrop(region),
                onCropClicked: onCropClicked,
                doTransform: (transform: TransformData) => doClipControlTransform(transform)
            }
            dispatch(editorActions.updateClipControlProps(props))
        }
    }

    useEffect(() => {
        updateClipControlRectInfo()
        console.log("useEffect", clipControlProps)
        if (clipControlProps) {
            clipControlRef.current?.updateProps(clipControlProps)
            clipControlRef.current?.redraw()
        }
    }, [showClipControl, clipControlProps])


    useEffect(() => {
        updateClipControlRectInfo()
        setShowClipControl(true)
    }, [])

    const clipControlCanvasRef = useRef<HTMLCanvasElement>(null)
    const liveWindowRef = useRef<HTMLCanvasElement>(null)
    return (
        <>
            <Allotment defaultSizes={[window.screen.width * 0.22, window.screen.width]}>
                <Allotment.Pane className="Pane" minSize={200}>
                </Allotment.Pane>
                <Allotment.Pane className="Pane">
                    <Allotment defaultSizes={[60, 600, window.screen.height - 660]} vertical>
                        <Allotment.Pane className="Pane">
                        </Allotment.Pane>
                        <Allotment.Pane className="Pane">
                            <div className={CssModule.container} ref={liveWindowContainerRef}>
                                <canvas id="live-window" ref={liveWindowRef} width={640} height={360} className={CssModule.liveWindow}/>
                                {
                                    showClipControl ? (
                                        <>
                                            <canvas
                                                id="clipControlCanvas"
                                                className={CssModule.clipControlCanvas}
                                                ref={clipControlCanvasRef}
                                            ></canvas>
                                            <canvas
                                                id="clipControlHitCanvas"
                                                className={CssModule.clipControlHitCanvas}
                                            ></canvas>
                                            <ClipControl
                                                x={clipControlProps!.x}
                                                y={clipControlProps!.y}
                                                width={clipControlProps!.width}
                                                height={clipControlProps!.height}
                                                rotation={clipControlProps!.rotation}
                                                scaleX={clipControlProps!.scaleX}
                                                scaleY={clipControlProps!.scaleY}
                                                transX={clipControlProps!.transX}
                                                transY={clipControlProps!.transY}
                                                liveWindowWidth={clipControlProps!.liveWindowWidth}
                                                liveWindowHeight={clipControlProps!.liveWindowHeight}
                                                ref={clipControlRef}
                                                doCrop={doCrop}
                                                onCropClicked={onCropClicked}
                                                doTransform={doClipControlTransform}
                                                canvasId={"clipControlCanvas"}
                                                hitCanvasId={"clipControlHitCanvas"}
                                            />
                                        </>

                                    ) : null
                                }
                            </div>
                        </Allotment.Pane>
                        <Allotment.Pane className="Pane" minSize={200}>
                        </Allotment.Pane>
                    </Allotment>
                </Allotment.Pane>
            </Allotment>
        </>
    )
}

export default App;
