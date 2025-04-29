<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../../stores/user'

interface Answer {
  questionId: number
  question: string
  type: string
  value: string | string[]
}

interface Response {
  id: string
  submittedAt: string
  submittedBy: string | null
  answers: Answer[]
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoading = ref(true)
const questionnaireId = ref('')
const title = ref('')
const responsesList = ref<Response[]>([])
const totalResponses = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailDialog = ref(false)
const currentResponse = ref<Response | null>(null)

// 返回问卷列表
const goBack = () => {
  router.push('/questionnaire/my')
}

// 获取问卷回答列表
const loadResponses = async (page = 1) => {
  currentPage.value = page
  
  questionnaireId.value = route.params.id as string
  if (!questionnaireId.value) {
    ElMessage.error('无效的问卷ID')
    router.push('/questionnaire/my')
    return
  }
  
  isLoading.value = true
  
  try {
    // 获取问卷信息
    const questResponse = await axios.get(`/api/questionnaires/${questionnaireId.value}`)
    const { code: questCode, data: questData } = questResponse.data
    
    if (questCode === 200 && questData) {
      title.value = questData.title
    }
    
    // 获取问卷回答列表 - 修正API路径
    const params = { page: page, page_size: pageSize.value }
    const response = await axios.get(`/api/responses/questionnaires/${questionnaireId.value}/responses`, { params })
    const { code, data } = response.data
    
    if (code === 200 && data) {
      console.log('后端返回的原始数据:', data);
      
      // 处理后端返回的不同数据格式
      if (Array.isArray(data)) {
        // 后端直接返回数组，需要转换字段名
        responsesList.value = data.map(item => ({
          id: item.id,
          submittedAt: new Date(item.created_at).toLocaleString(),
          submittedBy: item.respondent,
          // 注意：这里answers字段暂时是空的，会在查看详情时加载
          answers: []
        }));
        totalResponses.value = data.length; // 这里没有分页信息，暂用数组长度
      } else {
        // 如果后端返回了预期的对象格式
        responsesList.value = Array.isArray(data.items) ? data.items : [];
        totalResponses.value = data.total || 0;
      }
      
      console.log('处理后的回答数据:', responsesList.value);
    } else {
      ElMessage.error('加载问卷回答失败')
    }
  } catch (error) {
    console.error('加载问卷回答失败:', error)
    ElMessage.error('加载问卷回答失败，请检查网络连接')
  } finally {
    isLoading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  loadResponses(page)
}

// 查看回答详情
const viewResponseDetail = async (response: Response) => {
  try {
    // 如果回答没有详细内容，需要先加载
    if (!response.answers || response.answers.length === 0) {
      const detailResponse = await axios.get(`/api/responses/${response.id}`);
      const { code, data } = detailResponse.data;
      
      if (code === 200 && data) {
        console.log('加载的回答详情:', data);
        
        // 转换后端数据格式为前端格式
        const formattedAnswers = data.answers.map((answer: any) => ({
          questionId: answer.question_id,
          question: answer.question_title,
          type: answer.question_type,
          value: answer.question_type === 'checkbox' 
            ? (answer.selected_options || []) 
            : (answer.text_value || answer.selected_options?.[0] || '')
        }));
        
        // 更新响应对象
        response.answers = formattedAnswers;
      } else {
        ElMessage.error('加载回答详情失败');
        return;
      }
    }
    
    currentResponse.value = response;
    showDetailDialog.value = true;
  } catch (error) {
    console.error('加载回答详情失败:', error);
    ElMessage.error('加载回答详情失败，请检查网络连接');
  }
}

// 获取问题标题
const getQuestionTitle = (questionId: number): string => {
  const response = currentResponse.value
  if (!response) return ''
  
  const answer = response.answers.find(a => a.questionId === questionId)
  return answer ? answer.question : ''
}

// 格式化回答值
const formatAnswerValue = (answer: Answer) => {
  if (answer.type === 'checkbox' && Array.isArray(answer.value)) {
    return answer.value.join(', ')
  }
  return answer.value
}

onMounted(() => {
  if (userStore.isLoggedIn()) {
    loadResponses()
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})
</script>

<template>
  <div class="responses-container">
    <div class="page-header">
      <el-button 
        type="primary" 
        :icon="ArrowLeft" 
        @click="goBack" 
        class="back-button"
      >
        返回列表
      </el-button>
      <h2 v-if="title">{{ title }} - 回答列表</h2>
    </div>
    
    <el-card v-if="isLoading" class="loading-card">
      <el-skeleton :rows="10" animated />
    </el-card>
    
    <template v-else>
      <el-empty v-if="responsesList.length === 0" description="暂无回答数据" />
      
      <div v-else class="responses-list">
        <el-table :data="responsesList" border style="width: 100%">
          <el-table-column prop="id" label="回答ID" width="180" />
          <el-table-column prop="submittedAt" label="提交时间" width="180" />
          <el-table-column prop="submittedBy" label="提交者" width="150">
            <template #default="{ row }">
              {{ row.submittedBy || '匿名用户' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="viewResponseDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-if="totalResponses > pageSize"
            background
            layout="prev, pager, next"
            :total="totalResponses"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </div>
      
      <!-- 回答详情对话框 -->
      <el-dialog
        v-model="showDetailDialog"
        title="回答详情"
        width="60%"
      >
        <div v-if="currentResponse" class="response-detail">
          <div class="response-meta">
            <p><strong>提交时间：</strong> {{ currentResponse.submittedAt }}</p>
            <p><strong>提交者：</strong> {{ currentResponse.submittedBy || '匿名用户' }}</p>
          </div>
          
          <div class="response-answers">
            <el-card v-for="(answer, index) in currentResponse.answers" :key="index" class="answer-card">
              <template #header>
                <div class="answer-header">
                  <span class="question-number">{{ index + 1 }}</span>
                  <h4>{{ answer.question }}</h4>
                </div>
              </template>
              <div class="answer-content">
                {{ formatAnswerValue(answer) }}
              </div>
            </el-card>
          </div>
        </div>
      </el-dialog>
    </template>
  </div>
</template>

<style scoped>
.responses-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 0 20px;
}

.loading-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.response-meta {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.answer-card {
  margin-bottom: 15px;
}

.answer-header {
  display: flex;
  align-items: center;
}

.question-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #409eff;
  color: white;
  font-size: 14px;
  margin-right: 10px;
}

.answer-content {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style> 