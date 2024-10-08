import axios from "axios";

export function uploadImg(formData) {
  return axios.post("/upload", formData)
}

export function sendCode({email,type}) {
  return axios.post(`/user/code?email=${email}&type=${type}`)
}