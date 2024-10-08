<template>
  <div>
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>

export default {
  name: "App",
  components: {
  },
  data() {
    return {
    };
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

@import url("./assets/css/editor.scss");
</style>
