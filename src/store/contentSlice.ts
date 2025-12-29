import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';
import { setLoading } from './loaderSlice';
import { changePostStatus } from './postSlice';
import { changeReelStatus } from './reelSlice';


type status = 'idle' | 'loading' | 'error'

const STATUSES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    ERROR: 'error'
})

interface initialState {
    status: status
}


const initialState: initialState = {
    status: STATUSES.IDLE
}


const contentSlice = createSlice({
    name: "content",
    initialState,
    reducers: {
        setStatus(state, { payload }) {
            state.status = payload
        },
    }
})

const { setStatus } = contentSlice.actions;
export default contentSlice.reducer;


// thunk
export function updateContent(contentId, type) {
    return async function updateContentThunk(dispatch) {
        dispatch(setLoading(true));
        dispatch(setStatus(STATUSES.LOADING))
        try {
            await service.updateContent(contentId).then(
                (response) => {
                    dispatch(setStatus(STATUSES.IDLE))
                    dispatch(setLoading(false));

                    switch (type) {
                        case 'post':
                            dispatch(changePostStatus(contentId))
                            break;
                        case 'reel':
                            dispatch(changeReelStatus(contentId))
                            break;
                        case 'video':
                            dispatch(changeReelStatus(contentId))
                            break;
                        default:
                            break;
                    }
                }
            );
        } catch (error: any) {
            errorHandler(error.response)
            dispatch(setStatus(STATUSES.ERROR))
            dispatch(setLoading(false));
        }finally{
            dispatch(setLoading(false));
            dispatch(setStatus(STATUSES.IDLE))
        }
    }
}


