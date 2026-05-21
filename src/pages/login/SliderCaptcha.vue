<template>
  <div class="slider-captcha">
    <div
      class="slider-wrap"
      :class="{ success, dragging: isDragging }"
      ref="trackRef"
    >
      <!-- 填充轨道 -->
      <div class="slider-fill" :style="{ width: sliderLeft + sliderBtnSize + 'px' }"></div>

      <!-- 提示文字 -->
      <span class="slider-label" :class="{ hidden: isDragging || success }">按住滑块向右拖动</span>
      <span class="slider-label success-label" :class="{ visible: success }">✓ 验证通过</span>

      <!-- 滑块按钮 -->
      <div
        class="slider-btn"
        :style="{ left: sliderLeft + 'px' }"
        :class="{ success, dragging: isDragging }"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
      >
        <span class="btn-arrow" v-if="!success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="btn-check" v-else>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="btn-glow"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits(['success']);

const sliderBtnSize = 38;
const trackRef = ref(null);
const trackWidth = ref(0);

const sliderLeft = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const success = ref(false);

// 计算最大可滑动距离（轨道宽度 - 按钮宽度 - 左右各4px内边距）
const getMaxLeft = () => trackWidth.value - sliderBtnSize - 8;

onMounted(() => {
  if (trackRef.value) {
    trackWidth.value = trackRef.value.offsetWidth;
  }
});

const startDrag = (e) => {
  if (success.value) return;
  // 每次开始拖动时重新测量，防止布局变化
  if (trackRef.value) {
    trackWidth.value = trackRef.value.offsetWidth;
  }
  isDragging.value = true;
  startX.value = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  if (e.cancelable) e.preventDefault();
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  let moveX = clientX - startX.value;
  const max = getMaxLeft();
  if (moveX < 0) moveX = 0;
  if (moveX > max) moveX = max;
  sliderLeft.value = moveX;
};

const stopDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const max = getMaxLeft();
  if (sliderLeft.value >= max - 4) {
    sliderLeft.value = max;
    success.value = true;
    emit('success');
  } else {
    sliderLeft.value = 0;
  }
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);
};

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);
});
</script>

<style scoped>
.slider-captcha {
  width: 100%;
  margin-bottom: 18px;
}

.slider-wrap {
  position: relative;
  width: 100%;
  height: 46px;
  background: rgba(8, 8, 18, 0.75);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  user-select: none;
  transition: border-color 0.3s ease;
}

.slider-wrap.dragging {
  border-color: rgba(102, 126, 234, 0.35);
}

.slider-wrap.success {
  border-color: rgba(102, 126, 234, 0.5);
}

.slider-fill {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.25), rgba(118, 75, 162, 0.2));
  border-radius: 12px;
  pointer-events: none;
}

.slider-wrap.success .slider-fill {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.25));
}

.slider-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1.5px;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.2s ease;
}

.slider-label.hidden {
  opacity: 0;
}

.success-label {
  color: rgba(102, 126, 234, 0.9);
  letter-spacing: 1px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.success-label.visible {
  opacity: 1;
}

.slider-btn {
  position: absolute;
  top: 4px;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border: 1px solid rgba(102, 126, 234, 0.4);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 2;
  color: rgba(102, 126, 234, 0.8);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  /* 回弹过渡，仅在非拖动状态生效 */
  will-change: left;
}

.slider-btn:not(.dragging) {
  transition: left 0.25s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.2s ease, box-shadow 0.2s ease;
}

.slider-btn.dragging {
  cursor: grabbing;
  border-color: rgba(102, 126, 234, 0.7);
  background: linear-gradient(145deg, #1e1e38, #1a1a30);
  box-shadow:
    0 4px 16px rgba(102, 126, 234, 0.25),
    0 0 0 1px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: rgba(102, 126, 234, 1);
  transition: none; /* 拖动时禁用过渡，保证跟手 */
}

.slider-btn.success {
  cursor: default;
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(145deg, rgba(102,126,234,0.15), rgba(118,75,162,0.12));
  box-shadow:
    0 0 16px rgba(102, 126, 234, 0.2),
    0 0 0 1px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: #667eea;
}

.btn-arrow,
.btn-check {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.btn-glow {
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.slider-btn.dragging .btn-glow,
.slider-btn.success .btn-glow {
  opacity: 1;
}
</style>
