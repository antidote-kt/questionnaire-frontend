<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

// 返回问卷列表
const goBack = () => {
  router.push('/questionnaire/my')
}

// 定义问卷结果数据结构
interface QuestionnaireResult {
  id: number
  title: string
  totalResponses: number
  questions: Array<{
    question: string
    type: string
    options?: Array<{
      label: string
      count: number
    }>
    textResponses?: string[]
  }>
}

// 模拟问卷结果数据
const questionnaireResult = ref<QuestionnaireResult>({
  id: 1,
  title: '用户满意度调查',
  totalResponses: 120,
  questions: [
    {
      question: '您对我们的产品总体满意度如何？',
      type: 'single-choice',
      options: [
        { label: '非常满意', count: 45 },
        { label: '满意', count: 35 },
        { label: '一般', count: 25 },
        { label: '不满意', count: 10 },
        { label: '非常不满意', count: 5 }
      ]
    },
    {
      question: '您最喜欢产品的哪些功能？（多选）',
      type: 'multiple-choice',
      options: [
        { label: '界面设计', count: 80 },
        { label: '易用性', count: 75 },
        { label: '功能完整性', count: 60 },
        { label: '性能', count: 50 },
        { label: '客户支持', count: 30 }
      ]
    },
    {
      question: '您对产品有什么建议？',
      type: 'text',
      textResponses: [
        '希望能增加更多自定义功能',
        '界面可以更简洁一些',
        '希望有更多数据分析功能'
      ]
    }
  ]
})

// 计算选项题的百分比
const calculatePercentage = (count: number): string => {
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
      <!-- Removed duplicate title -->
      <p class="total-responses">
        总回复数：{{ questionnaireResult.totalResponses }}
      </p>
    </div>

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
                  :percentage="(row.count / questionnaireResult.totalResponses) * 100"
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