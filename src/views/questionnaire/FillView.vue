<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../../stores/user'

// 定义用户信息类型
interface UserInfo {
  id: number
  username: string
  nickname: string
  email?: string
}

interface Question {
  id: number
  type: 'text' | 'radio' | 'checkbox'
  title: string
  required: boolean
  options?: string[]
}

interface QuestionnaireData {
  id: string
  title: string
  description: string
  questions: Question[]
}

interface Answer {
  questionId: number
  type: string
  value: string | string[]
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const questionnaireId = ref('')
const questionnaire = ref<QuestionnaireData | null>(null)
const isLoading = ref(true)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const userInfo = ref<UserInfo | null>(null)

// 表单数据
const answers = ref<Answer[]>([])

// 加载用户信息
const loadUserInfo = () => {
  // 从localStorage加载用户信息
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
  }
  
  // 同时也检查userStore中的登录状态
  if (userStore.isLoggedIn()) {
    // 如果用户已登录，确保userInfo包含用户数据
    if (!userInfo.value && userStore.userInfo) {
      userInfo.value = userStore.userInfo
    }
    console.log('用户已登录:', userInfo.value)
  } else {
    console.log('用户未登录')
  }
}

// 加载问卷数据
const loadQuestionnaire = async () => {
  isLoading.value = true
  showError.value = false
  try {
    const response = await axios.get(`/api/questionnaires/${questionnaireId.value}`)
    const { code, data } = response.data
    
    if (code === 200 && data) {
      questionnaire.value = data
      
      // 初始化答案数组
      if (questionnaire.value && questionnaire.value.questions) {
        answers.value = questionnaire.value.questions.map(q => ({
          questionId: q.id,
          type: q.type,
          value: q.type === 'checkbox' ? [] : ''
        }))
      }
      
      isLoading.value = false
    } else {
      throw new Error('加载问卷失败')
    }
  } catch (error) {
    console.error('加载问卷失败:', error)
    isLoading.value = false
    showError.value = true
    errorMessage.value = '加载问卷失败，请稍后重试'
    ElMessage.error('加载问卷失败，请稍后重试')
  }
}

// 提交问卷回答
const submitResponse = async () => {
  if (!questionnaire.value) return
  
  // 验证必填项
  const invalidQuestions: string[] = []
  questionnaire.value.questions.forEach((q, index) => {
    if (q.required) {
      const answer = answers.value[index]
      if (
        (q.type === 'text' && !answer.value) ||
        (q.type === 'radio' && !answer.value) ||
        (q.type === 'checkbox' && Array.isArray(answer.value) && answer.value.length === 0)
      ) {
        invalidQuestions.push(q.title)
      }
    }
  })

  if (invalidQuestions.length > 0) {
    ElMessage.warning(`请完成以下必填问题：${invalidQuestions.join(', ')}`)
    return
  }

  try {
    // 将前端的回答格式转换为后端期望的格式
    const formattedAnswers = questionnaire.value.questions.map((question, index) => {
      const answer = answers.value[index];
      if (question.type === 'text') {
        return {
          question_id: question.id,
          answer_type: 'text',
          text_value: answer.value
        };
      } else if (question.type === 'radio') {
        return {
          question_id: question.id,
          answer_type: 'option',
          option_values: [answer.value]
        };
      } else if (question.type === 'checkbox') {
        return {
          question_id: question.id,
          answer_type: 'options',
          option_values: answer.value
        };
      }
    });

    const requestData = {
      questionnaire_id: parseInt(questionnaireId.value),
      answers: formattedAnswers
    };

    console.log('提交的数据格式:', requestData);
    
    // 根据用户登录状态选择不同的API路径
    const apiUrl = userInfo.value 
      ? '/api/responses/submit/auth'  // 已登录用户路径
      : '/api/responses/submit';      // 匿名用户路径
    
    const response = await axios.post(apiUrl, requestData);
    
    const { code, message } = response.data
    
    if (code === 200) {
      // 提交成功
      showSuccess.value = true
      ElMessage.success(message || '问卷提交成功！感谢您的参与。')
    } else {
      ElMessage.error(message || '提交失败，请稍后重试')
    }
  } catch (error: any) {
    console.error('提交回答失败:', error);
    
    // 显示详细的错误信息
    if (error.response) {
      // 检查是否为验证错误（422状态码）
      if (error.response.status === 422 || error.response.status === 400) {
        // 处理验证错误，包括重复提交的情况
        const errorMessage = error.response.data?.message || '表单验证失败';
        ElMessage.error(errorMessage);
      } else if (error.response.data) {
        // 其他有响应数据的错误
        const errorMsg = error.response.data.message || error.response.data;
        ElMessage.error(`提交失败: ${errorMsg}`);
      } else {
        // 没有响应数据的错误
        ElMessage.error(`提交失败: ${error.response.statusText}`);
      }
    } else {
      // 网络错误或其他错误
      ElMessage.error(error.message || '提交失败，请检查网络连接');
    }
  }
}

onMounted(() => {
  loadUserInfo()
  questionnaireId.value = route.params.id as string
  if (questionnaireId.value) {
    loadQuestionnaire()
  } else {
    isLoading.value = false
    showError.value = true
    errorMessage.value = '问卷ID无效'
  }
})
</script>

<template>
  <div class="questionnaire-fill">
    <div v-if="isLoading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>
    
    <div v-else-if="showError" class="error-container">
      <el-result
        icon="error"
        title="加载失败"
        :sub-title="errorMessage"
      >
        <template #extra>
          <el-button type="primary" @click="router.go(-1)">返回</el-button>
        </template>
      </el-result>
    </div>
    
    <div v-else-if="showSuccess" class="success-container">
      <el-result
        icon="success"
        title="提交成功"
        sub-title="感谢您的参与！"
      >
        <template #extra>
          <el-button type="primary" @click="router.push('/questionnaire/public')">返回公开问卷</el-button>
        </template>
      </el-result>
    </div>
    
    <div v-else-if="questionnaire" class="questionnaire-container">
      <el-card class="questionnaire-header">
        <h2 class="questionnaire-title">{{ questionnaire.title }}</h2>
        <p class="questionnaire-description">{{ questionnaire.description }}</p>
      </el-card>
      
      <div class="questions-container">
        <el-card v-for="(question, index) in questionnaire.questions" :key="question.id" class="question-card">
          <div class="question-header">
            <span class="question-index">{{ index + 1 }}</span>
            <h3 class="question-title">{{ question.title }}</h3>
            <span v-if="question.required" class="required-mark">*</span>
          </div>
          
          <!-- 文本题 -->
          <el-input
            v-if="question.type === 'text'"
            v-model="answers[index].value"
            placeholder="请输入您的回答"
            :maxlength="200"
            show-word-limit
          />
          
          <!-- 单选题 -->
          <el-radio-group
            v-else-if="question.type === 'radio'"
            v-model="answers[index].value"
          >
            <el-radio
              v-for="option in question.options"
              :key="option"
              :label="option"
              border
            >{{ option }}</el-radio>
          </el-radio-group>
          
          <!-- 多选题 -->
          <el-checkbox-group
            v-else-if="question.type === 'checkbox'"
            v-model="answers[index].value"
          >
            <el-checkbox
              v-for="option in question.options"
              :key="option"
              :label="option"
              border
            >{{ option }}</el-checkbox>
          </el-checkbox-group>
        </el-card>
      </div>
      
      <div class="form-actions">
        <el-button @click="router.go(-1)">取消</el-button>
        <el-button type="primary" @click="submitResponse">提交</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.questionnaire-fill {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container, .error-container, .success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.questionnaire-header {
  margin-bottom: 20px;
}

.questionnaire-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.questionnaire-description {
  color: #666;
  margin-bottom: 0;
}

.questions-container {
  margin-bottom: 20px;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.question-index {
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

.question-title {
  font-size: 16px;
  font-weight: normal;
  margin: 0;
}

.required-mark {
  color: #f56c6c;
  margin-left: 5px;
}

.el-radio, .el-checkbox {
  margin-right: 20px;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>