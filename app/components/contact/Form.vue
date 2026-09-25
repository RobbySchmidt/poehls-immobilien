<script setup lang="ts">
import { CircleAlert, CircleCheck } from '@lucide/vue'
import type { Concern, ContactValues } from '~/utils/contact'

// PROTOTYPE: validates and confirms, but sends nothing (spec E6).
const { t } = useI18n()
const localePath = useLocalePath()
const locale = useLocaleCode()
const route = useRoute()
const company = useCompany()
const values = reactive<ContactValues>({ name: '', email: '', phone: '', concern: 'sonstiges', subject: '', message: '' })
const errors = ref<Partial<Record<keyof ContactValues, string>>>({})
const sent = ref(false)
const successEl = ref<HTMLElement | null>(null)

onMounted(() => {
  const r = resolveInquiry(route.query, useAvailableListings(), locale)
  values.subject = r.subject
  values.concern = r.concern
})

// Clear fixed errors while typing – otherwise the blur on the submit click removes an
// error text, the button jumps up and the click misses.
watch(values, () => { errors.value = refreshErrors(errors.value, values, locale) })

function blur(field: keyof ContactValues) {
  errors.value = { ...errors.value, [field]: validateContact(values, locale)[field] }
}

async function submit() {
  errors.value = validateContact(values, locale)
  const firstError = Object.keys(errors.value)[0]
  if (firstError) {
    document.getElementById(`f-${firstError}`)?.focus()
    return
  }
  sent.value = true
  await nextTick()
  successEl.value?.focus()
}

const concerns = Object.entries(concernLabels(locale)) as [Concern, string][]
const describedBy = (f: keyof ContactValues) => (errors.value[f] ? `e-${f}` : undefined)
</script>

<template>
  <div v-if="sent" ref="successEl" tabindex="-1" class="rounded-2xl bg-secondary p-8 outline-none" role="status">
    <CircleCheck class="size-6 text-primary" aria-hidden="true" />
    <h2 class="mt-3 text-f-2xl">{{ t('contact.thanks', { name: values.name.trim().split(' ')[0] }) }}</h2>
    <p class="mt-2 text-muted-foreground">{{ t('contact.thanksText') }}</p>
    <p class="mt-4 text-sm text-muted-foreground">{{ t('contact.prototypeNote', { phone: company.phone }) }}</p>
  </div>

  <form v-else novalidate class="grid gap-6" @submit.prevent="submit">
    <div class="grid gap-2">
      <Label for="f-name">{{ t('contact.name') }}</Label>
      <Input id="f-name" v-model="values.name" autocomplete="name" class="h-12 text-base" :aria-invalid="!!errors.name" :aria-describedby="describedBy('name')" @blur="blur('name')" />
      <p v-if="errors.name" id="e-name" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4 shrink-0" aria-hidden="true" />{{ errors.name }}</p>
    </div>
    <div class="grid gap-6 sm:grid-cols-2">
      <div class="grid gap-2">
        <Label for="f-email">{{ t('contact.email') }}</Label>
        <Input id="f-email" v-model="values.email" type="email" autocomplete="email" inputmode="email" class="h-12 text-base" :aria-invalid="!!errors.email" :aria-describedby="describedBy('email')" @blur="blur('email')" />
        <p v-if="errors.email" id="e-email" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4 shrink-0" aria-hidden="true" />{{ errors.email }}</p>
      </div>
      <div class="grid gap-2">
        <Label for="f-phone">{{ t('contact.phone') }} <span class="font-normal text-muted-foreground">{{ t('contact.optional') }}</span></Label>
        <Input id="f-phone" v-model="values.phone" type="tel" autocomplete="tel" inputmode="tel" class="h-12 text-base" :aria-invalid="!!errors.phone" :aria-describedby="describedBy('phone')" @blur="blur('phone')" />
        <p v-if="errors.phone" id="e-phone" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4 shrink-0" aria-hidden="true" />{{ errors.phone }}</p>
      </div>
    </div>
    <div class="grid gap-2">
      <Label for="f-concern">{{ t('contact.concern') }}</Label>
      <Select v-model="values.concern">
        <SelectTrigger id="f-concern" size="field" class="w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem v-for="[k, label] in concerns" :key="k" :value="k">{{ label }}</SelectItem></SelectContent>
      </Select>
    </div>
    <div v-if="values.subject" class="grid gap-2">
      <Label for="f-subject">{{ t('contact.subject') }}</Label>
      <Input id="f-subject" v-model="values.subject" class="h-12 text-base" />
    </div>
    <div class="grid gap-2">
      <Label for="f-message">{{ t('contact.message') }}</Label>
      <Textarea id="f-message" v-model="values.message" rows="6" class="text-base" :aria-invalid="!!errors.message" :aria-describedby="describedBy('message')" @blur="blur('message')" />
      <p v-if="errors.message" id="e-message" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4 shrink-0" aria-hidden="true" />{{ errors.message }}</p>
    </div>
    <p class="text-sm text-muted-foreground">{{ t('contact.consent') }} <NuxtLink :to="localePath('datenschutz')" class="text-primary underline underline-offset-4">{{ t('contact.privacyLink') }}</NuxtLink>.</p>
    <div><Button type="submit" size="cta">{{ t('contact.send') }}</Button></div>
  </form>
</template>
