<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getCurrentModel, predict, type PredictionRequest, type PredictionResponse } from "@/api/model";

defineOptions({
  name: "ModelAnalysis"
});

const loading = ref(false);
const currentModel = ref<string>("");

const formData = ref<PredictionRequest>({
  title: "",
  location: "",
  department: "",
  salaryRange: "",
  companyProfile: "",
  description: "",
  requirements: "",
  benefits: "",
  telecommuting: 0,
  hasCompanyLogo: 0,
  hasQuestions: 0,
  employmentType: "",
  requiredExperience: "",
  requiredEducation: "",
  industry: "",
  function: ""
});

const predictionResult = ref<PredictionResponse | null>(null);
const showResult = ref(false);

// 雇用类型选项
const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Other"
];

// 所需经验选项
const experienceLevels = [
  "Entry level",
  "Mid-Senior level",
  "Executive",
  "Associate",
  "Director",
  "Internship",
  "Not Applicable"
];

// 学历要求选项
const educationLevels = [
  "Bachelor's Degree",
  "Master's Degree",
  "Associate Degree",
  "Doctorate",
  "High School or equivalent",
  "Certification",
  "Professional",
  "Some College Coursework Completed",
  "Some High School Coursework",
  "Unspecified",
  "Vocational",
  "Vocational - Degree",
  "Vocational - HS Diploma"
];

// 常见行业
const industries = [
  "Computer Software",
  "Information Technology and Services",
  "Internet",
  "Financial Services",
  "Healthcare",
  "Education Management",
  "Marketing and Advertising",
  "Consumer Services",
  "Telecommunications"
];

const handlePredict = async () => {
  // 基本验证
  if (!formData.value.title || !formData.value.location || !formData.value.description) {
    ElMessage.warning("请至少填写职位标题、位置和描述");
    return;
  }

  loading.value = true;
  showResult.value = false;

  try {
    const res = await predict(formData.value);
    if (res.success && res.data) {
      predictionResult.value = res.data;
      showResult.value = true;
      ElMessage.success("预测完成");
    } else {
      ElMessage.error(res.message || "预测失败");
    }
  } catch (error: any) {
    ElMessage.error(error.message || "预测失败");
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formData.value = {
    title: "",
    location: "",
    department: "",
    salaryRange: "",
    companyProfile: "",
    description: "",
    requirements: "",
    benefits: "",
    telecommuting: 0,
    hasCompanyLogo: 0,
    hasQuestions: 0,
    employmentType: "",
    requiredExperience: "",
    requiredEducation: "",
    industry: "",
    function: ""
  };
  predictionResult.value = null;
  showResult.value = false;
};

const loadCurrentModel = async () => {
  try {
    const res = await getCurrentModel();
    if (res.success) {
      currentModel.value = res.data;
    }
  } catch (error) {
    // 忽略错误
  }
};

onMounted(() => {
  loadCurrentModel();
});
</script>

<template>
  <div class="model-analysis">
    <div class="header">
      <h1>模型分析预测</h1>
      <p class="description">输入职位信息，使用机器学习模型预测是否为虚假职位</p>
      <el-tag v-if="currentModel" type="info" size="small" style="margin-top: 8px;">
        当前使用模型: {{ currentModel }}
      </el-tag>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="14" :lg="14">
        <el-card class="input-card" v-loading="loading">
          <template #header>
            <span>职位信息输入</span>
          </template>

          <el-form :model="formData" label-width="140px" size="default">
            <el-form-item label="职位标题" required>
              <el-input v-model="formData.title" placeholder="例如：Software Engineer" />
            </el-form-item>

            <el-form-item label="工作地点" required>
              <el-input v-model="formData.location" placeholder="例如：US, CA, San Francisco" />
            </el-form-item>

            <el-form-item label="部门">
              <el-input v-model="formData.department" placeholder="可选" />
            </el-form-item>

            <el-form-item label="薪资范围">
              <el-input v-model="formData.salaryRange" placeholder="例如：120000-180000" />
            </el-form-item>

            <el-form-item label="公司简介" required>
              <el-input
                v-model="formData.companyProfile"
                type="textarea"
                :rows="3"
                placeholder="输入公司简介..."
              />
            </el-form-item>

            <el-form-item label="职位描述" required>
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="输入职位描述..."
              />
            </el-form-item>

            <el-form-item label="任职要求">
              <el-input
                v-model="formData.requirements"
                type="textarea"
                :rows="3"
                placeholder="输入任职要求..."
              />
            </el-form-item>

            <el-form-item label="福利待遇">
              <el-input
                v-model="formData.benefits"
                type="textarea"
                :rows="2"
                placeholder="输入福利待遇..."
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="是否远程工作">
                  <el-radio-group v-model="formData.telecommuting">
                    <el-radio :label="0">否</el-radio>
                    <el-radio :label="1">是</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="是否有公司Logo">
                  <el-radio-group v-model="formData.hasCompanyLogo">
                    <el-radio :label="0">否</el-radio>
                    <el-radio :label="1">是</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="是否有申请问题">
                  <el-radio-group v-model="formData.hasQuestions">
                    <el-radio :label="0">否</el-radio>
                    <el-radio :label="1">是</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="雇用类型">
              <el-select v-model="formData.employmentType" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="type in employmentTypes"
                  :key="type"
                  :label="type"
                  :value="type"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="所需经验">
              <el-select v-model="formData.requiredExperience" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="level in experienceLevels"
                  :key="level"
                  :label="level"
                  :value="level"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="学历要求">
              <el-select v-model="formData.requiredEducation" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="level in educationLevels"
                  :key="level"
                  :label="level"
                  :value="level"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="行业">
              <el-select v-model="formData.industry" filterable placeholder="请选择或输入" style="width: 100%">
                <el-option
                  v-for="ind in industries"
                  :key="ind"
                  :label="ind"
                  :value="ind"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="职能">
              <el-input v-model="formData.function" placeholder="例如：Engineering" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handlePredict" :loading="loading">
                开始预测
              </el-button>
              <el-button @click="handleReset">重置表单</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="10" :lg="10">
        <el-card class="result-card" v-if="showResult && predictionResult">
          <template #header>
            <span>预测结果</span>
          </template>

          <div class="result-content">
            <div class="result-header">
              <div class="prediction-label" :class="predictionResult.prediction === 1 ? 'fake' : 'real'">
                {{ predictionResult.predictionLabel }}
              </div>
              <div class="model-info">使用模型: {{ predictionResult.modelName }}</div>
            </div>

            <el-divider />

            <div class="result-details">
              <div class="detail-item">
                <span class="label">虚假概率:</span>
                <el-progress
                  :percentage="predictionResult.probability * 100"
                  :color="predictionResult.probability < 0.3 ? '#67c23a' : predictionResult.probability < 0.7 ? '#e6a23c' : '#f56c6c'"
                  :stroke-width="20"
                />
                <span class="value">{{ predictionResult.probabilityPercent }}</span>
              </div>

              <div class="detail-item">
                <span class="label">风险评分:</span>
                <el-rate
                  :model-value="predictionResult.riskScore"
                  :max="7"
                  disabled
                  show-score
                />
                <span class="value">{{ predictionResult.riskScore }}/7</span>
              </div>

              <div class="detail-item">
                <span class="label">风险等级:</span>
                <el-tag
                  :type="predictionResult.riskLevel === '低风险' ? 'success' : predictionResult.riskLevel === '中风险' ? 'warning' : 'danger'"
                  size="large"
                >
                  {{ predictionResult.riskLevel }}
                </el-tag>
              </div>
            </div>

            <el-divider />

            <div class="result-tips">
              <h4>分析说明：</h4>
              <ul>
                <li v-if="predictionResult.prediction === 0">
                  该职位预测为<strong>真实职位</strong>，建议正常申请。
                </li>
                <li v-else>
                  该职位预测为<strong>虚假职位</strong>，建议谨慎对待，注意核实公司信息和联系方式。
                </li>
                <li>风险评分越高，虚假可能性越大。</li>
                <li>建议结合实际情况综合判断。</li>
              </ul>
            </div>
          </div>
        </el-card>

        <el-card v-else class="result-placeholder">
          <el-empty description="填写左侧表单并点击“开始预测”查看结果" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.model-analysis {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
}

.header .description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.input-card,
.result-card {
  min-height: 600px;
}

.result-content {
  padding: 10px 0;
}

.result-header {
  text-align: center;
  margin-bottom: 20px;
}

.prediction-label {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.prediction-label.real {
  color: #67c23a;
}

.prediction-label.fake {
  color: #f56c6c;
}

.model-info {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.result-details {
  margin: 20px 0;
}

.detail-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item .label {
  min-width: 80px;
  font-weight: 500;
}

.detail-item .value {
  margin-left: auto;
  font-weight: 500;
}

.result-tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.result-tips h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.result-tips ul {
  margin: 0;
  padding-left: 20px;
}

.result-tips li {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.result-placeholder {
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
