<template>
  <div @scroll="handleScroll">
    <div class="video-background">
      <video autoplay muted loop>
        <source src="@/assets/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <GlobalBanner></GlobalBanner>
    <div class="blog-detail-container">
      <div class="blog-button-container">
        <button class="back-button" @click="goBack">关闭</button>
      </div>
      <div class="blog-detail-content">
        <h1 class="blog-title">{{ blog.title }}</h1>
        <div class="blog-meta">
          <span @click="goToPersonalPage(blog.userId)" class="jump-to-personal">
            <img :src="blog.avatar" alt="Author Avatar" class="author-avatar" />{{ blog.username }}
          </span>
          <span>
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-liulanshu"></use>
            </svg>
            {{ blog.browseNum }}
          </span>
          <span :class="{ liked: blog.liked }" @click="likeBlog" title="点赞">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-dianzanshu" v-if="!blog.liked"></use>
              <use xlink:href="#icon-dianzanshu-pink-copy" v-if="blog.liked"></use>
            </svg>
            {{ blog.likeNum }}
          </span>
          <span :class="{ collected: blog.collected }" @click="collectBlog" title="收藏">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-shoucang" v-if="!blog.collected"></use>
              <use xlink:href="#icon-shoucang-copy" v-if="blog.collected"></use>
            </svg>
            {{ blog.collectNum }}
          </span>
        </div>
        <div class="blog-tags">
          <svg class="icon" aria-hidden="true" style="margin-right: 10px">
            <use xlink:href="#icon-biaoqian_o"></use>
          </svg>
          <span v-for="tag in blog.tagNames" :key="tag" class="blog-tag">
            {{ tag }}
          </span>
        </div>
        <div class="blog-content" v-html="blog.content" @click="handleImageClick" v-viewer></div>
      </div>

      <!-- 评论区 -->
      <div class="comment-section">
        <h3>
          发表评论
          <div class="editor-trigger" @click="toggleCommentSection" v-if="!isCommentSectionVisible">展开
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-down"></use>
            </svg>
          </div>
          <div class="editor-trigger" @click="toggleCommentSection" v-if="isCommentSectionVisible">收起
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-up-copy"></use>
            </svg>
          </div>
        </h3>
        <div v-if="isLoggedIn && isCommentSectionVisible">
          <Editor :init="init" v-model="newComment"></Editor>
          <button @click="submitComment" class="submit-button">发表评论</button>
        </div>
        <div v-if="!isLoggedIn">
          <p class="login-prompt">请先<a @click="goToLogin">登录</a>后发表评论。</p>
        </div>
        <!-- 显示评论列表 -->
        <div class="comments-display">
          <h3>查看评论<span style="color: #737373;font-size: 0.7em;margin-left: 10px;">共 {{ total }} 条</span></h3>
          <ul v-if="comments.length > 0">
            <li v-for="(comment, index) in comments" :key="comment.id" class="comment-item">
              <img :src="comment.avatar" alt="Comment Avatar" class="comment-avatar" />
              <div class="comment-content">
                <p><strong v-if="comment.username" @click="goToPersonalPage(comment.userId)" class="jump-to-personal">{{
                  comment.username }}</strong>
                  <strong v-else>用户已注销</strong>
                </p>
                <p v-html="comment.content" @click="handleImageClick" v-viewer></p>
                <div class="comment-meta">
                  <p class="comment-time">{{ formatTime(comment.createTime) }}</p>
                  <div class="comment-like-num" @click="likeComment(comment.id, index)"
                    :title="comment.liked ? '取消点赞' : '点赞'">
                    <svg class="icon" aria-hidden="true" v-if="!comment.liked">
                      <use xlink:href="#icon-dianzanshu"></use>
                    </svg>
                    <p v-if="!comment.liked">{{ comment.likeNum }}</p>
                    <svg class="icon" aria-hidden="true" v-if="comment.liked">
                      <use xlink:href="#icon-dianzanshu-pink-copy"></use>
                    </svg>
                    <p style="color: rgb(255, 125, 147);" v-if="comment.liked">{{ comment.likeNum }}
                    </p>
                  </div>
                  <p v-if="comment.username" class="comment-reply-num" @click="toggleReplyInput(comment.id)">回复</p>
                </div>
                <!-- Displaying Replies -->
                <ul v-if="comment.replies && comment.replies.length > 0" class="replies">
                  <li v-for="(reply, replyIndex) in visibleReplies(comment.id, comment.replies)" :key="reply.id">
                    <p v-if="reply.parentId === 0">
                      <span class="username">{{ reply.username }}:</span>
                      <span class="reply-content">{{ reply.content }}</span>
                    </p>
                    <p v-else>
                      <span class="username"><span @click="goToPersonalPage(reply.userId)" class="jump-to-personal">{{
                        reply.username }}</span>
                        回复 <span @click="goToPersonalPage(reply.repliedUserId)" class="jump-to-personal">{{
                          reply.repliedUsername }}</span>:</span>
                      <span class="reply-content">{{ reply.content }}</span>
                    </p>
                    <div class="reply-meta">
                      <p>{{ formatTime(reply.createTime) }}</p>
                      <div class="reply-like-num" @click="likeReply(reply.id, index, replyIndex)"
                        :title="reply.liked ? '取消点赞' : '点赞'">
                        <svg class="icon" aria-hidden="true" v-if="!reply.liked">
                          <use xlink:href="#icon-dianzanshu"></use>
                        </svg>
                        <p v-if="!reply.liked">{{ reply.likeNum }}</p>
                        <svg class="icon" aria-hidden="true" v-if="reply.liked">
                          <use xlink:href="#icon-dianzanshu-pink-copy"></use>
                        </svg>
                        <p style="color: rgb(255, 125, 147);" v-if="reply.liked">{{ reply.likeNum }}
                        </p>
                      </div>
                      <p class="reply-reply-num" @click="toggleReplyInput(comment.id, reply.id, reply.username)">回复</p>
                    </div>
                  </li>
                  <p v-if="comment.replies.length > 2 && !isExpanded[comment.id]" style="font-size: 0.8em;color: #666;">
                    <span>共{{ comment.replies.length }}条回复，</span><span class="view-more"
                      @click="toggleExpand(comment.id)">点击查看</span>
                  </p>
                  <p v-if="comment.replies.length > 2 && isExpanded[comment.id]" class="view-more-back"
                    @click="toggleExpand(comment.id)">
                    收起
                  </p>
                </ul>
                <div v-if="isReplyInputVisible[comment.id]" class="reply-input-container">
                  <textarea v-model="replyContent[comment.id]" :placeholder="replyPlaceholder"
                    class="reply-input"></textarea>
                  <button @click="submitReply(comment.id, parentIdOfCurrentReply)"
                    class="submit-reply-button">回复</button>
                </div>
              </div>
            </li>
            <p v-if="isBottomReached" class="bottom-reached">已经到底啦~</p>
          </ul>
          <p v-else>暂无评论</p>
        </div>
      </div>
    </div>
    <scroll-to-top></scroll-to-top>
  </div>
</template>

<script>
import "quill/dist/quill.core.css";
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/silver/theme";
import "tinymce/icons/default/icons";
import "tinymce/plugins/image";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/link";
import "tinymce/plugins/code";
import "tinymce/plugins/lists";
import "tinymce/plugins/contextmenu";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/colorpicker";
import "tinymce/plugins/textcolor";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/charmap";
import "tinymce/plugins/print";
import "tinymce/plugins/preview";
import "tinymce/plugins/hr";
import "tinymce/plugins/imagetools";
import "tinymce/plugins/noneditable";
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullpage";
import "tinymce/plugins/importcss";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/tabfocus";
import "tinymce/plugins/template";
import "tinymce/plugins/textpattern";
import "tinymce/plugins/toc";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce-plugin/plugins/tpImportword";
import "tinymce-plugin/plugins/imagetools";

import ScrollToTop from '../components/ScrollToTop.vue';
import { collectBlog, getBlogById, likeBlog } from "@/api/blog";
import { createComment, getCommentsByPage, likeComment } from "@/api/comment";
import { createReply, likeReply } from "@/api/reply";
import { uploadImg } from "@/api/common";
import { checkToken } from "@/api/user";


export default {
  components: {
    Editor,
    ScrollToTop,
  },
  props: {
    blogId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      blog: {},
      // liked: false,
      newComment: "",
      comments: [],
      isLoggedIn: !!localStorage.getItem("token"), // 判断是否登录
      isCommentSectionVisible: false,
      isExpanded: {},
      isReplyInputVisible: {},
      replyContent: {},
      parentIdOfCurrentReply: 0, // 当前回复的父级回复 ID
      replyPlaceholder: "", // 回复输入框的提示文本
      authorHeadImg: "",
      pageNum: 1,
      pageSize: 5,
      total: 0,
      isBottomReached: false,
      isLoading: false,
      token: null,
      init: {
        // placeholder: "在这里输入文字",
        language_url: "/js/editor//tinymce/langs/zh_CN.js", // 汉化路径
        language: "zh_CN",
        skin_url: "/js/editor//tinymce/skins/ui/oxide",
        height: 600, // 编辑器高度，可以考虑获取窗口高度，以适配不同设备屏幕
        end_container_on_empty_block: true,
        powerpaste_word_import: "clean",
        advlist_bullet_styles: "square",
        advlist_number_styles: "default",
        imagetools_cors_hosts: ["www.tinymce.com", "codepen.io"],
        default_link_target: "_blank",
        link_title: false,
        media_live_embeds: true,
        content_style: "img {max-width:100%;} html{background-color: #fff;}", // 直接自定义可编辑区域的css样式
        images_upload_url: "http://localhost:8888/upload",
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        // plugins: this.plugins,
        // toolbar: this.toolbar,
        // @ts-nocheckplugins: 'link lists image code table colorpicker textcolor wordcount contextmenu',
        external_plugins: {
          tpImportword: "/js/editor//tinymce/plugins/tpImportword/plugin.min.js",
          emoticons: '/js/editor/tinymce/plugins/emoticons/plugin.min.js',
          //  wordpaster: "../public/js/editor//tinymce/plugins/wordpaster"
        },
        plugins:
          "advlist anchor autolink autosave code codesample directionality toc  fullscreen hr image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak preview print save searchreplace tabfocus table template textpattern visualblocks visualchars wordcount wordpaster tpImportword",
        toolbar: [
          "searchreplace bold italic underline strikethrough fontselect fontsizeselect  alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample",
          "hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen tpImportword",
        ],
        fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt", // 第二步
        font_formats:
          "微软雅黑='微软雅黑';宋体='宋体';黑体='黑体';仿宋='仿宋';楷体='楷体';隶书='隶书';幼圆='幼圆';Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings",
        branding: false,
        elementpath: false, //隐藏底栏的元素路径
        // inline: true, //开启内联模式
        // icons: 'custom',
        menubar: true,

        file_picker_types: "media",
        content_css: "/js/editor//tinymce/skins/content/document/content.css",
        images_upload_handler: this.uploadImageHandler,
      },
    };
  },
  created() {
    this.fetchBlogDetail();
    window.addEventListener("scroll", this.handleScroll);
    tinymce.init({});
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    fetchBlogDetail() {
      getBlogById(this.blogId)
        .then((response) => {
          if (response.data.code === 200) {
            this.blog = response.data.data;
            this.fetchComments();
          }
        })
        .catch((error) => {
          console.error("Error fetching blog detail:", error);
        });
    },
    likeBlog() {
      likeBlog(this.blog.id)
        .then((response) => {
          if (response.data.code === 200) {
            this.blog = response.data.data;
          }
        })
        .catch((error) => {
          console.error("点赞失败:", error);
        });
    },
    collectBlog() {
      collectBlog(this.blog.id)
        .then((response) => {
          if (response.data.code === 200) {
            this.blog = response.data.data;
          }
        })
        .catch((error) => {
          console.error("收藏失败:", error);
        });
    },
    likeComment(commentId, index) {
      if (!this.isLoggedIn) {
        this.$message.error("请先登录");
        return;
      }
      likeComment(commentId)
        .then((response) => {
          if (response.data.code === 200) {
            this.$set(this.comments[index], 'likeNum', response.data.data.likeNum)
            this.$set(this.comments[index], 'replyNum', response.data.data.replyNum)
            this.$set(this.comments[index], 'replies', response.data.data.replies)
            this.$set(this.comments[index], 'liked', response.data.data.liked)
          }
        })
        .catch((error) => {
          console.error("点赞失败:", error);
        });
    },
    likeReply(replyId, index, replyIndex) {
      if (!this.isLoggedIn) {
        this.$message.error("请先登录");
        return;
      }
      likeReply(replyId)
        .then((response) => {
          if (response.data.code === 200) {
            this.$set(this.comments[index].replies, replyIndex, response.data.data);
          }
        })
        .catch((error) => {
          console.error("点赞失败:", error);
        });
    },
    goBack() {
      window.open("about:blank", "_top").close();
    },
    handleImageClick(event) {
      if (event.target.tagName === "IMG") {
        this.showImageModal(event.target.src);
      }
    },
    showImageModal(src) {
      this.modalImageSrc = src;
      this.isImageModalVisible = true;
    },
    closeImageModal() {
      this.isImageModalVisible = false;
      this.modalImageSrc = "";
    },
    checkToken() {
      this.token = this.getToken();
      if (this.token) {
        checkToken()
          .then(response => {
            if (!response.data.data) {
              this.token = null;
              localStorage.removeItem('token');
              location.reload()
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    getToken() {
      return localStorage.getItem('token');
    },
    submitComment() {
      this.checkToken()

      if (this.newComment.trim() === "") {
        this.$message.error("评论内容不能为空");
        return;
      }

      createComment({
        blogId: this.blog.id,
        content: this.newComment,
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.$message.success("评论提交成功");
            this.pageNum = 1
            this.comments.unshift(response.data.data)
            this.newComment = "";
            tinymce.activeEditor.setContent('');
          }else{
            this.$message.error(response.data.msg)
          }
        })
        .catch((error) => {
          console.error("评论提交失败:", error);
          this.$message.error("评论提交失败");
        });
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
    fetchComments() {
      this.isLoading = true;
      getCommentsByPage({
        blogId: this.blog.id,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
      })
        .then((response) => {
          if (response.data.code === 200) {
            const newComments = response.data.data.records;
            this.comments = [...this.comments, ...newComments];
            this.total = response.data.data.total;
            this.isLoading = false;
          } else {
            this.$message.error(response.data.msg || "获取评论失败");
          }
        })
        .catch((error) => {
          this.$message.error("获取评论失败");
          console.error("获取评论失败:", error);
        });
    },
    toggleCommentSection() {
      this.isCommentSectionVisible = !this.isCommentSectionVisible;
    },
    goToLogin() {
      this.$router.push("/login");
    },
    formatTime(createTime) {
      const now = new Date();
      const commentTime = new Date(createTime);
      const diffInSeconds = Math.floor((now - commentTime) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);

      if (diffInSeconds < 60) {
        return `${diffInSeconds}秒前`;
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`;
      } else if (diffInHours < 24) {
        return `${diffInHours}小时前`;
      } else {
        return createTime; // 直接显示完整时间
      }
    },
    visibleReplies(commentId, replies) {
      return replies.slice(0, this.isExpanded[commentId] ? replies.length : 2);
    },
    toggleExpand(commentId) {
      this.$set(this.isExpanded, commentId, !this.isExpanded[commentId]);
    },
    toggleReplyInput(commentId, replyId = 0, replyUserName = '') {
      if (!this.isLoggedIn) {
        this.$message.error("请先登录");
        return;
      }

      if (this.isReplyInputVisible[commentId] && this.parentIdOfCurrentReply === replyId) {
        this.$set(this.isReplyInputVisible, commentId, false);
        this.parentIdOfCurrentReply = 0;
        this.replyPlaceholder = "";
      } else {
        this.$set(this.isReplyInputVisible, commentId, true);
        this.parentIdOfCurrentReply = replyId;
        this.replyPlaceholder = replyId === 0
          ? `回复 ${this.comments.find(c => c.id === commentId).username}`
          : `回复 ${replyUserName}`;
        this.replyContent[commentId] = ''

        Object.keys(this.isReplyInputVisible).forEach(id => {
          if (parseInt(id) !== commentId) {
            this.$set(this.isReplyInputVisible, id, false);
          }
        });
      }
    },
    submitReply(commentId, parentId) {
      const content = this.replyContent[commentId]?.trim(); // 获取回复内容并去除首尾空格

      if (!content) {
        this.$message.error("回复内容不能为空");
        return;
      }

      createReply({
        parentId: parentId,
        commentId: commentId,
        content: content,
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.$message.success("回复提交成功");
            this.updateComments(response.data.data);
            this.replyContent[commentId] = "";
            this.isReplyInputVisible[commentId] = false;
            this.parentIdOfCurrentReply = 0;
          } else {
            this.$message.error(response.data.msg || "回复提交失败");
          }
        })
        .catch(() => {
          this.$message.error("回复提交失败");
        });
    },
    updateComments(newReply) {
      const commentIndex = this.comments.findIndex(c => c.id === newReply.commentId);
      if (commentIndex !== -1) {
        this.comments[commentIndex].replies = [newReply, ...this.comments[commentIndex].replies];
      }
    },
    goToPersonalPage(userId) {
      const routeUrl = this.$router.resolve('/user/' + userId)
      window.open(routeUrl.href, '_blank')
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
        this.loadMoreComments();
      }
    },
    loadMoreComments() {
      if (this.pageNum * this.pageSize < this.total) {
        this.pageNum += 1;
        this.fetchComments();
      } else if (!this.isBottomReached) {
        this.isBottomReached = true;
      }
    },
  },
};
</script>

<style lang="less" src="@/assets/css/BlogDetail.less" scoped></style>
