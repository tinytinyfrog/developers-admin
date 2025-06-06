<style>
/* 全局样式，覆盖iView Modal组件 */
/* .file-preview-modal .ivu-modal-body {
  overflow: hidden !important;
  padding: 0;
  max-height: calc(100vh - 120px);
} */
</style>

<style scoped>
.editos {
  height: 300px !important;
  margin-bottom: 0px !important;
}
.editos /deep/ .bytemd-fullscreen.bytemd {
  z-index: 99999;
}
.admin-faq-manager {
  width: 100%;
  height: 100%;
  overflow: scroll;
}

/* 添加弹窗内容样式 */
/* .file-preview-container {
  height: 600px;
  overflow: auto;
  position: relative;
  padding: 16px;
}

.file-preview-container >>> .vue-office-docx,
.file-preview-container >>> .vue-office-excel,
.file-preview-container >>> .vue-office-pdf {
  height: 100%;
  overflow: auto;
} */

.editos {
  height: 400px;
  margin-bottom: 20px;
}

.viewer {
  border: 1px solid #dcdee2;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.markdown-preview {
  border: 1px solid #dcdee2;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  background-color: #f8f8f9;
}

.markdown-preview h3 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8eaec;
}
</style>
<template>
  <div class="admin-faq-manager">
    <Breadcrumb :style="{ marginBottom: '10px' }">
      <BreadcrumbItem>专家墙管理</BreadcrumbItem>
    </Breadcrumb>
    <Row :style="{ marginBottom: '10px' }">
      <Col span="4">
        <Input v-model="filter.keyword" style="width:90%;" placeholder="标题" />
      </Col>
      <Col span="4">
        <Button type="primary" @click="search">查询</Button>
        <Button type="success" @click="openAddModal">新增</Button>
      </Col>
    </Row>
    <Table border :columns="tableColumns" :data="tableData">
      <template slot-scope="{ row, index }" slot="action">
        <Button
          type="primary"
          size="small"
          style="margin-right: 5px"
          @click="handleEdit(row)"
          >编辑</Button
        >
        <Button type="error" size="small" @click="handleDelete(row)"
          >删除</Button
        >
      </template>
    </Table>
    <Page
      :total="tableTotal"
      show-total
      show-sizer
      :page-size="tablePageSize"
      :page-size-opts="[10, 20, 30, 40]"
      @on-change="goPage"
      @on-page-size-change="pageSizeChange"
      :style="{ marginTop: '10px', textAlign: 'right' }"
    />

    <!-- 新增/编辑弹窗 -->
    <Modal
      v-model="formModal"
      :title="isEdit ? '编辑活动' : '新增活动'"
      width="850"
      @on-ok="handleFormSubmit"
      @on-cancel="resetForm"
    >
      <Form
        ref="formData"
        :model="formData"
        :rules="formRules"
        :label-width="100"
      >
        <FormItem label="标题" prop="title">
          <Input v-model="formData.title" placeholder="请输入标题" />
        </FormItem>
        <FormItem label="编号" prop="number">
          <Input v-model="formData.number" placeholder="请输入编号" />
        </FormItem>
        <FormItem label="照片" prop="imageUrl">
          <Row>
            <Col span="18">
              <img
                v-if="formData.imageUrl"
                :src="formData.imageUrl"
                alt=""
                style="width: 100px; height: 100px;"
              />
              <Upload
                action="/api/file/image/upload"
                :headers="{ token: pageToken }"
                :on-success="handleImageUploadSuccess"
                :format="['jpg', 'jpeg', 'png']"
                :max-size="2048"
                :show-upload-list="false"
              >
                <Button icon="ios-cloud-upload-outline">上传照片</Button>
              </Upload>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="Markdown内容" prop="content">
          <div>
            <Editor
              class="editos"
              :value="formData.markdownContent"
              @change="handleEditorChange"
            />
          </div>
        </FormItem>
        <FormItem label="获奖时间" prop="honorsTime">
          <DatePicker
            type="date"
            v-model="formData.honorsTime"
            placeholder="选择获奖时间"
            style="width: 100%"
            format="yyyy-MM-dd"
          ></DatePicker>
        </FormItem>

        <FormItem label="所属者" prop="honorsOwner">
          <Input v-model="formData.honorsOwner" placeholder="请输入所属者" />
        </FormItem>
        <FormItem label="所属部门" prop="honorsDept">
          <Input v-model="formData.honorsDept" placeholder="请输入所属部门" />
        </FormItem>
        <FormItem label="所属领域" prop="honorsDomain">
          <Input v-model="formData.honorsDomain" placeholder="请输入所属领域" />
        </FormItem>
        <FormItem label="概况说明" prop="summary">
          <Input
            type="textarea"
            v-model="formData.summary"
            placeholder="请输入概况说明"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 确认删除弹窗 -->
    <Modal v-model="deleteModal" title="确认删除" @on-ok="confirmDelete">
      <p>确定要删除该活动吗？此操作不可逆。</p>
    </Modal>
  </div>
</template>
<script>
// Using a simpler approach without external editor libraries
import VueMarkdown from "vue-markdown";
import { Editor, Viewer } from "@bytemd/vue";
import "bytemd/dist/index.css";

export default {
  components: {
    VueMarkdown,
    Editor,
    Viewer
  },
  data() {
    return {
      pageToken: "77a92fce48134eebbdb8ba6b08f1ebf2",
      // editor: null,
      // editorContent: "",
      filter: {
        auditState: null,
        userId: null,
        keyword: null,
        commentId: null,
        honorsType: 3
      },
      tableColumns: [
        {
          title: "id",
          key: "id",
          width: 60
        },
        {
          title: "标题",
          key: "title",
          minWidth: 120
        },
        {
          title: "编号",
          key: "number",
          minWidth: 120
        },
        {
          title: "照片",
          key: "authorAvatar",
          width: 120,
          render: (h, params) => {
            return h(
              "Avatar",
              {
                props: {
                  src: params.row.imageUrl
                }
              },
              params.row.authorNickname
            );
          }
        },
        {
          title: "获奖时间",
          key: "honorsTimeString",
          minWidth: 120
        },

        {
          title: "所属者",
          key: "honorsOwner",
          minWidth: 120
        },
        {
          title: "所属部门",
          key: "honorsDept",
          minWidth: 120
        },
        {
          title: "所属领域",
          key: "honorsDomain",
          minWidth: 120
        },
        {
          title: "概况说明",
          key: "summary",
          minWidth: 120,
          render: (h, params) => {
            const text = params.row.summary || "";
            return h(
              "div",
              {
                style: {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px"
                },
                attrs: {
                  title: text
                }
              },
              text
            );
          }
        },

        {
          title: "操作",
          slot: "action",
          width: 150,
          fixed: "right"
        }
      ],
      tableData: [],
      tableTotal: 0,
      tablePageSize: 10,
      tablePageNo: 1,
      // 表单相关数据
      formModal: false,
      isEdit: false,
      formData: {
        id: null,
        title: "",
        number: "",
        imageUrl: "",
        honorsTime: "",
        honorsType: "3",
        honorsOwner: "",
        honorsDept: "",
        honorsDomain: "",
        summary: "",
        markdownContent: "",
        content: ""
      },
      formRules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        imageUrl: [{ required: true, message: "请上传照片", trigger: "blur" }]
      },
      // 删除相关数据
      deleteModal: false,
      deleteId: null
    };
  },
  methods: {
    loadData() {
      this.$Loading.start();
      this.$http
        .post("config/page-honors", {
          pageSize: this.tablePageSize,
          pageNo: this.tablePageNo,
          filter: this.filter
        })
        .then(res => {
          if (res.code !== 0) {
            this.$Message.error(res.message);
            this.$Loading.error();
            return;
          }
          this.$Loading.finish();
          this.tableData = res.data.list;
          this.tableTotal = res.data.total;
        });
    },
    handleEditorChange(value) {
      this.formData.markdownContent = value;
    },
    search() {
      this.tablePageNo = 1;
      this.loadData();
    },
    goPage(pageNo) {
      this.tablePageNo = pageNo;
      this.loadData();
    },
    pageSizeChange(pageSize) {
      this.tablePageSize = pageSize;
      this.tablePageNo = 1;
      this.loadData();
    },
    // 打开新增弹窗
    openAddModal() {
      this.isEdit = false;
      this.resetForm();
      this.formModal = true;
    },
    // 处理编辑
    handleEdit(row) {
      this.isEdit = true;
      this.getActivityDetail(row.id);
      this.formModal = true;
    },
    // 获取活动详情
    getActivityDetail(id) {
      this.$Loading.start();
      this.$http.post(`config/honors-detail`, { id }).then(res => {
        this.$Loading.finish();
        if (res.code !== 0) {
          this.$Message.error(res.message);
          return;
        }
        this.formData = { ...res.data };
        // 设置富文本编辑器内容
        if (!this.formData.markdownContent) {
          this.formData.markdownContent = "";
        }
      });
    },
    // 处理删除
    handleDelete(row) {
      this.deleteId = row.id;
      this.deleteModal = true;
    },
    // 确认删除
    confirmDelete() {
      if (!this.deleteId) return;

      this.$Loading.start();
      this.$http
        .post(`config/delete-honors`, { id: this.deleteId })
        .then(res => {
          this.$Loading.finish();
          if (res.code !== 0) {
            this.$Message.error(res.message);
            return;
          }
          this.$Message.success("删除成功");
          this.loadData();
        });
    },
    // 提交表单
    handleFormSubmit() {
      this.$refs.formData.validate(valid => {
        if (!valid) {
          return false;
        }

        // 将编辑器内容保存到表单
        this.formData.content = this.formData.markdownContent;

        // 过滤掉空值和null值
        if (this.formData.id == null || this.formData.id == "null") {
          this.formData.id = "";
        }
        this.$Loading.start();
        this.$http.post("config/save-honors", this.formData).then(res => {
          this.$Loading.finish();
          if (res.code !== 0) {
            this.$Message.error(res.message);
            return;
          }
          this.$Message.success(this.isEdit ? "更新成功" : "添加成功");
          this.formModal = false;
          this.loadData();
        });
      });
    },

    // 重置表单
    resetForm() {
      this.formData = {
        id: null,
        title: "",
        number: "",
        imageUrl: "",
        honorsTime: "",
        honorsType: "3",
        honorsOwner: "",
        honorsDept: "",
        honorsDomain: "",
        summary: "",
        markdownContent: "",
        content: ""
      };
      if (this.$refs.formData) {
        this.$refs.formData.resetFields();
      }
    },
    // 处理照片上传成功
    handleImageUploadSuccess(response, file) {
      if (response.code === 0) {
        this.formData.imageUrl = response.data;
        this.$Message.success("照片上传成功");
      } else {
        this.$Message.error(response.message || "上传失败");
      }
    }
  },
  created() {
    document.title = "专家墙管理";
    this.tablePageNo = 1;
    this.loadData();
  }
};
</script>
