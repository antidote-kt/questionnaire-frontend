<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoading = ref(true)

// 返回问卷列表
const goBack = () => {
  router.push('/questionnaire/my')
}

// 定义问卷结果数据结构
interface QuestionnaireResult {
  id: string
  title: string
  totalResponses: number
  questions: Array<{
    id: number
    question: string
    type: string
    options?: Array<{
      label: string
      count: number
    }>
    textResponses?: string[]
  }>
}

// 问卷结果数据
const questionnaireResult = ref<QuestionnaireResult | null>(null)

// 加载问卷结果
const loadQuestionnaireResults = async () => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('无效的问卷ID')
    router.push('/questionnaire/my')
    return
  }
  
  isLoading.value = true
  console.log('开始加载问卷结果，ID:', id);
  
  try {
    const response = await axios.get(`/api/responses/questionnaires/${id}/statistics`)
    console.log('收到后端响应:', response.data);
    const { code, data } = response.data
    
    if (code === 200 && data) {
      questionnaireResult.value = {
        id: data.questionnaire_id.toString(),
        title: data.title,
        totalResponses: data.response_count,
        questions: data.questions.map((q: any) => ({
          id: q.question_id,
          question: q.title,
          type: q.question_type === 'radio' ? 'single-choice' : 
                q.question_type === 'checkbox' ? 'multiple-choice' : 'text',
          options: q.option_counts ? q.option_counts.map((opt: any) => ({
            label: opt.option_text,
            count: opt.count
          })) : undefined,
          textResponses: q.text_responses
        }))
      };
      
      console.log('处理后的结果数据:', questionnaireResult.value);
    } else {
      console.error('加载问卷结果失败，返回码:', code, '返回消息:', response.data.message);
      ElMessage.error('加载问卷结果失败')
    }
  } catch (error: any) {
    console.error('加载问卷结果失败:', error);
    // 输出详细的错误信息
    if (error.response) {
      console.error('错误响应状态:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    }
    ElMessage.error(`加载问卷结果失败: ${error.message || '未知错误'}`)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (userStore.isLoggedIn()) {
    loadQuestionnaireResults()
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})

// 计算选项题的百分比
const calculatePercentage = (count: number): string => {
  if (!questionnaireResult.value || questionnaireResult.value.totalResponses === 0) {
    return '0%'
  }
  return ((count / questionnaireResult.value.totalResponses) * 100).toFixed(1) + '%'
}
</script>

<template>
  <div class="results-container">
    <div class="page-header">
      <el-button 
        type="primary" 
        :icon="ArrowLeft" 
        @click="goBack" 
        class="back-button"
      >
        返回列表
      </el-button>
    </div>
    
    <el-card v-if="isLoading" class="loading-card">
      <el-skeleton :rows="10" animated />
    </el-card>
    
    <template v-else-if="questionnaireResult">
      <h2>{{ questionnaireResult.title }}</h2>
      <p class="total-responses">
        总回复数：{{ questionnaireResult.totalResponses }}
      </p>

      <div class="questions-results">
        <div
          v-for="(question, index) in questionnaireResult.questions"
          :key="index"
          class="question-result"
        >
          <h3>{{ question.question }}</h3>

          <!-- 选择题结果 -->
          <template v-if="question.type === 'single-choice' || question.type === 'multiple-choice'">
            <el-table :data="question.options" style="width: 100%">
              <el-table-column prop="label" label="选项" />
              <el-table-column prop="count" label="选择人数" width="120" />
              <el-table-column label="占比" width="120">
                <template #default="{ row }">
                  {{ calculatePercentage(row.count) }}
                </template>
              </el-table-column>
              <el-table-column label="分布" min-width="200">
                <template #default="{ row }">
                  <el-progress
                    :percentage="questionnaireResult && questionnaireResult.totalResponses > 0 ? (row.count / questionnaireResult.totalResponses) * 100 : 0"
                    :format="() => row.count"
                  />
                </template>
              </el-table-column>
            </el-table>
          </template>

          <!-- 文本题结果 -->
          <template v-else-if="question.type === 'text'">
            <el-card class="text-responses" shadow="never">
              <template v-if="question.textResponses && question.textResponses.length > 0">
                <div
                  v-for="(response, rIndex) in question.textResponses"
                  :key="rIndex"
                  class="text-response-item"
                >
                  {{ response }}
                </div>
              </template>
              <template v-else>
                <el-empty description="暂无回复" />
              </template>
            </el-card>
          </template>
        </div>
      </div>
    </template>
    
    <el-empty v-else description="暂无问卷数据" />
  </div>
</template>

<style scoped>
.results-container {
  padding: 20px;
}

.back-button {
  margin-bottom: 16px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px 0;
}

.total-responses {
  color: #666;
  margin: 0;
}

.question-result {
  margin-bottom: 30px;
}

.question-result h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 15px 0;
}

.text-responses {
  background-color: #f8f9fa;
}

.text-response-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.text-response-item:last-child {
  border-bottom: none;
}
</style>