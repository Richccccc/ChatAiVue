import { http } from "@/utils/http";

export type ModelInfo = {
  name: string;           // 模型名称
  displayName: string;    // 显示名称
  description: string;    // 模型描述
  available: boolean;     // 是否可用
  isSelected: boolean;    // 是否为当前选中
};

export type PredictionRequest = {
  modelName?: string;     // 可选：指定使用的模型
  title: string;
  location: string;
  department?: string;
  salaryRange?: string;
  companyProfile: string;
  description: string;
  requirements: string;
  benefits?: string;
  telecommuting: number;
  hasCompanyLogo: number;
  hasQuestions: number;
  employmentType: string;
  requiredExperience: string;
  requiredEducation: string;
  industry: string;
  function: string;
};

export type PredictionResponse = {
  modelName: string;
  prediction: number;         // 0=真实职位，1=虚假职位
  predictionLabel: string;    // "真实职位" 或 "虚假职位"
  probability: number;        // 虚假概率（0-1）
  probabilityPercent: string; // 虚假概率百分比
  riskScore: number;          // 风险评分（0-7）
  riskLevel: string;          // 风险等级
};

/** 获取所有可用模型列表 */
export const getAllModels = () => {
  return http.request<{ success: boolean; data: ModelInfo[] }>("get", "/model/list");
};

/** 获取当前选中的模型 */
export const getCurrentModel = () => {
  return http.request<{ success: boolean; data: string }>("get", "/model/current");
};

/** 切换模型 */
export const switchModel = (modelName: string) => {
  return http.request<{ success: boolean; data: string; message?: string }>("post", "/model/switch", {
    data: { modelName }
  });
};

/** 使用模型进行预测 */
export const predict = (data: PredictionRequest) => {
  return http.request<{ success: boolean; data: PredictionResponse; message?: string }>("post", "/model/predict", {
    data
  });
};

