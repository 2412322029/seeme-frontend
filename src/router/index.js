import { Toolbox } from "@vicons/fa";
import { createRouter, createWebHistory } from "vue-router";

const Note = () => import("@/views/note.vue");
const Home = () => import("@/views/home.vue");
const Page = () => import("@/views/page.vue");
const Doing = () => import("@/views/doing.vue");
const Mc = () => import("@/views/mc.vue");
const Steam = () => import("@/views/steam.vue");
const Calendar = () => import("@/views/calendar.vue");
const NotFound = () => import("@/views/NotFound.vue");
const Paste = () => import("@/views/paste.vue");
const Comment = () => import("@/views/comment.vue");
const Admin = () => import("@/views/admin.vue");
const Tool = () => import("@/views/toolbox.vue");
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        show: true,
        title: "Home",
        description: "Welcome to SeeMe",
        transition: "fade",
        summary: "home 页面，显示网站的简介和导航。",
      },
    },
    {
      path: "/note",
      name: "note",
      component: Note,
      meta: {
        show: true,
        title: "Note",
        description: "Notes from Xlog",
        transition: "fade",
        summary: "显示<a href='https://xlog.not404.cc'>Xlog</a>所有笔记的列表。",
      },
    },
    {
      path: "/p/:id?",
      name: "page",
      component: Page,
      meta: {
        title: "Page",
        description: "one Note",
        transition: "fade",
      },
    },
    {
      path: "/doing",
      name: "doing",
      component: Doing,
      meta: {
        show: true,
        title: "Doing",
        description: "What I am currently working on.",
        transition: "fade",
        summary: "显示当前正在干什么",
      },
    },
    {
      path: "/mcstatus/:type?/:address?",
      name: "mcstatus",
      component: Mc,
      meta: {
        show: true,
        title: "Minecraft Status",
        description: "Check the status of a Minecraft server.",
        transition: "fade",
        summary: "可以查看Minecraft服务器的状态。",
      },
    },
    {
      path: "/steam",
      name: "steam",
      component: Steam,
      meta: {
        show: true,
        title: "Steam Status",
        description: "View Steam game information and status.",
        transition: "fade",
        summary: "可以查看Steam游戏的信息和状态。",
      },
    },
    {
      path: "/calendar",
      name: "calendar",
      component: Calendar,
      meta: {
        show: true,
        title: "Calendar",
        description: "A calendar view for anime",
        transition: "fade",
        summary: "显示动漫的日历视图。",
      },
    },
    {
      path: "/e/:id?",
      name: "Paste",
      component: Paste,
      meta: {
        show: true,
        title: "Paste",
        description: "share your text easily",
        transition: "fade",
        summary: "可以轻松分享文本。",
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFound,
      meta: {
        title: "404 Not Found",
        description: "The page you are looking for does not exist.",
        transition: "fade",
      },
    },
    {
      path: "/comment",
      name: "comment",
      component: Comment,
      meta: {
        show: true,
        title: "Comment",
        description: "Leave a comment",
        transition: "fade",
        summary: "可以在此页面留下评论。",
      },
    },
     {
      path: "/admin",
      name: "admin",
      component: Admin,
      meta: {
        title: "Admin",
        description: "Admin panel",
        transition: "fade",
        summary: "管理员面板。",
      },
    },
    {
      path: "/tools",
      name: "tools",
      component: Tool,
      meta: {
        show: true,
        title: "Tools",
        description: "Tools panel",
        transition: "fade",
        summary: "工具面板。",
      },
    },
  ],
});

export default router;
