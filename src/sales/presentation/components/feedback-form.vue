<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Feedback } from '../../../sales/domain/model/feedback.entity.js'

const { t } = useI18n()

const props = defineProps({
  saleId: { type: Number, required: true },
  patientId: { type: Number, required: true }
})

const emit = defineEmits(['feedback-submitted', 'skip'])

const rating = ref(5)
const recommendService = ref(true)
const comment = ref('')

function submit() {
  const feedback = new Feedback({
    saleId: props.saleId,
    patientId: props.patientId,
    rating: rating.value,
    recommendService: recommendService.value,
    comment: comment.value,
    submittedAt: new Date().toISOString()
  })
  emit('feedback-submitted', feedback)
}
</script>

<template>
  <div class="feedback-form">
    <p class="feedback-intro">
      {{ $t('sales.feedback.intro') }}
    </p>

    <div class="form-field">
      <label>{{ $t('sales.feedback.rating') }}</label>
      <pv-rating v-model="rating" :stars="5" />
    </div>

    <div class="form-field">
      <label>{{ $t('sales.feedback.recommend') }}</label>
      <div class="recommend-options">
        <pv-button
          :label="$t('common.yes')"
          :outlined="!recommendService"
          severity="success"
          size="small"
          @click="recommendService = true"
        />
        <pv-button
          :label="$t('common.no')"
          :outlined="recommendService"
          severity="danger"
          size="small"
          @click="recommendService = false"
        />
      </div>
    </div>

    <div class="form-field">
      <label>{{ $t('sales.feedback.comments') }}</label>
      <pv-textarea v-model="comment" rows="3" :placeholder="$t('sales.feedback.commentsPlaceholder')" class="w-full" auto-resize />
    </div>

    <div class="feedback-actions">
      <pv-button :label="$t('sales.feedback.skip')" text severity="secondary" @click="emit('skip')" />
      <pv-button :label="$t('sales.feedback.submit')" icon="pi pi-send" @click="submit" />
    </div>
  </div>
</template>

<style scoped>
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-intro {
  color: #374151;
  font-size: 0.9rem;
  margin: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.recommend-options {
  display: flex;
  gap: 8px;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}
</style>
