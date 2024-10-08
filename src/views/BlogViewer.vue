<template>
  <div class="whole-container">
    <div class="video-background">
      <video autoplay muted loop>
        <source src="@/assets/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <GlobalBanner></GlobalBanner>
    <div class="banner-container" v-if="!loading">
      <h1 class="title">过江风的博客</h1>
      <word-printer></word-printer>
      <div class="floating-icon" @click="scrollToHalfHeight">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-down"></use>
        </svg>
      </div>
    </div>
    <loading v-if="loading"></loading>
    <wave v-if="!loading"></wave>
    <div class="blog-container" v-if="!loading">
      <div class="left-section">
        <div class="author-info">
          <p>MADE BY 过江风</p>
          <img src="@/assets/images/author_avatar.jpg" alt="Author Image" class="author-image" />
        </div>
        <div class="clock-container">
          <clock></clock>
          <div class="real-time">{{ formattedDate }}</div>
        </div>
        <div class="tag-selector">
          <div v-for="(tag) in displayTags" :key="tag.id" class="tag-item"
            :class="{ selected: selectedTags.includes(tag.id) }" @click="toggleTag(tag.id)">
            {{ tag.tagName }}
          </div>
          <button v-if="showExpandButton" @click="toggleTagVisibility" class="expand-button">
            <svg class="icon" aria-hidden="true" v-if="expanded">
              <use xlink:href="#icon-zhankai-copy"></use>
            </svg>
            <svg class="icon" aria-hidden="true" v-if="!expanded">
              <use xlink:href="#icon-zhankai"></use>
            </svg>
          </button>
        </div>
        <div class="blog-search">
          <input type="text" v-model="searchQuery" placeholder="搜索博客..." class="blog-search-input"
            @keyup.enter="searchBlogs" />
          <button @click="searchBlogs" class="search-button">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-sousuo"></use>
            </svg>
          </button>
        </div>
        <div class="music-player">
          <music-player></music-player>
        </div>
      </div>
      <div class="right-section">
        <div class="blog-whole">
          <div v-for="blog in blogs" :key="blog.id" class="blog-item">
            <!-- <div class="blog-title" @click="goToBlogDetail(blog.id)">{{ blog.title }}</div> -->
            <router-link :title="blog.title" class="blog-title" target="_blank"
              :to="{ name: 'BlogDetail', params: { blogId: blog.id } }">{{
                blog.title }}</router-link>
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
                  <use xlink:href="#icon-shoucang"></use>
                </svg>
                {{ blog.collectNum }}
              </span>
              <span>
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-pinglunshu"></use>
                </svg>
                {{ blog.commentNum }}
              </span>
            </div>
            <div class="blog-time"><span>
                {{ blog.createTime }}
              </span></div>
            <div class="blog-tags">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-biaoqian_o"></use>
              </svg>
              <span v-for="(tagName, index) in blog.tagNames" :key="tagName" class="blog-tag"
                :style="{ backgroundColor: getTagColor(tagName) }">
                <span @click.stop="addTag(blog.tags[index])">{{ tagName }}</span>
              </span>
            </div>
            <div class="blog-images">
              <img v-for="(image, index) in blog.images.slice(0, 2)" :key="index" :src="image" alt="Blog Image"
                v-viewer />
            </div>
          </div>
        </div>
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
          :current-page.sync="pageNum" @current-change="fetchBlogs" class="pagination"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getBlogsByPage, getTags } from '@/api/blog';

import GlobalBanner from "../components/GlobalBanner.vue"
import Wave from '../components/Wave.vue'
import WordPrinter from '../components/WordPrinter.vue'
import Clock from '../components/Clock.vue'
import Loading from '../components/Loading.vue'
import MusicPlayer from '../components/MusicPlayer'
import { checkToken } from '@/api/user';

export default {
  name: 'Blog',
  components: {
    GlobalBanner,
    Wave,
    WordPrinter,
    Clock,
    Loading,
    MusicPlayer,
  },
  data() {
    return {
      blogs: [],
      pageNum: 1,
      pageSize: 12,
      total: 0,
      tags: [],
      selectedTags: [],
      tagColorMap: {},
      searchQuery: '',
      expanded: false,
      tagColors: ['#defcf9', '#cadefc', '#ffc7c7', '#ffe2e2', "#abedd8", "#dcedc1"],
      formattedDate: '',
      loading: false,
    };
  },
  computed: {
    displayTags() {
      const selectedTags = this.tags.filter(tag => this.selectedTags.includes(tag.id));
      const unselectedTags = this.tags.filter(tag => !this.selectedTags.includes(tag.id));
      const sortedTags = [...selectedTags, ...unselectedTags];
      return this.expanded ? sortedTags : sortedTags.slice(0, 5);
    },
    showExpandButton() {
      return this.tags.length > 5;
    }
  },
  created() {
    this.checkToken();
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
    this.fetchTags();
    this.fetchBlogs();
    this.loading = true;
  },
  methods: {
    fetchBlogs(pageNum) {
      this.pageNum = pageNum || this.pageNum;
      getBlogsByPage({
        userId: this.userId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        queryText: this.searchQuery,
        queryTags: this.selectedTags,
      }).then(response => {
        if (response.data.code === 200) {
          this.total = response.data.data.total;
          this.blogs = response.data.data.records;
        }
      }).catch(error => {
        console.error('Error fetching blogs:', error);
      }).finally(() => {
        this.loading = false;
      });
    },
    fetchTags() {
      getTags().then(response => {
        if (response.data.code === 200) {
          this.tags = response.data.data;
          this.assignColorsToTags();
        } else {
          this.$message.error(response.data.msg);
        }
      }).catch(error => {
        this.$message.error('获取主题失败:', error);
      });
    },
    toggleTag(tagId) {
      if (this.selectedTags.includes(tagId)) {
        this.selectedTags = this.selectedTags.filter(id => id !== tagId);
      } else {
        this.selectedTags.push(tagId);
      }
      this.pageNum = 1;
      this.fetchBlogs(this.pageNum);
    },
    addTag(tagId) {
      if (!this.selectedTags.includes(tagId)) {
        this.selectedTags.push(tagId);
      }
      this.pageNum = 1;
      this.fetchBlogs(this.pageNum);
    },
    searchBlogs() {
      this.pageNum = 1;
      this.fetchBlogs(this.pageNum);
    },
    toggleTagVisibility() {
      this.expanded = !this.expanded;
    },
    assignColorsToTags() {
      this.tags.forEach(tag => {
        if (!this.tagColorMap[tag.tagName]) {
          this.tagColorMap[tag.tagName] = this.getRandomColor();
        }
      });
    },
    getRandomColor() {
      return this.tagColors[Math.floor(Math.random() * this.tagColors.length)];
    },
    getTagColor(tagName) {
      return this.tagColorMap[tagName] || '#e0e0e0';
    },
    getSimpleText(html) {
      var re1 = new RegExp("<.+?>", "g");
      var msg = html.replace(re1, '');
      return msg;
    },
    goToBlogDetail(blogId) {
      this.$router.push({ name: 'BlogDetail', params: { blogId: toString(blogId) } });
    },
    scrollToHalfHeight() {
      window.scrollTo({
        top: window.innerHeight * 0.8 + 150,
        behavior: 'smooth'
      });
    },
    updateTime() {
      const now = new Date();
      this.formattedDate = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
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
  },
  destroyed() {
    clearInterval(this.timeInterval);
  },
};
</script>

<style lang="less" src="@/assets/css/BlogViewer.less" scoped></style>
