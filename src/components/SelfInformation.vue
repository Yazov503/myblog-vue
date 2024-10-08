<template>
  <div class="info-container">
    <div class="left-section">
      <el-menu :default-active="selectedOption" class="el-menu-vertical" @select="handleMenuSelect">
        <el-menu-item index="1">个人信息</el-menu-item>
        <el-menu-item index="2">邮箱换绑</el-menu-item>
        <el-submenu index="3">
          <template slot="title">修改密码</template>
          <el-menu-item index="3-1">旧密码修改</el-menu-item>
          <el-menu-item index="3-2">验证码修改</el-menu-item>
        </el-submenu>
        <el-menu-item index="4">注销账号</el-menu-item>
      </el-menu>
    </div>
    <div class="right-section">
      <!-- 个人信息表单 -->
      <div v-if="selectedOption == '1'" class="info-section">
        <el-form :model="localUserinfo" label-width="120px">
          <el-form-item label="头像">
            <el-upload class="avatar-uploader" action="" :auto-upload="false" :headers="getheaders()"
              :show-file-list="false" :before-upload="beforeAvatarUpload" :on-change="handleFileChange">
              <img v-if="localUserinfo.avatar" :src="localUserinfo.avatar" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="localUserinfo.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="localUserinfo.email" disabled></el-input>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="localUserinfo.sex">
              <el-radio :label="0">男</el-radio>
              <el-radio :label="1">女</el-radio>
              <el-radio :label="2">未知</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="生日">
            <el-date-picker v-model="localUserinfo.birthday" type="date" placeholder="选择生日"></el-date-picker>
          </el-form-item>
          <el-form-item label="自我介绍">
            <el-input type="textarea" v-model="localUserinfo.introduce"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveInfo">保存</el-button>
            <el-button @click="resetInfo">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 邮箱换绑表单 -->
      <div v-if="selectedOption == '2'" class="info-section">
        <el-form :model="emailForm" label-width="120px">
          <el-form-item label="当前邮箱" class="current-email">
            <el-input v-model="emailForm.currentEmail" disabled></el-input>
          </el-form-item>
          <el-form-item label="新邮箱" class="new-email">
            <el-input v-model="emailForm.newEmail" placeholder="请输入新的邮箱"></el-input>
          </el-form-item>
          <el-form-item label="验证码" class="verification-code">
            <el-input v-model="emailForm.verificationCode" placeholder="请输入验证码">
              <template slot="append">
                <el-button :disabled="isSendingCode" @click="sendVerificationCode">
                  {{ isSendingCode ? `${countdown}s 后重新发送` : '发送验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="bindNewEmail">确认换绑</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 修改密码表单 -->
      <div v-if="selectedOption.startsWith('3-')" class="info-section">
        <!-- 旧密码修改表单 -->
        <el-form :model="passwordForm" label-width="120px" class="password-form" v-if="selectedOption == '3-1'">
          <el-form-item label="旧密码">
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码"></el-input>
          </el-form-item>
          <el-form-item label="确认旧密码">
            <el-input v-model="passwordForm.confirmOldPassword" type="password" placeholder="再次输入旧密码"></el-input>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePassword">确认修改</el-button>
          </el-form-item>
        </el-form>

        <!-- 验证码修改表单 -->
        <el-form :model="codeForm" label-width="120px" class="code-form" v-if="selectedOption == '3-2'">
          <el-form-item label="绑定邮箱" style="width: 40%;">
            <el-input v-model="codeForm.email" disabled></el-input>
          </el-form-item>
          <el-form-item label="验证码" style="width: 50%;">
            <el-input v-model="codeForm.code" placeholder="请输入验证码">
              <template slot="append">
                <el-button :disabled="isSendingCode" @click="sendPasswordVerificationCode">
                  {{ isSendingCode ? `${countdown}s 后重新发送` : '发送验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="新密码" style="width: 40%;">
            <el-input v-model="codeForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePasswordByCode">确认修改</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 注销账号 -->
      <div v-if="selectedOption == '4'" class="info-section">
        <el-form label-width="120px">
          <el-form-item>
            <p>注销账号将永久删除您的账户及相关数据，操作不可撤销，请谨慎操作。</p>
            <el-button type="danger" @click="confirmDeleteAccount">确认注销</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-dialog title="裁剪头像" :visible.sync="cropperVisible" @close="cropperVisible = false" width="80%">
      <div class="cropper-container">
        <img ref="cropperImage" :src="imageSrc" alt="Cropper Image" />
      </div>
      <span slot="footer">
        <el-button @click="cropImage">裁剪并保存</el-button>
        <el-button @click="cancelCrop">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { sendCode, uploadImg } from '@/api/common';
import { deleteUser, resetEmail, resetPassword, resetPasswordWithCode, updateUserinfo, VerificationCode } from '@/api/user';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { Loading } from 'element-ui';

export default {
  props: {
    userinfo: {
      type: Object,
      required: true
    },
    isSelf: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      localUserinfo: JSON.parse(JSON.stringify(this.userinfo)),
      emailForm: {
        currentEmail: this.userinfo.email,
        newEmail: '',
        verificationCode: ''
      },
      selectedOption: '1',
      cropperVisible: false,
      imageSrc: '',
      cropperInstance: null,
      uploadUrl: 'http://localhost:8888/upload',
      isSendingCode: false,
      countdown: 60,
      countdownTimer: null,
      passwordForm: {
        oldPassword: '',
        confirmOldPassword: '',
        newPassword: '',
      },
      codeForm: {
        email: this.userinfo.email,
        code: '',
      },
      showEmailConfirmDialog: false,
      showPasswordConfirmDialog: false,
    };
  },
  methods: {
    selectOption(option) {
      this.selectedOption = parseInt(option);
    },
    handleFileChange(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target.result;
        this.cropperVisible = true;
        this.$nextTick(() => {
          if (this.cropperInstance) {
            this.cropperInstance.destroy();
          }
          this.cropperInstance = new Cropper(this.$refs.cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            background: false,
            cropBoxResizable: true,
            minCropBoxWidth: 100,
            minCropBoxHeight: 100,
          });
        });
      };
      reader.readAsDataURL(file.raw);
    },
    cropImage() {
      if (this.cropperInstance) {
        this.cropperInstance.getCroppedCanvas({ width: 200, height: 200 }).toBlob((blob) => {
          const formData = new FormData();
          const file = new File([blob], 'avatar.jpg', { type: blob.type });
          formData.append('image', file);

          const loadingInstance = Loading.service({
            lock: true,
            text: '上传中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });

          uploadImg(formData)
            .then(response => {
              this.localUserinfo.avatar = response.data.data;
              this.$message.success('头像上传成功!');
              this.cropperVisible = false;
            }).catch(() => {
              this.$message.error('头像上传失败!');
            }).finally(() => {
              loadingInstance.close();
            });
        });
      }
    },
    cancelCrop() {
      this.cropperVisible = false;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    saveInfo() {
      this.$confirm('你确定要修改个人信息吗？', '确认修改个人信息', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateUserinfo(this.localUserinfo)
          .then(response => {
            if (response.data.code === 200) {
              this.localUserinfo = response.data.data;
              this.$message.success('信息保存成功!');
              this.$emit('updateUserInfo', this.localUserinfo);
              location.reload();
            } else {
              this.$message.error(response.data.msg);
            }
          })
          .catch(() => {
            this.$message.error('信息保存失败!');
          });
      }).catch(() => {
      });
    },
    resetInfo() {
      this.localUserinfo = JSON.parse(JSON.stringify(this.userinfo));
    },
    getheaders() {
      const headers = {
        token: localStorage.getItem("token"),
      };
      return headers;
    },
    sendVerificationCode() {
      if (!this.emailForm.newEmail) {
        this.$message.error('新邮箱不能为空!');
        return;
      }
      if (!this.isValidEmail(this.emailForm.newEmail)) {
        this.$message.error('请输入有效的邮箱地址!');
        return;
      }
      this.startCountdown();
      this.sendingCode = true;
      sendCode({
        email: this.emailForm.newEmail,
        type: VerificationCode.RESET_EMAIL,
      })
        .then(response => {
          if (response.data.code == 200) {
            this.$message.success('验证码已发送到新邮箱，请查收!');
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch(() => {
          this.$message.error('验证码发送失败，请重试!');
          this.sendingCode = false;
        });
    },
    startCountdown() {
      this.countdown = 60;
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.sendingCode = false;
        }
      }, 1000);
    },
    bindNewEmail() {
      if (!this.emailForm.verificationCode) {
        this.$message.error('验证码不能为空!');
        return;
      }
      if (!this.isValidEmail(this.emailForm.newEmail)) {
        this.$message.error('请输入有效的邮箱地址!');
        return;
      }

      this.$confirm('你确定要换绑邮箱吗？', '确认换绑邮箱', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetEmail({
          email: this.emailForm.newEmail,
          code: this.emailForm.verificationCode,
        })
          .then(() => {
            this.$message.success('邮箱换绑成功! 请重新登录.');
            localStorage.removeItem('token');
            this.$router.push('/login');
          }).catch(() => {
            this.$message.error('邮箱绑定失败，请重试!');
          });
      }).catch(() => {
      });
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    changePassword() {
      if (this.passwordForm.oldPassword !== this.passwordForm.confirmOldPassword) {
        this.$message.error('两次输入的旧密码不一致!');
        return;
      }

      if (!this.passwordForm.newPassword) {
        this.$message.error('新密码不能为空!');
        return;
      }

      this.$confirm('你确定要修改密码吗？', '确认修改密码', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetPassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword,
        })
          .then(() => {
            this.$message.success('密码修改成功! 请重新登录.');
            localStorage.removeItem('token');
            this.$router.push('/login');
          })
          .catch(() => {
            this.$message.error('密码修改失败，请重试!');
          });
      }).catch(() => {
        this.$message.info('已取消修改');
      }).catch(() => {
      });
    },
    confirmDeleteAccount() {
      this.$confirm('你确定要注销账号吗？此操作不可撤销。', '确认注销', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser()
          .then((response) => {
            if (response.data.code === 200) {
              this.$message.success('账号已成功注销');
              localStorage.removeItem('token');
              this.$router.push('/login');
            } else {
              this.$message.error(response.data.msg);
            }
          })
          .catch(() => {
            this.$message.error('注销账号失败，请重试!');
          });
      }).catch(() => {
        this.$message.info('已取消注销');
      });
    },
    handleMenuSelect(index) {
      this.selectedOption = index
    },
    sendPasswordVerificationCode() {
      this.isSendingCode = true;
      sendCode({
        email: this.userinfo.email,
        type: VerificationCode.RESET_PASSWORD,
      })
        .then(response => {
          if (response.data.code == 200) {
            this.$message.success('验证码已发送到邮箱，请查收!');
            this.startCountdown();
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch(() => {
          this.$message.error('验证码发送失败，请重试!');
          this.isSendingCode = false;
        });
    },
    changePasswordByCode() {
      if (!this.codeForm.code) {
        this.$message.error('验证码不能为空!');
        return;
      }
      if (!this.codeForm.newPassword) {
        this.$message.error('新密码不能为空!');
        return;
      }
      this.$confirm('你确定要修改密码吗？', '确认修改密码', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetPasswordWithCode({
          email: this.codeForm.email,
          code: this.codeForm.code,
          newPassword: this.codeForm.newPassword,
        })
          .then(() => {
            this.$message.success('密码修改成功! 请重新登录.');
            localStorage.removeItem('token');
            this.$router.push('/login');
          })
          .catch(() => {
            this.$message.error('密码修改失败，请重试!');
          });
      }).catch(() => {
        this.$message.info('已取消修改');
      });
    },
  },
  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },
}
</script>

<style lang="less" src="@/assets/css/SelfInformation.less" scoped></style>
