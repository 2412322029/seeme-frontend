import axios from "axios";
const isDevelopment = process.env.NODE_ENV === 'development';
export const baseURL = isDevelopment ? 'http://localhost:5173/api' : location.origin;
const axiosInstance = axios.create({
    baseURL
});
export const proxy = baseURL + '/proxy?url=';
// const proxy = '';
async function fetchData(endpoint) {
    const response = await axiosInstance.get(endpoint);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    return response.data;
}
async function proxyfetch(endpoint) {
    const response = await axios.get(proxy + endpoint);
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
    return proxyfetch(`https://api.bgm.tv/calendar`);
}
export async function getsubject(subject_id) {
    return proxyfetch('https://api.bgm.tv/v0/subjects/'+subject_id);
}
//https://api.bgm.tv/v0/subjects/454684/characters
export async function getepisodes(subject_id) {
    return proxyfetch('https://api.bgm.tv/v0/episodes?subject_id='+subject_id);
}
export async function gethitokoto() {
    const response = await axios.get("https://international.v1.hitokoto.cn?c=a&c=b&c=c&c=d&c=h&c=i&c=j&c=k");
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    const data = response.data;
    return {
        id: data.id,
        uuid: data.uuid,
        hitokoto: data.hitokoto,
        type: data.type,
        from: data.from,
        from_who: data.from_who,
        creator: data.creator,
        creator_uid: data.creator_uid,
        reviewer: data.reviewer,
        commit_from: data.commit_from,
        created_at: data.created_at,
        length: data.length
    };
}
export async function getxlog(subject_id) {
    return fetchData("/proxy_xlog");
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

export function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    const pad = (num) => (num < 10 ? `0${num}` : num);
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1); 
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const ipfsToCrossbell = (ipfs) =>
    ipfs &&
  ipfs.replace(
    /ipfs:\/\/([a-zA-Z0-9]+)/g, // 全局匹配
    "https://ipfs.crossbell.io/ipfs/$1?img-quality=75&img-format=auto&img-onerror=redirect"
  );

export async function leaveMessage({ name, email, content, recaptcha_token }) {
  const res = await axiosInstance.post('/leave_message', {
    name, email, content, recaptcha_token
  }, {
    headers: { 'Recaptcha-Token': recaptcha_token || '' }
  });
  return res.data;
}
export async function googleSiteVerifyProxy(secret, token, remoteip = '') {
  const url = 'https://www.google.com/recaptcha/api/siteverify?secret='
    + encodeURIComponent(secret)
    + '&response=' + encodeURIComponent(token)
    + (remoteip ? '&remoteip=' + encodeURIComponent(remoteip) : '');
  return proxyfetch(url);
}


// 获取留言列表（后端路由：/get_messages）
export async function getMessages() {
  return fetchData('/get_messages');
}