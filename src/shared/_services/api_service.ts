import axios from "axios";
import { authHeader } from "../_helper/auth-header";



// export const rootUrl = 'http://localhost:3230/api/v1/';
export const rootUrl = 'http://192.168.1.23:3230/api/v1/';
// export const rootUrl = 'https://rpkfhgmx-3230.inc1.devtunnels.ms/api/v1/';




const authUrl = rootUrl + 'admin'
const categoryUrl = rootUrl + 'category'
const subCategoryUrl = rootUrl + 'subCategory'
const userUrl = rootUrl + 'user'
const contentUrl = rootUrl + 'content'



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

// ======================== Sub Category ================================

async function getSubCategoryList(categoryId) {
    return await axios.get(subCategoryUrl + `/admin?categoryId=${categoryId}`, {
        headers: await authHeader('')
    });
}

async function addSubCategory(data) {
    return await axios.post(subCategoryUrl, data, {
        headers: await authHeader('')
    });
}


async function updateSubCategory(id, data) {
    return await axios.patch(subCategoryUrl + `/${id}`, data, {
        headers: await authHeader('')
    });
}


async function statusUpdate(id, status) {
    return await axios.put(subCategoryUrl + `/${id}`, {status}, {
        headers: await authHeader('')
    });
}


// ====================== User =========================
async function getUserList(limit, offset, keyword,status, country, state, city) {
    return await axios.get(userUrl + `/admin/userList?limit=${limit}&offset=${offset}&keyword=${keyword}&status=${status}&country=${country}&state=${state}&city=${city}`, {
        headers: await authHeader('')
    });
}

async function changeUserStatus(id, status) {
    return await axios.put(userUrl + `/admin/userStatus/${id}`, {status}, {
        headers: await authHeader('')
    });
}


// ======================= Post ===================================
async function getAllPost(limit, offset) {
    return await axios.get(contentUrl + `/admin/posts?limit=${limit}&offset=${offset}`, {
        headers: await authHeader('')
    });
}


async function getAllReel(limit, offset) {
    return await axios.get(contentUrl + `/admin/reels?limit=${limit}&offset=${offset}`, {
        headers: await authHeader('')
    });
}

// ======================== Video ===================================
async function getAllVideo(limit, offset) {
    return await axios.get(contentUrl + `/admin/videos?limit=${limit}&offset=${offset}`, {
        headers: await authHeader('')
    });
}

// ======================== Content ======================================
async function updateContent(data) {
    return await axios.put(contentUrl + `/admin/status`, data, {
        headers: await authHeader('')
    });
}

export const service = {
    loginAdmin, getAdminProfile,

    getCategoryList,

    getSubCategoryList, addSubCategory, updateSubCategory, statusUpdate, 

    getUserList, changeUserStatus,

    getAllPost, 

    getAllReel, 

    getAllVideo, 

    updateContent, 

}