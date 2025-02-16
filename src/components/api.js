import axios from "axios";
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment ? 'http://localhost:5173/api' : location.origin;
const axiosInstance = axios.create({
    baseURL
});


export async function McInfo(serverAddress) {
    const response = await axiosInstance.get(`/get_mcinfo/${serverAddress}`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}

export async function Mclatency(serverAddress) {
    const response = await axiosInstance.get(`/get_mclatency/${serverAddress}`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
export async function getinfo() {
    const response = await axiosInstance.get(`/get_info`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}

export async function getlimit() {
    const response = await axiosInstance.get(`/get_limit`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
export async function getalltypes() {
    const response = await axiosInstance.get(`/get_all_types`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}

export async function get_activity_window() {
    const response = await axiosInstance.get(`/get_activity_window`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
export async function get_steam_info() {
    const response = await axiosInstance.get(`/get_steam_info`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
export async function get_steam_friend_list() {
    const response = await axiosInstance.get(`get_steam_friend_list`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
export async function get_steam_friend_info() {
    const response = await axiosInstance.get(`get_steam_friend_info`);
    if (!response.status == 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
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