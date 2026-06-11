const _listeners = new Map()

export const eventBus = {
  on(event, handler) {
    if (!_listeners.has(event)) _listeners.set(event, [])
    _listeners.get(event).push(handler)
    return () => this.off(event, handler)
  },
  off(event, handler) {
    const list = _listeners.get(event) || []
    _listeners.set(event, list.filter(h => h !== handler))
  },
  emit(event, payload) {
    ;(_listeners.get(event) || []).forEach(h => h(payload))
  }
}
