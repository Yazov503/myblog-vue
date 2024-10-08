<template>
  <div :style="{ height: waveAllHeight + 'px', background: bgColor }" class="wave">
    <canvas id="wave1"></canvas>
    <canvas id="wave2"></canvas>
    <canvas id="wave3"></canvas>
  </div>
</template>

<script>
export default {
  name: "Wave",
  props: {
    // bgColor: { default: 'linear-gradient(to bottom, #daeeff, #fff)' }, // 背景色
    bgColor: { default: 'transparent' }, // 背景色
    waveAllHeight: { default: 150 }, // 波浪的整体高度
    waveCount: { default: 4 }, // 波峰个数
    waveHeight: { default: 30 }, // 波浪起伏高度
    // 波浪颜色
    waveColor: {
      default() {
        return [
          "rgba(255, 255, 255, .7)",
          "rgba(255, 255, 255, .7)",
          "rgba(255, 255, 255, .7)",
        ];
      },
    },
    // 波浪速率
    waveTime: {
      default() {
        return [1500, 3000, 2500];
      },
    },
  },
  data() {
    return {
    };
  },
  mounted() {
    window.addEventListener('resize', this.updateCanvasWidth);
    this.startWaves()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateCanvasWidth);
  },
  methods: {
    startWaves() {
      this.wavePlay("wave1", 180, this.waveColor[0], this.waveTime[0]);
      this.wavePlay("wave2", 190, this.waveColor[1], this.waveTime[1]);
      this.wavePlay("wave3", 170, this.waveColor[2], this.waveTime[2]);
    },
    updateCanvasWidth() {
      if (document.getElementById("wave1").width != document.body.clientWidth) {
        document.getElementById("wave1").width = document.body.clientWidth;
        document.getElementById("wave2").width = document.body.clientWidth;
        document.getElementById("wave3").width = document.body.clientWidth;
      }
    },
    wavePlay($canvasID, $progress, $maveColor, $time) {
      const that = this;
      let waveWidth = 3300, // 波浪长度
        offset = 0,
        waveHeight = that.waveHeight, // 波浪起伏高度
        waveCount = that.waveCount, // 波浪个数
        startX = -1000,
        startY = 212, // canvas 高度
        progress = $progress, // 波浪位置高度
        d2 = waveWidth / waveCount, // 单个波浪的宽度
        d = d2 / 2,
        hd = d / 2,
        c = document.getElementById($canvasID),
        ctx = c.getContext("2d");
      c.width = document.body.clientWidth; // 画布宽度
      c.height = that.waveAllHeight; // 画布高度
      function move() {
        offset -= 5;
        if (-1 * offset === d2) {
          offset = 0;
        }
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = $maveColor; // 画布填充色
        ctx.beginPath();
        let offsetY = startY - progress;
        // 绘制贝塞尔曲线
        ctx.moveTo(startX - offset, offsetY); // 开始点
        for (let i = 0; i < waveCount; i++) {
          let dx = i * d2;
          let offsetX = dx + startX - offset;
          ctx.quadraticCurveTo(
            offsetX + hd,
            offsetY + waveHeight,
            offsetX + d,
            offsetY
          );
          ctx.quadraticCurveTo(
            offsetX + hd + d,
            offsetY - waveHeight,
            offsetX + d2,
            offsetY
          );
        }
        ctx.lineTo(startX + waveWidth, 3000);
        ctx.lineTo(startX, 3000);
        ctx.fill();
        setTimeout(move, $time / 60); // 速度
      }

      move();
    },
  },
};
</script>

<style scoped lang="less">
.wave {
  position: absolute;
  top: 85vh;
  left: 0;

  canvas {
    opacity: 0.5;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>