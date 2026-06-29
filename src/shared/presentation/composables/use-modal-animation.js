import { ref } from 'vue'

export function useModalAnimation(emit) {
  const isClosing = ref(false)

  function requestClose() {
    if (isClosing.value) return
    isClosing.value = true
  }

  function onOverlayAnimEnd(e) {
    if (isClosing.value && e.target === e.currentTarget) {
      emit('close')
    }
  }

  return { isClosing, requestClose, onOverlayAnimEnd }
}
