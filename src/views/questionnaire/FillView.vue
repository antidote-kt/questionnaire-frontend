<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

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

const questionnaireId = ref('')
const questionnaire = ref<QuestionnaireData | null>(null)
const isLoading = ref(true)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const userInfo = ref(null)

// 表单数据
const answers = ref<Answer[]>([])

// 加载用户信息
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
  }
}

// 加载问卷数据
const loadQuestionnaire = async () => {
  isLoading.value = true
  showError.value = false
  try {
    // 模拟API调用数据
    // TODO: 替换为实际的API调用
    questionnaire.value = {
      id: questionnaireId.value,
      title: '示例问卷',
      description: '这是一个示例问卷描述',
      questions: [
        {
          id: 1,
          type: 'text',
          title: '您的姓名',
          required: true
        },
        {
          id: 2,
          type: 'radio',
          title: '您的性别',
          required: true,
          options: ['男', '女']
        },
        {
          id: 3,
          type: 'checkbox',
          title: '您的兴趣爱好',
          required: false,
          options: ['阅读', '运动', '音乐', '旅行']
        }
      ]
    }

    // 初始化答案数组
    answers.value = questionnaire.value.questions.map(q => ({
      questionId: q.id,
      type: q.type,
      value: q.type === 'checkbox' ? [] : ''
    }))

    isLoading.value = false
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
    // 这里应该替换为实际的API调用
    await axios.post(`/api/questionnaires/${questionnaireId.value}/responses`, {
      answers: answers.value
    })

    // 提交成功
    showSuccess.value = true
    ElMessage.success('问卷提交成功！感谢您的参与。')

  } catch (error) {
    console.error('提交回答失败:', error)
    ElMessage.error('提交回答失败，请稍后重试')
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