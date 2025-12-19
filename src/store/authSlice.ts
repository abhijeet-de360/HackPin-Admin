import { createSlice } from "@reduxjs/toolkit";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import { service } from "@/shared/_services/api_service";
import { localService } from "@/shared/_session/local";


const STATUSES = Object.freeze({
    IDLE: false,
    LOADING: true,
});



const initialState = {
    loadingStatus: false,
    isAuthenticated: localService.get('token') ? true : false,
    profile: {
        name: '',
        email: '',
    },
    type: '',
    permissions: []
};



const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setStatus(state, { payload }) {
            state.loadingStatus = payload;
        },
        setAdmin(state, { payload }) {
            state.profile = payload.user;
            localService.set("token", payload.token);
            state.isAuthenticated = true
        },
        setProfile(state, { payload }) {
            state.profile = payload
        },
        setLogout(state) {
            state.isAuthenticated = false;
            state.profile = {
                name: '',
                email: '',
            };
            localService.clearAll();
        }
    },
});


export const { setStatus, setAdmin, setProfile, setLogout } = authSlice.actions;
export default authSlice.reducer;





//   thunk
export function loginAdmin({ email, password }, navigate) {
    return async function loginAdminThunk(dispatch) {
        dispatch(setStatus(STATUSES.LOADING));
        try {
            const response = await service.loginAdmin({ email, password });
            if (response?.data) {
                successHandler("Logged In successfully");
                dispatch(setAdmin(response.data));
                navigate("/user");
            }
            dispatch(setStatus(false));

        } catch (error) {
            errorHandler(error?.response);
            dispatch(setStatus(false));
        }
    };
}

export function getAdminProfile() {
    return async (dispatch) => {
        try {
            const response = await service.getAdminProfile();
            if (response?.data) {
                dispatch(setProfile(response.data));
            }
        } catch (error) {
            errorHandler(error.message);
        }
    };
}



export function adminLogout(navigate) {
    return async function logoutThunk(dispatch) {
        try {
            dispatch(setLogout());
            successHandler("Logout Successfully.")
            navigate('/')
        } catch (error) {
            errorHandler(error);
        }
    };
}





