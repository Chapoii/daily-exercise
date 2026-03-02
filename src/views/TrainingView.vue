<template>
  <div class="training-container">
    <!-- 训练完成 -->
    <div v-if="workoutStore.trainingCompleted" class="completed-screen">
      <div class="completed-content">
        <div class="trophy-icon">🏆</div>
        <h1>恭喜完成！</h1>
        <p class="workout-name">{{ workoutStore.currentWorkout?.title }}</p>
        <div class="stats">
          <div class="stat">
            <div class="value">{{ workoutStore.totalProgress.total }}</div>
            <div class="label">总组数</div>
          </div>
          <div class="stat">
            <div class="value">{{ Math.round(workoutStore.totalProgress.total * 1.5) }}</div>
            <div class="label">消耗卡路里</div>
          </div>
        </div>
        <button class="home-btn" @click="goHome">返回首页</button>
      </div>
    </div>

    <!-- 训练中 -->
    <div v-else class="training-content">
      <!-- 进度条 -->
      <div class="progress-section">
        <div class="progress-info">
          <span>进度</span>
          <span>{{ workoutStore.totalProgress.current }} / {{ workoutStore.totalProgress.total }} 组</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: workoutStore.progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- 动作信息 -->
      <div class="exercise-info">
        <div class="exercise-header">
          <span class="set-badge">第 {{ workoutStore.currentSet }} / {{ workoutStore.currentExercise?.sets }} 组</span>
          <span :class="['status-badge', workoutStore.isResting ? 'rest' : 'work']">
            {{ workoutStore.isResting ? '休息中' : '训练中' }}
          </span>
        </div>
        
        <h1 class="exercise-name">
          {{ workoutStore.currentExercise?.name }}
        </h1>
        
        <p class="exercise-note" v-if="workoutStore.currentExercise?.note">
          💡 {{ workoutStore.currentExercise.note }}
        </p>
      </div>

      <!-- 计时器 -->
      <div class="timer-section" :class="{ 'is-resting': workoutStore.isResting }">
        <div class="timer-display">
          <span class="time">{{ formatTime(workoutStore.currentTime) }}</span>
          <span class="timer-label">
            {{ workoutStore.isResting ? '休息' : (workoutStore.currentExercise?.unit === 'reps' ? '次数' : '秒') }}
          </span>
        </div>
        
        <!-- 次数制显示 -->
        <div v-if="workoutStore.currentExercise?.unit === 'reps' && !workoutStore.isResting" class="reps-display">
          <div class="reps-target">目标：{{ workoutStore.currentExercise.duration }}次</div>
        </div>
      </div>

      <!-- 下一个动作预览 -->
      <div v-if="!workoutStore.isResting && showNextExercise" class="next-exercise">
        <span class="next-label">下一组：</span>
        <span class="next-name">{{ nextExerciseName }}</span>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button class="control-btn secondary" @click="stopWorkout">
          ✕ 停止
        </button>
        
        <button class="control-btn primary" @click="togglePause">
          {{ workoutStore.isPaused ? '▶ 继续' : '⏸ 暂停' }}
        </button>
        
        <button class="control-btn skip" @click="skipCurrent">
          {{ workoutStore.isResting ? '⏭ 跳过休息' : '⏭ 完成' }}
        </button>
      </div>

      <!-- 动作列表 -->
      <div class="exercise-list-preview">
        <h3>今日训练</h3>
        <div 
          v-for="(exercise, index) in workoutStore.currentWorkout?.exercises" 
          :key="index"
          :class="['exercise-item', { 
            'is-current': index === workoutStore.currentExerciseIndex,
            'is-completed': index < workoutStore.currentExerciseIndex
          }]"
        >
          <div class="exercise-number">
            {{ index < workoutStore.currentExerciseIndex ? '✓' : (index === workoutStore.currentExerciseIndex ? '▶' : index + 1) }}
          </div>
          <div class="exercise-detail">
            <div class="exercise-name-small">{{ exercise.name }}</div>
            <div class="exercise-meta">
              {{ exercise.sets }}组 × 
              {{ exercise.unit === 'time' ? formatDuration(exercise.duration) : exercise.duration + '次' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '../stores/workoutStore'

const router = useRouter()
const workoutStore = useWorkoutStore()

let timer = null

// 显示下一个动作预览
const showNextExercise = computed(() => {
  if (!workoutStore.currentWorkout) return false
  const currentIndex = workoutStore.currentExerciseIndex
  const currentSet = workoutStore.currentSet
  const exercise = workoutStore.currentExercise
  
  // 如果是最后一组的最后一个动作，不显示下一个
  if (currentIndex === workoutStore.currentWorkout.exercises.length - 1 && 
      currentSet === exercise.sets) {
    return false
  }
  
  return true
})

// 下一个动作名称
const nextExerciseName = computed(() => {
  if (!workoutStore.currentExercise) return ''
  
  if (workoutStore.currentSet < workoutStore.currentExercise.sets) {
    return `继续${workoutStore.currentExercise.name}`
  } else if (workoutStore.currentExerciseIndex < workoutStore.currentWorkout.exercises.length - 1) {
    return workoutStore.currentWorkout.exercises[workoutStore.currentExerciseIndex + 1].name
  }
  return '完成训练'
})

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化时长
const formatDuration = (seconds) => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`
  }
  return `${seconds}秒`
}

// 暂停/继续
const togglePause = () => {
  workoutStore.pauseTraining()
}

// 跳过当前
const skipCurrent = () => {
  workoutStore.skip()
}

// 停止训练
const stopWorkout = () => {
  if (confirm('确定要停止当前训练吗？进度将不会保存。')) {
    workoutStore.stopTraining()
    goHome()
  }
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 倒计时逻辑
const startTimer = () => {
  if (timer) clearInterval(timer)
  
  timer = setInterval(() => {
    if (!workoutStore.isPaused && workoutStore.isTraining && workoutStore.currentTime > 0) {
      workoutStore.updateTime(workoutStore.currentTime - 1)
    } else if (workoutStore.currentTime === 0 && workoutStore.isTraining && !workoutStore.isPaused) {
      // 时间到
      handleTimeUp()
    }
  }, 1000)
}

// 时间到处理
const handleTimeUp = () => {
  if (workoutStore.isResting) {
    // 休息结束，开始下一组
    workoutStore.nextSetOrExercise()
  } else {
    // 动作完成，进入休息或下一组
    workoutStore.completeSet()
  }
}

onMounted(() => {
  // 如果没有在训练中，重定向到首页
  if (!workoutStore.isTraining && !workoutStore.trainingCompleted) {
    router.push('/')
    return
  }
  
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.training-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* 完成界面 */
.completed-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
}

.trophy-icon {
  font-size: 6rem;
  margin-bottom: 20px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.completed-content h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.workout-name {
  color: #7f8c8d;
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.stat {
  text-align: center;
}

.stat .value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat .label {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 5px;
}

.home-btn {
  padding: 15px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.home-btn:hover {
  transform: translateY(-2px);
}

/* 训练内容 */
.training-content {
  padding-bottom: 30px;
}

.progress-section {
  margin-bottom: 30px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.exercise-info {
  text-align: center;
  margin-bottom: 30px;
}

.exercise-header {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.set-badge,
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.set-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.work {
  background: #e8f5e9;
  color: #388e3c;
}

.status-badge.rest {
  background: #fff3e0;
  color: #f57c00;
}

.exercise-name {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.exercise-note {
  color: #95a5a6;
  font-size: 1rem;
  margin: 0;
}

.timer-section {
  background: white;
  border-radius: 16px;
  padding: 40px 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s;
}

.timer-section.is-resting {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.timer-display {
  margin-bottom: 10px;
}

.time {
  display: block;
  font-size: 5rem;
  font-weight: bold;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
  line-height: 1;
}

.timer-section.is-resting .time {
  color: #f57c00;
}

.timer-label {
  display: block;
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-top: 10px;
}

.reps-display {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #ecf0f1;
}

.reps-target {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.next-exercise {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.next-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.next-name {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1rem;
  margin-left: 8px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.control-btn {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn.primary {
  flex: 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.control-btn.secondary {
  background: #ecf0f1;
  color: #7f8c8d;
}

.control-btn.skip {
  background: #e3f2fd;
  color: #1976d2;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.control-btn:active {
  transform: translateY(0);
}

.exercise-list-preview {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.exercise-list-preview h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.exercise-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ecf0f1;
  transition: all 0.3s;
}

.exercise-item:last-child {
  border-bottom: none;
}

.exercise-item.is-current {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding-left: 10px;
  padding-right: 10px;
  margin: 0 -10px;
  border-radius: 8px;
  border-bottom: none;
}

.exercise-item.is-completed {
  opacity: 0.6;
}

.exercise-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ecf0f1;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.exercise-item.is-current .exercise-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.exercise-item.is-completed .exercise-number {
  background: #27ae60;
  color: white;
}

.exercise-detail {
  flex: 1;
}

.exercise-name-small {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 4px;
}

.exercise-meta {
  color: #95a5a6;
  font-size: 0.85rem;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .time {
    font-size: 3.5rem;
  }
  
  .exercise-name {
    font-size: 1.5rem;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .control-btn.primary {
    order: -1;
  }
  
  .stats {
    gap: 20px;
  }
}
</style>
