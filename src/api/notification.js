import axios from "axios";

export function getUnreadNotificationNum(){
  return axios.get("/notification/unread")
}

export function getNotificationByPage(pageSize,pageNum){
  return axios.get("/notification/page", {
    params: {
      pageNum,
      pageSize,
    },
  });
}