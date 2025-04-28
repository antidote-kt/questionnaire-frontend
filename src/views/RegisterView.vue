<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
// 导入Element Plus图标
import { User, Lock, Message, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const isPasswordMatch = computed(() => {
  return password.value === confirmPassword.value
})

const validateForm = () => {
  // 用户名验证：4-20个字符，只能包含字母、数字和下划线
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/
  if (!usernameRegex.test(username.value)) {
    errorMessage.value = '用户名必须是4-20个字符，只能包含字母、数字和下划线'
    return false
  }
  
  // 邮箱验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = '请输入有效的电子邮箱地址'
    return false
  }
  
  // 密码长度验证
  if (password.value.length < 6) {
    errorMessage.value = '密码长度至少6个字符'
    return false
  }
  
  // 确认密码验证
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return false
  }
  
  return true
}

const register = async () => {
  errorMessage.value = ''
  
  if (!validateForm()) {
    return
  }
  
  try {
    isLoading.value = true
    
    const response = await axios.post('/api/users/register', {
      username: username.value,
      nickname: nickname.value,
      email: email.value,
      password: password.value
    })
    
    const { code, message } = response.data
    
    if (code === 200) {
      ElMessage.success(message || '注册成功')
      // 注册成功后跳转到登录页面
      router.push('/login')
    } else {
      errorMessage.value = message || '注册失败，请稍后重试'
    }
  } catch (error: any) {
    console.error('注册错误:', error)
    errorMessage.value = error.response?.data?.message || '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="content-wrapper">
      <header class="page-header">
        <h1 class="page-title">问卷星</h1>
      </header>

      <el-card class="register-card">
        <template #header>
          <div class="card-header">
            <h3>注册账号</h3>
          </div>
        </template>
        
        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          class="mb-4"
        />
        
        <el-form @submit.native.prevent="register" class="register-form">
          <el-form-item>
            <el-input 
              v-model="username" 
              placeholder="用户名" 
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="nickname" 
              placeholder="昵称" 
              :prefix-icon="UserFilled"
            />
          </el-form-item>
          <el-form-item>
            <el-input 
              v-model="email" 
              placeholder="邮箱" 
              :prefix-icon="Message"
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
          <el-form-item>
            <el-input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="确认密码" 
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
           <div class="form-actions">
            <el-button type="primary" @click="register" :loading="isLoading" class="action-btn">注册</el-button>
            <router-link to="/login" class="action-btn">
              <el-button>返回登录</el-button>
            </router-link>
          </div>
        </el-form>
      </el-card>

    </div>
    <footer class="page-footer">
      <p>&copy; 2024 问卷星系统 版权所有</p>
    </footer>
  </div>
</template>

<style scoped>
.register-container {
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

.register-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: center;
}

.register-form {
  padding: 0 20px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
  gap: 20px;
}

.action-btn {
  flex: 1;
}

.action-btn .el-button {
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