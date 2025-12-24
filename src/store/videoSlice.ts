import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';
import { setLoading } from './loaderSlice';

type Status = 'idle' | 'loading' | 'error'

const STATUES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    ERROR: 'error'
})

interface initialState {
    videoList: any[],
    totalVideos: number,
    status: Status
}


const initialState: initialState = {
    videoList: [],
    totalVideos: 0,
    status: STATUES.IDLE
}


const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        setStatus(state, { payload }) {
            state.status = payload
        },
        setVideos(state, { payload }) {
            state.videoList = payload.result
            state.totalVideos = payload.total
        },
        postStatusChange(state, { payload }) {
            const index = state.videoList.findIndex((video) => video._id === payload?.id);
            if (index !== -1) {
                state.videoList[index].status = payload.status;
            }
        },
        appendVideo(state, { payload }) {
            state.videoList = [...state.videoList, ...payload.result];
            state.totalVideos = payload.total;
        },
    }
})

export const { setVideos, postStatusChange, appendVideo, setStatus } = videoSlice.actions;
export default videoSlice.reducer;


// =========================// thunk  //========================================//
export function getAllVideo(limit, offset) {
    return async function getAllVideoThunk(dispatch) {
        dispatch(setLoading(true))
        dispatch(setStatus(STATUES.LOADING))
        try {
            await service.getAllVideo(limit, offset).then(
                (response) => {
                    if (offset > 0) {
                        dispatch(appendVideo(response.data))
                    } else {
                        dispatch(setVideos(response.data))
                    }
                    dispatch(setStatus(STATUES.IDLE))
                    dispatch(setLoading(false))
                }
            )
        } catch (error: any) {
            errorHandler(error.response)
            dispatch(setStatus(STATUES.IDLE))
            dispatch(setLoading(false))
        }
    }
}
