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
      <BreadcrumbItem>月刊管理</BreadcrumbItem>
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
      :title="isEdit ? '编辑' : '新增'"
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
        <FormItem label="封面" prop="coverImageUrl">
          <Row>
            <Col span="18">
              <img
                v-if="formData.coverImageUrl"
                :src="formData.coverImageUrl"
                alt=""
                style="width: 100px; height: 100px;"
              />
              <Upload
                action="/api/file/image/upload"
                :headers="{ token: pageToken }"
                :on-success="handleCoverUploadSuccess"
                 :on-format-error="handleFormatError"
                :format="['jpg', 'jpeg', 'png']"
                :max-size="2048"
                :show-upload-list="false"
              >
                <Button icon="ios-cloud-upload-outline">上传封面</Button>
              </Upload>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="副标题" prop="subtitle">
          <Input v-model="formData.subtitle" placeholder="请输入副标题" />
        </FormItem>

        <FormItem label="附件地址" prop="attachmentUrl">
          <Row>
            <Col span="18">
                <div v-for="(item,index) of formData.attachmentJson" :key="index" >
                  <div
                    style="margin-bottom: 10px; display: flex; align-items: center;"
                  >
                    <a
                      href="javascript:void(0);"
                      style="margin-right: 10px; color: #2d8cf0; cursor: pointer;"
                      @click="e =>openFilePreview(item)"
                    >
                      {{ item.name || "查看附件" }}
                    </a>
                    <Button
                      type="text"
                      icon="ios-trash"
                      @click="e =>removeAttachment(index)"
                      style="color: #ed4014;"
                      >删除</Button
                    >
                    <Button
                      type="primary"
                      size="small"
                      @click="e =>openFilePreview(item)"
                      style="margin-left: 10px;"
                      v-if="canPreviewFile(item.url)"
                    >
                      预览文件
                    </Button>
                  </div>
                </div>
              <div >
                <Row>
                  <!-- <Col span="12">
                    <Input
                      v-model="formData.attachmentUrl"
                      placeholder="请输入附件地址"
                    />
                  </Col> -->
                  <Col span="10">
                    <Upload
                      action="/api/file/file/upload"
                      :headers="{ token: pageToken }"
                      :on-success="handleAttachmentUploadSuccess"
                      :on-format-error="handleFormatError"
                      :format="[
                        'pdf',
                        'doc',
                        'xls',
                        'xlsx',
                        'ppt',
                        'pptx'
                      ]"
                      :max-size="5120"
                      :show-upload-list="false"
                      :multiple="true"
                    >
                      <Button icon="ios-cloud-upload-outline">上传附件</Button>
                    </Upload>
                  </Col>
                </Row>
              </div>
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
            <!-- <Viewer
              class="viewer"
              :tabindex="2"
              :value="formData.markdownContent"
            ></Viewer> -->
          </div>
        </FormItem>
        <FormItem label="分享者" prop="speakerName">
          <Input
            v-model="formData.speakerName"
            placeholder="请输入分享者姓名"
          />
        </FormItem>
        <FormItem label="分享主题" prop="topic">
          <Input v-model="formData.topic" placeholder="请输入分享主题" />
        </FormItem>
        <FormItem label="分享简介" prop="summary">
          <Input
            type="textarea"
            v-model="formData.summary"
            placeholder="请输入分享简介"
          />
        </FormItem>
        <FormItem label="部门" prop="deptName">
          <Input v-model="formData.deptName" placeholder="请输入部门" />
        </FormItem>
      </Form>
    </Modal>

    <!-- 确认删除弹窗 -->
    <Modal v-model="deleteModal" title="确认删除" @on-ok="confirmDelete">
      <p>确定要删除该吗？此操作不可逆。</p>
    </Modal>
  </div>
</template>
<script>
// Using a simpler approach without external editor libraries
import VueMarkdown from "vue-markdown";
import { Editor, Viewer } from "@bytemd/vue";
import "bytemd/dist/index.css";
import { getCookie } from "../../lib/util";

export default {
  components: {
    VueMarkdown,
    Editor,
    Viewer
  },
  data() {
    return {
      pageToken:getCookie('__dp_tk__') || "3e47a55147c246b6ac4c23af506e80ef",
      editor: null,
      editorContent: "",
      filter: {
        auditState: null,
        userId: null,
        keyword: null,
        commentId: null,
        activityType: 1
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
          title: "副标题",
          key: "subtitle",
          minWidth: 120
        },
        {
          title: "封面",
          key: "authorAvatar",
          width: 120,
          render: (h, params) => {
            return h(
              "Avatar",
              {
                props: {
                  src: params.row.coverImageUrl
                }
              },
              params.row.authorNickname
            );
          }
        },
        {
          title: "发布时间",
          key: "publishTime",
          minWidth: 120
        },

        {
          title: "附件名称",
          key: "attachmentName",
          minWidth: 120
        },
        {
          title: "分享者",
          key: "speakerName",
          minWidth: 120
        },
        {
          title: "分享主题",
          key: "topic",
          minWidth: 120
        },
        {
          title: "分享简介",
          key: "summary",
          minWidth: 120
        },
        {
          title: "部门",
          key: "deptName",
          minWidth: 120
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
        subtitle: "",
        coverImageUrl: "",
        attachmentJson:[],
        speakerName: "",
        topic: "",
        summary: "",
        deptName: "",
        activityType: 1,
        content: "",
        markdownContent: ""
      },
      formRules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        coverImageUrl: [
          { required: true, message: "请输入封面url", trigger: "blur" }
        ]
      },
      // 删除相关数据
      deleteModal: false,
      deleteId: null
    };
  },
  methods: {
    handleEditorChange(value) {
      this.formData.markdownContent = value;
      this.editorContent = value;
    },
    loadData() {
      this.$Loading.start();
      this.$http
        .post("config/page-activity-info", {
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
    handleFormatError (file) {
       this.$Message.warning('不支持上传此类型文件');
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
    // 获取详情
    getActivityDetail(id) {
      this.$Loading.start();
      this.$http.post(`config/activity-info-detail`, { id }).then(res => {
        this.$Loading.finish();
        if (res.code !== 0) {
          this.$Message.error(res.message);
          return;
        }
        this.formData = { ...res.data, activityType: 1 };
        this.formData.attachmentJson = JSON.parse(res.data.attachmentJson)
        // 设置富文本编辑器内容
        if (this.formData.content) {
          this.editorContent = this.formData.content;
          this.formData.markdownContent = this.formData.content;
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
        .post(`config/delete-activity-info`, { id: this.deleteId })
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
        this.formData.attachmentJson = JSON.stringify(this.formData.attachmentJson)
        this.$Loading.start();
        
        this.$http
          .post("config/save-activity-info", this.formData)
          .then(res => {
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
        subtitle: "",
        coverImageUrl: "",
        attachmentJson:[],
        speakerName: "",
        topic: "",
        summary: "",
        deptName: "",
        activityType: 1,
        content: "",
        markdownContent: ""
      };
      this.editorContent = ""; // 清空编辑器内容
      if (this.$refs.formData) {
        this.$refs.formData.resetFields();
      }
    },
    auditState(id, pass) {
      this.$Loading.start();
      this.$http.post("/posts/audit-state", { id, is: pass }).then(res => {
        if (res.code !== 0) {
          this.$Message.error(res.message);
          this.$Loading.error();
          return;
        }
        this.$Loading.finish();
        this.$Message.success(res.message);
        this.loadData();
      });
    },
    // 处理封面上传成功
    handleCoverUploadSuccess(response, file) {
      if (response.code === 0) {
        this.formData.coverImageUrl = response.data;
        this.$Message.success("封面上传成功");
      } else {
        this.$Message.error(response.message || "上传失败");
      }
    },
    // 处理附件上传成功
    handleAttachmentUploadSuccess(response, file) {
      if (response.code === 0) {
        this.formData.attachmentJson.push({name:file.name,url:response.data})
        this.$Message.success("附件上传成功");
      } else {
        this.$Message.error(response.message || "上传失败");
      }
    },
    // 判断文件是否可预览
    canPreviewFile(url) {
      // 由于使用了外部预览服务，所有文件都可以预览
      return !!url;
    },
    // 删除附件
    removeAttachment(index) {
      this.formData.attachmentJson.splice(index,1)
      this.$Message.success("附件删除成功");
    },
    isPdfFile(url) {
      // 由于使用了外部预览服务，此方法不再需要，但为了兼容性保留
      if (!url) return false;
      return url.toLowerCase().endsWith(".pdf");
    },
    base64Encode(str) {
      // 创建一个Buffer对象，然后转换为Base64
      return window.btoa(unescape(encodeURIComponent(str || "")));
    },
    // 添加超时处理，防止loading状态一直存在
    openFilePreview(item) {
      try {
        if (!this.formData.attachmentUrl) {
          this.$Message.warning("没有可预览的文件");
          return;
        }

        window.open(
          "https://delivery.paas.talkweb.com.cn/kkfile/onlinePreview?url=" +
            encodeURIComponent(this.base64Encode(this.formData.attachmentUrl))
        );
      } catch (error) {
        console.error("文件预览失败:", error);
        this.$Message.error("文件预览失败");
      }
    }
  },
  created() {
    document.title = "新闻管理";
    this.tablePageNo = 1;
    this.loadData();
  }
};
</script>
