<template>
  <div>
    <div class="video-background">
      <video autoplay muted loop>
        <source src="@/assets/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <GlobalBanner></GlobalBanner>
    <div class="write-blog-container">
      <h1>写博客</h1>
      <form @submit.prevent="submitBlog">
        <div class="form-group">
          <label for="title">标题</label>
          <input type="text" id="title" v-model="title" @blur="validateTitle" />
          <span v-if="titleError" class="error-message">{{ titleError }}</span>
        </div>
        <div class="form-group">
          <label for="tags">选择标签</label>
          <div class="tag-selector">
            <div v-for="tag in tags" :key="tag.id" class="tag-item" :class="{ selected: selectedTags.includes(tag.id) }"
              @click="toggleTag(tag.id)">
              {{ tag.tagName }}
            </div>
          </div>
          <button type="button" @click="clearSelectedTags" class="clear-button">清除所有</button>
        </div>
        <div class="form-group">
          <label for="content">内容</label>
          <Editor :init="init" v-model="content"></Editor>
          <span v-if="contentError" class="error-message">{{ contentError }}</span>
        </div>
        <button type="submit">提交</button>
      </form>
    </div>
  </div>
</template>

<script>
// import { fileUpload } from '@/api/cms'
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import { Loading } from 'element-ui';

import "tinymce/plugins/emoticons/plugin.js";

import { createOrUpdateBlog, getBlogById, getTags } from "@/api/blog";
import { uploadImg } from "@/api/common";


export default {
  components: {
    Editor,
  },
  props: {
    blogId: {
      required: false,
    },
  },
  data() {
    return {
      title: "",
      content: "",
      userId: "",
      quill: null,
      titleError: "",
      contentError: "",
      tags: [], // 存放主题数据
      selectedTags: [], // 用户选中的主题
      init: {
        // placeholder: "在这里输入文字",
        language_url: "/js/editor/tinymce/langs/zh_CN.js", // 汉化路径
        language: "zh_CN",
        skin_url: "/js/editor/tinymce/skins/ui/oxide",
        height: 600, // 编辑器高度，可以考虑获取窗口高度，以适配不同设备屏幕
        end_container_on_empty_block: true,
        advlist_bullet_styles: "square",
        advlist_number_styles: "default",
        imagetools_cors_hosts: ["www.tinymce.com", "codepen.io"],
        default_link_target: "_blank",
        link_title: false,
        media_live_embeds: true,
        powerpaste_word_import: "propmt",
        powerpaste_html_import: 'propmt',// propmt, merge, clear
        paste_data_images: false,
        // powerpaste_allow_local_images: true,
        content_style: "img {max-width:100%;height:auto;} html{background-color: #fff;}", // 直接自定义可编辑区域的css样式
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        // plugins: this.plugins,
        // toolbar: this.toolbar,
        // @ts-nocheckplugins: 'link lists image code table colorpicker textcolor wordcount contextmenu',
        external_plugins: {
          emoticons: '/js/editor/tinymce/plugins/emoticons/plugin.min.js'
        },
        plugins:
          "emoticons",
        toolbar: [
          "emoticons",
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
        content_css: "/js/editor/tinymce/skins/content/document/content.css",
        images_upload_handler: this.uploadImageHandler,
        setup: (editor) => {
          editor.on('paste', (event) => {
            if (event.clipboardData) {
              this.handlePaste(event);
            }
          });
        },
      },
    };
  },
  mounted() {
    this.fetchTags();
    tinymce.init({});

    if (this.blogId) {
      getBlogById(this.blogId).then((response) => {
        this.title = response.data.data.title;
        this.content = response.data.data.content;
        this.selectedTags = response.data.data.tags;
        this.userId = response.data.data.userId;
      });
    }
  },
  methods: {
    validateTitle() {
      if (!this.title.trim()) {
        this.titleError = "标题不能为空";
      } else if (this.title.length < 5 || this.title.length > 100) {
        this.titleError = "标题长度应在 5 到 100 个字符之间";
      } else {
        this.titleError = "";
      }
    },
    validateContent() {
      const theEditor = tinymce.activeEditor;
      const wordCount = theEditor.plugins.wordcount.getCount();
      console.log(wordCount);
      if (wordCount === 0) {
        this.contentError = "内容不能为空";
      } else if (wordCount < 5) {
        this.contentError = "内容长度应不少于 5 个字符";
      } else {
        this.contentError = "";
      }
    },
    fetchTags() {
      getTags().then((response) => {
        if (response.data.code == 200) {
          this.tags = response.data.data;
        } else {
          this.$message.error(response.data.msg);
        }
      })
        .catch((error) => {
          this.$message.error("获取主题失败:", error);
        });
    },
    toggleTag(tagId) {
      if (this.selectedTags.includes(tagId)) {
        this.selectedTags = this.selectedTags.filter((id) => id !== tagId);
      } else {
        this.selectedTags.push(tagId);
      }
    },
    clearSelectedTags() {
      this.selectedTags = [];
    },
    submitBlog() {
      this.validateTitle();
      this.validateContent();

      if (!this.titleError && !this.contentError) {
        createOrUpdateBlog({
          blogId: this.blogId,
          userId: this.userId,
          title: this.title,
          content: this.content,
          tags: this.selectedTags,
          status: 0,
        }).then((response) => {
          if (response.data.code == 200) {
            this.$message.success("提交成功");
            this.clearForm();
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch((error) => {
          this.$message.error("提交失败:", error);
        });
      }
    },
    uploadImageHandler(blobInfo, success, failure) {
      const formData = new FormData();
      formData.append("image", new File([blobInfo.blob()], Date.now() + '.jpg', { type: 'image/jpg' }));

      const loadingInstance = Loading.service({
        lock: true,
        text: '上传中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

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
        }).finally(() => {
          loadingInstance.close();
        });
    },
    clearForm() {
      this.title = ""; // 清空标题
      this.selectedTags = []; // 清空标签
      this.content = ""; // 清空内容
      tinymce.activeEditor.setContent('');
    },
    handlePaste(event) {
      event.preventDefault();

      const clipboardData = event.clipboardData || window.clipboardData;
      const html = clipboardData.getData('text/html');
      const text = clipboardData.getData('text/plain');

      if (html) {
        this.handleHTMLPaste(html);
      } else if (text) {
        tinymce.activeEditor.execCommand('mceInsertContent', false, text);
      } else {
        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          console.log(item)
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const formData = new FormData();
              formData.append('image', file);
              uploadImg(formData).then(response => {
                if (response.data.code === 200) {
                  const imageUrl = response.data.data;
                  tinymce.activeEditor.execCommand('mceInsertContent', false, `<img src="${imageUrl}">`);
                } else {
                  this.$message.error(response.data.msg);
                }
              }).catch(() => {
                this.$message.error('上传失败');
              });
            }
          }
        }
      }
    },
    handleHTMLPaste(htmlContent) {
      tinymce.activeEditor.execCommand('mceInsertContent', false, htmlContent);
    },
  },
};
</script>

<style lang="less" src="@/assets/css/BlogEditor.less" scoped></style>
