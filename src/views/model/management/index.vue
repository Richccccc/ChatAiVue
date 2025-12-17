<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getAllModels, switchModel, getCurrentModel, type ModelInfo } from "@/api/model";

defineOptions({
  name: "ModelManagement"
});

const loading = ref(false);
const models = ref<ModelInfo[]>([]);
const currentModel = ref<string>("");

const loadModels = async () => {
  loading.value = true;
  try {
    const res = await getAllModels();
    if (res.success) {
      models.value = res.data;
      // 找到当前选中的模型
      const selected = res.data.find(m => m.isSelected);
      if (selected) {
        currentModel.value = selected.name;
      }
    } else {
      ElMessage.error("加载模型列表失败");
    }
  } catch (error: any) {
    ElMessage.error(error.message || "加载模型列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSwitchModel = async (modelName: string) => {
  if (modelName === currentModel.value) {
    ElMessage.info("该模型已经是当前使用的模型");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要切换到模型 "${models.value.find(m => m.name === modelName)?.displayName}" 吗？`,
      "切换模型",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    loading.value = true;
    const res = await switchModel(modelName);
    if (res.success) {
      ElMessage.success(res.data || "模型切换成功");
      currentModel.value = modelName;
      // 更新模型列表，刷新选中状态
      await loadModels();
    } else {
      ElMessage.error(res.message || "模型切换失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "模型切换失败");
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadModels();
});
</script>

<template>
  <div class="model-management">
    <div class="header">
      <h1>模型管理</h1>
      <p class="description">管理和切换用于职位虚假检测的机器学习模型</p>
    </div>

    <el-card class="models-container" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>可用模型列表</span>
          <el-tag v-if="currentModel" type="success" size="small">
            当前使用: {{ models.find(m => m.name === currentModel)?.displayName || currentModel }}
          </el-tag>
        </div>
      </template>

      <el-empty v-if="!loading && models.length === 0" description="暂无可用模型" />

      <div v-else class="models-grid">
        <el-card
          v-for="model in models"
          :key="model.name"
          class="model-card"
          :class="{ 'selected': model.isSelected }"
          shadow="hover"
        >
          <div class="model-header">
            <div class="model-title">
              <h3>{{ model.displayName }}</h3>
              <el-tag v-if="model.isSelected" type="success" size="small">当前使用</el-tag>
              <el-tag v-else-if="!model.available" type="danger" size="small">不可用</el-tag>
            </div>
            <div class="model-name">{{ model.name }}</div>
          </div>

          <div class="model-description">
            {{ model.description }}
          </div>

          <div class="model-actions">
            <el-button
              type="primary"
              :disabled="!model.available || model.isSelected"
              @click="handleSwitchModel(model.name)"
            >
              {{ model.isSelected ? "当前使用中" : "切换到此模型" }}
            </el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.model-management {
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

.models-container {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.model-card {
  transition: all 0.3s;
}

.model-card.selected {
  border: 2px solid #409eff;
  background-color: #f0f9ff;
}

.model-header {
  margin-bottom: 12px;
}

.model-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.model-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.model-name {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
}

.model-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  min-height: 60px;
}

.model-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
