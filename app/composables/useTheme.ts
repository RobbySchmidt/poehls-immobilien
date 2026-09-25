export function useTheme() {
  const dark = useState<boolean>('theme-dark', () => false)

  function sync() {
    dark.value = document.documentElement.classList.contains('dark')
  }

  function set(value: boolean) {
    const root = document.documentElement
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-anim')
      window.setTimeout(() => root.classList.remove('theme-anim'), 350)
    }
    root.classList.toggle('dark', value)
    dark.value = value
    try {
      localStorage.setItem('theme', value ? 'dark' : 'light')
    }
    catch {
      // private mode / blocked storage: choice just isn't remembered
    }
  }

  return { dark, sync, set, toggle: () => set(!dark.value) }
}
