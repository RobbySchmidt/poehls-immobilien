export function useTheme() {
  const dark = useState<boolean>('theme-dark', () => false)

  function sync() {
    dark.value = document.documentElement.classList.contains('dark')
  }

  function apply(value: boolean) {
    const root = document.documentElement
    // no element transitions while .dark flips; the forced style read applies the new colours
    // before the class is lifted again
    root.classList.add('theme-switch')
    root.classList.toggle('dark', value)
    dark.value = value
    void window.getComputedStyle(root).color
    window.setTimeout(() => root.classList.remove('theme-switch'), 0)
  }

  function set(value: boolean) {
    // one calm cross-fade of the whole page (view transition) instead of every element fading on its own;
    // instant where unsupported or with reduced motion
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      document.startViewTransition(() => apply(value))
    else
      apply(value)
    try {
      localStorage.setItem('theme', value ? 'dark' : 'light')
    }
    catch {
      // private mode / blocked storage: choice just isn't remembered
    }
  }

  return { dark, sync, set, toggle: () => set(!dark.value) }
}
