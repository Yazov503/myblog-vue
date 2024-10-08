import axios from "axios";

export function getUnreadMessageNum() {
  return axios.get("/message/unread")
}

export function getMessages(userId, start = 0, limit = 50) {
  return axios.get("/message", {
    params: {
      contactId: userId,
      start,
      limit,
    }
  })
}

export function sendMessage(message) {
  return axios.post("/message", message)
}

export function refreshUnreadMessage(contactId) {
  return axios.post("/message/refresh", null, {
    params: {
      contactId
    }
  })
}
