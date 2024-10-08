<template>
  <div v-if="showButton" class="scroll-to-top" @click="scrollToTop">
    <svg class="icon" aria-hidden="true">
      <use xlink:href="#icon-huidaodingbu"></use>
    </svg>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showButton: false
    };
  },
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    handleScroll() {
      this.showButton = window.scrollY > 300; // 控制按钮显示的滚动距离
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: transparent;
  color: white;
  font-size: 24px;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}
</style>
