import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';
import { setLoading } from './loaderSlice';


type Status = 'idle' | 'loading' | 'error'

interface initialState { 
    postList: any[],
    totalList: number
    status: Status
}

const STATUES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    ERROR: 'error'
})

const initialState: initialState = {
    postList: [],
    totalList: 0,
    status: STATUES.IDLE
}


const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        setStatus(state, { payload }) {
            state.status = payload
        },
        setPosts(state, {payload}){
            state.postList = payload.result
            state.totalList = payload.total
        },
        appendPost(state, { payload }) {
            state.postList = [...state.postList, ...payload.result];
            state.totalList = payload.total;
        },
    }
})

export const { setStatus, setPosts, appendPost } = postSlice.actions;
export default postSlice.reducer;


// =========================// thunk  //========================================//
export function getAllPost(limit, offset) {
    return async function getAllPostThunk(dispatch) {
        dispatch(setLoading(true))
        dispatch(setStatus(STATUES.LOADING))
        try {
            await service.getAllPost(limit, offset).then(
                (response) => {
                    if (offset > 0) {
                        dispatch(appendPost(response.data));
                    } else {
                        dispatch(setPosts(response.data));
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
