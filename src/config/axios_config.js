import axios from 'axios';

axios.interceptors.request.use(
  request => {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers['token'] = token;
    }
    return request;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    const token = response.headers['token'];
    if (token) {
      localStorage.setItem('token', token);
    }
    return response;
  },
  error => {
    if(error.response.status&&error.response.status === 403) {
      localStorage.removeItem('token');
      this.$router.go(0)
    }
    return Promise.reject(error);
  }
);

axios.defaults.paramsSerializer = (params) => {
  const qs = require('qs');
  return qs.stringify(params, { arrayFormat: 'repeat', allowDots: true });
};