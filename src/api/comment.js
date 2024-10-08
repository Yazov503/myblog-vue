import axios from "axios";

export function getCommentsByPage({ blogId, pageNum, pageSize }) {
  return axios.get("/blog/comment/page", {
    params: {
      blogId,
      pageNum,
      pageSize,
    },
  });
}

export function createComment({ blogId, content }) {
  return axios.post("/blog/comment", {
    blogId,
    content,
  });
}

export function likeComment(commentId) {
  return axios.post(`/blog/comment/like/${commentId}`)
}
