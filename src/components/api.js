import axios from "axios";

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment ? 'http://localhost:5173/api' : location.origin;
const axiosInstance = axios.create({
    baseURL
});
// const proxy = baseURL + '/proxy/';
const proxy = '';
async function fetchData(endpoint) {
    const response = await axiosInstance.get(endpoint);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}

export async function McInfo(serverAddress) {
    return fetchData(`/get_mcinfo/${serverAddress}`);
}

export async function Mclatency(serverAddress) {
    return fetchData(`/get_mclatency/${serverAddress}`);
}

export async function getinfo() {
    return fetchData(`/get_info`);
}

export async function getlimit() {
    return fetchData(`/get_limit`);
}

export async function getalltypes() {
    return fetchData(`/get_all_types`);
}

export async function get_activity_window() {
    return fetchData(`/get_activity_window`);
}

export async function get_steam_info() {
    return fetchData(`/get_steam_info`);
}

export async function get_steam_friend_list() {
    return fetchData(`/get_steam_friend_list`);
}

export async function get_steam_friend_info() {
    return fetchData(`/get_steam_friend_info`);
}

export async function get_deployment_info() {
    return fetchData(`/get_deployment_info`);
}

export async function getcalendar() {
    const response = await axios.get(proxy+'https://api.bgm.tv/calendar');
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
export async function getsubject(subject_id) {
    const response = await axios.get(proxy+'https://api.bgm.tv/v0/subjects/'+subject_id);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}

export async function getepisodes(subject_id) {
    const response = await axios.get(proxy+'https://api.bgm.tv/v0/episodes?subject_id='+subject_id);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
//https://api.bgm.tv/v0/subjects/454684/characters
export function timeAgo(time) {
    const now = new Date();
    const past = new Date(time);
    const seconds = Math.floor((now - past) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return `${time}(${seconds}秒前)`;
    } else if (minutes < 60) {
        return `${time}(${minutes}分钟前)`;
    } else if (hours < 24) {
        return `${time}(${hours}小时前)`;
    } else {
        return `${time}(${days}天前)`;
    }
}