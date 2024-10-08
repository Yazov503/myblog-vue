<template>
  <div @scroll="handleScroll">
    <div class="notification-container">
      <div class="notification-list" ref="notificationList">
        <div v-if="isLoading" class="loading">加载中...</div>
        <div v-if="notifications.length === 0" class="no-notifications">暂无通知</div>
        <div v-for="(notification,index) in notifications" :key="notification.id" class="notification-item">
          <div v-if="notification.senderId" class="notification-content">
            <img :src="notification.senderAvatar" alt="avatar" class="avatar" />
            <div class="notification-text">
              <a :href="`/user/${notification.senderId}`" class="sender-name" target="_blank">
                {{ notification.senderName }}
              </a>
              在
              <a :href="`/blog/${notification.blogId}`" class="blog-title" target="_blank">
                {{ notification.blogTitle }}
              </a>
              中回复你:
              <p class="content">{{ getSimpleText(notification.content) }}</p>
              <p class="create-time">{{ formatDate(notification.createTime) }}</p>
            </div>
            <div class="quick-reply-btn" @click="openReplyModal(index)">
            快速回复
          </div>
          </div>
          <div v-else class="notification-content">
            <div class="notification-text">
              系统通知:
              <p class="content">{{ getSimpleText(notification.content) }}</p>
              <p class="create-time">{{ formatDate(notification.createTime) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="快速回复" :visible.sync="isReplyModalVisible" width="400px" @close="closeReplyModal" append-to-body>
      <el-input type="textarea" v-model="replyContent[activeNotificationId]" placeholder="输入回复..." rows="4"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeReplyModal">取消</el-button>
        <el-button type="primary" @click="submitReply(activeNotificationId)">发送</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getNotificationByPage } from '@/api/notification';
import { getUserId } from '@/api/user';
import { createReply } from '@/api/reply';

export default {
  data() {
    return {
      notifications: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      isLoading: false,
      isBottomReached: false,
      stompClient: null,
      userId: null,
      replyContent: {},
      isReplyModalVisible: false,
      activeNotificationId: null,
    };
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  mounted() {
    getUserId()
      .then(response => {
        this.userId = response.data.data;
        this.connectToWebSocket();
        this.fetchNotifications();
      })
      .catch(error => {
        console.error('Error fetching userId:', error);
      });
  },
  destroyed() {
    // 断开 WebSocket 连接
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    connectToWebSocket() {
      const socket = new SockJS('http://localhost:8888/ws/notification');
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, () => {
        this.stompClient.subscribe('/topic/notification/' + this.userId, (message) => {
          const newNotification = JSON.parse(message.body);
          this.notifications.unshift(newNotification);
          this.total += 1
        });
      });
    },
    getSimpleText(html) {
      var re1 = new RegExp("<.+?>", "g");
      var msg = html.replace(re1, '');
      return msg;
    },
    fetchNotifications() {
      if (this.isLoading || this.isBottomReached) return;

      this.isLoading = true;
      getNotificationByPage(this.pageSize, this.pageNum)
        .then(response => {
          const newNotifications = response.data.data.records;
          this.total = response.data.data.total;
          this.notifications = [...this.notifications, ...newNotifications];
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    handleScroll() {
      //滚动条在Y轴上的滚动距离
      function getScrollTop() {
        var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
        if (document.body) {
          bodyScrollTop = document.body.scrollTop;
        }
        if (document.documentElement) {
          documentScrollTop = document.documentElement.scrollTop;
        }
        scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
        return scrollTop;
      }

      //文档的总高度
      function getScrollHeight() {
        var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
        if (document.body) {
          bodyScrollHeight = document.body.scrollHeight;
        }
        if (document.documentElement) {
          documentScrollHeight = document.documentElement.scrollHeight;
        }
        scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
        return scrollHeight;
      }

      //浏览器视口的高度
      function getWindowHeight() {
        var windowHeight = 0;
        if (document.compatMode == "CSS1Compat") {
          windowHeight = document.documentElement.clientHeight;
        } else {
          windowHeight = document.body.clientHeight;
        }
        return windowHeight;
      }

      const scrollTop = getScrollTop();
      const scrollHeight = getScrollHeight();
      const clientHeight = getWindowHeight();

      if (scrollTop + clientHeight >= scrollHeight - 20 && !this.isLoading) {
        this.loadMoreNotifications();
      }
    },
    loadMoreNotifications() {
      if (this.pageNum * this.pageSize < this.total) {
        this.pageNum += 1;
        this.fetchNotifications();
      } else if (!this.isBottomReached) {
        this.isBottomReached = true;
      }
    },
    formatDate(time) {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const hours = ('0' + date.getHours()).slice(-2);
      const minutes = ('0' + date.getMinutes()).slice(-2);
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    // 打开弹窗
    openReplyModal(notificationId) {
      this.activeNotificationId = notificationId;
      this.isReplyModalVisible = true;
    },
    // 关闭弹窗
    closeReplyModal() {
      this.isReplyModalVisible = false;
      this.activeNotificationId = null;
    },
    // 提交回复
    submitReply(notificationId) {
      const replyText = this.replyContent[notificationId];
      if (!replyText) {
        this.$message.error("回复不能为空")
        return;
      }

      const currentNotification = this.notifications[notificationId]
        createReply({
          parentId: currentNotification.replyId,
          commentId: currentNotification.commentId,
          content: replyText,
        }).then((response) => {
          if (response.data.code == 200) {
            this.$message.success("回复成功")
            this.replyContent[notificationId] = '';
            this.closeReplyModal();
          }
        });
    },
  }
};
</script>

<style lang="less" src="@/assets/css/Notification.less" scoped></style>
