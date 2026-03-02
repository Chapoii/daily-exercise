import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TrainingView from '../views/TrainingView.vue'
import WorkoutDetailView from '../views/WorkoutDetailView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/training',
    name: 'training',
    component: TrainingView
  },
  {
    path: '/workout/:day',
    name: 'workout-detail',
    component: WorkoutDetailView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
