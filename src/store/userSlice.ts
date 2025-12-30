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
    userList: any[],
    totalUser: number,
    status: Status
}



const initialState: initialState = {
    userList: [],
    totalUser: 0,
    status: STATUES.IDLE
}


const subSubCategorySlice = createSlice({
    name: "subSubCategory",
    initialState,
    reducers: {
        setStatus(state, { payload }) {
            state.status = payload
        },
        setUsers(state, { payload }) {
            state.userList = payload.result;
            state.totalUser = payload.total;
        },

        appendUsers(state, { payload }) {
            state.userList = [...state.userList, ...payload.result];
            state.totalUser = payload.total;
        },
        userStatusCahnge(state, { payload }) {
            const index = state.userList.findIndex(
                (user) => user._id === payload.id
            );
            if (index !== -1) {
                state.userList[index].status = payload.status;
            }
        },
    }
})

export const { setUsers, userStatusCahnge,appendUsers, setStatus } = subSubCategorySlice.actions;
export default subSubCategorySlice.reducer;


// =========================// thunk  //========================================//
export function getUserList(limit, offset, keyword, status, country, state, city) {
    return async function getUserListThunk(dispatch) {
        dispatch(setLoading(true))
        dispatch(setStatus(STATUES.LOADING))
        try {
            await service.getUserList(limit, offset, keyword, status, country, state, city).then(
                (response) => {
                    if (offset > 0) {
                        dispatch(appendUsers(response.data));
                    } else {
                        dispatch(setUsers(response.data));
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


export function changeStatus(id, status) {
    return async function changeStatusThunk(dispatch) {
        dispatch(setLoading(true))
        dispatch(setStatus(STATUES.LOADING))
        try {
            await service.changeUserStatus(id, status).then(
                (response) => {
                    dispatch(userStatusCahnge({ id, status }))
                    dispatch(setLoading(false))
                    dispatch(setStatus(STATUES.IDLE))
                }
            )
        } catch (error: any) {
            errorHandler(error.response)
            dispatch(setLoading(false))
            dispatch(setStatus(STATUES.IDLE))
        }
    }
}
