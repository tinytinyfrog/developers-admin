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
.role-drawer-footer{
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        border-top: 1px solid #e8e8e8;
        padding: 10px 16px;
        text-align: right;
        background: #fff;
    }
 .data-wrap {
  display: flex;
  column-gap: 16px;
 }
 .data-value {
  width: 400px;
 }
 .tree-wrap{
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 16px;
 }
</style>
<template>
  <div class="admin-faq-manager">
    <Breadcrumb :style="{ marginBottom: '10px' }">
      <BreadcrumbItem>角色管理</BreadcrumbItem>
    </Breadcrumb>
    <Row :style="{ marginBottom: '10px' }">
      <Col span="4">
        <Input v-model="filter.roleName" style="width:90%;" placeholder="请输入角色名称" />
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
        <Button
          type="success"
          size="small"
          style="margin-right: 5px"
          @click="handleManage(row)"
          >权限管理
        </Button>
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
      :title="isEdit ? '编辑角色' : '新增角色'"
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
        <FormItem label="角色名称" prop="roleName">
          <Input v-model="formData.roleName" placeholder="请输入角色名称" />
        </FormItem>
        <FormItem label="角色编码" prop="roleKey">
          <Input v-model="formData.roleKey" placeholder="请输入角色编码" :disabled="['ADMIN', 'SUPER_ADMIN','GUEST','USER'].includes(formData.roleKey)" />
        </FormItem>
      </Form>
    </Modal>

    <!-- 确认删除弹窗 -->
    <Modal v-model="deleteModal" title="确认删除" @on-ok="confirmDelete">
      <p>确定要删除该角色吗？此操作不可逆。</p>
    </Modal>
    <Drawer Drawer v-model="actionDrawer" title="权限管理" @on-ok="confirmDelete" width="40%">
      <Tabs v-model="tabValue">
          <TabPane label="功能权限" name="menu">
            <div v-if="treeData.length > 0">
              <div>
                <Checkbox v-model="expandValue">展开/折叠</Checkbox>
                <Checkbox v-model="checkValue" >全选/全不选</Checkbox>
              </div>
              <div class="tree-wrap">
                <a-tree :treeData="treeData"   @expand="onExpand" :expandedKeys.sync="expandKeys" checkable checkStrictly :checkedKeys="checkedKeys" @check="onCheck" aria-checked="">
                </a-tree>
              </div>
            </div>
            <div v-else>
              <a-empty description="暂无数据"/>
            </div>
          </TabPane>
          <TabPane label="数据权限" name="data"> 
            <div class="data-wrap">
              <div class="data-label"><span style="color: red;">*</span>数据权限范围</div>
              <div class="data-value">
                <a-select v-model="selectValue" placeholder="请选择数据权限范围" style="width: 400px" >
                  <a-select-option v-for="(item,index) of dataList" :key="index" :value="item.key">{{ item.value }}</a-select-option>
                </a-select>
              </div>
            </div>
        </TabPane>
        </Tabs>
      <div class="role-drawer-footer">
          <Button style="margin-right: 8px" @click="actionDrawer = false">关闭</Button>
          <Button type="primary" @click="handleSbumit">保存</Button>
      </div>
    </Drawer>
  </div>
</template>
<script>
// Using a simpler approach without external editor libraries
import VueMarkdown from "vue-markdown";
import { Editor, Viewer } from "@bytemd/vue";
import "bytemd/dist/index.css";
import { getCookie } from "../../lib/util";
import { Select } from "iview";
import { Checkbox, Empty } from "ant-design-vue";

export default {
  components: {
    VueMarkdown,
    Editor,
    Viewer
  },
  data() {
    return {
      pageToken:getCookie('__dp_tk__') || "77a92fce48134eebbdb8ba6b08f1ebf2",
      // editor: null,
      // editorContent: "",
      filter: {
        auditState: null,
        userId: null,
        roleName: undefined,
        commentId: null,
        honorsType: 2
      },
      tableColumns: [
        {
          title: "id",
          key: "id",
          width: 100
        },
        {
          title: "角色名称",
          key: "roleName",
          minWidth: 120
        },
        {
          title: "编码",
          key: "roleKey",
          minWidth: 120
        },
        {
          title: "用户状态",
          key: "status",
          width: 120,
        //   render: (h, params) => {
        //     return h(
        //       "Avatar",
        //       {
        //         props: {
        //           src: params.row.imageUrl
        //         }
        //       },
        //       params.row.authorNickname
        //     );
        //   }
        },
        {
          title: "备注",
          key: "remark",
          minWidth: 120
        },
        {
          title: "创建时间",
          key: "createAtString",
          minWidth: 120
        },
        {
          title: "操作",
          slot: "action",
          width: 250,
          fixed: "right"
        }
      ],
      tableData: [],
      tableTotal: 0,
      tablePageSize: 10,
      tablePageNo: 1,
      expandValue:false,
      checkValue:false,
      // 表单相关数据
      formModal: false,
      isEdit: false,
      tabValue: 'menu',
      formData: {
        roleName:'',
        roleKey:''
      },
      formRules: {
        roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        roleKey: [{ required: true, message: "请输入角色编码", trigger: "blur" }]
      },
      // 删除相关数据
      deleteModal: false,
      deleteId: null,
      actionDrawer:false,
      dataList:[],
      selectValue:'ALL',
      roleId:null,
      treeData:[],
      expandKeys:[],
      checkedKeys:[],
      isCheckedAll: false
    };
  },
  methods: {
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys; 
    },
    onCheck(checkedKeys){
      this.checkedKeys = checkedKeys.checked
    },
    loadData() {
      this.$Loading.start();
      this.$http
        .post("accredit/page-role", {
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
    handleManage(row){
      this.actionDrawer = true;
      this.roleId = row.id
    },
    handleSbumit(){
      if(this.tabValue === 'data'){
        this.$http.post(`accredit/add-data-scope`,{scopeType:this.selectValue,id:this.roleId,roleId:this.roleId}).then(res => {
            if(res.data) {
              this.$Message.success('配置成功');
            }else{
              this.$Message.error(res.message);
            }
        })
      }
      if(this.tabValue === 'menu') {
        this.$http.post('accredit/add-role-menu',{roleId:this.roleId,menuIds:this.checkedKeys}).then(res => {
            if(res.code === 0) {
              this.$Message.success('配置成功');
              this.loadTreeData()
            }else{
              this.$Message.error(res.message);
            }
        })
      }
    },
    loadTreeData() {
      this.$Loading.start();
      this.$http
        .get(`accredit/role-menu-tree/${this.roleId}`,)
        .then(res => {
          if (res.code !== 0) {
            this.$Message.error(res.message);
            this.$Loading.error();
            return;
          }
          this.$Loading.finish();
          res = res.data.map(item => ({...item,title:item.menuName,key:item.id, children:this.resolveTreeTitle(item.children)}));
          this.treeData = res;
          this.getRoleMenuDetail()
          console.log(this.checkedKeys)
        });
    },
    resolveTreeTitle(list){
      return list.map(i => ({...i,title:i.menuName,key:i.id}))
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
      //this.getActivityDetail(row.id);
      this.formData = { roleName:row.roleName,roleKey:row.roleKey,roleId:row.id,userId:row.id };
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
    getDataList(){
      this.$Loading.start()
      this.$http.get(`accredit/enum-constant-list/DataScopeEn`).then((res) => {
        console.log(res,'ddd')
        this.dataList = res.data
        this.getRolDataDetail()
      }).finally(() => {
        this.$Loading.finish()
      })
    },
    getRolDataDetail(){
      this.$Loading.start()
      this.$http.get(`accredit/role-data-scope/${this.roleId}`).then((res) => {
      if(res.data)
        this.selectValue = res.data.scopeType
      }).finally(() => {
        this.$Loading.finish()
      })
    },
    getRoleMenuDetail(){
      this.$Loading.start()
      this.$http.get(`accredit/role-menu-ids/${this.roleId}`).then((res) => {
      if(res.data)
        this.checkedKeys = res.data
      }).finally(() => {
        this.$Loading.finish()
      })
    },
    getAllKeys(){
     let arr = []
      if(!this.treeData || this.treeData.length === 0) {
        return arr
      }
      this.treeData.map(item => {
            arr.push(item.key)
            if(item.children.length > 0) {
              item.children.map(i => {
                arr.push(i.key)
              })
            }
      })
         return arr
    },
    // 处理删除
    handleDelete(row) {
      this.deleteId = row.id
      this.deleteModal = true;
    },
    // 确认删除
    confirmDelete() {
      if (!this.deleteId) return;

      this.$Loading.start();
      this.$http
        .post(`accredit/delete-role`, { id: this.deleteId })
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
        // if (this.formData.id == null || this.formData.id == "null") {
        //   this.formData.id = "";
        // }
        this.$Loading.start();
        this.$http.post( this.isEdit ? "accredit/update-user-role": "accredit/add-role", this.formData).then(res => {
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
        roleName:'',
        roleKey:''
      };
      if (this.$refs.formData) {
        this.$refs.formData.resetFields();
      }
    },
    // 处理照片上传成功
  },
  created() {
    document.title = "角色管理";
    this.tablePageNo = 1;
    this.loadData();
  },
  watch:{
    tabValue(oVal,nVal){
      if(oVal === 'data'){
        this.getDataList()
      }
      if(oVal === 'menu') {
        this.loadTreeData()
      }
    },
    actionDrawer(oVal){
      if(!oVal){
        this.roleId = null
      }
      if(oVal && this.tabValue === 'menu') {
        this.loadTreeData()
      }
      if(oVal && this.tabValue === 'data') {
        this.getDataList()
      }
    },
    expandValue(oVal){
      console.log(oVal,'oVal')
      if(oVal){
          this.treeData.map(item => {
            this.expandKeys.push(item.key)
            if(item.children.length > 0) {
              item.children.map(i => {
                this.expandKeys.push(i.key)
              })
            }
          })
      }else {
        this.expandKeys = []
      }
    },
    checkValue(oVal){
      console.log(this.selectValue,'ddd')
      if(oVal){
          this.treeData.map(item => {
            this.checkedKeys.push(item.key)
            if(item.children.length > 0) {
              item.children.map(i => {
                this.checkedKeys.push(i.key)
              })
            }
          })
      }else  {
        this.checkedKeys = []
      }
    }
  }
};
</script>
