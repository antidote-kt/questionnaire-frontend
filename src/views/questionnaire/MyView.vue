<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit, View } from '@element-plus/icons-vue'

const router = useRouter()

// 定义问卷列表数据结构
interface Questionnaire {
  id: number
  title: string
  status: string
  createdAt: string
  responses: number
}

// 模拟问卷数据
const questionnaires = ref<Questionnaire[]>([
  {
    id: 1,
    title: '用户满意度调查',
    status: '进行中',
    createdAt: '2024-01-15',
    responses: 120
  },
  {
    id: 2,
    title: '产品反馈问卷',
    status: '已结束',
    createdAt: '2024-01-10',
    responses: 85
  }
])

// 删除问卷
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个问卷吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 实际项目中这里应该调用API
    questionnaires.value = questionnaires.value.filter(q => q.id !== id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问卷失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 编辑问卷
const handleEdit = (id: number) => {
  router.push(`/questionnaire/edit/${id}`)
}

// 查看问卷结果
const handleViewResults = (id: number) => {
  router.push(`/questionnaire/results/${id}`)
}
</script>

<template>
  <div class="my-questionnaires">
    <el-table :data="questionnaires" style="width: 100%" border>
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
      
      <el-table-column label="操作" width="280" fixed="right">
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
              查看结果
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