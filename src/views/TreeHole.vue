<template>
  <div id="main">
    <global-banner></global-banner>
    <h1 class="title">树洞</h1>
    <br />
    <div class="input-box">
      <input v-model="newDanmus" autocomplete="off" class="input" name="text" type="text"
        placeholder="在这留下你的足迹吧..." />
      <button class="cta" @click="sendDanmu">
        <span class="span">发送</span>
      </button>
    </div>
    <vue-danmaku ref="danmakuRef" :danmus="danmus" class="barrage" :speeds="100" :debounce="500" :randomChannel="true"
      :isSuspend="true" useSlot @play-end="playEnd">
      <template v-slot:dm="{ danmu }">
        <div class="dmDiv" @mouseover="hover = danmu.id" @mouseleave="hover = null">
          <span>{{ danmu.content }}</span>
          <div v-if="hover == danmu.id" class="timestamp">{{ danmu.createTime }}</div>
        </div>
      </template>
    </vue-danmaku>
  </div>
</template>

<script>
import { addDanmu, getDanmus } from '@/api/treehole';
import VueDanmaku from 'vue-danmaku';

export default {
  components: {
    VueDanmaku,
  },
  data() {
    return {
      danmus: [],
      newDanmus: '',
      speed: 5,
      loop: true,
      hover: null,
      danmuSize: 100,
    };
  },
  methods: {
    sendDanmu() {
      if (this.newDanmus.trim()) {
        addDanmu(this.newDanmus).then((response) => {
          if (response.data.code == 200) {
            this.$message.success('发送成功');
            this.danmus.push(response.data.data);
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch((error) => {
          console.error('Error sending message:', error);
        }).finally(() => {
          this.newDanmus = '';
        });
      }
    },
    loadDanmus() {
      getDanmus(this.danmuSize).then((response) => {
        if (response.data.code == 200) {
          this.danmus = [];
          // this.$refs.danmakuRef.stop();
          this.$refs.danmakuRef.reset();
          setTimeout(() => {
            response.data.data.forEach((item) => {
              this.danmus.push(item);
            });
          }, 100);
        } else {
          this.$message.error(response.data.msg);
        }
      }).catch((error) => {
        console.error('Error fetching danmus:', error);
      });
    },
    playEnd() {
      this.loadDanmus();
    },
  },
  mounted() {
    this.loadDanmus();
  },
};
</script>

<style lang="less" src="@/assets/css/TreeHole.less" scoped>
</style>
