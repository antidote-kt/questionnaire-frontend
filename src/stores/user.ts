import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: number
  username: string
  nickname: string
  email?: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<User | null>(null)
  const token = ref<string | null>(null)
  
  // 初始化：从localStorage获取数据
  const initialize = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      token.value = storedToken
    }
    
    if (storedUser) {
      try {
        userInfo.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('解析用户信息失败', error)
      }
    }
  }
  
  // 设置用户信息
  const setUser = (user: User | null) => {
    userInfo.value = user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }
  
  // 设置token
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }
  
  // 登录
  const login = (newToken: string, user: User) => {
    setToken(newToken)
    setUser(user)
  }
  
  // 登出
  const logout = () => {
    setToken(null)
    setUser(null)
  }
  
  // 判断是否已登录
  const isLoggedIn = () => {
    return !!token.value && !!userInfo.value
  }
  
  return {
    userInfo,
    token,
    initialize,
    setUser,
    setToken,
    login,
    logout,
    isLoggedIn
  }
}) 