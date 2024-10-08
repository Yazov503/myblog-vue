<template>
  <div>
    <div class="video-background">
      <video autoplay muted loop>
        <source src="@/assets/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <GlobalBanner></GlobalBanner>
    <div v-if="isUnauthorized">
      <div class="unauthorized-message">
        <h2>该用户已注销</h2>
        <p>当前用户已注销，无法访问该页面。</p>
        <p>页面将在 {{ countdown }} 秒后自动关闭。</p>
      </div>
    </div>
    <div v-else>
      <div class="personal-page">
        <div class="userinfo">
          <div class="userinfo-left" v-viewer>
            <img :src=userinfo.avatar>
          </div>
          <div class="userinfo-middle">
            <div class="userinfo-title">
              <span class="userinfo-username">{{ userinfo.username }}</span>
            </div>
            <div class="userinfo-introduce">
              <span>{{ userinfo.introduce || '这位用户很神秘，什么也没有留下。' }}</span>
            </div>
            <div class="userinfo-userdata">
              <div class="userinfo-sex">
                <svg class="icon" aria-hidden="true" v-if="userinfo.sex === 0">
                  <use xlink:href="#icon-Male"></use>
                </svg>
                <svg class="icon" aria-hidden="true" v-if="userinfo.sex === 1">
                  <use xlink:href="#icon-Female"></use>
                </svg>
                <svg class="icon" aria-hidden="true" v-if="userinfo.sex === 2">
                  <use xlink:href="#icon-xingbie-weizhi-copy"></use>
                </svg>
              </div>
              <div class="userinfo-others">
                <div class="userinfo-others-item">
                  <span>创建时间: {{ formatTime(userinfo.createTime) }}</span>
                </div>
                <div class="userinfo-others-item">
                  <span>博客数: {{ total }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="userInfo-right" v-if="!isSelf">
            <button class="message-button" @click="startChat">私信</button>
            <button class="follow-button" @click="followUser" v-if="!userinfo.isFollowed">关注</button>
            <button class="follow-button" @click="followUser" v-if="userinfo.isFollowed">取消关注</button>
          </div>
        </div>
        <div class="container">
          <div class="navbar">
            <button :class="{ selected: navIndex == 1 }" @click="selectOption(1)">我的博客</button>
            <button :class="{ selected: navIndex == 2 }" v-if="isSelf" @click="selectOption(2)">我的收藏</button>
            <button :class="{ selected: navIndex == 3 }" v-if="isSelf" @click="selectOption(3)">我的关注</button>
            <button :class="{ selected: navIndex == 4 }" v-if="isSelf" @click="selectOption(4)">个人信息</button>
          </div>
          <div>
            <component :is="currentComponent" :userId="userId" :isSelf="isSelf" :userinfo="userinfo"
              @updateTotal="handleTotalUpdate" @updateUserinfo="handleUserinfoUpdate">
            </component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PersonalBlogViewer from '../components/PersonalBlogViewer.vue';
import SelfInformation from '../components/SelfInformation.vue';
import MyCollection from '../components/MyCollection.vue';
import MyFollow from '../components/MyFollow.vue';
import { followUser, getCurrentUserId, getUserInfo } from '@/api/user';

export default {
  components: {
    PersonalBlogViewer,
    SelfInformation,
    MyCollection,
    MyFollow,
  },
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isSelf: false,
      userinfo: {},
      navIndex: 1,
      currentComponent: PersonalBlogViewer,
      total: 0,
      countdown: 3,
      isUnauthorized: false,
    };
  },
  created() {
    if (this.userId == 0) {
      this.handleUnauthorized()
    } else {
      this.fetchInfo()
    }
  },
  methods: {
    fetchInfo() {
      getCurrentUserId()
        .then((response) => {
          if (response.data.code == 200) {
            const currentUserId = response.data.data;
            this.isSelf = (currentUserId == this.userId)
            this.fetchUserInfo()
          }
        })
        .catch(() => {
          console.log('获取用户ID失败')
        });
    },
    fetchUserInfo() {
      getUserInfo(this.userId)
        .then((response) => {
          if (response.data.code == 200) {
            this.userinfo = response.data.data;
          } else if (response.data.code == 401) {
            this.handleUnauthorized();
          }
        })
        .catch((error) => {
          this.$message.error("获取个人信息失败", error);
        });
    },
    followUser() {
      followUser(this.userId)
        .then((response) => {
          if (response.data.code === 200) {
            this.userinfo.isFollowed = !this.userinfo.isFollowed;
            this.$message.success(this.userinfo.isFollowed ? '关注成功' : '取消关注成功');
          } else {
            this.$message.error(response.data.msg);
          }
        })
    },
    handleTotalUpdate(updatedTotal) {
      this.total = updatedTotal;
    },
    handleUserinfoUpdate(updatedUserinfo) {
      this.userinfo = updatedUserinfo;
    },
    formatTime(createTime) {
      const createTimeDate = new Date(createTime);
      const now = new Date();
      const diffInSeconds = Math.floor((now - createTimeDate) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInYears = Math.floor(diffInDays / 365);

      if (diffInYears >= 1) {
        return `${diffInYears}年`;
      } else if (diffInDays >= 1) {
        return `${diffInDays}天`;
      } else if (diffInHours >= 1) {
        return `${diffInHours}小时`;
      } else {
        return `${diffInMinutes}分钟`;
      }
    },
    selectOption(option) {
      this.navIndex = option;
      switch (option) {
        case 1:
          this.currentComponent = PersonalBlogViewer
          break;
        case 2:
          this.currentComponent = MyCollection
          break;
        case 3:
          this.currentComponent = MyFollow
          break;
        case 4:
          this.currentComponent = SelfInformation
          break;
        default:
          this.navIndex = 1
          this.currentComponent = PersonalBlogViewer
          break;
      }
    },
    handleUnauthorized() {
      this.isUnauthorized = true;
      this.startCountdown();
    },
    startCountdown() {
      const interval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(interval);
          this.closePage();
        }
      }, 1000);
    },
    closePage() {
      window.close()
    },
    startChat() {
      window.sessionStorage.setItem('contactId', this.userId);
      window.open('/message-center?index=1', '_blank');
    }
  }
};
</script>

<style lang="less" src="@/assets/css/PersonalPage.less" scoped></style>