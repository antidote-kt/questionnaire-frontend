<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit, View, Document } from '@element-plus/icons-vue'
import axios from 'axios'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 定义后端返回的问卷项目数据结构
interface QuestionnaireApiItem {
  id: number
  title: string
  description: string
  creator: string
  created_at: string
  response_count: number
}

// 定义问卷列表数据结构
interface Questionnaire {
  id: number | string
  title: string
  status: string
  createdAt: string
  responses: number
  description?: string
  creator?: string
}

// 问卷数据
const questionnaires = ref<Questionnaire[]>([])
const isLoading = ref(true)

// 获取我的问卷列表
const loadMyQuestionnaires = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/api/questionnaires/my')
    const { code, data } = response.data
    
    if (code === 200 && data) {
      // 转换后端数据到前端需要的格式
      questionnaires.value = data.items.map((item: QuestionnaireApiItem) => ({
        id: item.id,
        title: item.title,
        status: '进行中', // 默认状态
        createdAt: new Date(item.created_at).toLocaleString(), // 格式化日期
        responses: item.response_count,
        description: item.description,
        creator: item.creator
      }))
    } else {
      ElMessage.error('加载问卷列表失败')
    }
  } catch (error) {
    console.error('加载问卷列表失败:', error)
    ElMessage.error('加载问卷列表失败，请检查网络连接')
  } finally {
    isLoading.value = false
  }
}

// 页面加载时获取问卷列表
onMounted(() => {
  if (userStore.isLoggedIn()) {
    loadMyQuestionnaires()
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})

// 删除问卷
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个问卷吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await axios.delete(`/api/questionnaires/${id}`)
    const { code, message } = response.data
    
    if (code === 200) {
      ElMessage.success(message || '删除成功')
      // 重新加载问卷列表
      loadMyQuestionnaires()
    } else {
      ElMessage.error(message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问卷失败:', error)
      ElMessage.error('删除失败，请检查网络连接')
    }
  }
}

// 编辑问卷
const handleEdit = (id: string) => {
  router.push(`/questionnaire/edit/${id}`)
}

// 查看问卷结果
const handleViewResults = (id: string) => {
  router.push(`/questionnaire/results/${id}`)
}

// 查看问卷回答列表
const handleViewResponses = (id: string) => {
  router.push(`/questionnaire/responses/${id}`)
}
</script>

<template>
  <div class="my-questionnaires">
    <el-table 
      :data="questionnaires" 
      style="width: 100%" 
      border
      v-loading="isLoading"
    >
      <el-table-column prop="title" label="问卷标题" min-width="200">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" @click="handleEdit(row.id)">
            {{ row.title }}
          </el-link>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '进行中' ? 'success' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      
      <el-table-column prop="responses" label="回复数" width="100" align="center" />
      
      <el-table-column label="操作" width="380" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              type="primary"
              :icon="Edit"
              @click="handleEdit(row.id)"
              size="small"
            >
              编辑
            </el-button>
            <el-button
              type="success"
              :icon="View"
              @click="handleViewResults(row.id)"
              size="small"
            >
              统计结果
            </el-button>
            <el-button
              type="info"
              :icon="Document"
              @click="handleViewResponses(row.id)"
              size="small"
            >
              查看回答
            </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              @click="handleDelete(row.id)"
              size="small"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.my-questionnaires {
  padding: 20px;
  height: 100%;
  background-color: #fff;
}

.el-button-group {
  display: flex;
  gap: 8px;
}

.el-table {
  margin-top: 20px;
}
</style>