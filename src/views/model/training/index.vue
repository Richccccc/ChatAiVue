<script setup lang="ts">
defineOptions({
  name: "ModelTraining"
});
</script>

<template>
  <div class="model-training">
    <div class="header">
      <h1>模型训练</h1>
      <p class="description">训练新的机器学习模型用于职位虚假检测</p>
    </div>

    <el-card>
      <el-empty description="模型训练功能开发中..." />
    </el-card>
  </div>
</template>

<style scoped>
.model-training {
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
</style>
