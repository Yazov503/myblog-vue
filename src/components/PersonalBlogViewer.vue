<template>
  <div class="blog-container">
    <div class="left-section">
      <div class="blog-whole">
        <div v-if="blogs.length === 0" class="no-blogs">
          <p>暂无博客</p>
        </div>
        <div v-else>
          <div v-for="blog in blogs" :key="blog.id" class="blog-item">
            <div class="blog-header">
              <router-link class="blog-title" target="_blank" :to="{ name: 'BlogDetail', params: { blogId: blog.id } }">
                {{ blog.title }}
              </router-link>
              <div v-if="isSelf && blog.status === 0" class="status-message">
                <el-tag type="warning">正在审核</el-tag>
              </div>
              <div v-if="isSelf && blog.status === 2" class="status-message">
                <el-tag type="danger">审核未通过</el-tag>
              </div>
              <div class="blog-menu" v-if="isSelf">
                <el-popconfirm title="确认要修改这篇博客吗？" confirm-button-text="修改" cancel-button-text="取消"
                  @confirm="updateBlog(blog.id)" class="blog-menu-item">
                  <el-button slot="reference">
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-xiugai"></use>
                    </svg>
                  </el-button>
                </el-popconfirm>
                <el-popconfirm title="确认要删除这篇博客吗？" confirm-button-text="删除" cancel-button-text="取消"
                  @confirm="deleteBlog(blog.id)" class="blog-menu-item">
                  <el-button slot="reference">
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-shanchu"></use>
                    </svg>
                  </el-button>
                </el-popconfirm>
              </div>
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
              <span v-for="(tagName, index) in blog.tagNames" :key="tagName" class="blog-tag"
                :style="{ backgroundColor: getTagColor(tagName) }">
                <span @click.stop="addTag(blog.tags[index])">{{ tagName }}</span>
              </span>
            </div>
            <div class="blog-images">
              <img v-for="(image, index) in blog.images.slice(0, 3)" :key="index" :src="image" alt="Blog Image"
                v-viewer />
            </div>
          </div>
        </div>
      </div>

      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :current-page.sync="pageNum" @current-change="fetchBlogs" class="pagination"></el-pagination>
    </div>

    <div class="right-section">
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
    </div>
  </div>
</template>

<script>
import { deleteBlog, getBlogsByPage, getTags } from '@/api/blog';

export default {
  props: {
    userId: String,
    isSelf: Boolean,
  },
  data() {
    return {
      blogs: [],
      pageNum: 1,
      pageSize: 5,
      total: 0,
      tags: [],
      selectedTags: [],
      tagColorMap: {},
      searchQuery: '',
      expanded: false,
      tagColors: ['#defcf9', '#cadefc', '#ffc7c7', '#ffe2e2', "#abedd8", "#dcedc1"],
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
    this.fetchTags()
    this.fetchBlogs()
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
      }).then((response) => {
        if (response.data.code == 200) {
          this.total = response.data.data.total
          this.blogs = response.data.data.records
          this.$emit('updateTotal', this.total);
        }
      })
        .catch((error) => {
          this.$message.error("获取个人博客失败", error);
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
    toggleTagVisibility() {
      this.expanded = !this.expanded;
    },
    getSimpleText(html) {
      var re1 = new RegExp("<.+?>", "g");
      var msg = html.replace(re1, '');
      return msg;
    },
    searchBlogs() {
      this.pageNum = 1;
      this.fetchBlogs(this.pageNum);
    },
    deleteBlog(blogId) {
      deleteBlog(blogId).then((response) => {
        if (response.data.code === 200) {
          this.$message.success("博客删除成功");
          this.blogs = this.blogs.filter(blog => blog.id !== blogId);
          this.fetchBlogs(this.pageNum);
        } else {
          this.$message.error(response.data.msg || "删除博客失败");
        }
      }).catch((error) => {
        this.$message.error("删除博客时出错");
        console.error(error);
      });
    },
    updateBlog(blogId) {
      this.$router.push(`/blog/edit/${blogId}`);
    }
  }
};
</script>

<style lang="less" src="@/assets/css/PersonalBlogViewer.less" scoped></style>
