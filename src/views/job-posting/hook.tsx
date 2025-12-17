import { message } from "@/utils/message";
import { getJobPostingList, createJobPosting, updateJobPosting, deleteJobPosting } from "@/api/jobPostings";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import type { TableColumns } from "@pureadmin/table";
import EditForm from "./form.vue";

export function useJobPosting() {
    const form = reactive({
        title: ""
    });
    const formRef = ref();
    const dataList = ref([]);
    const loading = ref(true);
    const pagination = reactive<PaginationProps>({
        total: 0,
        pageSize: 10,
        currentPage: 1,
        background: true
    });

    const columns = [
        {
            label: "ID",
            prop: "jobId",
            width: 80
        },
        {
            label: "职位名称",
            prop: "title",
            minWidth: 150
        },
        {
            label: "地点",
            prop: "location",
            minWidth: 120
        },
        {
            label: "部门",
            prop: "department",
            minWidth: 100
        },
        {
            label: "薪资范围",
            prop: "salaryRange",
            minWidth: 120
        },
        {
            label: "是否虚假",
            prop: "fraudulent",
            minWidth: 100,
            cellRenderer: ({ row }) => {
                return h(
                    "span",
                    {
                        style: {
                            color: row.fraudulent === 1 ? "red" : "green"
                        }
                    },
                    row.fraudulent === 1 ? "是" : "否"
                );
            }
        },
        {
            label: "操作",
            fixed: "right",
            width: 180,
            slot: "operation"
        }
    ];

    function handleDelete(row) {
        deleteJobPosting(row.jobId).then(res => {
            if (res.success) {
                message("删除成功", { type: "success" });
                onSearch();
            } else {
                message("删除失败", { type: "error" });
            }
        });
    }

    function handleSizeChange(val: number) {
        pagination.pageSize = val;
        onSearch();
    }

    function handleCurrentChange(val: number) {
        pagination.currentPage = val;
        onSearch();
    }

    async function onSearch() {
        loading.value = true;
        const { data } = await getJobPostingList({
            page: pagination.currentPage,
            size: pagination.pageSize,
            sortBy: "jobId", // default sort
            ...form
        });
        dataList.value = data.list;
        pagination.total = data.total;
        loading.value = false;
    }

    const resetForm = formEl => {
        if (!formEl) return;
        formEl.resetFields();
        onSearch();
    };

    function openDialog(title = "新增", row?: any) {
        addDialog({
            title: `${title}职位`,
            props: {
                formInline: {
                    jobId: row?.jobId ?? undefined,
                    title: row?.title ?? "",
                    location: row?.location ?? "",
                    department: row?.department ?? "",
                    salaryRange: row?.salaryRange ?? "",
                    description: row?.description ?? "",
                    requirements: row?.requirements ?? "",
                    telecommuting: row?.telecommuting ?? 0,
                    fraudulent: row?.fraudulent ?? 0
                }
            },
            width: "50%",
            draggable: true,
            fullscreenIcon: true,
            closeOnClickModal: false,
            contentRenderer: () => h(EditForm, { ref: "formRef" }),
            beforeSure: (done, { options }) => {
                const FormRef = options.props.formInline;
                const curData = options.props.formInline;

                // 获取表单实例并进行校验
                // 注意：这里需要通过 contentRenderer 返回的组件实例来获取 formRef
                // 但由于 Pure Admin 的 addDialog 实现机制，我们这里尝试直接通过 ref 获取可能比较困难
                // 更稳妥的方式是在 formComponent 中 expose validate 方法，或者在 hook 中通过 index 传递的引用

                // 修正：options.contentRenderer 返回的是 VNode，无法直接获取实例。
                // 正确做法：利用 ReDialog 的 openDialog 返回的 options 中的 componentRef 或者类似机制
                // 但 PureDialog 的 props 传递是单向的。

                // 实际上，我们可以在 beforeSure 中通过 contentRef 获取内部组件暴露的 formRef
                // options.footerRenderer 等回调中可能含有有用信息。
                // 这是一个常见的集成难点。

                // 简单点：我们让 EditForm 把 formRef 传递出来？
                // 或者我们直接在这里手动校验数据（如果不依赖 UI 校验）
                // 为了 UI 校验效果（红框提示），必须调用 el-form 的 validate()

                // 使用 options.contentRef.value.formRef
                if (!formRef.value) {
                    console.warn("Form instance not captured");
                    // 防止死循环，如果获取不到实例则不校验直接提交或仅仅return
                    // return;
                }

                formRef.value?.validate((valid) => {
                    if (valid) {
                        const request = curData.jobId
                            ? updateJobPosting(curData.jobId, curData)
                            : createJobPosting(curData);

                        request.then(res => {
                            if (res.success) {
                                message("保存成功", { type: "success" });
                                done();
                                onSearch();
                            } else {
                                message("保存失败", { type: "error" });
                            }
                        });
                    }
                });
            }
        });
    }

    onMounted(() => {
        onSearch();
    });

    return {
        form,
        loading,
        columns,
        dataList,
        pagination,
        onSearch,
        resetForm,
        openDialog,
        handleDelete,
        handleSizeChange,
        handleCurrentChange
    };
}
