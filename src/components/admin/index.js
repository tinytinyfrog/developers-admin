import Index from './Index.vue'
import Home from './Home.vue'
import UserManager from './UserManager.vue'
import UserOptLog from './UserOptLog.vue'
import ArticleManager from './ArticleManager.vue'
import FaqManager from './FaqManager.vue'
import TagManager from './TagManager.vue'
import ConfigCarousel from './ConfigCarousel.vue'

export default [{
  path: '/admin',
  component: Index,
  children: [{
    path: '/',
    component: Home
  }, {
    path: '/admin/user-manager',
    component: UserManager
  }, {
    path: '/admin/user-opt-log',
    component: UserOptLog
  }, {
    path: '/admin/article-manager',
    component: ArticleManager
  }, {
    path: '/admin/faq-manager',
    component: FaqManager
  }, {
    path: '/admin/tag-manager',
    component: TagManager
  }, {
    path: '/admin/config-carousel',
    component: ConfigCarousel
  }]
}]
