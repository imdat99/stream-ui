import { ref } from 'vue'

const visible = ref(false)
const progress = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

function start() {
  if (timer) clearInterval(timer)

  visible.value = true
  progress.value = 8

  timer = setInterval(() => {
    if (progress.value < 80) {
      progress.value += Math.random() * 12
    } else if (progress.value < 95) {
      progress.value += Math.random() * 3
    }
  }, 200)
}

function finish() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  progress.value = 100

  setTimeout(() => {
    visible.value = false
    progress.value = 0
  }, 250)
}

function fail() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  progress.value = 100

  setTimeout(() => {
    visible.value = false
    progress.value = 0
  }, 250)
}

export function useRouteLoading() {
  return {
    visible,
    progress,
    start,
    finish,
    fail,
  }
}
