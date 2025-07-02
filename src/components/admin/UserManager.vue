<style scoped>
.admin-user {
  width: 100%;
  height: 100%;
  overflow: scroll;
}
.set-wrap {
  display: flex;
}
</style>
<template>
  <div class="admin-user">
    <Breadcrumb :style="{marginBottom: '10px'}">
        <BreadcrumbItem>用户</BreadcrumbItem>
        <BreadcrumbItem>用户管理</BreadcrumbItem>
    </Breadcrumb>
    <Row :style="{marginBottom: '10px'}">
      <Col span="4">
        <Select v-model="filter.role" style="width:90%;" placeholder="用户角色">
          <Option v-for="role in roles" :value="role.value" :key="role.value">{{ role.label }}</Option>
        </Select>
      </Col>
      <Col span="4">
        <Select v-model="filter.state" style="width:90%;" placeholder="用户状态">
          <Option v-for="state in states" :value="state.value" :key="state.value">{{ state.label }}</Option>
        </Select>
      </Col>
      <Col span="4">
        <Input v-model="filter.nickname" style="width:90%;" placeholder="昵称" />
      </Col>
      <Col span="4">
        <Input v-model="filter.email" style="width:90%;" placeholder="邮箱" />
      </Col>
      <Col span="4">
        &nbsp;&nbsp;&nbsp;<Button type="primary" @click="search">查询</Button>
        &nbsp;&nbsp;&nbsp;<Button type="success" @click="openAddModal">新增</Button>
      </Col>
    </Row>
    <Table border :columns="tableColumns" :data="tableData">
      <template slot-scope="{ row, index }" slot="action">
        <Button v-if="row.state === '禁用'" type="success" size="small" @click="enable(row)">启用</Button>
        <Button v-if="row.state !== '禁用'" type="error" size="small" @click="disable(row)">禁用</Button>
        <Button type="primary" size="small" @click="() =>handleEdit(row)">编辑</Button>
        <Button type="success" size="small" @click="() =>handleOpen(row)">权限管理</Button>
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
      :style="{marginTop: '10px', textAlign: 'right'}" />
    <Modal
        v-model="setModal"
        title="设置角色"
        width="450"
        @on-ok="handleFormSubmit"
        @on-cancel="setModal = false;"
        destroy-on-close
    >
        <div class="set-wrap">
         <div style="width: 80px;">选择角色：</div> 
         <Select  placeholder="请选择角色名称" v-model="roleId" >
          <Option
            v-for="(item,index) of roleList"
            :value="item.id"
            :key="index"
            >{{ item.roleName }}
            </Option>
         </Select>
        </div>
 
    </Modal>
    <Modal
        v-model="addModal"
        :title="isEdit ? '编辑用户' : '新增用户'"
        width="450"
        @on-ok="handleUserSubmit"
        @on-cancel="addModal = false; resetForm()"
    >
    <Form
        ref="formData"
        :model="formData"
        :rules="formRules"
        :label-width="100"
      >
        <FormItem label="昵称" prop="nickname">
          <Input v-model="formData.nickname" placeholder="请输入昵称" />
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="formData.email" placeholder="请输入邮箱" />
        </FormItem>
        <FormItem label="角色" prop="role" v-if="!isEdit">
          <Select  placeholder="请选择角色名称" v-model="roleId" >
            <Option
              v-for="(item,index) of roleList"
              :value="item.id"
              :key="index"
              >{{ item.roleName }}
              </Option>
          </Select>
        </FormItem>
        <FormItem label="性别 " prop="sex">
           <RadioGroup v-model="formData.sex">
             <Radio v-for="item of sexList" :label="item.key" :key="item.key">{{ item.value }}</Radio>
           </RadioGroup>
        </FormItem>
        <FormItem label="密码" prop="password" v-if="!isEdit">
          <Input v-model="formData.password" placeholder="请输入密码" />
        </FormItem>
        <FormItem label="头像" prop="avatar">
          <Row>
            <Col span="18">
              <img
                v-if="formData.avatar"
                :src="formData.avatar"
                alt=""
                style="width: 100px; height: 100px;"
              />
              <Upload
                action="/api/file/image/upload"
                :headers="{ token: pageToken }"
                :on-success="handleAvatarUploadSuccess"
                :on-format-error="handleFormatError"
                :format="['jpg', 'jpeg', 'png']"
                :max-size="2048"
                :show-upload-list="false"
              >
                <Button icon="ios-cloud-upload-outline">上传头像</Button>
              </Upload>
            </Col>
          </Row>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
import { getCookie } from "../../lib/util";
export default {
  data () {
    return {
      pageToken:getCookie('__dp_tk__') || "1ed93768cd0a475093a1861a746a4d58",
      roles: [{
        value: '',
        label: '全部用户'
      }, {
        value: 'SUPER_ADMIN',
        label: '超级管理员'
      }, {
        value: 'ADMIN',
        label: '管理员'
      }, {
        value: 'USER',
        label: '普通用户'
      }],
      states: [{
        value: '',
        label: '全部状态'
      }, {
        value: 'ENABLE',
        label: '启用'
      }, {
        value: 'DISABLE',
        label: '禁用'
      }, {
        value: 'UN_ACTIVATION',
        label: '未激活'
      }],
      filter: {
        email: null,
        nickname: null,
        role: null,
        state: null
      },
      tableColumns: [{
        title: 'id',
        key: 'id',
        fixed: 'left',
        width: 100
      }, {
        title: '头像',
        key: 'avatar',
        width: 70,
        fixed: 'left',
        render: (h, params) => {
          return h('Avatar', {
            props: {
              src: params.row.avatar
            }
          }, params.row.nickname)
        }
      }, {
        title: '邮箱',
        key: 'email',
        fixed: 'left',
        width: 180
      }, {
        title: '昵称',
        key: 'nickname',
        width: 100
      }, {
        title: '角色',
        key: 'role',
        width: 80
      }, {
        title: '性别',
        key: 'sex',
        width: 70
      }, {
        title: '状态',
        key: 'state',
        width: 80
      }, {
        title: '描述',
        key: 'signature',
        width: 300
      }, {
        title: '创建时间',
        key: 'createAt',
        width: 150
      }, {
        title: '更新时间',
        key: 'updateAt',
        width: 150
      }, {
        title: '操作',
        fixed: 'right',
        slot: 'action',
        width: 200,
        align: 'center'
      }],
      tableData: [],
      tableTotal: 0,
      tablePageSize: 10,
      tablePageNo: 1,
      setModal:false,
      roleList:[],
      roleId: undefined,
      currenUser:null,
      addModal:false,
      formRules: {
        nickname: [
          { required: true, message: "请输入昵称", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { 
          pattern: /^[a-zA-Z0-9_.-]+@talkweb\.com\.cn$/, 
          message: "请输入有效的 @talkweb.com.cn 邮箱地址",
          trigger: "blur"
        }
        ],
        role: [{ required: true, message: "请输入角色", trigger: "blur" }],
        sex: [
          { required: true, message: "请输入性别", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" }
        ]
      },
      formData: {
        id: null,
        nickname: "",
        email: "",  
        role: "USER",
        sex: "MALE",
        password: "",
        avatar: ""
      },
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        id: null,
        nickname: "",
        email: "",  
        role: "USER",
        sex: "MALE",
        password: "",
        avatar: ""
      };
      if (this.$refs.formData) {
        this.$refs.formData.resetFields();
      }
    },
    loadData () {
      this.$Loading.start()
      this.$http.post('/user/admin-page', {
        pageSize: this.tablePageSize,
        pageNo: this.tablePageNo,
        filter: this.filter
      }).then(res => {
        if (res.code !== 0) {
          this.$Message.error(res.message)
          this.$Loading.error()
          return
        }
        this.$Loading.finish()
        this.tableData = res.data.list
        this.tableTotal = res.data.total
      })
    },
    fetchSexList(){
      this.$Loading.start()
      this.$http.get('/accredit/enum-constant-list/UserSexEn').then(res => {
        if (res.code !== 0) {
          this.$Message.error(res.message)
          this.$Loading.error()
          return
        }
        this.$Loading.finish()
        this.sexList = res.data
      })
    },
    openAddModal(){
      this.isEdit = false;
      this.addModal = true
    },
    handleUserSubmit(){
      if(!this.formData.id){
        delete this.formData.id
      }
      if(this.formData.id){
        delete this.formData.sexValue
      }
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.$http.post(this.isEdit ? '/user/update-info' : '/user/register', this.formData).then(res => {
            if (res.code !== 0) {
              this.$Message.error(res.message)
              return
            }
            this.$Message.success("保存成功");
            this.addModal = false
            this.loadData()
          }).finally(() => {
            this.resetForm()
          })
        }
      })
    },
    handleAvatarUploadSuccess(response, file) {
      if (response.code === 0) {
        console.log(response.data,'response',this.formData)
        this.formData.avatar = response.data
        this.$Message.success("头像上传成功");
      } else {
        this.$Message.error(response.message || "上传失败");
      }
    },
    handleFormatError (file) {
       this.$Message.warning('不支持上传此类型文件');
    },
    handleOpen(row){
      this.setModal =true
      this.currenUser = row
      if(row.roleId) {
        this.roleId = row.roleId
      }
    },
    handleEdit(row){
      this.isEdit = true
      this.addModal = true
      this.formData = {...row}
      this.formData.sex = row.sexValue
    },
    search () {
      this.tablePageNo = 1
      this.loadData()
    },
    goPage (pageNo) {
      this.tablePageNo = pageNo
      this.loadData()
    },
    pageSizeChange (pageSize) {
      this.tablePageSize = pageSize
      this.tablePageNo = 1
      this.loadData()
    },
    enable (row) {
      this.updateState('enable', row.id)
    },
    disable (row) {
      this.updateState('disable', row.id)
    },
    fetchRoleList(){
      this.$Loading.start()
      this.$http.post(`accredit/page-role`,{
        pageSize:9999,pageNo:1,filter:{}
      }).then((res) => {
        this.roleList = res.data.list
      }).finally(() => {
        this.$Loading.finish()
      })
    },
    handleFormSubmit(){
      this.$Loading.start()
      this.$http.post(`accredit/update-user-role`,{
         roleId:this.roleId,
         userId:this.currenUser.id,
      }).then((res) => {
         if(res.code === 0) {
          this.$Message.success('修改成功')
          this.loadData()
         }else {
          this.$Message.error(res.message)
         }
      }).finally(() => {
        this.$Loading.finish()
      })
    },
    updateState (path, id) {
      this.$Loading.start()
      this.$http.post(`/user/${path}/${id}`, {}).then(res => {
        if (res.code !== 0) {
          this.$Loading.error()
          return
        }
        this.$Loading.finish()
        this.$Message.success('更新状态成功!')
        this.loadData()
      })
    },
    updateRole (id, is) {
      this.$Loading.start()
      this.$http.post(`/user/update-role`, { id, is }).then(res => {
        if (res.code !== 0) {
          this.$Loading.error()
          this.$Message.error(res.message)
          return
        }
        this.$Loading.finish()
        this.$Message.success(res.message)
        this.loadData()
      })
    }
  },
  created () {
    document.title = '用户管理'
    this.tablePageNo = 1
    this.loadData()
    this.fetchRoleList()
    this.fetchSexList()
  },
  watch:{
    setModal(oVal) {
      if(!oVal) {
        this.roleId = undefined
      }
    }
  }
}
</script>
