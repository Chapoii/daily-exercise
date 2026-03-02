import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTodayWorkout, getWorkoutByDay } from '../data/workoutPlan'

export const useWorkoutStore = defineStore('workout', () => {
  // 当前训练状态
  const isTraining = ref(false) // 是否正在训练
  const isPaused = ref(false) // 是否暂停
  const currentDay = ref(new Date().getDay()) // 当前训练的星期几
  const currentExerciseIndex = ref(0) // 当前动作索引
  const currentSet = ref(1) // 当前组数
  const currentTime = ref(0) // 当前倒计时（秒）
  const isResting = ref(false) // 是否正在休息
  const trainingCompleted = ref(false) // 训练是否完成

  // 获取当前训练计划
  const currentWorkout = computed(() => {
    return getWorkoutByDay(currentDay.value)
  })

  // 获取当前动作
  const currentExercise = computed(() => {
    if (!currentWorkout.value || currentWorkout.value.exercises.length === 0) {
      return null
    }
    return currentWorkout.value.exercises[currentExerciseIndex.value]
  })

  // 获取总进度
  const totalProgress = computed(() => {
    if (!currentWorkout.value) return { current: 0, total: 0 }
    
    let totalSets = 0
    let completedSets = 0
    
    currentWorkout.value.exercises.forEach((exercise, exIndex) => {
      totalSets += exercise.sets
      if (exIndex < currentExerciseIndex.value) {
        completedSets += exercise.sets
      } else if (exIndex === currentExerciseIndex.value) {
        completedSets += currentSet.value - 1
      }
    })
    
    return { current: completedSets, total: totalSets }
  })

  // 进度百分比
  const progressPercentage = computed(() => {
    if (totalProgress.value.total === 0) return 0
    return Math.round((totalProgress.value.current / totalProgress.value.total) * 100)
  })

  // 开始训练
  function startTraining(day = null) {
    if (day !== null) {
      currentDay.value = day
    }
    
    isTraining.value = true
    isPaused.value = false
    currentExerciseIndex.value = 0
    currentSet.value = 1
    trainingCompleted.value = false
    isResting.value = false
    
    // 开始第一个动作
    startExercise()
  }

  // 开始/继续计时
  function startExercise() {
    if (!currentExercise.value) return
    
    isResting.value = false
    if (currentExercise.value.unit === 'reps') {
      // 次数制：显示次数，不倒计时
      currentTime.value = currentExercise.value.duration
    } else {
      // 时间制：开始倒计时
      currentTime.value = currentExercise.value.duration
    }
  }

  // 开始休息
  function startRest() {
    if (!currentExercise.value) return
    
    isResting.value = true
    currentTime.value = currentExercise.value.restTime
  }

  // 暂停训练
  function pauseTraining() {
    isPaused.value = !isPaused.value
  }

  // 停止训练
  function stopTraining() {
    isTraining.value = false
    isPaused.value = false
    isResting.value = false
    trainingCompleted.value = false
    currentExerciseIndex.value = 0
    currentSet.value = 1
    currentTime.value = 0
  }

  // 跳过当前动作/休息
  function skip() {
    if (isResting.value) {
      // 跳过休息，开始下一组或下一个动作
      nextSetOrExercise()
    } else {
      // 跳过当前动作，进入休息或下一个动作
      completeSet()
    }
  }

  // 完成一组
  function completeSet() {
    if (!currentExercise.value) return
    
    if (currentSet.value < currentExercise.value.sets) {
      // 还有下一组，进入休息
      currentSet.value++
      if (currentExercise.value.restTime > 0) {
        startRest()
      } else {
        startExercise()
      }
    } else {
      // 完成所有组，进入下一个动作
      nextExercise()
    }
  }

  // 下一个动作
  function nextExercise() {
    if (!currentWorkout.value) return
    
    if (currentExerciseIndex.value < currentWorkout.value.exercises.length - 1) {
      currentExerciseIndex.value++
      currentSet.value = 1
      isResting.value = false
      startExercise()
    } else {
      // 完成所有训练
      finishTraining()
    }
  }

  // 下一组或下一个动作（休息结束后调用）
  function nextSetOrExercise() {
    if (!currentExercise.value) return
    
    isResting.value = false
    startExercise()
  }

  // 完成训练
  function finishTraining() {
    isTraining.value = false
    isPaused.value = false
    isResting.value = false
    trainingCompleted.value = true
    
    // 保存训练记录
    saveWorkoutLog()
  }

  // 更新倒计时
  function updateTime(time) {
    currentTime.value = time
  }

  // 保存训练记录到 localStorage
  function saveWorkoutLog() {
    const logs = JSON.parse(localStorage.getItem('workoutLogs') || '[]')
    const today = new Date().toISOString().split('T')[0]
    
    // 避免重复记录
    const existingIndex = logs.findIndex(log => log.date === today)
    const logEntry = {
      date: today,
      day: currentDay.value,
      workoutName: currentWorkout.value?.title,
      completedAt: new Date().toISOString()
    }
    
    if (existingIndex >= 0) {
      logs[existingIndex] = logEntry
    } else {
      logs.push(logEntry)
    }
    
    localStorage.setItem('workoutLogs', JSON.stringify(logs))
    
    // 更新完成的天数统计
    const completedDays = JSON.parse(localStorage.getItem('completedDays') || '[]')
    if (!completedDays.includes(today)) {
      completedDays.push(today)
      localStorage.setItem('completedDays', JSON.stringify(completedDays))
    }
  }

  // 获取训练历史
  function getWorkoutHistory() {
    return JSON.parse(localStorage.getItem('workoutLogs') || '[]')
  }

  // 获取连续完成天数
  function getStreak() {
    const completedDays = JSON.parse(localStorage.getItem('completedDays') || '[]')
    if (completedDays.length === 0) return 0
    
    // 按日期排序
    const sortedDays = [...completedDays].sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let currentDate = new Date(today)
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (sortedDays.includes(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  return {
    // 状态
    isTraining,
    isPaused,
    currentDay,
    currentExerciseIndex,
    currentSet,
    currentTime,
    isResting,
    trainingCompleted,
    
    // 计算属性
    currentWorkout,
    currentExercise,
    totalProgress,
    progressPercentage,
    
    // 方法
    startTraining,
    startExercise,
    startRest,
    pauseTraining,
    stopTraining,
    skip,
    completeSet,
    nextExercise,
    nextSetOrExercise,
    finishTraining,
    updateTime,
    getWorkoutHistory,
    getStreak
  }
})
