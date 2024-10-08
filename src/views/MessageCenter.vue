<template>
  <div class="message-center">
    <div class="video-background">
      <video autoplay muted loop>
        <source src="@/assets/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <global-banner></global-banner>
    <div class="content-wrapper">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" tab-position="left" class="custom-tabs">
        <el-tab-pane label="消息" name="1">
          <message></message>
        </el-tab-pane>
        <el-tab-pane label="通知" name="2">
          <notification></notification>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import Notification from '@/components/Notification';
import Message from '@/components/Message';

export default {
  components: {
    Notification,
    Message,
  },
  data() {
    return {
      activeTab: '1',
    };
  },
  mounted() {
    this.setActiveTab();
  },
  methods: {
    setActiveTab() {
      const index = this.$route.query.index || '1';
      this.activeTab = index;
    },
    handleTabClick(tab) {
      const newIndex = tab.name;
      this.$router.push({ query: { index: newIndex } });
    }
  },
  watch: {
    '$route.query.index'(newIndex) {
      this.activeTab = newIndex || '1';
    }
  }
};
</script>

<style lang="less" scoped>
@pink: #fb7299;

.message-center {
  position: relative;
  width: 70%;
  height: 100%;
  margin: 100px auto 10px auto;
}

.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.video-background video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  max-width: 1200px;
  padding: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.el-tabs /deep/ .el-tabs__item {
  color: #888;
}

.el-tabs /deep/ .el-tabs__item:hover {
  color: @pink;
}

.el-tabs /deep/ .is-active {
  color: @pink;
}
 
/* 下划线颜色 */
::v-deep .el-tabs__active-bar {
  background-color: @pink;
}
</style>
