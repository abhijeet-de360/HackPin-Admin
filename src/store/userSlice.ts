import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';
import { setLoading } from './loaderSlice';




const initialState = {
    userList: [],
    totalUser: 0,
}


const subSubCategorySlice = createSlice({
    name: "subSubCategory",
    initialState,
    reducers: {
        setUsers(state, {payload}){
            state.userList = payload.result
            state.totalUser = payload.total
        }
    }
})

export const { setUsers } = subSubCategorySlice.actions;
export default subSubCategorySlice.reducer;


// =========================// thunk  //========================================//
export function getUserList(limit, offset, keyword, status, country, state, city) {
    return async function getUserListThunk(dispatch) {
        dispatch(setLoading(true))
        try {
            await service.getUserList(limit, offset, keyword, status, country, state, city).then(
                (response) => {
                    dispatch(setUsers(response.data))
                    dispatch(setLoading(false))
                }
            )
        } catch (error: any) {
            errorHandler(error.response)
            dispatch(setLoading(false))
        }
    }
}
