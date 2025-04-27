import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/questionnaire/create'
    },
    {
      path: '/questionnaire',
      name: 'questionnaire',
      component: () => import('../views/QuestionnaireView.vue'),
      children: [
        {
          path: 'create',
          name: 'questionnaire-create',
          component: () => import('../views/questionnaire/CreateView.vue')
        },
        {
          path: 'edit/:id',
          name: 'questionnaire-edit',
          component: () => import('../views/questionnaire/CreateView.vue')
        },
        {
          path: 'public',
          name: 'questionnaire-public',
          component: () => import('../views/questionnaire/PublicView.vue')
        },
        {
          path: 'my',
          name: 'questionnaire-my',
          component: () => import('../views/questionnaire/MyView.vue')
        },
        {
          path: 'results/:id',
          name: 'questionnaire-results',
          component: () => import('../views/questionnaire/ResultsView.vue')
        },
        {
          path: 'fill/:id',
          name: 'questionnaire-fill',
          component: () => import('../views/questionnaire/FillView.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
  ],
})

export default router
