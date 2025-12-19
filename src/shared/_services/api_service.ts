import axios from "axios";
import { authHeader } from "../_helper/auth-header";



export const rootUrl = 'http://localhost:3230/api/v1/';




const authUrl = rootUrl + 'admin'
const categoryUrl = rootUrl + 'category'
const subCategoryUrl = rootUrl + 'subCategory'



// Auth login
async function loginAdmin(data) {
    return await axios.post(authUrl + '/login', data);
}
async function getAdminProfile() {
    return await axios.get(authUrl + '/myProfile', {
        headers: await authHeader('')
    });
}


//Categories
async function getCategoryList() {
    return await axios.get(categoryUrl + '/admin', {
        headers: await authHeader('')
    });
}
async function getSubCategoryList(categoryId) {
    return await axios.get(subCategoryUrl + `/admin?categoryId=${categoryId}`, {
        headers: await authHeader('')
    });
}

export const service = {
    loginAdmin, getAdminProfile,

    getCategoryList,

    getSubCategoryList,


}