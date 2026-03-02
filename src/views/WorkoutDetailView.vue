<template>
  <div class="workout-detail-container">
    <button class="back-btn" @click="goBack">
      ← 返回
    </button>

    <div v-if="workout" class="workout-card">
      <div class="workout-header">
        <h1>{{ workout.name }} - {{ workout.title }}</h1>
        <span :class="['workout-type-badge', workout.type]">
          {{ getWorkoutTypeText(workout.type) }}
        </span>
      </div>
      
      <p class="workout-description">{{ workout.description }}</p>

      <div class="exercise-list">
        <h3>训练动作</h3>
        <div 
          v-for="(exercise, index) in workout.exercises" 
          :key="index"
          class="exercise-item"
        >
          <div class="exercise-number">{{ index + 1 }}</div>
          <div class="exercise-content">
            <h4>{{ exercise.name }}</h4>
            <div class="exercise-details">
              <span v-if="exercise.unit === 'time'">
                ⏱️ {{ formatDuration(exercise.duration) }}
              </span>
              <span v-else>
                🔄 {{ exercise.duration }}次
              </span>
              <span class="separator">•</span>
              <span>📊 {{ exercise.sets }}组</span>
              <span v-if="exercise.restTime > 0" class="separator">•</span>
              <span v-if="exercise.restTime > 0">😴 休息{{ exercise.restTime }}秒</span>
            </div>
            <p class="exercise-note" v-if="exercise.note">
              💡 {{ exercise.note }}
            </p>
          </div>
        </div>
      </div>

      <button class="start-btn" @click="startWorkout">
        🚀 开始训练
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { weeklyPlan } from '../data/workoutPlan'
import { useWorkoutStore } from '../stores/workoutStore'

const router = useRouter()
const route = useRoute()
const workoutStore = useWorkoutStore()

const workout = computed(() => {
  const dayIndex = parseInt(route.params.day)
  return weeklyPlan[dayIndex]
})

const getWorkoutTypeText = (type) => {
  const typeMap = {
    'workout': '力量训练',
    'cardio': '有氧运动',
    'rest': '休息日'
  }
  return typeMap[type] || '训练'
}

const formatDuration = (seconds) => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`
  }
  return `${seconds}秒`
}

const startWorkout = () => {
  const dayIndex = parseInt(route.params.day)
  workoutStore.startTraining(dayIndex)
  router.push('/training')
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.workout-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 10px 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.workout-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.workout-header h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin: 0;
}

.workout-type-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.workout-type-badge.workout {
  background: #e3f2fd;
  color: #1976d2;
}

.workout-type-badge.cardio {
  background: #e8f5e9;
  color: #388e3c;
}

.workout-type-badge.rest {
  background: #f3e5f5;
  color: #7b1fa2;
}

.workout-description {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1.05rem;
}

.exercise-list h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.exercise-item {
  display: flex;
  gap: 15px;
  padding: 20px 0;
  border-bottom: 1px solid #ecf0f1;
}

.exercise-item:last-child {
  border-bottom: none;
}

.exercise-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.exercise-content h4 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
}

.exercise-details {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.separator {
  margin: 0 8px;
  color: #bdc3c7;
}

.exercise-note {
  color: #95a5a6;
  font-size: 0.9rem;
  margin: 8px 0 0 0;
  font-style: italic;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
}

.start-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
  margin-top: 20px;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.start-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workout-header h1 {
    font-size: 1.5rem;
  }
  
  .exercise-item {
    flex-direction: column;
  }
  
  .exercise-number {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
}
</style>
