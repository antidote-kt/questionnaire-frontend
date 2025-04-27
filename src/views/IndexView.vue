<script setup lang="ts">
import { ref, onMounted } from 'vue'
// 导入Element Plus图标
import { Delete, Plus, Document, Search, Edit, DataAnalysis } from '@element-plus/icons-vue'

// 用户信息
const userInfo = ref(null)

// 标签页控制
const activeTab = ref('create')

// 问卷创建相关
const title = ref('')
const description = ref('')
const isPublic = ref(false)
const questions = ref([])

// 问卷列表
const publicQuestionnaires = ref([])
const myQuestionnaires = ref([])

// 问卷结果相关
const selectedQuestionnaireId = ref('')
const myQuestionnaireOptions = ref([])
const responses = ref([])
const isLoadingResults = ref(false)

// 加载用户信息
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
  }
}

// 添加问题
const addQuestion = () => {
  questions.value.push({
    id: Date.now(),
    type: 'text',
    title: '',
    required: true,
    options: []
  })
}

// 提交问卷
const submitQuestionnaire = () => {
  // 这里应该替换为实际的API调用
  console.log('提交问卷', {
    title: title.value,
    description: description.value,
    isPublic: isPublic.value,
    questions: questions.value
  })
  
  // 重置表单
  title.value = ''
  description.value = ''
  isPublic.value = false
  questions.value = []
}

// 加载公开问卷
const loadPublicQuestionnaires = () => {
  // 模拟数据
  publicQuestionnaires.value = [
    { id: 1, title: '用户满意度调查', description: '了解用户对我们服务的满意程度', creator: '管理员' },
    { id: 2, title: '产品反馈问卷', description: '收集用户对新产品的反馈意见', creator: '产品部' }
  ]
}

// 加载我的问卷
const loadMyQuestionnaires = () => {
  // 模拟数据
  myQuestionnaires.value = [
    { id: 3, title: '我的调查问卷', description: '个人创建的调查问卷', responseCount: 5 },
    { id: 4, title: '团队满意度', description: '团队成员满意度调查', responseCount: 8 }
  ]
  
  // 同时更新问卷结果选项
  myQuestionnaireOptions.value = myQuestionnaires.value.map(q => ({
    value: q.id,
    text: q.title
  }))
}

// 加载问卷回答
const loadResponses = () => {
  if (!selectedQuestionnaireId.value) return
  
  isLoadingResults.value = true
  
  // 模拟加载数据
  setTimeout(() => {
    responses.value = [
      { id: 1, respondent: '匿名用户', submitTime: '2024-01-15 14:30', answers: [{question: '您对我们的服务满意吗?', answer: '非常满意'}] },
      { id: 2, respondent: '匿名用户', submitTime: '2024-01-16 09:45', answers: [{question: '您对我们的服务满意吗?', answer: '一般'}] }
    ]
    isLoadingResults.value = false
  }, 1000)
}

// 监听问卷选择变化
const handleQuestionnaireSelect = () => {
  if (selectedQuestionnaireId.value) {
    loadResponses()
    document.getElementById('responses-container').style.display = 'block'
  } else {
    document.getElementById('responses-container').style.display = 'none'
  }
}

onMounted(() => {
  loadUserInfo()
  loadPublicQuestionnaires()
  loadMyQuestionnaires()
})
</script>

<template>
  <div class="index-container">
    <header class="page-header">
      <h1 class="page-title">问卷星</h1>
      <div v-if="userInfo" class="user-info">
        欢迎，{{ userInfo.nickname || userInfo.username }}
        <el-button size="small" @click="localStorage.removeItem('user'); localStorage.removeItem('token'); location.reload()">
          退出登录
        </el-button>
      </div>
      <div v-else class="user-info">
        <router-link to="/login">
          <el-button type="primary">登录</el-button>
        </router-link>
        <router-link to="/register">
          <el-button>注册</el-button>
        </router-link>
      </div>
    </header>

    <div class="dashboard">
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="创建问卷" name="create">
          <div id="create-app">
            <h2 class="section-title">创建新问卷</h2>
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
                <el-button type="success" @click="submitQuestionnaire" :disabled="!userInfo">提交问卷</el-button>
                <el-alert
                  v-if="!userInfo"
                  title="请先登录后再创建问卷"
                  type="warning"
                  show-icon
                >
                  <router-link to="/login" class="login-link">立即登录</router-link>
                </el-alert>
              </div>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 查看问卷 -->
        <el-tab-pane label="查看问卷" name="public">
          <div id="public-app">
            <h2 class="section-title">公开问卷</h2>
            <el-row :gutter="20" class="questionnaire-list">
              <el-col :xs="24" :sm="12" :md="8" v-for="questionnaire in publicQuestionnaires" :key="questionnaire.id" class="questionnaire-col">
                <el-card class="questionnaire-card">
                  <h5 class="card-title">{{ questionnaire.title }}</h5>
                  <p class="card-text">{{ questionnaire.description }}</p>
                  <p class="text-secondary">创建者: {{ questionnaire.creator }}</p>
                  <div class="card-actions">
                    <router-link :to="`/fill/${questionnaire.id}`">
                      <el-button type="primary" :icon="Document">填写问卷</el-button>
                    </router-link>
                  </div>
                </el-card>
              </el-col>
              <el-empty v-if="publicQuestionnaires.length === 0" description="暂无公开问卷" />
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 我的问卷 -->
        <el-tab-pane label="我的问卷" name="my">
          <div id="my-app">
            <h2 class="section-title">我的问卷</h2>
            <el-alert
              v-if="!userInfo"
              title="请先登录后查看您的问卷"
              type="warning"
              show-icon
            >
              <router-link to="/login" class="login-link">立即登录</router-link>
            </el-alert>
            <el-row v-else :gutter="20" class="questionnaire-list">
              <el-col :xs="24" :sm="12" :md="8" v-for="questionnaire in myQuestionnaires" :key="questionnaire.id" class="questionnaire-col">
                <el-card class="questionnaire-card">
                  <h5 class="card-title">{{ questionnaire.title }}</h5>
                  <p class="card-text">{{ questionnaire.description }}</p>
                  <p class="text-secondary">回答数: {{ questionnaire.responseCount }}</p>
                  <div class="card-actions">
                    <router-link :to="`/fill/${questionnaire.id}`">
                      <el-button type="primary" :icon="Search">查看问卷</el-button>
                    </router-link>
                    <el-button type="danger" :icon="Delete" plain>删除</el-button>
                  </div>
                </el-card>
              </el-col>
              <el-empty 
                v-if="myQuestionnaires.length === 0" 
                description="您还没有创建问卷"
              >
                <el-button type="primary" @click="activeTab = 'create'">创建问卷</el-button>
              </el-empty>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 查看详细数据 -->
        <el-tab-pane label="查看详细数据" name="results">
          <div id="results-app">
            <h2 class="section-title">我的问卷结果</h2>
            <el-alert
              v-if="!userInfo"
              title="请先登录后查看问卷结果"
              type="warning"
              show-icon
            >
              <router-link to="/login" class="login-link">立即登录</router-link>
            </el-alert>
            <div v-else>
              <el-skeleton :loading="isLoadingResults" animated>
                <template #template>
                  <el-skeleton-item variant="p" style="width: 100%" />
                  <el-skeleton-item variant="text" style="margin-right: 16px" />
                  <el-skeleton-item variant="p" style="width: 100%" />
                  <el-skeleton-item variant="text" style="margin-right: 16px" />
                </template>
                <template #default>
                  <el-form-item label="选择问卷" class="questionnaire-select">
                    <el-select v-model="selectedQuestionnaireId" @change="handleQuestionnaireSelect" placeholder="请选择问卷" style="width: 100%">
                      <el-option value="" label="-- 请选择 --" />
                      <el-option v-for="option in myQuestionnaireOptions" :key="option.value" :value="option.value" :label="option.text" />
                    </el-select>
                  </el-form-item>
                  
                  <div id="responses-container" v-show="selectedQuestionnaireId" class="responses-section">
                    <h3 class="subsection-title">回答列表</h3>
                    <el-alert
                      v-if="responses.length === 0"
                      title="该问卷暂无回答数据"
                      type="info"
                      show-icon
                    />
                    <div v-else id="responses-list" class="responses-grid">
                      <el-card v-for="response in responses" :key="response.id" class="response-card" shadow="hover">
                        <template #header>
                          <div class="response-header">
                            <span class="respondent-name">{{ response.respondent }}</span>
                            <span class="submit-time">{{ response.submitTime }}</span>
                          </div>
                        </template>
                        <div v-for="(answer, index) in response.answers" :key="index" class="answer-item">
                          <div class="question-text">{{ answer.question }}</div>
                          <div class="answer-text">{{ answer.answer }}</div>
                        </div>
                      </el-card>
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <footer class="mt-5 text-center text-muted">
      <p>&copy; 2024 问卷星 - 基于Rocket框架的问卷系统</p>
    </footer>
  </div>
</template>

<style scoped>
.index-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.page-title {
  margin: 0;
  color: var(--el-color-primary);
}

.dashboard {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.main-tabs {
  margin-bottom: 20px;
}

.section-title {
  margin-bottom: 24px;
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

.questionnaire-list {
  margin-top: 20px;
}

.questionnaire-col {
  margin-bottom: 20px;
}

.questionnaire-card {
  height: 100%;
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}

.questionnaire-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-title {
  margin: 0 0 10px;
  font-size: 1.2rem;
  color: var(--el-text-color-primary);
}

.card-text {
  color: var(--el-text-color-regular);
  margin-bottom: 15px;
}

.card-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
}

.questionnaire-select {
  margin: 20px 0;
  max-width: 400px;
}

.responses-section {
  margin-top: 30px;
}

.responses-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  margin-top: 20px;
}

.response-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.response-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.respondent-name {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.submit-time {
  color: var(--el-text-color-secondary);
  font-size: 0.9em;
}

.answer-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.answer-item:last-child {
  border-bottom: none;
}

.question-text {
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.answer-text {
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.login-link {
  color: var(--el-color-primary);
  text-decoration: none;
  margin-left: 5px;
}

.login-link:hover {
  text-decoration: underline;
}

footer {
  margin-top: 40px;
  padding: 20px;
  text-align: center;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>