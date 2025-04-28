<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

interface Questionnaire {
  id: string
  title: string
  description: string
  creator: string
  createdAt: string
  responseCount: number
}

const router = useRouter()
const publicQuestionnaires = ref<Questionnaire[]>([])
const isLoading = ref(true)
const searchText = ref('')

// 加载公开问卷列表
const loadPublicQuestionnaires = async () => {
  isLoading.value = true
  
  try {
    const params = searchText.value ? { search: searchText.value } : {}
    const response = await axios.get('/api/questionnaires/public', { params })
    const { code, data } = response.data
    
    if (code === 200 && data) {
      publicQuestionnaires.value = data.items
    } else {
      ElMessage.error('加载公开问卷失败')
    }
  } catch (error) {
    console.error('加载公开问卷失败:', error)
    ElMessage.error('加载公开问卷失败，请检查网络连接')
  } finally {
    isLoading.value = false
  }
}

// 监听搜索文本变化，延迟500ms执行搜索
let searchTimeout: number | null = null
watch(searchText, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    loadPublicQuestionnaires()
  }, 500) as unknown as number
})

// 跳转到填写问卷页面
const goToFill = (id: string) => {
  router.push(`/questionnaire/fill/${id}`)
}

onMounted(() => {
  loadPublicQuestionnaires()
})
</script>

<template>
  <div class="public-questionnaires">
    <div class="page-header">
      <el-input
        placeholder="搜索问卷"
        style="width: 300px"
        v-model="searchText"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <el-card v-if="isLoading" class="loading-card">
      <el-skeleton :rows="3" animated />
    </el-card>
    
    <div v-else class="questionnaire-list">
      <el-empty v-if="publicQuestionnaires.length === 0" description="暂无公开问卷" />
      
      <el-card v-for="item in publicQuestionnaires" :key="item.id" class="questionnaire-card">
        <div class="card-content">
          <h3>{{ item.title }}</h3>
          <p class="description">{{ item.description }}</p>
          <div class="meta-info">
            <span>创建者: {{ item.creator }}</span>
            <span>创建时间: {{ item.createdAt }}</span>
            <span>已收集: {{ item.responseCount }}份</span>
          </div>
        </div>
        <div class="card-actions">
          <el-button type="primary" @click="goToFill(item.id)">填写问卷</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.public-questionnaires {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: center; /* 修改为居中 */
  align-items: center;
  margin-bottom: 20px;
}

.questionnaire-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.questionnaire-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-content {
  flex: 1;
}

.description {
  color: #666;
  margin: 10px 0;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.9em;
  color: #999;
  margin-bottom: 15px;
}

.card-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.loading-card {
  margin-bottom: 20px;
}
</style>