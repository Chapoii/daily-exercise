<template>
  <div class="home-container">
    <header class="header">
      <h1>💪 每日锻炼</h1>
      <p class="subtitle">坚持每一天，遇见更好的自己</p>
    </header>

    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ streak }}</div>
        <div class="stat-label">连续完成天数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ totalCompleted }}</div>
        <div class="stat-label">总共完成</div>
      </div>
    </div>

    <!-- 今日训练 -->
    <div class="today-workout-card">
      <div class="card-header">
        <h2>{{ todayWorkout.name }} - {{ todayWorkout.title }}</h2>
        <span :class="['workout-type', todayWorkout.type]">
          {{ getWorkoutTypeText(todayWorkout.type) }}
        </span>
      </div>
      <p class="workout-description">{{ todayWorkout.description }}</p>

      <div class="exercise-list">
        <div
          v-for="(exercise, index) in todayWorkout.exercises"
          :key="index"
          class="exercise-item"
        >
          <div class="exercise-info">
            <h3>{{ exercise.name }}</h3>
            <p class="exercise-detail">
              <span v-if="exercise.unit === 'time'">
                ⏱️ {{ formatDuration(exercise.duration) }}
              </span>
              <span v-else> 🔄 {{ exercise.duration }}次 </span>
              <span class="separator">|</span>
              <span>📊 {{ exercise.sets }}组</span>
              <span v-if="exercise.restTime > 0" class="separator">|</span>
              <span v-if="exercise.restTime > 0"
                >😴 休息{{ exercise.restTime }}秒</span
              >
            </p>
            <p class="exercise-note" v-if="exercise.note">
              💡 {{ exercise.note }}
            </p>
          </div>
        </div>
      </div>

      <button class="start-btn" @click="startTodayWorkout">🚀 开始训练</button>
    </div>

    <!-- 周计划 -->
    <div class="weekly-plan-card">
      <h2>📅 周计划</h2>
      <div class="week-grid">
        <div
          v-for="(day, index) in weeklyPlan"
          :key="index"
          :class="[
            'day-card',
            {
              'is-today': index === (todayIndex === 0 ? 6 : todayIndex - 1),
              'is-completed': isDayCompleted(index),
            },
          ]"
          @click="selectDay(index)"
        >
          <div class="day-header">
            <span class="day-name">{{ day.name }}</span>
            <span v-if="isDayCompleted(index)" class="completed-badge">✓</span>
          </div>
          <h3 class="day-title">{{ day.title }}</h3>
          <p class="day-description">{{ day.description }}</p>
          <div class="exercise-count">📝 {{ day.exercises.length }}个动作</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { weeklyPlan } from "../data/workoutPlan";
import { useWorkoutStore } from "../stores/workoutStore";

const router = useRouter();
const workoutStore = useWorkoutStore();

const todayIndex = new Date().getDay();
// 转换日期索引：周日 (0) -> 6, 周一 (1) -> 0, 周二 (2) -> 1, ..., 周六 (6) -> 5
const todayArrayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
const todayWorkout = computed(() => weeklyPlan[todayArrayIndex]);
const streak = ref(0);
const totalCompleted = ref(0);

// 获取训练类型文本
const getWorkoutTypeText = (type) => {
  const typeMap = {
    workout: "力量训练",
    cardio: "有氧运动",
    rest: "休息日",
  };
  return typeMap[type] || "训练";
};

// 格式化时长
const formatDuration = (seconds) => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
  }
  return `${seconds}秒`;
};

// 检查某天是否已完成
const isDayCompleted = (arrayIndex) => {
  const logs = JSON.parse(localStorage.getItem("workoutLogs") || "[]");
  const today = new Date();
  // 将数组索引转换为星期几：0->周一 (1), 1->周二 (2), ..., 5->周六 (6), 6->周日 (0)
  const dayOfWeek = arrayIndex === 6 ? 0 : arrayIndex + 1;
  // 计算目标日期
  const currentDayOfWeek = today.getDay();
  const diff = (currentDayOfWeek - dayOfWeek + 7) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - diff);
  const targetDateStr = targetDate.toISOString().split("T")[0];

  return logs.some(
    (log) => log.date === targetDateStr && log.day === dayOfWeek,
  );
};

// 选择某天
const selectDay = (arrayIndex) => {
  // 将数组索引转换为星期几：0->周一 (1), 1->周二 (2), ..., 5->周六 (6), 6->周日 (0)
  const dayOfWeek = arrayIndex === 6 ? 0 : arrayIndex + 1;
  workoutStore.currentDay = dayOfWeek;
  router.push(`/workout/${arrayIndex}`);
};

// 开始今日训练
const startTodayWorkout = () => {
  workoutStore.startTraining(todayIndex);
  router.push("/training");
};

// 加载统计数据
const loadStats = () => {
  streak.value = workoutStore.getStreak();
  const logs = workoutStore.getWorkoutHistory();
  totalCompleted.value = logs.length;
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.stats-card {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.today-workout-card,
.weekly-plan-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0;
}

.workout-type {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.workout-type.workout {
  background: #e3f2fd;
  color: #1976d2;
}

.workout-type.cardio {
  background: #e8f5e9;
  color: #388e3c;
}

.workout-type.rest {
  background: #f3e5f5;
  color: #7b1fa2;
}

.workout-description {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.exercise-list {
  margin-bottom: 25px;
}

.exercise-item {
  border-bottom: 1px solid #ecf0f1;
  padding: 15px 0;
}

.exercise-item:last-child {
  border-bottom: none;
}

.exercise-info h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.exercise-detail {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 5px 0;
}

.separator {
  margin: 0 8px;
  color: #bdc3c7;
}

.exercise-note {
  color: #95a5a6;
  font-size: 0.85rem;
  margin: 5px 0 0 0;
  font-style: italic;
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.start-btn:active {
  transform: translateY(0);
}

.weekly-plan-card h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.day-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.day-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.day-card.is-today {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.day-card.is-completed {
  border-color: #27ae60;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.completed-badge {
  background: #27ae60;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.day-title {
  color: #34495e;
  font-size: 0.95rem;
  margin: 0 0 5px 0;
}

.day-description {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin: 0 0 10px 0;
}

.exercise-count {
  color: #95a5a6;
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .stats-card {
    flex-direction: column;
  }

  .week-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
