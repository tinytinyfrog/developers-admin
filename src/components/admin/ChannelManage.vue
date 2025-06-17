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
.admin-channel-manager {
  width: 100%;
  height: 100%;
  overflow: scroll;
  display: flex;
  column-gap: 20px;
}

.admin-channel-left {
   width:210px;
   padding: 12px 8px;
 }


.admin-channel-right {
   width:240px;
   padding: 12px 8px;
   flex:1
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
  <div class="admin-channel-manager">
    <div class="admin-channel-left">
        <a-tree :treeData="treeData"  :selectedKeys="currentKeys" @select="handleChange" >
        </a-tree>
    </div>
    <div class="admin-channel-right">
    <Breadcrumb :style="{ marginBottom: '10px' }">
      <BreadcrumbItem>栏目管理</BreadcrumbItem>
    </Breadcrumb>
    <Row :style="{ marginBottom: '10px' }">
      <Col span="4">
        <Input v-model="menuNameValue" style="width:90%;" placeholder="请输入菜单名称" />
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
  </div>

    <!-- 新增/编辑弹窗 -->
    <Modal
      v-model="formModal"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
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
        <FormItem label="菜单名称" prop="menuName">
          <Input v-model="formData.menuName" placeholder="请输入菜单名称" />
        </FormItem>
        <FormItem label="上级菜单" prop="parentId">
          <Select v-model="formData.parentId" placeholder="请选择上级菜单" clearable>
            <Option v-for="item in parentMenuList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="菜单路由" prop="path">
          <Input v-model="formData.path" placeholder="请输入菜单路由" />
        </FormItem>
        <FormItem label="菜单序号" prop="orderNum">
          <InputNumber v-model="formData.orderNum" placeholder="请输入菜单序号" />
        </FormItem>
        <FormItem label="菜单类型" prop="menuType">
          <RadioGroup v-model="formData.menuType" type="button">
            <Radio label="M" >目录</Radio>
            <Radio label="C">菜单</Radio>
            <!-- <Radio label="按钮" value="F"></Radio> -->
          </RadioGroup>
        </FormItem>
        <FormItem label="导航类型" prop="navigationType">
          <RadioGroup v-model="formData.navigationType" type="button">
            <Radio label="0" >内部导航</Radio>
            <Radio label="1" >外部链接</Radio>
            <!-- <Radio label="按钮" value="F"></Radio> -->
          </RadioGroup>
        </FormItem>
        <FormItem label="图标" prop="icon">
          <Row>
            <Col span="18">
              <img
                v-if="formData.icon"
                :src="formData.icon"
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
                <Button icon="ios-cloud-upload-outline">上传图标</Button>
              </Upload>
            </Col>
          </Row>
        </FormItem>
      </Form>
        <!-- <FormItem label="照片" prop="imageUrl">
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
        </FormItem> -->
      <!-- </Form> -->
    </Modal>

    <!-- 确认删除弹窗 -->
    <Modal v-model="deleteModal" title="确认删除" @on-ok="confirmDelete">
      <p>确定要删除该菜单吗？此操作不可逆。</p>
    </Modal>
  </div>
</template>
<script>
// Using a simpler approach without external editor libraries
import VueMarkdown from "vue-markdown";
import { Editor, Viewer } from "@bytemd/vue";
import "bytemd/dist/index.css";
import { Select } from "iview";

export default {
  components: {
    VueMarkdown,
    Editor,
    Viewer
  },
  data() {
    const treeData = []
    return {
      pageToken: "77a92fce48134eebbdb8ba6b08f1ebf2",
      // editor: null,
      // editorContent: "",
      filter: {
        auditState: null,
        userId: null,
        deptName: null,
        commentId: null,
        honorsType: 2
      },
      treeData,
      menuNameValue:undefined,
      currentKeys: [],
      parentMenuList:[],
      tableColumns: [
        {
          title: "id",
          key: "id",
          width: 60
        },
        {
          title: "菜单名称",
          key: "menuName",
          minWidth: 120
        },
        {
          title: "菜单状态",
          key: "navigationType",
          minWidth: 120
        },
        {
          title: "菜单类型",
          key: "menuTypeName",
          minWidth: 120
        },
        {
        title: '操作',
        fixed: 'right',
        slot: 'action',
        width: 180,
        align: 'center'
      }
        // {
        //   title: "状态",
        //   key: "status",
        //   minWidth: 120
        // },
        // {
        //   title: "创建时间",
        //   key: "createAtString",
        //   minWidth: 120
        // },
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
        menuName: "",
        menuType:"C",
        navigationType:"0",
        icon:null,
        path: "",
        parentId: "",
        orderNum: undefined
       
      },
      formRules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        imageUrl: [{ required: true, message: "请上传照片", trigger: "blur" }]
      },
      // 删除相关数据
      deleteModal: false,
      deleteId: null,
    };
  },
  methods: {
    loadTreeData() {
      this.$Loading.start();
      this.$http
        .get(`accredit/menu-tree/0`,)
        .then(res => {
          if (res.code !== 0) {
            this.$Message.error(res.message);
            this.$Loading.error();
            return;
          }
          this.$Loading.finish();
          res = res.data.map(item => ({...item,title:item.menuName,key:item.id, children:this.resolveTreeTitle(item.children)}));
          this.parentMenuList = res.map((item) => ({label:item.menuName,value:item.id}))
          this.currentKeys.push(res[0].id)
          this.treeData = res;
          this.treeData[0].selected = true
          this.loadChildrenData()
        });
    },
    loadChildrenData(defaultId){
      this.$Loading.start();
      this.$http
        .post( `accredit/menu-and-child`,{
          id:typeof defaultId  === 'number'? 0 :this.currentKeys[0],
          menuName:this.menuNameValue
        })
        .then(res => {
          if (res.code !== 0) {
            this.$Message.error(res.message);
            this.$Loading.error();
            return;
          }
          this.$Loading.finish();
          this.tableData =res.data.children.length === 0 ?[res.data] :[res.data,...res.data.children]
        });
    },
    onCheck(checkedKeys){
      console.log(checkedKeys,'keys')
      this.checkedKeys = checkedKeys
    },
    handleChange(selectedKeys,e){
      if(e.selected) {
      this.currentKeys = selectedKeys
      this.loadChildrenData()
      }
    },
    resolveTreeTitle(list){
      return list.map(i => ({...i,title:i.menuName,key:i.id}))
    },
    handleEditorChange(value) {
      this.formData.markdownContent = value;
    },
    search() {
      this.tablePageNo = 1;
      this.loadChildrenData();
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
      // this.getActivityDetail(row.id);
      this.formData = row
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
        .post(`accredit/delete-menus`, { deleteIds: [this.deleteId] })
        .then(res => {
          this.$Loading.finish();
          if (res.code !== 0) {
            this.$Message.error(res.message);
            return;
          }
          this.$Message.success("删除成功");
          this.loadChildrenData(this.treeData[0].id);
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
        this.formData.parentId = this.formData.parentId || 0
        this.$http.post("accredit/add-menu", this.formData).then(res => {
          this.$Loading.finish();
          if (res.code !== 0) {
            this.$Message.error(res.message);
            return;
          }
          this.$Message.success(this.isEdit ? "更新成功" : "添加成功");
          this.formModal = false;
          this.loadTreeData();
        });
      });
    },

    // 重置表单
    resetForm() {
      this.formData = {
        id: null,
        menuName: "",
        menuType:"C",
        navigationType:"0",
        icon:null,
        path: "",
        parentId: "",
        orderNum: undefined
      };
      if (this.$refs.formData) {
        this.$refs.formData.resetFields();
      }
    },
    // 处理照片上传成功
    handleImageUploadSuccess(response, file) {
      if (response.code === 0) {
        this.formData.icon = response.data;
        this.$Message.success("照片上传成功");
      } else {
        this.$Message.error(response.message || "上传失败");
      }
    }
  },
  created() {
    document.title = "部门管理";
    this.tablePageNo = 1;
    this.loadTreeData();
  }
};
</script>
