<template>
  <div>
    <transition name="banner">
      <div class="banner" v-if="showBanner">
        <div class="banner-title">小碧宰治</div>
        <div class="banner-menu">
          <button class="banner-menu-button" @click="handleMenuSelect(1)">看博客</button>
          <button v-if="token" class="banner-menu-button" @click="handleMenuSelect(2)">写博客</button>
          <button class="banner-menu-button" @click="handleMenuSelect(3)">树洞</button>
          <button v-if="token" class="banner-menu-button" @click="handleMenuSelect(4)">我的</button>

          <el-dropdown v-if="token" @command="handleMessageCommand">
            <button class="banner-menu-button">
              消息中心
              <el-badge :value="getTotalCount()" class="notification-bubble" v-if="getTotalCount() > 0"></el-badge>
            </button>
            <el-dropdown-menu slot="dropdown" class="el-dropdown-menu">
              <el-dropdown-item command="message" class="dropdown-menu-item">
                消息
                <el-badge :value="unreadMessageCount" class="notification-bubble"
                  v-if="unreadMessageCount > 0"></el-badge>
              </el-dropdown-item>
              <el-dropdown-item command="notification" class="dropdown-menu-item">
                通知
                <el-badge :value="unreadNotificationCount" class="notification-bubble"
                  v-if="unreadNotificationCount > 0"></el-badge>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- <button v-if="token" class="banner-menu-button" @click="handleMenuSelect(5)">
            通知
            <el-badge :value="unreadNotificationCount" class="notification-bubble"
              v-if="unreadNotificationCount > 0"></el-badge>
          </button> -->
          <button v-if="!token" class="banner-menu-button" @click="handleLogin">登录</button>
          <button v-if="!token" class="banner-menu-button" @click="handleAdminLogin">管理员登录</button>
          <button v-if="token" class="banner-menu-button" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { checkToken, getUserId } from '@/api/user';
import { getUnreadNotificationNum } from '@/api/notification';
import { getUnreadMessageNum } from '@/api/message';

export default {
  data() {
    return {
      showBanner: true,
      token: null,
      userId: '',
      unreadNotificationCount: 0, // 未读通知数量
      unreadMessageCount: 0, // 未读消息数量
    };
  },
  mounted() {
    this.token = this.getToken(); // 检查是否存在token
    this.fetchuserId();
    this.fetchUnreadCount();
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed() {
    // 断开 WebSocket 连接
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    getTotalCount() {
      return Number(this.unreadNotificationCount) + Number(this.unreadMessageCount)
    },
    connectToWebSocket() {
      const socket = new SockJS('http://localhost:8888/ws/notification');
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, () => {
        this.stompClient.subscribe('/topic/notification/unread/' + this.userId, (message) => {
          this.unreadNotificationCount = message.body
        });

        this.stompClient.subscribe('/queue/message/unread/' + this.userId, (message) => {
          this.unreadMessageCount = message.body;
        });
      });
    },
    fetchUnreadCount() {
      getUnreadNotificationNum()
        .then(response => {
          if (response.data.code === 200) {
            this.unreadNotificationCount = response.data.data;
          } else {
            this.$message.error(response.data.msg);
          }
        })
        .catch(error => {
          console.error('Error fetching unread notification:', error);
        });

      getUnreadMessageNum()
        .then(response => {
          if (response.data.code === 200) {
            this.unreadMessageCount = response.data.data;
          } else {
            this.$message.error(response.data.msg);
          }
        })
        .catch(error => {
          console.error('Error fetching unread message:', error);
        });
    },
    handleScroll() {
      const scrollPosition = window.scrollY;
      this.showBanner = scrollPosition < 100;
    },
    handleMenuSelect(index) {
      this.checkToken();
      let targetPath = '/';
      switch (index) {
        case 1:
          targetPath = '/blog/view';
          break;
        case 2:
          targetPath = '/blog/edit';
          break;
        case 3:
          targetPath = '/treehole';
          break;
        case 4:
          targetPath = '/user/' + this.userId;
          break;
        case 5:
          targetPath = '/message-center';
          break;
        default:
          targetPath = '/';
          break;
      }

      if (this.$route.path === targetPath) {
        location.reload(); // 刷新页面
      } else {
        this.$router.push(targetPath);
      }
    },
    handleMessageCommand(command) {
      let targetPath = '/message-center';
      if (command === 'message') {
        targetPath += '?index=1';
      } else if (command === 'notification') {
        targetPath += '?index=2';
      }
      if (this.$route.path === targetPath) {
        location.reload();
      } else {
        this.$router.push(targetPath);
      }
    },
    handleLogin() {
      this.$router.push('/login');
    },
    handleAdminLogin() {
      window.open('http://localhost:9000/admin/login', '_blank');
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/');
    },
    getToken() {
      return localStorage.getItem('token');
    },
    checkToken() {
      this.token = this.getToken();
      if (this.token) {
        checkToken()
          .then(response => {
            if (!response.data.data) {
              this.token = null;
              localStorage.removeItem('token');
              this.$router.push('/blog/view');
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    fetchuserId() {
      if (!this.token) {
        return;
      }
      getUserId()
        .then(response => {
          this.userId = response.data.data;
          this.connectToWebSocket();
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
</script>

<style lang="less" src="@/assets/css/GlobalBanner.less"></style>
