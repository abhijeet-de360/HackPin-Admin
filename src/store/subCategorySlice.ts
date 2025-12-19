import { createSlice } from '@reduxjs/toolkit'
import { service } from '../shared/_services/api_service'
import { errorHandler } from '../shared/_helper/responseHelper';




const initialState = {
    subSubCategoryList: [],
    totalSubCategory: 0,
}


const subSubCategorySlice = createSlice({
    name: "subSubCategory",
    initialState,
    reducers: {
        setSubCategoryList(state, { payload }) {
            state.subSubCategoryList = payload.result
            state.totalSubCategory = payload.total
        },
    }
})


export const { setSubCategoryList, } = subSubCategorySlice.actions;
export default subSubCategorySlice.reducer;


export function getSubCategoryList(categoryId) {
    return async function getSubCategoryThunk(dispatch) {
        try {
            await service.getSubCategoryList(categoryId).then(
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

