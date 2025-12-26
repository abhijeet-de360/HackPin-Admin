import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';
import { setLoading } from './loaderSlice';

type Status = "idle" | "loading" | "error";

const STATUES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    ERROR: 'error'
})

interface SubCategoryState {
    subSubCategoryList: any[],
    totalSubCategory: number,
    status: Status
}

const initialState:SubCategoryState = {
    subSubCategoryList: [],
    totalSubCategory: 0,
    status: STATUES.IDLE
}


const subSubCategorySlice = createSlice({
    name: "subSubCategory",
    initialState,
    reducers: {
        setStatus(state, {payload}){state.status = payload},
        setSubCategoryList(state, { payload }) {
            state.subSubCategoryList = payload.result
            state.totalSubCategory = payload.total
        },
        setSubCategory(state, { payload }) {
            state.subSubCategoryList.push(payload)
        },
        updateSubCategoryInList(state, { payload }) {
            const index = state.subSubCategoryList.findIndex((item) => item._id === payload._id);
            if (index !== -1) {
                state.subSubCategoryList[index] = payload;
            }
        },
        removeSubCategory(state, { payload }) {
            const index = state.subSubCategoryList.findIndex((item) => item._id === payload);
            if (index !== -1) {
                state.subSubCategoryList.splice(index, 1);
            }
        },
        appendSubCategoryList(state, {payload}){
            state.subSubCategoryList = [...state.subSubCategoryList, ...payload.result];
            state.totalSubCategory = payload.total;
        }
    }
})


export const { setStatus, setSubCategoryList, setSubCategory, updateSubCategoryInList, removeSubCategory, appendSubCategoryList } = subSubCategorySlice.actions;
export default subSubCategorySlice.reducer;


export function getSubCategoryList(categoryId, limit, offset, keyword) {
    return async function getSubCategoryThunk(dispatch) {
        try {
            await service.getSubCategoryList(categoryId,limit, offset, keyword).then(
                (response) => {
                    
                    dispatch(setSubCategoryList(response.data))
                }, (error) => {
                    errorHandler(error.response)
                }
            );
        } catch (error: any) {
            errorHandler(error.response)
        }
    }
}

export function addSubCategory(data) {
    return async function addSubCategoryThunk(dispatch) {
        dispatch(setLoading(true));
        try {
            await service.addSubCategory(data).then(
                (response) => {
                    dispatch(setSubCategory(response.data))
                    dispatch(setLoading(false));
                }
            );
        } catch (error: any) {
            errorHandler(error.response);
            dispatch(setLoading(false));
        }
    }
}


export function updateSubCategory(id, data) {
    return async function updateSubCategoryThunk(dispatch) {
        dispatch(setLoading(true));
        try {
            await service.updateSubCategory(id, data).then(
                (response) => {
                    dispatch(updateSubCategoryInList(response.data))
                    dispatch(setLoading(false));
                }
            );
        } catch (error: any) {
            errorHandler(error.response);
            dispatch(setLoading(false));
        }
    }
}

export function statusUpdate(id, status) {
    return async function statusUpdateThunk(dispatch) {
        dispatch(setLoading(true));
        try {
            await service.statusUpdate(id, status).then(
                (response) => {
                    dispatch(removeSubCategory(id))
                    dispatch(setLoading(false));
                }
            );
        } catch (error: any) {
            errorHandler(error.response);
            dispatch(setLoading(false));
        }
    }
}