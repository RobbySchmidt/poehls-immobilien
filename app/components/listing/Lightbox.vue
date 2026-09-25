<script setup lang="ts">
// Lightbox "Filmstreifen", ported from Praxis-Websites features/gallery/Lightbox.vue:
// dark full-screen stage, image as large as possible with the site radius, prev/next in their own
// side columns (never over the image), counter + caption and a thumbnail strip at the bottom.
// Phone: no side arrows – swipe or tap a thumbnail. Always night tokens (class "dark").
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { ChevronLeft, ChevronRight, X } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

const props = defineProps<{ images: FileAsset[], title: string }>()
const { t } = useI18n()
const open = defineModel<boolean>('open', { default: false })
const index = defineModel<number>('index', { default: 0 })

const idx = ref(0)
const many = computed(() => props.images.length > 1)
const file = computed(() => props.images[idx.value])

// ── fit ──
const stageRef = ref<HTMLElement | null>(null)
const stripRef = ref<HTMLElement | null>(null)
const topRef = ref<HTMLElement | null>(null)
const size = ref<FitSize>({ width: 0, height: 0 })

function fit() {
  const stage = stageRef.value
  const f = file.value
  if (!stage || !f) return
  const cs = getComputedStyle(stage)
  const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
  const h = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
  size.value = fitContain(w, h, f.width / f.height)
}

let ro: ResizeObserver | null = null
watch(stageRef, (el) => {
  ro?.disconnect()
  ro = null
  if (!el) return
  ro = new ResizeObserver(() => fit())
  ro.observe(el)
  fit()
  // focus "close" once the portal content is really there
  requestAnimationFrame(() => {
    const btn = topRef.value?.querySelector<HTMLElement>('button')
    if (btn && !btn.contains(document.activeElement)) btn.focus({ preventScroll: true })
  })
})
onBeforeUnmount(() => ro?.disconnect())

// ── paging: 180 ms fade out with 14 px offset in paging direction, then in ──
const reduce = ref(false)
const phase = ref<'' | 'out' | 'in'>('')
const dir = ref<'next' | 'prev'>('next')
let busy = false
let timer: ReturnType<typeof setTimeout> | null = null

function show(next: number) {
  idx.value = next
  index.value = next
  fit()
  preloadNeighbours()
  scrollThumbIntoView()
}

function go(step: number, to?: number) {
  const count = props.images.length
  if (count < 2 || busy) return
  const next = to != null ? to : wrapIndex(idx.value + step, count)
  if (next === idx.value) return
  dir.value = to != null ? (to > idx.value ? 'next' : 'prev') : step > 0 ? 'next' : 'prev'
  if (reduce.value) { show(next); return }
  busy = true
  phase.value = 'out'
  timer = setTimeout(() => {
    phase.value = 'in'
    show(next)
    requestAnimationFrame(() => requestAnimationFrame(() => { phase.value = ''; busy = false }))
  }, 180)
}

function preloadNeighbours() {
  if (props.images.length < 2) return
  for (const d of [1, -1]) {
    const f = props.images[wrapIndex(idx.value + d, props.images.length)]
    if (!f) continue
    const im = new Image()
    im.sizes = `${size.value.width || 1280}px`
    im.srcset = assetSrcset(f)
  }
}

function scrollThumbIntoView() {
  nextTick(() => {
    const strip = stripRef.value
    const thumb = strip?.children[idx.value] as HTMLElement | undefined
    if (!strip || !thumb) return
    const left = thumb.offsetLeft - strip.offsetLeft
    if (left < strip.scrollLeft) strip.scrollLeft = left - 4
    else if (left + thumb.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = left + thumb.offsetWidth - strip.clientWidth + 4
  })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') { go(1); e.preventDefault() }
  else if (e.key === 'ArrowLeft') { go(-1); e.preventDefault() }
}

// swipe: more than 40 px horizontally pages (mouse too)
let x0: number | null = null
let swiped = false
function onPointerDown(e: PointerEvent) {
  swiped = false
  if ((e.target as HTMLElement).closest('button')) return
  x0 = e.clientX
}
function onPointerUp(e: PointerEvent) {
  if (x0 == null) return
  const dx = e.clientX - x0
  x0 = null
  if (Math.abs(dx) > 40) { swiped = true; go(dx < 0 ? 1 : -1) }
}
/** Click on the empty dark area next to the image closes. */
function onStageClick(e: MouseEvent) {
  if (!swiped && e.target === stageRef.value) open.value = false
}

// ── open / close: reka only returns focus to a DialogTrigger – our tiles aren't one ──
let opener: HTMLElement | null = null
watch(open, (isOpen) => {
  if (isOpen) {
    opener = document.activeElement as HTMLElement | null
    reduce.value = matchMedia('(prefers-reduced-motion: reduce)').matches
    phase.value = ''
    busy = false
    idx.value = wrapIndex(index.value, props.images.length)
    nextTick(() => { fit(); preloadNeighbours(); scrollThumbIntoView() })
  }
  else if (timer) { clearTimeout(timer); timer = null }
})
function onCloseAutoFocus(e: Event) {
  e.preventDefault()
  if (opener && document.contains(opener)) opener.focus({ preventScroll: true })
  opener = null
}
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="lb-overlay dark" />
      <DialogContent class="lb dark" @close-auto-focus="onCloseAutoFocus" @keydown="onKeydown">
        <DialogTitle class="sr-only">{{ t('gallery.dialogTitle', { title }) }}</DialogTitle>

        <div ref="topRef" class="lb-top">
          <DialogClose class="lb-btn" :aria-label="t('gallery.close')">
            <X class="size-5" aria-hidden="true" />
          </DialogClose>
        </div>

        <div ref="stageRef" class="lb-stage" @click="onStageClick" @pointerdown="onPointerDown" @pointerup="onPointerUp" @pointercancel="x0 = null">
          <img
            v-if="file && size.width"
            class="lb-img"
            :class="[phase && `is-${phase}`, phase && `dir-${dir}`]"
            :src="assetUrl(file, 1600)"
            :srcset="assetSrcset(file)"
            :sizes="`${size.width}px`"
            :width="size.width"
            :height="size.height"
            :style="{ width: `${size.width}px`, height: `${size.height}px` }"
            :alt="file.description"
            draggable="false"
            decoding="async"
          >
          <template v-if="many">
            <button type="button" class="lb-btn lb-side lb-side--prev" :aria-label="t('gallery.prev')" @click="go(-1)">
              <ChevronLeft class="size-5" aria-hidden="true" />
            </button>
            <button type="button" class="lb-btn lb-side lb-side--next" :aria-label="t('gallery.next')" @click="go(1)">
              <ChevronRight class="size-5" aria-hidden="true" />
            </button>
          </template>
        </div>

        <div class="lb-foot">
          <DialogDescription as="div" class="lb-meta" aria-live="polite">
            <span v-if="many" class="lb-count">{{ t('gallery.count', { n: idx + 1, total: images.length }) }}</span>
            <span class="lb-cap">{{ title }}</span>
          </DialogDescription>
          <div v-if="many" ref="stripRef" class="lb-strip" role="group" :aria-label="t('gallery.thumbs')">
            <button
              v-for="(img, i) in images"
              :key="img.id"
              type="button"
              class="lb-thumb"
              :aria-label="t('gallery.showImage', { n: i + 1 })"
              :aria-current="i === idx ? 'true' : 'false'"
              @click="go(0, i)"
            >
              <img :src="assetUrl(img, 480)" alt="" loading="lazy" decoding="async" draggable="false">
            </button>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Always dark (class "dark" → night tokens), above header (z-40) and mobile action bar. */
.lb-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: color-mix(in oklch, var(--background) 96%, transparent);
  backdrop-filter: blur(8px);
}

.lb {
  --lb-btn: color-mix(in oklch, var(--foreground) 10%, transparent);
  --lb-btn-hover: color-mix(in oklch, var(--foreground) 16%, transparent);
  --lb-btn-line: color-mix(in oklch, var(--foreground) 18%, transparent);
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  grid-template-rows: 76px minmax(0, 1fr) auto;
  color: var(--foreground);
  font-size: 0.9375rem;
  line-height: 1.55;
  outline: none;
}

.lb-overlay[data-state='open'], .lb[data-state='open'] { animation: lb-in 0.2s ease-out; }
.lb-overlay[data-state='closed'], .lb[data-state='closed'] { animation: lb-out 0.2s ease-out forwards; }
@keyframes lb-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes lb-out { from { opacity: 1; } to { opacity: 0; } }

.lb-top { display: flex; justify-content: flex-end; align-items: center; padding: 0 32px; }

/* one round button for all three, 44 px */
.lb-btn {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  background: var(--lb-btn);
  border: 1px solid var(--lb-btn-line);
  color: var(--foreground);
  cursor: pointer;
  transition: background-color 0.15s ease-out;
}
@media (hover: hover) {
  .lb-btn:hover { background: var(--lb-btn-hover); }
}
.lb :focus-visible { outline: 2px solid var(--ring); outline-offset: 3px; }

.lb-stage {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  padding: 0 104px;
  touch-action: pan-y;
}

.lb-img {
  display: block;
  max-width: none;
  border-radius: var(--radius);
  user-select: none;
  -webkit-user-drag: none;
  transition: opacity 0.18s ease-out, transform 0.22s ease-out;
}
.lb-img.is-out { opacity: 0; }
.lb-img.is-out.dir-next { transform: translateX(-14px); }
.lb-img.is-out.dir-prev { transform: translateX(14px); }
.lb-img.is-in { opacity: 0; transition: none; }
.lb-img.is-in.dir-next { transform: translateX(14px); }
.lb-img.is-in.dir-prev { transform: translateX(-14px); }

.lb-side { position: absolute; top: 50%; transform: translateY(-50%); }
.lb-side--prev { left: 32px; }
.lb-side--next { right: 32px; }

.lb-foot { display: grid; gap: 14px; min-width: 0; padding: 20px 32px 24px; }
.lb-meta { display: flex; align-items: baseline; gap: 14px; min-width: 0; }
.lb-count { font-weight: 600; white-space: nowrap; }
.lb-cap { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted-foreground); }

.lb-strip { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 4px; margin: -4px; }
.lb-strip::-webkit-scrollbar { display: none; }

.lb-thumb {
  flex: none;
  width: 88px;
  height: 60px;
  padding: 0;
  border: 0;
  overflow: hidden;
  cursor: pointer;
  background: none;
  border-radius: max(0px, calc(var(--radius) - 4px));
  opacity: 0.5;
  transition: opacity 0.15s ease-out, box-shadow 0.15s ease-out;
}
.lb-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
/* active: fully opaque, 2 px gap in the ground tone, then a 2 px ring in the action colour */
.lb-thumb[aria-current='true'] { opacity: 1; box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--primary); }
@media (hover: hover) {
  .lb-thumb:not([aria-current='true']):hover { opacity: 0.75; }
}

/* phone: no side arrows, caption may wrap */
@media (max-width: 639.98px) {
  .lb-top { padding: 0 16px; }
  .lb-stage { padding: 0 16px; }
  .lb-side { display: none; }
  .lb-foot { padding: 16px 16px 28px; }
  .lb-meta { flex-direction: column; gap: 2px; }
  .lb-cap { white-space: normal; line-height: 1.45; }
  .lb-thumb { width: 64px; height: 48px; }
}

@media (prefers-reduced-motion: reduce) {
  .lb-overlay[data-state], .lb[data-state] { animation: none; }
  .lb-img, .lb-thumb, .lb-btn { transition: none !important; }
}
</style>
