<style scoped>
.admin-faq-manager {
  width: 100%;
  height: 100%;
  overflow: scroll;
}
</style>
<template>
  <div class="admin-config-carousel">
    <Modal
      :loading="true"
      :title="isEdit ? '编辑AI项目' : '新增AI项目'"
      v-model="showCreateMode"
      :mask-closable="false"
      @on-ok="createOk"
      @on-cancel="createCancel">
      <Form ref="newForm" :model="newForm" :rules="newFormValidate" :label-width="80">
        <FormItem label="名称" prop="name">
          <Input v-model="newForm.name" placeholder="请输入名称..."/>
        </FormItem>
        <FormItem label="图片地址" prop="imgUrl">
          <Input v-model="newForm.imgUrl" placeholder="请输入图片地址..."/>
        </FormItem>
        <FormItem label="跳转连接" prop="actionUrl">
          <Input v-model="newForm.actionUrl" placeholder="请输入跳转连接..."/>
        </FormItem>
        <FormItem label="状态" prop="state">
          <Select v-model="newForm.state">
            <Option v-for="state in states" :value="state.value" :key="state.value">{{ state.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="序号" prop="sort">
          <Input v-model="newForm.sort" placeholder="请输入序号..."/>
        </FormItem>
      </Form>
    </Modal>
    <Breadcrumb :style="{marginBottom: '10px'}">
        <BreadcrumbItem>配置</BreadcrumbItem>
        <BreadcrumbItem>AI项目配置</BreadcrumbItem>
    </Breadcrumb>
    <Row :style="{marginBottom: '10px'}">
      <Col span="4" style="display: flex; column-gap: 10px;">
        <Input v-model="filter.name" style="width:90%;" placeholder="名称" />
        <Button type="primary" @click="search">查询</Button>
        <Button type="success" @click="showCreateMode = true">新增</Button>
      </Col>
    </Row>
    <Table border :columns="tableColumns" :data="tableData">
      <template slot-scope="{ row, index }" slot="action">
        <Button type="primary" size="small" @click="handleEdit(row)">编辑</Button>
        <Button type="error" size="small" @click="handleDelete(row.id)">删除</Button>
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
      <Modal v-model="deleteModal" title="确认删除" @on-ok="confirmDelete">
      <p>确定要删除该条数据吗？此操作不可逆。</p>
    </Modal>
  </div>
</template>
<script>
export default {
  data () {
    return {
      showCreateMode: false,
      newForm: {
        type: '',
        name: '',
        imgUrl: '',
        actionUrl: '',
        startAt: '',
        endAt: ''
      },
      newFormValidate: {
        type: [
          { required: true, message: '类型不能为空', trigger: 'blur' }
        ],
        imgUrl: [
          { required: true, message: '图片地址不能为空', trigger: 'blur' },
          { type: 'string', max: 1024, message: '最大长度不得超过1024个字', trigger: 'blur' }
        ],
        actionUrl: [
          { required: true, message: '跳转连接不能为空', trigger: 'blur' },
          { type: 'string', max: 1024, message: '最大长度不得超过1024个字', trigger: 'blur' }
        ],
        startAt: [
          { required: true, message: '开始时间不能为空', trigger: 'blur' },
          { type: 'string', max: 100, message: '最大长度不得超过256个字', trigger: 'blur' }
        ],
        endAt: [
          { required: true, message: '结束时间不能为空', trigger: 'blur' },
          { type: 'string', max: 100, message: '最大长度不得超过256个字', trigger: 'blur' }
        ]
      },
      states: [],
      types: [{
        value: '',
        label: '全部类型'
      }, {
        value: 'HOME_CAROUSEL',
        label: '首页轮播图'
      }, {
        value: 'SIDEBAR_CAROUSEL',
        label: '侧边栏轮播图'
      }],
      filter: {
        state: null,
        name: null,
        type: null
      },
      tableColumns: [{
        title: 'id',
        key: 'id',
        fixed: 'left',
        width: 60
      },
      {
        title: '名称',
        key: 'name',
        width: 100
      },
      {
        title: '封面',
        key: 'imgUrl',
        fixed: 'left',
        width: 100,
        render: (h, params) => {
          return h('img', {
            attrs: {
                src: params.row.imgUrl,
                alt: '图片'
              },
            style: {
              maxWidth: '100px',
              maxHeight: '100px'
            }
          })
        }
      },
      {
        title: '跳转地址',
        key: 'actionUrl',
        fixed: 'left',
        render: (h, params) => {
          return h('a', {
            props: {
              href: params.row.actionUrl
            }
          },params.row.actionUrl)
        },
        width: 100
      },
       {
        title: '类型',
        key: 'type',
        fixed: 'left',
        width: 100
      }, {
        title: '状态',
        key: 'stateDesc',
        fixed: 'left',
        width: 100
      }, {
        title: '序号',
        key: 'sort',
        width: 100
      }, {
        title: '创建人',
        key: 'creator',
        width: 100
      }, {
        title: '创建时间',
        key: 'createAtString',
        width: 180
      }, {
        title: '更新时间',
        key: 'updateAtString',
        width: 180
      }, {
        title: '操作',
        fixed: 'right',
        slot: 'action',
        width: 150,
        align: 'center'
      }],
      tableData: [],
      tableTotal: 0,
      tablePageSize: 10,
      tablePageNo: 1,
      isEdit: false,
      rowId:'',
      deleteModal:false,
    }
  },
  methods: {
    loadData () {
      this.$Loading.start()
      this.$http.post('/widget-config/page', {
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
    fetchState(){
      this.$http.get('/accredit/enum-constant-list/WidgetStateEn').then(res => {
        if (res.code !== 0) {
          this.$Message.error(res.message)
          return
        }
        this.states = res.data.map(i => ({
          label:i.value,
          value:i.key
        }))
      })
    },
    handleDelete(id){
      this.deleteModal = true
      this.rowId = id
    },
    confirmDelete(){
      this.$http.post(`widget-config/delete/${this.rowId}`).then(res => {
        if (res.code !== 0) {
          this.$Message.error(res.message)
          return
        }
        this.$Message.success('删除成功');
        this.loadData();
      }).finally(() => {
        this.deleteModal = false
        this.rowId = ''
      })
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
    handleEdit (row) {
      this.isEdit = true;
      this.newForm = {...row};
      this.showCreateMode = true;
    },
    createOk () {
      this.$refs.newForm.validate((valid) => {
        if (!valid) {
          return
        }
        this.$Loading.start()
        const params = {
          name: this.newForm.name,
          state: this.newForm.state,
          actionUrl: this.newForm.actionUrl,
          sort: this.newForm.sort,
          imgUrl: this.newForm.imgUrl,
          stateDesc: this.newForm.stateDesc,
          id: this.newForm.id ? this.newForm.id : undefined
        }
        this.$http.post(`/widget-config/${this.isEdit ? 'update' : 'add'}`, params).then(res => {
          if (res.code !== 0) {
            this.$Loading.error()
            this.$Message.error(res.message)
            return
          }
          this.$refs.newForm.resetFields()
          this.showCreateMode = false
          this.$Loading.finish()
          this.$Message.success(res.message)
          this.tablePageNo = 1
          this.loadData()
        })
      })
    },
    createCancel () {
      this.$refs.newForm.resetFields()
      this.isEdit = false
    }
  },
  created() {
    document.title = "AI项目配置";
    this.tablePageNo = 1;
    this.loadData();
    this.fetchState()
  }
}
</script>
