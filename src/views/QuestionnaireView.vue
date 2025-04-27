<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 导入Element Plus图标
import { Document, Search, Edit, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 获取当前活动的子路由
// 初始化 activeMenu 基于当前路由
const getCurrentActiveMenu = () => {
  const routeName = route.name?.toString() || '';
  if (routeName === 'questionnaire-edit' || routeName === 'questionnaire-results') {
    return 'questionnaire-my';
  }
  // 默认返回 create 或当前路由名
  return routeName || 'questionnaire-create'; 
};
const activeMenu = ref(getCurrentActiveMenu());

// 导航到指定路由并更新 activeMenu
const navigateTo = (routeName: string) => {
  router.push({ name: routeName }).then(() => {
    activeMenu.value = routeName; // 在路由导航完成后更新 activeMenu
  });
}
</script>

<template>
  <div class="questionnaire-container">
    <el-container>
      <el-aside width="250px" class="sidebar">
        <div class="sidebar-header">
          <h2>问卷系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          
        >
          <el-menu-item index="questionnaire-create" @click="navigateTo('questionnaire-create')">
            <el-icon><Document /></el-icon>
            <span>创建问卷</span>
          </el-menu-item>
          <el-menu-item index="questionnaire-public" @click="navigateTo('questionnaire-public')">
            <el-icon><Search /></el-icon>
            <span>公开问卷</span>
          </el-menu-item>
          <el-menu-item index="questionnaire-my" @click="navigateTo('questionnaire-my')">
            <el-icon><Edit /></el-icon>
            <span>我的问卷</span>
          </el-menu-item>
        </el-menu>
        <div class="sidebar-footer">
          <el-button type="primary" @click="router.push('/login')" plain size="small">登录</el-button>
          <el-button type="info" @click="router.push('/register')" plain size="small">注册</el-button>
        </div>
      </el-aside>
      <el-container class="main-content">
        <el-header class="content-header">
          <div class="header-title">
            <h2>
              {{ 
                activeMenu === 'questionnaire-create' ? '创建问卷' :
                activeMenu === 'questionnaire-public' ? '公开问卷' :
                activeMenu === 'questionnaire-my' ? '我的问卷' :
                activeMenu === 'questionnaire-results' ? '问卷结果' :
                activeMenu === 'questionnaire-fill' ? '填写问卷' : '问卷系统'
              }}
            </h2>
          </div>
          <div class="user-info">
            <el-dropdown>
              <span class="user-dropdown">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <span>用户</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/login')">登录</el-dropdown-item>
                  <el-dropdown-item @click="router.push('/register')">注册</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <!-- 子路由视图 -->
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.questionnaire-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sidebar {
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  padding: 20px 0;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-around;
}

.content-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.main-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-dropdown span {
  margin-left: 8px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>