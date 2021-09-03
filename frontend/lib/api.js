import axios from "axios"
import Cookie from "js-cookie"
import Router from "next/router"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

const authHeader = () => ({
  headers: {
    Authorization:
      `Bearer ${Cookie.get("token")}`,
    }
}) 

axios.interceptors.response.use(null, function (error) {
  console.log('INTERCEPT ERROR', error.response);
  // Handle expired log ins
  if (error.response.status === 401) {
    console.log('401 REDIRECT TO LOGIN')
    Router.push("/login")
  }
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});

export const getProfile = async () => axios.get(`${API_URL}/profile`, authHeader())

export const updateProfile = async (id, data) => axios.put(`${API_URL}/users/${id}`, data, authHeader())

export const findChallenge = async (id) => axios.get(`${API_URL}/challenge/${id}`, authHeader())

export const createChallenge = async (data) => axios.post(`${API_URL}/challenge`, data, authHeader())

export const updateChallenge = async (id, data) => axios.put(`${API_URL}/challenge/${id}`, data, authHeader())

export const updateResult = async (id, data) => axios.put(`${API_URL}/result/${id}`, data, authHeader())

export const postRank = async (data) => axios.post(`${API_URL}/ranks`, data, authHeader())

export const updateRank = async (id, data) => axios.put(`${API_URL}/ranks/${id}`, data, authHeader())

export const createUpload = async (data) => axios.post(`${API_URL}/upload`, data, authHeader())