import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';




const initialState = {
    categoryList: [],
    totalCategory: 0,
}


const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setCategoryList(state, { payload }) {
            state.categoryList = payload.result
            state.totalCategory = payload.total
        },
    }
})


export const { setCategoryList, } = categorySlice.actions;
export default categorySlice.reducer;


export function getCategoryList() {
    return async function getCategoryThunk(dispatch) {
        try {
            await service.getCategoryList().then(
                (response) => {
                    dispatch(setCategoryList(response.data))
                }, (error) => {
                    errorHandler(error.response)
                }
            );
        } catch (error: any) {
            errorHandler(error.response)
        }
    }
}

