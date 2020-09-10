<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="toAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类列表区域 -->
      <tree-table
      :data="cateList"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      :show-row-hover="false"
      show-index
      index-text="#"
      border
      class="cateTable">
        <!-- 是否有效 -->
        <template slot="isEffective" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="danger">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="handle" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="toEditCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" @close="resetAddCateForm">
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef">
        <el-form-item label="分类名称" label-width="90px" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" label-width="90px">
          <el-cascader v-model="addCateKeys" :options="allCateList" :props="cascaderProps" @change="parentCateChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="resetEditCateForm">
      <!-- 表单填写区域 -->
      <el-form label-width="100px" :model="editCateForm" :rules="addCateRules" ref="editCateFormRef">
        <!-- 分类名称 -->
        <el-form-item label="角色名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 控制添加商品分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 控制添加商品分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 商品分类列表
      cateList: [],
      // 查询分类列表条件:
      queryInfo: {
        type: 3,
        // 获取并显示第几页
        pagenum: 1,
        // 每页显示几条数据
        pagesize: 5
      },
      // 总共有多少条数据
      total: 0,
      // 分类表格每列所展示的数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isEffective'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'handle',
          align: 'center',
          width: '250px'
        }
      ],
      // 添加分类表单数据(默认添加一级分类)
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类表达验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '分类名称长度在2-10个字符之间', trigger: 'blur' }
        ]
      },
      // 全部商品分类
      allCateList: [],
      // cascaderProps级联选择器数据展示配置
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 关联添加分类时选中的id
      addCateKeys: [],
      // 编辑分类表单数据
      editCateForm: {},
      // 要编辑的分类的id
      editCateId: ''
    }
  },
  methods: {
    // 获取商品分类数据
    getCateList: async function () {
      const { data: result } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = result.data.result
      this.total = result.data.total
      console.log(this.cateList)
    },
    // 每页显示条数变化
    handleSizeChange: function (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 当前页改变时
    handleCurrentChange: function (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加分类时显示添加分类对话框并获取全部分类数据
    toAddCate: async function () {
      const { data: result } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.allCateList = result.data
      console.log(this.allCateList)
      this.addCateDialogVisible = true
    },
    // 添加分类选择框父级分类改变时执行的函数
    parentCateChange: function () {
      console.log(this.addCateKeys)
      // 若addCateKeys数组长度为0，则没有选择任何父级分类，创建的分类为一级分类
      // 若addCateKeys数组长度为1，则选择了父级分类，创建的分类为二级分类
      // 若addCateKeys数组长度为2，则选择了父级分类，创建的分类为三级分类
      if (this.addCateKeys.length > 0) {
        this.addCateForm.cat_level = this.addCateKeys.length
        this.addCateForm.cat_pid = this.addCateKeys[this.addCateKeys.length - 1]
      } else {
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    },
    // 重置添加分类表单信息
    resetAddCateForm: function () {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.addCateKeys = []
    },
    // 确认添加商品分类
    addCate: function () {
      // 表单预验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送添加商品分类请求
        const { data: result } = await this.$http.post('categories', this.addCateForm)
        if (result.meta.status !== 201) {
          return this.$message.error('添加商品分类失败')
        }
        this.$message.success('添加商品分类成功')
        // 隐藏添加商品分类对话框
        this.addCateDialogVisible = false
        // 更新商品分类列表页面
        this.getCateList()
      })
    },
    // 展示编辑分类对框框并将当前分类显示在对框框中
    toEditCate: async function (id) {
      // 根据id获取分类
      const { data: result } = await this.$http.get('categories/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.editCateForm = result.data
      this.editCateDialogVisible = true
    },
    // 编辑分类
    editCate: function () {
      // 表单预验证
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送修改用户请求
        const { data: result } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if (result.meta.status !== 200) {
          return this.$message.error('编辑商品分类失败')
        }
        this.$message.success('编辑商品分类成功')
        // 隐藏编辑商品分类对话框
        this.editCateDialogVisible = false
        // 更新商品分类列表页面
        this.getCateList()
      })
    },
    // 编辑商品分类对框框关闭时 执行的函数
    resetEditCateForm: function () {
      this.$refs.editCateFormRef.resetFields()
    },
    // 删除分类
    deleteCate: async function (id) {
      const res = await this.$confirm('是否要删除该分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message('已取消删除分类操作')
      }
      // 向服务器发送请求，删除对应分类
      const { data: result } = await this.$http.delete('categories/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      // 重新获取分类列表
      this.getCateList()
    }
  },
  created () {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.cateTable {
  margin-top: 20px;
}
</style>
