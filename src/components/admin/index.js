import Index from "./Index.vue";
import Home from "./Home.vue";
import UserManager from "./UserManager.vue";
import UserOptLog from "./UserOptLog.vue";
import ArticleManager from "./ArticleManager.vue";
import FaqManager from "./FaqManager.vue";
import TagManager from "./TagManager.vue";
import ConfigCarousel from "./ConfigCarousel.vue";
import NewsManage from "./NewsManage.vue";
import MagazineManage from "./MagazineManage.vue";
import SalonManage from "./SalonManage.vue";
import MasterManage from "./MasterManage.vue";
import HonorManage from "./HonorManage.vue";
import TeamManage from "./TeamManage.vue";
import OrgManage from './OrgManage.vue';
import RoleManage from './RoleManage.vue'

export default [
  {
    path: "/admin",
    component: Index,
    children: [
      {
        path: "/",
        component: Home
      },
      {
        path: "/admin/user-manager",
        component: UserManager
      },
      {
        path: "/admin/user-opt-log",
        component: UserOptLog
      },
      {
        path: "/admin/article-manager",
        component: ArticleManager
      },
      {
        path: "/admin/faq-manager",
        component: FaqManager
      },
      {
        path: "/admin/tag-manager",
        component: TagManager
      },
      {
        path: "/admin/config-carousel",
        component: ConfigCarousel
      },
      {
        path: "/admin/news-manage",
        component: NewsManage
      },
      {
        path: "/admin/monMagazine-manage",
        component: MagazineManage
      },
      {
        path: "/admin/salon-manage",
        component: SalonManage
      },
      {
        path: "/admin/master-manage",
        component: MasterManage
      },
      {
        path: "/admin/honor-manage",
        component: HonorManage
      },
      {
        path: "/admin/team-manage",
        component: TeamManage
      },
      {
        path: "/admin/org-manage",
        component: OrgManage
      },
      {
        path: "/admin/role-manage",
        component: RoleManage
      }
    ]
  }
];
