<template>
  <div class="slider-captcha">
    <div class="slider-bg" :class="{ success: success }">
      <div class="slider-track" :style="{ width: sliderLeft + sliderWidth + 'px' }"></div>
      <div
        class="slider-btn"
        :style="{ left: sliderLeft + 'px' }"
        @mousedown="startDrag"
        @touchstart="startDrag"
        :class="{ success: success }"
      >
        <span v-if="!success">→</span>
        <span v-else>✔</span>
      </div>
      <span class="slider-text" v-if="!success">请按住滑块拖动</span>
      <span class="slider-text success" v-else>验证通过</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits(['success']);
const sliderLeft = ref(0);
const dragging = ref(false);
const startX = ref(0);
const sliderWidth = 40;
const maxWidth = 260;
const success = ref(false);

const startDrag = (e) => {
  if (success.value) return;
  dragging.value = true;
  startX.value = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('touchend', stopDrag);
};

const onDrag = (e) => {
  if (!dragging.value) return;
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  let moveX = clientX - startX.value;
  if (moveX < 0) moveX = 0;
  if (moveX > maxWidth - sliderWidth) moveX = maxWidth - sliderWidth;
  sliderLeft.value = moveX;
};

const stopDrag = () => {
  if (!dragging.value) return;
  dragging.value = false;
  if (sliderLeft.value >= maxWidth - sliderWidth - 2) {
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
  width: 260px;
  margin: 0 auto 20px auto;
}
.slider-bg {
  position: relative;
  width: 100%;
  height: 48px;
  background: rgba(16, 16, 35, 0.7);
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(106,17,203,0.10), 0 1.5px 8px rgba(0,0,0,0.18);
  user-select: none;
  overflow: hidden;
  border: 1.5px solid rgba(255,255,255,0.10);
  transition: background 0.3s;
}
.slider-bg.success {
  background: linear-gradient(90deg, #e6f7ff 60%, #d6eaff 100%);
  border-color: #6a11cb;
}
.slider-track {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  border-radius: 22px;
  transition: background 0.3s;
  z-index: 1;
  box-shadow: 0 0 8px 2px #6a11cb33;
}
.slider-btn {
  position: absolute;
  top: 3px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(106,17,203,0.18), 0 0 0 2px #fff2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  cursor: pointer;
  z-index: 2;
  border: 2px solid #fff3;
  transition: background 0.3s, color 0.3s;
  user-select: none;
}
.slider-btn.success {
  background: linear-gradient(135deg, #6a11cb 60%, #2575fc 100%);
  color: #fff;
  border-color: #6a11cb;
  box-shadow: 0 0 12px 2px #6a11cb55;
}
.slider-text {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  line-height: 44px;
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  letter-spacing: 1px;
  text-shadow: 0 1px 4px #0004;
}
.slider-text.success {
  color: #6a11cb;
  text-shadow: 0 1px 4px #fff8;
  font-weight: bold;
}
</style> 