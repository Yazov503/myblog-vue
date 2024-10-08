<template>
  <div class="follow-container" @scroll="handleScroll">
    <loading v-if="loading"></loading>
    <div v-else>
      <div class="follow-selector">
        <!-- <div class="follow-header">
          <span class="follow-title">关注</span>
          <span class="follow-count">{{ followers.length }}</span>
        </div> -->
        <div class="follow-prev">
          <svg class="icon" aria-hidden="true" @click="moveFollowList(false)"
          v-if="currentLength > 0">
            <use xlink:href="#icon-zhankai-copy"></use>
          </svg>
        </div>
        <div class="follow-window">
          <div class="follow-list" :style="{ transform: `translateX(${translateX}%)` }">
            <div class="follow-item">
              <div @click="fetchFollowerBlogs(null, false)">
                <svg class="icon follow-avatar" aria-hidden="true" style="height: 36px;">
                  <use xlink:href="#icon-quanbudongtai"></use>
                </svg>
              </div>
              <div class="follow-username">全部动态</div>
            </div>
            <div class="follow-item" v-for="follower in followers" :key="follower.id"
              @click="fetchFollowerBlogs(follower.id, false)">
              <img :src="follower.avatar" class="follow-avatar">
              <div class="follow-username">{{ follower.username }}</div>
            </div>
          </div>
        </div>
        <div class="follow-next">
          <svg class="icon" aria-hidden="true" @click="moveFollowList(true)"
            v-if="followers.length + 1 - currentLength > windowLength">
            <use xlink:href="#icon-zhankai"></use>
          </svg>
        </div>
      </div>
      <div class="blog-container">
        <div class="blog-whole">
          <div v-if="blogs.length === 0" class="no-blogs">
            <p>暂无博客</p>
          </div>
          <div v-else>
            <div v-for="blog in blogs" :key="blog.id" class="blog-item">
              <div class="blog-header">
                <router-link class="blog-title" target="_blank"
                  :to="{ name: 'BlogDetail', params: { blogId: blog.id } }">
                  {{ blog.title }}
                </router-link>
              </div>
              <div v-html="getSimpleText(blog.content)" class="blog-content"></div>
              <div class="blog-meta">
                <span>
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-liulanshu"></use>
                  </svg>
                  {{ blog.browseNum }}
                </span>
                <span>
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-dianzanshu"></use>
                  </svg>
                  {{ blog.likeNum }}
                </span>
                <span>
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-pinglunshu"></use>
                  </svg>
                  {{ blog.commentNum }}
                </span>
              </div>
              <div class="blog-time"><span>{{ blog.createTime }}</span></div>
              <div class="blog-tags">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-biaoqian_o"></use>
                </svg>
                <span v-for="(tagName) in blog.tagNames" :key="tagName" class="blog-tag">
                  <span>{{ tagName }}</span>
                </span>
              </div>
              <div class="blog-images">
                <img v-for="(image, index) in blog.images.slice(0, 3)" :key="index" :src="image" alt="Blog Image"
                  v-viewer />
              </div>
            </div>
            <p v-if="isBottomReached" class="bottom-reached">已经到底啦~</p>
          </div>
        </div>
      </div>
      <!-- <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
      :current-page.sync="pageNum" @current-change="fetchFollowerBlogs(selectedFollowId)" class="pagination"></el-pagination> -->
    </div>
  </div>
</template>

<script>
import { getFollowers } from '@/api/user';
import Loading from './Loading.vue'
import { getFollowerBlogs } from '@/api/blog';

export default {
  components: {
    Loading,
  },
  props: {
    userId: String,
  },
  data() {
    return {
      followers: [],
      blogs: [],
      pageNum: 1,
      pageSize: 5,
      total: 0,
      loading: false,
      blogLoading: false,
      tagColorMap: {},
      selectedFollowId: null,
      tagColors: ['#defcf9', '#cadefc', '#ffc7c7', '#ffe2e2', "#abedd8", "#dcedc1"],
      isBottomReached: false,
      translateX: 0,
      windowLength: 4,
      currentLength: 0,
    };
  },
  created() {
    this.loading = true
    this.fetchFollowers()
    this.fetchFollowerBlogs()
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    fetchFollowers() {
      getFollowers()
        .then((response) => {
          if (response.data.code == 200) {
            this.followers = response.data.data
          } else {
            this.$message.error(response.data.msg)
          }
        })
    },
    fetchFollowerBlogs(followId, loadingMore) {
      this.blogLoading = true
      if (!loadingMore) {
        this.blogs = []
        this.pageNum = 1
        this.selectedFollowId = followId
      }
      getFollowerBlogs({
        followId: followId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
      })
        .then((response) => {
          if (response.data.code == 200) {
            const newBlogs = response.data.data.records
            this.blogs = [...this.blogs, ...newBlogs]
            this.total = response.data.data.total
            this.blogLoading = false
          } else {
            this.$message.error(response.data.msg)
          }
        }).finally(() => {
          this.loading = false
        })
    },
    getSimpleText(html) {
      var re1 = new RegExp("<.+?>", "g");
      var msg = html.replace(re1, '');
      return msg;
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

      if (scrollTop + clientHeight >= scrollHeight - 20 && !this.blogLoading) {
        this.loadMoreBlogs();
      }
    },
    loadMoreBlogs() {
      if (this.pageNum * this.pageSize < this.total) {
        this.pageNum += 1;
        this.fetchFollowerBlogs(this.selectedFollowId, true);
      } else if (!this.isBottomReached) {
        this.isBottomReached = true;
      }
    },
    moveFollowList(next) {
      if (next) {
        this.translateX -= 100;
        this.currentLength += this.windowLength
      } else {
        this.translateX += 100
        this.currentLength -= this.windowLength
      }
    },
  },
}
</script>

<style lang="less" src="@/assets/css/MyFollow.less" scoped></style>
