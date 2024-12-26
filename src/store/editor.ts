import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import {RegionData} from "@/ClipControl/ClipControl";
import {IDivClipControlProps} from "@/ClipControl/DivClipControl";

export interface IPrepareTransition {
    clipIndex: number
    leftPostion: number
    trackIndex: number
}
const initialState: {
    clipIndex: number
    trackIndex: number
    sliderMenuKey: string
    editPanel: string
    prepareTransition: IPrepareTransition | null
    showReplaceClipDialog: boolean
    showReplacClipModal: boolean
    currentMenuItem: string
    currentSubMenuItem: string
    currentCropRegion: null | RegionData
    clipControlProps: null | IDivClipControlProps
    subtitlesPageStatus: string
} = {
    clipIndex: -1,
    trackIndex: -1,
    editPanel: '',
    sliderMenuKey: 'resource',
    prepareTransition: null,
    showReplaceClipDialog: false,
    showReplacClipModal: false,
    currentMenuItem: '',
    currentSubMenuItem: '',
    currentCropRegion: null,
    clipControlProps: null,
    subtitlesPageStatus: 'preview',
}

export const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        updateEditClipInfo(
            state,
            {
                payload,
            }: PayloadAction<{
                trackIndex: number
                clipIndex: number
            }>,
        ) {
            state.clipIndex = payload.clipIndex
            state.trackIndex = payload.trackIndex
        },
        updateSliderMenuKey(state, { payload }: PayloadAction<string>) {
            state.sliderMenuKey = payload
        },
        updateEditPanel(state, { payload }: PayloadAction<any>) {
            state.editPanel = payload
        },
        updatePrepareTransition(
            state,
            { payload }: PayloadAction<IPrepareTransition | null>,
        ) {
            state.prepareTransition = payload
        },
        isShowReplaceClipDialog(state, { payload }: PayloadAction<boolean>) {
            state.showReplaceClipDialog = payload
        },
        isShowReplaceClipModal(state, { payload }: PayloadAction<boolean>) {
            state.showReplacClipModal = payload
        },
        updateCurrentMenuItem(state, { payload }: PayloadAction<string>) {
            state.currentMenuItem = payload
        },
        updateCurrentSubMenuItem(state, { payload }: PayloadAction<string>) {
            state.currentSubMenuItem = payload
        },
        updateCurrentCropRegion(
            state,
            { payload }: PayloadAction<null | RegionData>,
        ) {
            state.currentCropRegion = payload
        },
        updateClipControlProps(
            state,
            { payload }: PayloadAction<null | IDivClipControlProps>,
        ) {
            state.clipControlProps = (payload)
        },
        updateSubtitlesPageStatus(state, { payload }: PayloadAction<string>) {
            state.subtitlesPageStatus = payload
        },
    },
})

export const editorActions = { ...editorSlice.actions }

export default editorSlice.reducer
