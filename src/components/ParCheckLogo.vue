<template>
  <component
    :is="to ? 'router-link' : 'span'"
    :to="to"
    class="inline-flex items-center select-none"
  >
    <img
      src="/logo.svg"
      alt="ParCheck"
      :style="{ height: dims.h + 'px', width: 'auto' }"
      class="object-contain"
    />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 'sm' | 'md' | 'lg' */
  size: { type: String, default: 'md' },
  /** router-link destino opcional */
  to:   { type: String, default: null  },
})

const SIZES = {
  sm: { h: 40  },
  md: { h: 56  },
  lg: { h: 90  },
}

const dims = computed(() => SIZES[props.size] ?? SIZES.md)
</script>
