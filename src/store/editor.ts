import {
    IClipControlProps,
    RegionData,
} from '../ClipControl/ClipControl'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface IPrepareTransition {
    clipIndex: number
    leftPostion: number
    trackIndex: number
}
const initialState: {
    currentMenuItem: string
    currentSubMenuItem: string
    currentCropRegion: null | RegionData
    clipControlProps: null | IClipControlProps
} = {
    currentMenuItem: '',
    currentSubMenuItem: '',
    currentCropRegion: null,
    clipControlProps: null,
}

export const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
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
            { payload }: PayloadAction<null | IClipControlProps>,
        ) {
            state.clipControlProps = payload
        },
    },
})

export const editorActions = { ...editorSlice.actions }

export default editorSlice.reducer
