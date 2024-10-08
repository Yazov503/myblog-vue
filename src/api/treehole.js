import axios from 'axios';

// 发送弹幕
export function addDanmu(content) {
  return axios.post('/treehole', {
    content,
  });
}

// 获取弹幕
export function getDanmus(pageSize = 100) {
  return axios.get('/treehole', {
    params: {
      pageSize,
    },
  });
}
