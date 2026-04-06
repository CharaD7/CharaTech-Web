<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <BaseAlert
      v-for="alert in alerts"
      :key="alert.id"
      v-model="alert.visible"
      :variant="alert.variant"
      :title="alert.title"
      :dismissible="true"
      @update:model-value="removeAlert(alert.id)"
    >
      {{ alert.message }}
    </BaseAlert>
  </div>
</template>

<script setup lang="ts">
interface Alert {
  id: string
  variant: 'info' | 'warning' | 'danger' | 'success'
  title?: string
  message: string
  visible: boolean
}

const alerts = ref<Alert[]>([])

const addAlert = (variant: Alert['variant'], message: string, title?: string) => {
  const id = Math.random().toString(36).substr(2, 9)
  alerts.value.push({
    id,
    variant,
    title,
    message,
    visible: true
  })
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    removeAlert(id)
  }, 5000)
}

const removeAlert = (id: string) => {
  const index = alerts.value.findIndex(alert => alert.id === id)
  if (index > -1) {
    alerts.value.splice(index, 1)
  }
}

// Expose methods globally
defineExpose({
  addAlert,
  removeAlert
})
</script>