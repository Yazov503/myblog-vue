<template>
  <div class="container">
    <div class="content">
      <span>{{ currentPoem }}</span>
      <span class="cursor" :class="{ blink: isCursorBlinking }">|</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      poems: [
        "纸上得来终觉浅，绝知此事要躬行。",
        "寻寻觅觅，冷冷清清，凄凄惨惨戚戚。",
        "不识庐山真面目，只缘身在此山中。",
        "人有悲欢离合，月有阴晴圆缺，此事古难全。",
        "人生得意须尽欢，莫使金樽空对月。",
        // 你可以添加更多诗句
      ],
      currentPoem: "",
      isCursorBlinking: true,
      poemIndex: 0,
      charIndex: 0,
      adding: true,
    };
  },
  mounted() {
    this.startCursorBlink();
    this.startPoemAnimation();
  },
  methods: {
    startCursorBlink() {
      setInterval(() => {
        this.isCursorBlinking = !this.isCursorBlinking;
      }, 500);
    },
    startPoemAnimation() {
      const addInterval = 100; // 字符添加间隔时间（毫秒）
      const removeInterval = 100; // 字符删除间隔时间（毫秒）
      const waitTime = 3000; // 等待时间（毫秒）
    
      const addChars = () => {
        if (this.charIndex < this.poems[this.poemIndex].length) {
          this.currentPoem += this.poems[this.poemIndex][this.charIndex];
          this.charIndex++;
          setTimeout(addChars, addInterval);
        } else {
          setTimeout(removeChars, waitTime + this.poems[this.poemIndex].length * addInterval);
        }
      };

      const removeChars = () => {
        if (this.charIndex > 0) {
          this.currentPoem = this.currentPoem.slice(0, -1);
          this.charIndex--;
          setTimeout(removeChars, removeInterval);
        } else {
          this.poemIndex = (this.poemIndex + 1) % this.poems.length;
          setTimeout(addChars, waitTime + this.poems[this.poemIndex].length * removeInterval);
        }
      };

      addChars();
    },
  },
};
</script>

<style scoped>
.container {
  margin-top: 20px;
  text-align: center;
}

.content {
  display: inline-block;
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.6);
}

.cursor {
  display: inline-block;
  width: 2px;
}

.blink {
  opacity: 0;
}
</style>
