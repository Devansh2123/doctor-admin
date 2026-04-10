const isEmbedded = () => {
  try {
    return window.top !== window.self
  } catch {
    return true
  }
}

const canUseStorage = () => {
  if (typeof window === 'undefined') return false
  if (isEmbedded()) return false
  return true
}

const safeStorage = {
  get(key) {
    if (!canUseStorage()) return null
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    if (!canUseStorage()) return false
    try {
      window.localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  remove(key) {
    if (!canUseStorage()) return false
    try {
      window.localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}

export default safeStorage
