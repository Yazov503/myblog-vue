import axios from 'axios';

export const VerificationCode = {
  'REGISTER': '1',
  'RESET_EMAIL': '2',
  'LOGIN': '3',
  'RESET_PASSWORD': '4',
};

// 密码登录
export function login({ email, password }) {
  return axios.post(`/user/login?email=${email}&password=${password}`)
}

// 验证码登录
export function codeLogin({ email, code }) {
  return axios.post(`/user/code-login?email=${email}&code=${code}`)
}

// 注册
export function register({ email, password, code }) {
  return axios.post(`/user/register?email=${email}&password=${password}&code=${code}`)
}

// 获取关注用户
export function getFollowers() {
  return axios.get("/user/getFollows");
}

// 更新用户信息
export function updateUserinfo(localUserinfo) {
  return axios.put('/user', localUserinfo)
}

// 获取当前用户ID
export function getCurrentUserId() {
  return axios.get("/user/getUserId");
}

// 获取用户信息
export function getUserInfo(userId) {
  return axios.get(`/user/${userId}`);
}

// 获取用户id
export function getUserId() {
  return axios.get(`user/getUserId`);
}

// 分页获取用户
export function getUsersByPage({ pageNum, pageSize, queryText }) {
  return axios.get(`/user/page`, {
    params: {
      pageNum,
      pageSize,
      queryText,
    },
  });
}

// 关注用户
export function followUser(userId) {
  return axios.post(`/user/follow?followId=${userId}`);
}

// 注销账号
export function deleteUser() {
  return axios.delete('/user');
}

// 换绑邮箱
export function resetEmail({ email, code }) {
  return axios.put(`/user/reset-email?email=${email}&code=${code}`);
}

// 重设密码
export function resetPassword({ oldPassword, newPassword }) {
  return axios.put(`/user/reset-password?oldPassword=${oldPassword}&newPassword=${newPassword}`);
}

// 验证码重设密码
export function resetPasswordWithCode({ email, code, newPassword }) {
  return axios.put(`/user/reset-password-code?email=${email}&code=${code}&newPassword=${newPassword}`);
}

// 检验token有效
export function checkToken() {
  return axios.get(`http://localhost:8888/user/check`);
}

export function getContactsByPage(pageSize,pageNum,queryText){
  return axios.get("/user/contact/page", {
    params: {
      pageNum,
      pageSize,
      queryText,
    },
  });
}
