<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const { t } = useI18n()
const { dark, sync, toggle } = useTheme()
onMounted(sync)
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-pill"
          :aria-pressed="dark"
          :aria-label="t('theme.toggle')"
          @click="toggle"
        >
          <Sun class="size-5 dark:hidden" aria-hidden="true" />
          <Moon class="hidden size-5 dark:block" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ t('theme.tooltip') }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
