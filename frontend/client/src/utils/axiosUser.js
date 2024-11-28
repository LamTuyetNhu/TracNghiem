import axios from "axios"
import jwtDecode from 'jwt-decode';
import  NProgress from "nprogress";
import { store } from "../redux/store";
import { port } from "../configs/config";
const token = localStorage.getItem("token");
NProgress.configure({
  showSpinner: false,
  color: "green",
  trickleSpeed: 100,
});


const instance = axios.create({
  baseURL: port,
  // headers: {
  //   'Content-Type': 'application/json',
  //   'Authorization': `Bearer ${token}`
  // }
})

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  const accesss_token = store?.getState()?.user?.account?.access_token;
  config.headers["Authorization"] = "Bearer " + accesss_token;
  NProgress.start();
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  NProgress.done();
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response && response.data ? response.data : response;
}, function (error) {
  NProgress.done();
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return error && error.response && error.response.data
  ? error.response.data : Promise.reject(error);
});

export default instance;