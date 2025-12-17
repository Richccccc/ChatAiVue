import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/",
    name: "Dashboard",
    component: Layout,
    redirect: "/dashboard",
    meta: {
      icon: "ep:data-analysis",
      title: "可视化大屏",
      rank: 1
    },
    children: [
      {
        path: "/dashboard",
        name: "DashboardPage",
        component: () => import("@/views/welcome/index.vue"),
        meta: {
          title: "可视化大屏"
        }
      }
    ]
  },
  {
    path: "/model",
    name: "Model",
    component: Layout,
    redirect: "/model/management",
    meta: {
      icon: "ep:cpu",
      title: "模型菜单",
      rank: 2
    },
    children: [
      {
        path: "/model/management",
        name: "ModelManagement",
        component: () => import("@/views/model/management/index.vue"),
        meta: {
          title: "模型管理"
        }
      },
      {
        path: "/model/training",
        name: "ModelTraining",
        component: () => import("@/views/model/training/index.vue"),
        meta: {
          title: "模型训练"
        }
      },
      {
        path: "/model/deployment",
        name: "ModelDeployment",
        component: () => import("@/views/model/deployment/index.vue"),
        meta: {
          title: "模型分析"
        }
      }
    ]
  },
  {
    path: "/reserved1",
    name: "Reserved1",
    component: Layout,
    redirect: "/reserved1/index",
    meta: {
      icon: "ep:menu",
      title: "预留菜单1",
      rank: 3
    },
    children: [
      {
        path: "/reserved1/index",
        name: "JobPostingManagement",
        component: () => import("@/views/job-posting/index.vue"),
        meta: {
          title: "职位管理"
        }
      }
    ]
  },
  {
    path: "/reserved2",
    name: "Reserved2",
    component: Layout,
    redirect: "/reserved2/index",
    meta: {
      icon: "ep:menu",
      title: "预留菜单2",
      rank: 4
    },
    children: [
      {
        path: "/reserved2/index",
        name: "Reserved2Page",
        component: () => import("@/views/welcome/index.vue"), // Reuse welcome or create new placeholder
        meta: {
          title: "预留菜单2"
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;


