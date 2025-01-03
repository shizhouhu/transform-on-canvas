import CssModule from "./index.module.css";
import React, {useEffect, useRef, useState} from "react";
import {ClipControl, IClipControlProps, IClipControlRef, RegionData} from "./ClipControl/ClipControl";
import {DivClipControl, IDivClipControlProps, IDivClipControlRef} from "./ClipControl/DivClipControl";
import { Allotment } from 'allotment'
import "allotment/dist/style.css";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {editorActions} from "./store/editor";
import {TransformData} from "./ClipControl/Math";
import {Button} from "@mui/material";

let width = 1280
let height = 720

const App = () => {
    const [showClipControl, setShowClipControl] = useState(false)
    const clipControlRef = useRef<IClipControlRef>(null)
    const liveWindowContainerRef = useRef<HTMLDivElement>(null)
    const clipControlCanvasRef = useRef<HTMLCanvasElement>(null)
    const liveWindowRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        setShowClipControl(true)
    }, [])

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

        // console.log("window.screen.width", window.screen.width, "window.screen.height", window.screen.height)
        console.log("liveWindowContainer width", liveWindowContainerWidth, "liveWindowContainer height", liveWindowContainerHeight)

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
        setTimeout(() => {
            updateClipControlRectInfo()
        }, 1)
    }, [showClipControl])

    useEffect(() => {
        if (clipControlProps) {
            clipControlRef.current?.updateProps(clipControlProps)
            clipControlRef.current?.redraw()
        }
    }, [clipControlProps]);

    let editPanel  = useAppSelector(
        state => state.editor.editPanel,
    )
    const onSwitchClicked = () => {
        if (editPanel.length == 0) {
            editPanel = "video"
        } else {
            editPanel = ""
        }
        console.log("switch", editPanel)
        dispatch(editorActions.updateEditPanel(editPanel))
    }

    return (
        <>
            <Allotment defaultSizes={[window.screen.width * 0.22, window.screen.width]}>
                <Allotment.Pane className={CssModule.leftPane} minSize={200}>
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
                                            {clipControlProps ? (<DivClipControl
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
                                            />) : null}
                                        </>

                                    ) : null
                                }
                            </div>
                        </Allotment.Pane>
                        <Allotment.Pane className="Pane" minSize={200}>
                            <Button onClick={onSwitchClicked}>{"Switch"}</Button>
                        </Allotment.Pane>
                    </Allotment>
                </Allotment.Pane>
            </Allotment>
        </>
    )
}

export default App;
