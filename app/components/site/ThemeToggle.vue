<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const { dark, sync, toggle } = useTheme()
onMounted(sync)
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="size-11 rounded-full"
          :aria-pressed="dark"
          aria-label="Zwischen Tag- und Nachtansicht wechseln"
          @click="toggle"
        >
          <Sun class="size-5 dark:hidden" aria-hidden="true" />
          <Moon class="hidden size-5 dark:block" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Tag / Nacht</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
