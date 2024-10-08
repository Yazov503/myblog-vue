<template>
  <div>
    <div class="no-message" v-if="!contacts.length">
      <el-empty description="暂无消息"></el-empty>
    </div>
    <div class="chat-container" v-else>
      <div class="user-list" ref="userList" @scroll="handleUserScroll">
        <div v-for="user in sortedContacts" :key="user.id" @click="selectUser(user)"
          :class="{ 'active-user': selectedUser && selectedUser.id === user.id }" class="user-item">
          <img :src="user.avatar" alt="Avatar" class="avatar" />
          <div class="user-info">
            <p class="user-name">{{ user.username }}</p>
            <p class="last-contact-time">{{ user.lastContactTime }}</p>
          </div>
          <el-badge :value="unreadCounts[user.id]" class="unread-badge"
            v-if="unreadCounts[user.id] && unreadCounts[user.id] > 0 > 0"></el-badge>
        </div>
        <div v-if="loadingMore" class="loading-indicator">加载中...</div>
      </div>
      <div class="chat-window">
        <div v-if="selectedUser" class="message-list" ref="messageList" @scroll="handleMessageScroll">
          <div v-for="message in filteredMessages" :key="message.id"
            :class="{ 'message-sent': message.senderId === userId, 'message-received': message.senderId !== userId }">
            <div v-if="message.senderId !== userId" class="message-item received">
              <img :src="message.senderAvatar" alt="Avatar" class="message-avatar" />
              <div class="message-content">
                <p v-html="message.content" @click="handleImageClick" v-viewer></p>
                <span class="message-time">{{ formatDate(message.createTime) }}</span>
              </div>
            </div>
            <div v-if="message.senderId === userId" class="message-item sent">
              <div class="message-content">
                <p v-html="message.content" @click="handleImageClick" v-viewer></p>
                <span class="message-time">{{ formatDate(message.createTime) }}</span>
              </div>
              <img :src="userAvatar" alt="Avatar" class="message-avatar" />
            </div>
          </div>
        </div>
        <div v-if="selectedUser" class="message-input">
          <editor :init="init" v-model="newMessageContent"></editor>
          <div class="button-menu">
            <button @click="sendMessage" class="send-button">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMessages, refreshUnreadMessage, sendMessage } from '@/api/message';
import { getUserId, getUserInfo } from '@/api/user';
import { getContactsByPage } from '@/api/user';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Editor from "@tinymce/tinymce-vue";
import { uploadImg } from '@/api/common';

export default {
  components: {
    Editor
  },
  data() {
    return {
      messages: {},
      contacts: [],
      userId: null,
      selectedUser: null,
      newMessageContent: '',
      stompClient: null,
      userAvatar: '',
      pageSize: 10,
      pageNum: 1,
      totalContacts: 0,
      loadingMore: false,
      messageLimit: 50,
      unreadCounts: {},
      init: {
        language_url: "/js/editor//tinymce/langs/zh_CN.js",
        language: "zh_CN",
        skin_url: "/js/editor//tinymce/skins/ui/oxide",
        height: 160,
        width: 800,
        end_container_on_empty_block: true,
        powerpaste_word_import: "clean",
        advlist_bullet_styles: "square",
        advlist_number_styles: "default",
        imagetools_cors_hosts: ["www.tinymce.com", "codepen.io"],
        default_link_target: "_blank",
        link_title: false,
        media_live_embeds: true,
        content_style: `
          html { background-color: #fff; }
          .mce-content-body { 
            padding: 2px !important;margin: 0 !important;
          }
          .mce-content-body p img {
              max-width: 50%;
              height: auto;
          }
        `,
        images_upload_url: "http://localhost:8888/upload",
        nonbreaking_force_tab: true,
        plugins: ["image"],
        external_plugins: {
          tpImportword: "/js/editor//tinymce/plugins/tpImportword/plugin.min.js",
          emoticons: '/js/editor/tinymce/plugins/emoticons/plugin.min.js',
        },
        toolbar: [" emoticons image tpImportword"],
        branding: false,
        elementpath: false,
        file_picker_types: "media",
        menubar: false,
        statusbar: false,
        content_css: "/js/editor//tinymce/skins/content/document/content.css",
        images_upload_handler: this.uploadImageHandler,
      },
    };
  },
  created() {
    getUserId().then(response => {
      this.userId = response.data.data;
      getUserInfo(this.userId).then(response => {
        this.userAvatar = response.data.data.avatar;
      });
      this.loadContacts();
      this.connectToWebSocket();
    });
  },
  methods: {
    loadContacts() {
      if (this.loadingMore) return;
      this.loadingMore = true;
      getContactsByPage(this.pageSize, this.pageNum, '').then(response => {
        if (response.data.code === 200) {
          this.contacts = [...this.contacts, ...response.data.data.records];
          this.totalContacts = response.data.data.total;
          this.pageNum += 1;
          this.loadingMore = false;
        } else {
          this.loadingMore = false;
        }

        this.contacts.forEach(contact => {
          this.getRecentMessagesForUser(contact.id);
        });

        const contactId = window.sessionStorage.getItem('contactId');
        window.sessionStorage.removeItem('contactId');
        if (contactId) {
          const existingContact = this.contacts.find(contact => contact.id == contactId);
          if (existingContact) {
            this.selectUser(existingContact);
          } else {
            getUserInfo(contactId).then(userResponse => {
              const newContact = userResponse.data.data;
              newContact.lastContactTime = Date.now();
              this.contacts.push(newContact);
              this.selectUser(newContact);
            });
          }
        } else if (this.contacts.length > 0) {
          this.selectUser(this.contacts[0]);
        }
      });
    },
    getRecentMessagesForUser(userId) {
      getMessages(userId, 0, this.messageLimit).then(response => {
        if (response.data.code === 200) {
          this.$set(this.messages, userId, response.data.data);
          const unreadCount = response.data.data.filter(msg => !msg.isRead && msg.senderId !== this.userId).length;
          this.$set(this.unreadCounts, userId, unreadCount);
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      });
    },
    selectUser(user) {
      this.selectedUser = user;
      refreshUnreadMessage(user.id)
        .then((response) => {
          if (response.data.code == 200) {
            this.$set(this.unreadCounts, user.id, 0);
          }
        });
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    connectToWebSocket() {
      const socket = new SockJS('http://localhost:8888/ws/message');
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => { };
      this.stompClient.connect({}, () => {
        this.stompClient.subscribe('/queue/message/' + this.userId, (message) => {
          const newMessage = JSON.parse(message.body);
          const userId = newMessage.senderId === this.userId ? newMessage.receiverId : newMessage.senderId;
          if (!this.messages[userId]) {
            this.$set(this.messages, userId, []);
          }
          this.$set(this.messages[userId], this.messages[userId].length, newMessage);
          if (!this.contacts.some(contact => contact.id === userId)) {
            this.loadContacts();
          }
          if (!newMessage.isRead && newMessage.senderId !== this.userId) {
            if (newMessage.senderId !== this.selectedUser.id) {
              this.$set(this.unreadCounts, userId, (this.unreadCounts[userId] || 0) + 1);
            } else {
              refreshUnreadMessage(userId);
            }
          }
          this.contacts.find(contact => contact.id == userId).lastContactTime = this.formatLastChatTime(newMessage.createTime)
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        });
      });
    },
    sendMessage() {
      if (this.newMessageContent.trim() === '') {
        return;
      }
      const message = {
        senderId: this.userId,
        receiverId: this.selectedUser.id,
        content: this.newMessageContent,
      };
      sendMessage(message).then(response => {
        if (response.data.code === 200) {
          if (!this.messages[this.selectedUser.id]) {
            this.$set(this.messages, this.selectedUser.id, []);
          }
          this.messages[this.selectedUser.id].push(response.data.data);
          this.contacts.find(contact => contact.id == this.selectedUser.id).lastContactTime = this.formatLastChatTime(response.data.data.createTime)
          this.newMessageContent = '';
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          console.error('Failed to send message');
        }
      });
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
    formatLastChatTime(time) {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const hours = ('0' + date.getHours()).slice(-2);
      const minutes = ('0' + date.getMinutes()).slice(-2);
      const seconds = ('0' + date.getSeconds()).slice(-2);
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    scrollToBottom() {
      const messageList = this.$refs.messageList;
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    },
    handleUserScroll() {
      const userList = this.$refs.userList;
      const bottom = userList.scrollHeight === userList.scrollTop + userList.clientHeight;
      if (bottom && this.contacts.length < this.totalContacts) {
        this.loadContacts();
      }
    },
    handleMessageScroll() {
      const messageList = this.$refs.messageList;
      const currentScrollTop = messageList.scrollTop;
      const currentScrollHeight = messageList.scrollHeight;

      if (messageList.scrollHeight > messageList.clientHeight) {
        if (messageList.scrollTop <= 0) {
          const userId = this.selectedUser.id;
          const currentMessageCount = this.messages[userId].length;

          getMessages(userId, currentMessageCount, this.messageLimit).then(response => {
            if (response.data.code === 200) {
              const olderMessages = response.data.data;

              if (olderMessages.length > 0) {
                this.messages[userId] = [...olderMessages, ...this.messages[userId]];

                this.$nextTick(() => {
                  messageList.scrollTop = messageList.scrollHeight - currentScrollHeight + currentScrollTop;
                });
              } else {
                this.$message.info('没有更多消息了');
              }
            }
          });
        }
      }
    },
    uploadImageHandler(blobInfo, success, failure) {
      const formData = new FormData();
      formData.append("image", blobInfo.blob());

      uploadImg(formData)
        .then((response) => {
          if (response.data.code === 200) {
            success(response.data.data);
          } else {
            failure(response.data.msg);
          }
        })
        .catch(() => {
          failure("上传失败");
        });
    },
    handleImageClick(event) {
      if (event.target.tagName === "IMG") {
        this.showImageModal(event.target.src);
      }
    },
  },
  computed: {
    sortedContacts() {
      return this.contacts.slice().sort((a, b) => {
        if (a.lastContactTime !== b.lastContactTime) {
          return b.lastContactTime.localeCompare(a.lastContactTime); // 确保时间是数字类型
        }
        return b.unreadCount - a.unreadCount;
      });
    },
    filteredMessages() {
      if (this.selectedUser && this.messages[this.selectedUser.id]) {
        return this.messages[this.selectedUser.id].map(message => {
          const modifiedContent = message.content.replace(/<img/g, '<img style="max-width: 10vw; height: auto;"');
          return { ...message, content: modifiedContent };
        });
      }
      return [];
    }
  }
};
</script>

<style lang="less" src="@/assets/css/Message.less" scoped></style>
