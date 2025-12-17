<script setup lang="ts">
import { ref } from "vue";

export interface FormProps {
  formInline: {
    jobId?: number;
    title: string;
    location: string;
    department: string;
    salaryRange: string;
    description: string;
    requirements: string;
    telecommuting: number;
    fraudulent: number;
  };
  onFormInstance?: (instance: any) => void;
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "",
    location: "",
    department: "",
    salaryRange: "",
    description: "",
    requirements: "",
    telecommuting: 0,
    fraudulent: 0
  })
});
// 验证规则
const formRules = {
  title: [{ required: true, message: "请输入职位名称", trigger: "blur" }],
  location: [{ required: true, message: "请输入地点", trigger: "blur" }],
  salaryRange: [{ required: true, message: "请输入薪资范围", trigger: "blur" }],
  description: [{ required: true, message: "请输入职位描述", trigger: "blur" }]
};

const formRef = ref();
const newFormInline = ref(props.formInline);

import { onMounted } from "vue";
onMounted(() => {
  if (props.onFormInstance) {
    props.onFormInstance(formRef.value);
  }
});

defineExpose({ formRef });
</script>

<template>
  <el-form
    ref="formRef"
    :rules="formRules"
    :model="newFormInline"
    label-width="82px"
  >
    <el-form-item label="职位名称" prop="title">
      <el-input
        v-model="newFormInline.title"
        clearable
        placeholder="请输入职位名称"
      />
    </el-form-item>
    
    <el-form-item label="地点" prop="location">
      <el-input
        v-model="newFormInline.location"
        clearable
        placeholder="请输入地点"
      />
    </el-form-item>

    <el-form-item label="部门" prop="department">
      <el-input
        v-model="newFormInline.department"
        clearable
        placeholder="请输入部门"
      />
    </el-form-item>

    <el-form-item label="薪资范围" prop="salaryRange">
      <el-input
        v-model="newFormInline.salaryRange"
        clearable
        placeholder="请输入薪资范围"
      />
    </el-form-item>

    <el-form-item label="远程办公" prop="telecommuting">
      <el-switch
        v-model="newFormInline.telecommuting"
        :active-value="1"
        :inactive-value="0"
      />
    </el-form-item>

    <el-form-item label="虚假职位" prop="fraudulent">
      <el-switch
        v-model="newFormInline.fraudulent"
        :active-value="1"
        :inactive-value="0"
        active-color="#ff4949"
      />
    </el-form-item>

    <el-form-item label="描述" prop="description">
      <el-input
        v-model="newFormInline.description"
        type="textarea"
        :rows="3"
        placeholder="请输入职位描述"
      />
    </el-form-item>
    
    <el-form-item label="要求" prop="requirements">
      <el-input
        v-model="newFormInline.requirements"
        type="textarea"
        :rows="3"
        placeholder="请输入职位要求"
      />
    </el-form-item>
  </el-form>
</template>
