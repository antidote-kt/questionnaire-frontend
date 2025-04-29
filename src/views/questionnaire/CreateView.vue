<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 导入Element Plus图标
import { Delete, Plus, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../../stores/user'

interface Question {
  id: number;
  type: 'text' | 'radio' | 'checkbox'; // 限定为特定类型
  title: string;
  required: boolean;
  options: string[]; // 选项是字符串数组
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 获取用户登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn())

// 问卷创建相关
const title = ref('')
const description = ref('')
const isPublic = ref(false)
const questions = ref<Question[]>([]); // 明确类型为 Question[]
const isEditing = ref(false)
const isLoading = ref(false)

// 返回问卷列表
const goBack = () => {
  router.push('/questionnaire/my')
}

// 加载问卷数据
const loadQuestionnaireData = async () => {
  const id = route.params.id
  if (id) {
    isEditing.value = true
    isLoading.value = true
    
    try {
      const response = await axios.get(`/api/questionnaires/${id}`)
      const { code, data } = response.data
      
      if (code === 200 && data) {
        title.value = data.title
        description.value = data.description
        isPublic.value = data.is_public
        
        // 转换问题数据以匹配前端格式
        questions.value = (data.questions || []).map((q: any) => ({
          id: q.id,
          title: q.title,
          type: q.type || q.question_type, // 兼容两种字段名
          required: q.required,
          options: q.options || []
        }))
        
        console.log('加载的问卷数据:', data)
      } else {
        ElMessage.error('加载问卷失败')
      }
    } catch (error) {
      console.error('加载问卷失败:', error)
      ElMessage.error('加载问卷失败，请检查网络连接')
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  if (isEditing.value || isLoggedIn.value) {
    loadQuestionnaireData()
  } else if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再创建问卷')
    router.push('/login')
  }
})

// 添加问题
const addQuestion = () => {
  questions.value.push({
    id: Math.floor(Math.random() * 1000000), // 使用较小的随机数替代Date.now()
    type: 'text',
    title: '',
    required: true,
    options: []
  })
}

// 提交问卷
const submitQuestionnaire = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再创建问卷')
    router.push('/login')
    return
  }
  
  if (!title.value) {
    ElMessage.warning('请输入问卷标题')
    return
  }
  
  try {
    isLoading.value = true
    
    const questionnaireData = {
      title: title.value,
      description: description.value,
      is_public: isPublic.value,
      questions: questions.value.map(q => ({
        //id : q.id,
        title: q.title,
        type: q.type,
        required: q.required,
        options: q.options || []
      }))
    }
    
    // 在发送请求前打印数据
    console.log('发送的问卷数据:', JSON.stringify(questionnaireData))
    
    let response
    
    if (isEditing.value) {
      response = await axios.put(`/api/questionnaires/${route.params.id}`, questionnaireData)
    } else {
      response = await axios.post('/api/questionnaires', questionnaireData)
    }
    
    const { code, message, data } = response.data
    
    if (code === 200) {
      ElMessage.success(message || '保存成功')
      
      // 重置表单
      if (!isEditing.value) {
        title.value = ''
        description.value = ''
        isPublic.value = false
        questions.value = []
      }
      
      // 跳转到我的问卷页面
      router.push('/questionnaire/my')
    } else {
      ElMessage.error(message || '保存失败')
    }
  } catch (error) {
    console.error('提交问卷失败:', error)
    ElMessage.error('提交失败，请检查网络连接')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div id="create-app">
    <div class="page-header">
      <el-button 
        v-if="isEditing"
        type="primary" 
        :icon="ArrowLeft" 
        @click="goBack" 
        class="back-button"
      >
        返回列表
      </el-button>
      <!-- Removed duplicate title -->
    </div>
    <el-form @submit.native.prevent="submitQuestionnaire" class="questionnaire-form">
      <el-form-item label="问卷标题">
        <el-input v-model="title" placeholder="请输入问卷标题" />
      </el-form-item>
      <el-form-item label="问卷描述">
        <el-input v-model="description" type="textarea" :rows="3" placeholder="请输入问卷描述" />
      </el-form-item>
      <el-form-item>
        <el-switch v-model="isPublic" active-text="公开问卷" inactive-text="私有问卷" />
      </el-form-item>

      <h3 class="subsection-title">问题列表</h3>
      <div id="questions-container">
        <el-card v-for="(question, index) in questions" :key="question.id" class="question-card">
          <el-form-item label="问题标题">
            <el-input v-model="question.title" placeholder="请输入问题标题" />
          </el-form-item>
          <el-form-item label="问题类型">
            <el-select v-model="question.type" placeholder="请选择问题类型" style="width: 100%">
              <el-option label="文本" value="text" />
              <el-option label="单选" value="radio" />
              <el-option label="多选" value="checkbox" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-switch v-model="question.required" active-text="必填" inactive-text="选填" />
          </el-form-item>
          
          <!-- 选项（仅对单选和多选显示） -->
          <div v-if="question.type === 'radio' || question.type === 'checkbox'">
            <h5 class="options-title">选项</h5>
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
              <el-input v-model="question.options[optIndex]" placeholder="选项文本" class="option-input" />
              <el-button type="danger" @click="question.options.splice(optIndex, 1)" :icon="Delete" circle />
            </div>
            <el-button type="primary" plain size="small" @click="question.options.push('')" class="add-option-btn">添加选项</el-button>
          </div>
          
          <div class="question-actions">
            <el-button type="danger" @click="questions.splice(index, 1)">删除问题</el-button>
          </div>
        </el-card>
      </div>
      
      <el-button type="primary" @click="addQuestion" class="add-question-btn">添加问题</el-button>
      
      <div class="form-actions">
        <el-button type="success" @click="submitQuestionnaire">{{ isEditing ? '保存修改' : '提交问卷' }}</el-button>
        <el-alert
          v-if="!isLoggedIn"
          title="请先登录后再创建问卷"
          type="warning"
          show-icon
        >
          <router-link to="/login" class="login-link">立即登录</router-link>
        </el-alert>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  margin-right: 8px;
}

.section-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 1.5rem;
}

.subsection-title {
  margin: 20px 0;
  color: var(--el-text-color-regular);
  font-size: 1.2rem;
}

.questionnaire-form {
  max-width: 800px;
  margin: 0 auto;
}

.question-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-input {
  flex: 1;
  margin-right: 10px;
}

.add-option-btn {
  margin-bottom: 15px;
}

.add-question-btn {
  margin: 20px 0;
}

.login-link {
  color: var(--el-color-primary);
  text-decoration: none;
  margin-left: 5px;
}

.login-link:hover {
  text-decoration: underline;
}
</style>