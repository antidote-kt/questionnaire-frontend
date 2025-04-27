<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 导入Element Plus图标
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const login = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // 这里应该替换为实际的API调用
    // const response = await axios.post('/api/login', {
    //   username: username.value,
    //   password: password.value
    // })
    
    // 模拟登录成功
    setTimeout(() => {
      // 存储用户信息和token
      localStorage.setItem('user', JSON.stringify({
        username: username.value,
        nickname: '测试用户'
      }))
      localStorage.setItem('token', 'sample-token')
      
      // 登录成功后跳转到首页
      router.push('/')
      isLoading.value = false
    }, 1000)
  } catch (error) {
    isLoading.value = false
    errorMessage.value = '登录失败，请检查用户名和密码'
    console.error('登录错误:', error)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="content-wrapper">
      <header class="page-header">
        <h1 class="page-title">问卷星</h1>
      </header>

      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <h4>用户登录</h4>
          </div>
        </template>
        
        <el-form @submit.native.prevent="login" class="login-form">
          <el-form-item>
            <el-input 
              v-model="username" 
              placeholder="用户名"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item>
            <el-input 
              v-model="password" 
              type="password" 
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <div class="form-actions">
            <el-button type="primary" @click="login" :loading="isLoading" class="submit-btn">登录</el-button>
            <router-link to="/register">
              <el-button type="default" class="register-btn">注册新账户</el-button>
            </router-link>
          </div>
          
          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
            type="error"
            show-icon
            class="mt-3"
          />
        </el-form>
      </el-card>

    </div>
    <footer class="page-footer">
      <p>&copy; 2024 问卷星 - 基于Rocket框架的问卷系统</p>
    </footer>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  background-color: #f5f7fa;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.content-wrapper {
  flex: 1;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  color: #409EFF;
  margin: 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: center;
}

.login-form {
  padding: 0 20px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
  gap: 20px;
}

.submit-btn,
.register-btn {
  flex: 1;
  width: 100%;
}

.page-footer {
  width: 100%;
  text-align: center;
  color: #909399;
  padding: 20px 0;
  margin-top: auto;
  background-color: #f0f2f5;
  position: relative;
  bottom: 0;
}
</style>