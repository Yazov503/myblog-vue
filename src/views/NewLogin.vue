<template>
  <div class="main">
    <div class="video-background">
      <video autoplay muted loop>
        <source src="@/assets/videos/login.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="background">
      <div class="login-block" v-if="isLogin">
        <router-link to="/blog/view" class="title">ACGN</router-link>
        <p class="login-title">ACGN - Login</p>
        <el-form class="login-form" v-if="loginMode == 1">
          <el-form-item>
            <el-input type="text" class="email" placeholder="邮箱" v-model="loginForm.email" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-input type="password" class="password" placeholder="密码" v-model="loginForm.password" clearable
              show-password></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="default" class="reset-button" @click="resetLoginForm">重置</el-button>
            <el-button type="primary" class="login-button" @click="handleLogin">登录</el-button>
          </el-form-item>
        </el-form>
        <el-form class="login-form" v-if="loginMode == 2">
          <el-form-item>
            <el-input type="text" class="email" placeholder="邮箱" v-model="codeLoginForm.email" clearable></el-input>
          </el-form-item>
          <el-form-item class="code-pane">
            <el-input type="text" class="code" placeholder="验证码" v-model="codeLoginForm.code" clearable></el-input>
            <el-button class="code-button" @click="sendCode(3)" :disabled="isCountingDown">
              {{ isCountingDown ? `${countdown}s 后重新获取` : '获取验证码' }}
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="default" class="reset-button" @click="resetCodeLoginForm">重置</el-button>
            <el-button type="primary" class="login-button" @click="handleCodeLogin">登录</el-button>
          </el-form-item>
        </el-form>
        <div class="link">
          <div @click="isLogin = false" class="register">注册账号</div>
          <div class="code-login" @click="changeLoginMode(2)" v-if="loginMode == 1">验证码登录</div>
          <div class="code-login" @click="changeLoginMode(1)" v-if="loginMode == 2">密码登录</div>
        </div>
      </div>
      <div class="register-block" v-if="!isLogin">
        <router-link to="/blog/view" class="title">ACGN</router-link>
        <p class="register-title">ACGN - register</p>
        <el-form class="register-form">
          <el-form-item>
            <el-input type="text" class="email" placeholder="邮箱" v-model="registerForm.email" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-input type="password" class="password" placeholder="密码" v-model="registerForm.password" clearable
              show-password></el-input>
          </el-form-item>
          <el-form-item class="code-pane">
            <el-input type="text" class="code" placeholder="验证码" v-model="registerForm.code" clearable></el-input>
            <el-button class="code-button" @click="sendCode(1)" :disabled="isCountingDown">
              {{ isCountingDown ? `${countdown}s 后重新获取` : '获取验证码' }}
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="default" class="reset-button" @click="resetRegisterForm">重置</el-button>
            <el-button type="primary" class="register-button" @click="handleRegister">注册</el-button>
          </el-form-item>
        </el-form>
        <div class="link">
          <div @click="isLogin = true" class="login">登录账号</div>
          <router-link to="/">返回主页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sendCode } from '@/api/common';
import { codeLogin, login, register, VerificationCode } from '@/api/user';


export default {
  name: 'NewLogin',
  data() {
    return {
      loginForm: {
        email: '',
        password: '',
      },
      codeLoginForm: {
        email: '',
        code: '',
      },
      registerForm: {
        email: '',
        password: '',
        code: '',
      },
      countdown: 60, // 倒计时初始值
      isCountingDown: false, // 控制按钮状态
      isLogin: true,
      loginMode: 1,
    };
  },
  mounted() {
    if (localStorage.getItem('token') != null) {
      this.$router.push('/blog/view')
    }
    const LoginOrRegister = sessionStorage.getItem('isLogin')
    if (LoginOrRegister == 'false') {
      this.isLogin = false
    } else {
      this.isLogin = true
    }
    sessionStorage.removeItem('isLogin')
  },
  methods: {
    handleLogin() {
      this.loginForm.email = this.loginForm.email.trim();
      this.loginForm.password = this.loginForm.password.trim();
      if (!this.loginForm.email) {
        this.$message.error('请填写邮箱地址');
        return;
      }
      if (!this.loginForm.password) {
        this.$message.error('请填写密码');
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.loginForm.email)) {
        this.$message.error('请输入有效的邮箱地址');
        return;
      }

      login({
        email: this.loginForm.email,
        password: this.loginForm.password,
      })
        .then(response => {
          if (response.data.code == 200) {
            localStorage.setItem("token", response.data.data['token'])
            this.$router.push('/blog/view');
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch(error => {
          this.$message.error('登录失败:', error);
        });
    },
    handleCodeLogin() {
      this.codeLoginForm.email = this.codeLoginForm.email.trim();
      this.codeLoginForm.code = this.codeLoginForm.code.trim();
      if (!this.codeLoginForm.email) {
        this.$message.error('请填写邮箱地址');
        return;
      }
      if (!this.codeLoginForm.code) {
        this.$message.error('请填写验证码');
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.codeLoginForm.email)) {
        this.$message.error('请输入有效的邮箱地址');
        return;
      }

      codeLogin({
        email: this.codeLoginForm.email,
        code: this.codeLoginForm.code,
      })
        .then(response => {
          if (response.data.code === 200) {
            localStorage.setItem("token", response.data.data['token'])
            this.$router.push('/blog/view');
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch(error => {
          this.$message.error('登录失败:', error);
        });
    },
    resetLoginForm() {
      this.loginForm.email = '';
      this.loginForm.password = '';
    },
    resetCodeLoginForm() {
      this.codeLoginForm.email = ''
      this.codeLoginForm.code = ''
    },
    handleRegister() {
      this.registerForm.email = this.registerForm.email.trim();
      this.registerForm.password = this.registerForm.password.trim();
      this.registerForm.code = this.registerForm.code.trim();
      if (!this.registerForm.email) {
        this.$message.error('请填写邮箱地址');
        return;
      }
      if (!this.registerForm.password) {
        this.$message.error('请填写密码');
        return;
      }
      if (!this.registerForm.code) {
        this.$message.error('请填写验证码');
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.registerForm.email)) {
        this.$message.error('请输入有效的邮箱地址');
        return;
      }

      register({
        email: this.registerForm.email,
        password: this.registerForm.password,
        code: this.registerForm.code,
      })
        .then(response => {
          if (response.data.code === 200) {
            localStorage.setItem("token", response.data.data['token'])
            this.$router.push('/blog/view');
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch(error => {
          this.$message.error('注册失败:', error);
        });
    },
    sendCode(type) {
      if (type == VerificationCode.REGISTER && !this.registerForm.email) {
        this.$message.error('请填写邮箱地址');
        return;
      }
      if (type == VerificationCode.LOGIN && !this.codeLoginForm.email) {
        this.$message.error('请填写邮箱地址');
        return;
      }
      var email;
      if (type == VerificationCode.REGISTER) {
        email = this.registerForm.email
      } else if (type == VerificationCode.LOGIN) {
        email = this.codeLoginForm.email
      }
      this.startCountdown();
      sendCode({ email, type: String(type) })
        .then(response => {
          if (response.data.code === 200) {
            this.$message.success('验证码发送成功');
          } else {
            this.$message.error(response.data.msg);
          }
        }).catch(() => {
          this.$message.error('验证码发送失败，请重试!');
        });
    },
    startCountdown() {
      this.isCountingDown = true;
      this.countdown = 60;
      const interval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.isCountingDown = false;
          clearInterval(interval);
        }
      }, 1000);
    },
    resetRegisterForm() {
      this.registerForm.email = '';
      this.registerForm.password = '';
      this.registerForm.code = '';
    },
    changeLoginMode(mode) {
      this.resetLoginForm()
      this.resetCodeLoginForm()
      this.loginMode = mode
    }
  }
};
</script>

<style lang="less" src="@/assets/css/NewLogin.less" scoped></style>