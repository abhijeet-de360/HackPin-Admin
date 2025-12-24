import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';
import { setLoading } from './loaderSlice';

type Status = "idle" | "loading" | "error";


const STATUES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    ERROR: 'error',
});

interface initialState{
    reelList: any[],
    totalList: number,
    status: Status
}


const initialState: initialState = {
    reelList: [],
    totalList: 0,
    status: STATUES.IDLE
}


const reelSlice = createSlice({
    name: "reel",
    initialState,
    reducers: {
        setStatus(state, {payload}){
            state.status = payload
        },
        setReels(state, { payload }) {
            state.reelList = payload.result
            state.totalList = payload.total
        },
        postStatusChange(state, { payload }) {
            const index = state.reelList.findIndex((reel) => reel._id === payload?.id);
            if (index !== -1) {
                state.reelList[index].status = payload.status;
            }
        },
        appendReel(state, { payload }) {
            state.reelList = [...state.reelList, ...payload.result];
            state.totalList = payload.total;
        },
    }
})

export const { setStatus, setReels, postStatusChange, appendReel } = reelSlice.actions;
export default reelSlice.reducer;


// =========================// thunk  //========================================//
export function getAllReel(limit, offset) {
    return async function getAllReelThunk(dispatch) {
        dispatch(setLoading(true))
        dispatch(setStatus(STATUES.LOADING))
        try {
            await service.getAllReel(limit, offset).then(
                (response) => {
                    if (offset > 0) {
                        dispatch(appendReel(response.data));
                    } else {
                        dispatch(setReels(response.data))
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
