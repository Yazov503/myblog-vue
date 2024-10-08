<template>
  <div class="main">
    <div class="video-background">
      <video autoplay muted loop>
        <source src="@/assets/videos/board.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="background">
      <div class="index">
        <p class="title">过♂江♂风♂的♂奇♂妙♂世♂界</p>
        <div class="link">
          <div @click="goToLogin(true)">登录</div>
          <div @click="goToLogin(false)">注册</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToLogin(isLogin) {
      sessionStorage.setItem('isLogin', isLogin)
      this.$router.push({ path: '/login' });
    }
  }
}
</script>


<style lang="less" src="@/assets/css/Index.less" scoped></style>