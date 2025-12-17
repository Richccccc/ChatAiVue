<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { http } from "@/utils/http";
import * as echarts from "echarts";

defineOptions({
  name: "Welcome"
});

const loading = ref(false);
const charts = ref<any>({});
const chartRefs = ref<HTMLElement[]>([]);

// 标签格式化函数：缩短长标签显示
const shortenLabel = (label: string, maxLength: number = 10): string => {
  // 处理空值和 Unknown
  if (!label || label === 'Unknown' || label === 'unknown' || label.trim() === '') {
    return '未分类';
  }
  // 如果已经是中文或很短，直接返回
  if (label.length <= maxLength) return label;
  
  // 地理位置格式化：GB, LND, London -> London
  if (label.includes(',')) {
    const parts = label.split(',').map(s => s.trim());
    if (parts.length >= 3) {
      return parts[2] || parts[1] || parts[0]; // 取城市名
    }
    return parts[parts.length - 1]; // 取最后一个部分
  }
  
  // 行业名称简化
  const industryMap: Record<string, string> = {
    'Computer Software': '软件',
    'Information Technology and Services': 'IT服务',
    'Consumer Services': '消费服务',
    'Education Management': '教育管理',
    'Financial Services': '金融服务',
    'Hospital & Health Care': '医疗健康',
    'Internet': '互联网',
    'Marketing and Advertising': '营销广告',
    'Telecommunications': '电信'
  };
  if (industryMap[label]) return industryMap[label];
  
  // 雇用类型简化
  const employmentMap: Record<string, string> = {
    'Full-time': '全职',
    'Part-time': '兼职',
    'Contract': '合同',
    'Temporary': '临时',
    'Other': '其他'
  };
  if (employmentMap[label]) return employmentMap[label];
  
  // 经验等级简化
  const experienceMap: Record<string, string> = {
    'Entry level': '初级',
    'Mid-Senior level': '中高级',
    'Executive': '高管',
    'Associate': '助理',
    'Director': '总监',
    'Internship': '实习',
    'Not Applicable': '不限'
  };
  if (experienceMap[label]) return experienceMap[label];
  
  // 学历要求简化
  const educationMap: Record<string, string> = {
    "Bachelor's Degree": '学士',
    "Master's Degree": '硕士',
    "Associate Degree": '副学士',
    "Doctorate": '博士',
    'High School or equivalent': '高中',
    'Certification': '认证',
    'Professional': '专业',
    'Some College Coursework Completed': '大学课程',
    'Some High School Coursework': '高中课程',
    'Unspecified': '未指定',
    'Vocational': '职业',
    'Vocational - Degree': '职业学位',
    'Vocational - HS Diploma': '职业高中'
  };
  if (educationMap[label]) return educationMap[label];
  
  // 通用截断：超过最大长度则截断并加省略号
  if (label.length > maxLength) {
    return label.substring(0, maxLength) + '...';
  }
  
  return label;
};

// 15个图表的配置生成函数
// 使用 any 以避免类型检查错误
const chartConfigurators: any = {
  fraud_distribution: (data) => ({
    title: { text: "真假职位分布", left: "center", top: '5%' },
    tooltip: { trigger: "item" },
    grid: { top: '15%', left: '5%', right: '5%', bottom: '5%', containLabel: true },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ['50%', '60%'],
        data: data.labels.map((label, i) => ({
          name: label,
          value: data.values[i]
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  }),
  location_distribution: (data) => {
    const originalLabels = data.labels;
    const shortLabels = originalLabels.map(l => shortenLabel(l, 8));
    return {
      title: { text: "职位地理位置分布 (Top 10)", left: "center", top: '5%' },
      tooltip: { 
        trigger: "axis",
        formatter: (params: any) => {
          if (params && params.length > 0) {
            const index = shortLabels.indexOf(params[0].axisValue);
            const originalLabel = index >= 0 ? originalLabels[index] : params[0].axisValue;
            return `${originalLabel}<br/>${params[0].marker} ${params[0].seriesName || '数量'}: ${params[0].value}`;
          }
          return '';
        }
      },
      grid: { top: '20%', bottom: '20%', containLabel: true },
      xAxis: { 
        type: "category", 
        data: shortLabels,
        axisLabel: { rotate: 45, interval: 0 }
      },
      yAxis: { type: "value" },
      series: [{ name: '职位数量', data: data.values, type: "bar" }]
    };
  },
  company_logo_risk: (data) => ({
    title: { text: "公司Logo与真实性关联", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    legend: { data: ["真实", "虚假"], top: "bottom" },
    grid: { top: '20%', bottom: '15%', containLabel: true },
    xAxis: { type: "category", data: data.categories },
    yAxis: { type: "value" },
    series: [
      { name: "真实", type: "bar", data: data.real },
      { name: "虚假", type: "bar", data: data.fake }
    ]
  }),
  salary_anomaly: (data) => ({
    title: { text: "薪资范围标注分析", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    legend: { data: ["真实", "虚假"], top: "bottom" },
    grid: { top: '20%', bottom: '15%', containLabel: true },
    xAxis: { type: "category", data: data.categories },
    yAxis: { type: "value" },
    series: [
      { name: "真实", type: "bar", data: data.real },
      { name: "虚假", type: "bar", data: data.fake }
    ]
  }),
  title_length: (data) => ({
    title: { text: "平均职位标题长度", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    grid: { top: '20%', bottom: '10%', containLabel: true },
    xAxis: { type: "category", data: data.labels },
    yAxis: { type: "value" },
    series: [{ data: data.values, type: "bar" }]
  }),
  description_complexity: (data) => ({
    title: { text: "平均职位描述长度", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    grid: { top: '20%', bottom: '10%', containLabel: true },
    xAxis: { type: "category", data: data.labels },
    yAxis: { type: "value" },
    series: [{ data: data.values, type: "bar", color: "#91cc75" }]
  }),
  requirements_risk: (data) => ({
    title: { text: "任职要求有无分析", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    legend: { data: ["真实", "虚假"], top: "bottom" },
    grid: { top: '20%', bottom: '15%', containLabel: true },
    xAxis: { type: "category", data: data.categories },
    yAxis: { type: "value" },
    series: [
      { name: "真实", type: "bar", data: data.real, stack: "total" },
      { name: "虚假", type: "bar", data: data.fake, stack: "total" }
    ]
  }),
  contact_completeness: (data) => ({
    title: { text: "筛选问题完整性", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    legend: { data: ["真实", "虚假"], top: "bottom" },
    grid: { top: '20%', bottom: '15%', containLabel: true },
    xAxis: { type: "category", data: data.categories },
    yAxis: { type: "value" },
    series: [
      { name: "真实", type: "bar", data: data.real, stack: "total" },
      { name: "虚假", type: "bar", data: data.fake, stack: "total" }
    ]
  }),
  industry_risk: (data) => {
    const originalCategories = data.categories;
    const shortCategories = originalCategories.map(l => shortenLabel(l, 8));
    return {
      title: { text: "热门行业风险 (Top 10)", left: "center", top: '5%' },
      tooltip: { 
        trigger: "axis",
        formatter: (params: any) => {
          if (params && params.length > 0) {
            const index = shortCategories.indexOf(params[0].axisValue);
            const originalLabel = index >= 0 ? originalCategories[index] : params[0].axisValue;
            let result = `${originalLabel}<br/>`;
            params.forEach((param: any) => {
              result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
            });
            return result;
          }
          return '';
        }
      },
      legend: { data: ["真实", "虚假"], top: "bottom" },
      grid: { top: '20%', bottom: '25%', containLabel: true },
      xAxis: { 
        type: "category", 
        data: shortCategories,
        axisLabel: { rotate: 45, interval: 0 }
      },
      yAxis: { type: "value" },
      series: [
        { name: "真实", type: "bar", data: data.real },
        { name: "虚假", type: "bar", data: data.fake }
      ]
    };
  },
  telecommuting_risk: (data) => ({
    title: { text: "远程办公模式分析", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    legend: { data: ["真实", "虚假"], top: "bottom" },
    grid: { top: '20%', bottom: '15%', containLabel: true },
    xAxis: { type: "category", data: data.categories },
    yAxis: { type: "value" },
    series: [
      { name: "真实", type: "bar", data: data.real },
      { name: "虚假", type: "bar", data: data.fake }
    ]
  }),
  benefits_risk: (data) => ({
    title: { text: "福利待遇描述分析", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    legend: { data: ["真实", "虚假"], top: "bottom" },
    grid: { top: '20%', bottom: '15%', containLabel: true },
    xAxis: { type: "category", data: data.categories },
    yAxis: { type: "value" },
    series: [
      { name: "真实", type: "bar", data: data.real },
      { name: "虚假", type: "bar", data: data.fake }
    ]
  }),
  profile_credibility: (data) => ({
    title: { text: "平均公司简介长度", left: "center", top: '5%' },
    tooltip: { trigger: "axis" },
    grid: { top: '20%', bottom: '10%', containLabel: true },
    xAxis: { type: "category", data: data.labels },
    yAxis: { type: "value" },
    series: [{ data: data.values, type: "bar", color: "#fac858" }]
  }),
  employment_type_risk: (data) => {
    const originalCategories = data.categories;
    const shortCategories = originalCategories.map(l => shortenLabel(l, 6));
    return {
      title: { text: "雇用类型风险", left: "center", top: '5%' },
      tooltip: { 
        trigger: "axis",
        formatter: (params: any) => {
          if (params && params.length > 0) {
            const index = shortCategories.indexOf(params[0].axisValue);
            const originalLabel = index >= 0 ? originalCategories[index] : params[0].axisValue;
            let result = `${originalLabel}<br/>`;
            params.forEach((param: any) => {
              result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
            });
            return result;
          }
          return '';
        }
      },
      legend: { data: ["真实", "虚假"], top: "bottom" },
      grid: { top: '20%', bottom: '20%', containLabel: true },
      xAxis: { 
        type: "category", 
        data: shortCategories,
        axisLabel: { rotate: 30, interval: 0 }
      },
      yAxis: { type: "value" },
      series: [
        { name: "真实", type: "bar", data: data.real, stack: "total" },
        { name: "虚假", type: "bar", data: data.fake, stack: "total" }
      ]
    };
  },
  experience_risk: (data) => {
    const originalCategories = data.categories;
    const shortCategories = originalCategories.map(l => shortenLabel(l, 8));
    return {
      title: { text: "所需经验与风险", left: "center", top: '5%' },
      tooltip: { 
        trigger: "axis",
        formatter: (params: any) => {
          if (params && params.length > 0) {
            const index = shortCategories.indexOf(params[0].axisValue);
            const originalLabel = index >= 0 ? originalCategories[index] : params[0].axisValue;
            let result = `${originalLabel}<br/>`;
            params.forEach((param: any) => {
              result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
            });
            return result;
          }
          return '';
        }
      },
      legend: { data: ["真实", "虚假"], top: "bottom" },
      grid: { top: '20%', bottom: '20%', containLabel: true },
      xAxis: { 
        type: "category", 
        data: shortCategories,
        axisLabel: { rotate: 30, interval: 0 }
      },
      yAxis: { type: "value" },
      series: [
        { name: "真实", type: "bar", data: data.real, stack: "total" },
        { name: "虚假", type: "bar", data: data.fake, stack: "total" }
      ]
    };
  },
  education_risk: (data) => {
    const originalCategories = data.categories;
    const shortCategories = originalCategories.map(l => shortenLabel(l, 6));
    return {
      title: { text: "学历要求与风险", left: "center", top: '5%' },
      tooltip: { 
        trigger: "axis",
        formatter: (params: any) => {
          if (params && params.length > 0) {
            const index = shortCategories.indexOf(params[0].axisValue);
            const originalLabel = index >= 0 ? originalCategories[index] : params[0].axisValue;
            let result = `${originalLabel}<br/>`;
            params.forEach((param: any) => {
              result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
            });
            return result;
          }
          return '';
        }
      },
      legend: { data: ["真实", "虚假"], top: "bottom" },
      grid: { top: '20%', bottom: '20%', containLabel: true },
      xAxis: { 
        type: "category", 
        data: shortCategories,
        axisLabel: { rotate: 30, interval: 0 }
      },
      yAxis: { type: "value" },
      series: [
        { name: "真实", type: "bar", data: data.real, stack: "total" },
        { name: "虚假", type: "bar", data: data.fake, stack: "total" }
      ]
    };
  }
};

const runAnalysis = async () => {
  loading.value = true;
  try {
    // 这里的 /analysis/run 现在直接返回 JSON 数据
    const res = await http.request<any>("post", "/analysis/run");
    // 后端返回的是字符串JSON，需要再次解析? 不，http请求会自动解析JSON响应
    // 假设后端返回 { success: true, data: "{\"fraud_distribution\": ...}" } -> 需要两次解析
    // 或者后端直接返回对象
    
    // 如果是 ApiResponse<String> 且内容是JSON字符串
    let resultData = res.data;
    
    // 如果返回的字符串以 "分析任务已启动" 开头，说明是之前的逻辑，或者出错了
    if (typeof resultData === 'string' && resultData.includes("分析任务已启动")) {
        console.error("Received status message instead of JSON data:", resultData);
        return;
    }

    if (typeof resultData === 'string') {
        try {
            // 尝试查找 JSON 的开始和结束位置，过滤掉可能的非 JSON 日志信息
            const jsonStart = resultData.indexOf('{');
            const jsonEnd = resultData.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = resultData.substring(jsonStart, jsonEnd + 1);
                resultData = JSON.parse(jsonStr);
            } else {
                 // 如果找不到 JSON 结构，可能是报错信息
                 console.error("Invalid JSON format from backend:", resultData);
                 return;
            }
        } catch(e) {
            console.error("Failed to parse JSON string", e);
            return;
        }
    }

    if (res.success && resultData) {
      renderCharts(resultData);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const renderCharts = (data) => {
  nextTick(() => {
    // 销毁旧图表
    Object.values(charts.value).forEach((chart: any) => chart.dispose());
    charts.value = {};

    const keys = Object.keys(chartConfigurators);
    
    // 先确保所有容器都有尺寸
    keys.forEach((key, index) => {
      const el = chartRefs.value[index];
      if (el) {
        // 强制设置样式，使用 !important 级别的设置
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('height', '350px', 'important');
        el.style.setProperty('min-height', '350px', 'important');
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('box-sizing', 'border-box', 'important');
        
        // 检查父元素（Card body）
        const parent = el.parentElement;
        if (parent) {
          parent.style.setProperty('height', '100%', 'important');
          parent.style.setProperty('display', 'flex', 'important');
          parent.style.setProperty('flex-direction', 'column', 'important');
          parent.style.setProperty('padding', '10px', 'important');
        }
      }
    });

    // 等待一帧后再初始化图表
    requestAnimationFrame(() => {
      keys.forEach((key, index) => {
        if (data && data[key]) {
          const el = chartRefs.value[index];
          if (el) {
            // 再次检查并强制设置尺寸
            if (el.clientHeight === 0 || el.clientWidth === 0) {
              console.warn(`[Force Resize] Chart ${key} container dimensions are 0. Forcing dimensions.`);
              // 使用计算后的父元素尺寸
              const parent = el.parentElement;
              const card = parent?.parentElement;
              if (card) {
                const cardHeight = card.clientHeight || 400;
                const cardBodyHeight = cardHeight - 60; // 减去 Card header 高度
                el.style.setProperty('height', `${Math.max(350, cardBodyHeight - 20)}px`, 'important');
              } else {
                el.style.setProperty('height', '350px', 'important');
              }
              el.style.setProperty('width', '100%', 'important');
              // 强制浏览器重新计算布局
              void el.offsetHeight;
            }
            
            try {
              const chart = echarts.init(el);
              const options = chartConfigurators[key](data[key]);
              chart.setOption(options);
              
              // 延迟 resize，确保图表已经渲染
              setTimeout(() => {
                chart.resize();
              }, 50);
              
              charts.value[key] = chart;
              console.log(`[Success] Chart ${key} rendered. Dimensions: ${el.clientWidth}x${el.clientHeight}`);
            } catch (err) {
              console.error(`Failed to init chart ${key}:`, err);
            }
          } else {
            console.warn(`Skipping chart ${key}: ref element not found at index ${index}`);
          }
        } else {
          console.warn(`Skipping chart ${key}: data missing`, { dataKey: !!(data && data[key]) });
        }
      });
    });
  });
};

onMounted(() => {
  // 自动运行一次
  runAnalysis();
  
  window.addEventListener("resize", () => {
    Object.values(charts.value).forEach((chart: any) => chart.resize());
  });
});
</script>

<template>
  <div class="welcome-container">
    <div class="header">
      <h1>实时数据分析大屏</h1>
      <el-button type="primary" :loading="loading" @click="runAnalysis">
        刷新实时数据
      </el-button>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <el-row :gutter="20" class="charts-container" v-else>
      <el-col
        v-for="(key, index) in Object.keys(chartConfigurators)"
        :key="key"
        :xs="24"
        :sm="24"
        :md="12"
        :lg="8"
        :xl="6"
      >
        <el-card class="chart-card" shadow="hover" :style="{ height: '400px', display: 'flex', flexDirection: 'column' }">
          <!-- 修改 ref 绑定方式，确保在 v-for 中正确收集 -->
          <div 
            :ref="(el) => { if (el) { chartRefs[index] = el; } }" 
            class="chart-instance"
            :style="{ width: '100%', height: '350px', minHeight: '350px', display: 'block', boxSizing: 'border-box' }"
          ></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.welcome-container {
  padding: 20px;
}

.welcome-container .header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.welcome-container .header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.charts-container {
  width: 100%;
}

.charts-container .chart-card {
  margin-bottom: 20px;
  height: 400px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden;
}

.charts-container .chart-card :deep(.el-card__body) {
  height: 100% !important;
  padding: 10px !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
}

.chart-instance {
  width: 100% !important;
  height: 350px !important;
  min-height: 350px !important;
  display: block !important;
  box-sizing: border-box !important;
  flex: 1;
}
</style>
