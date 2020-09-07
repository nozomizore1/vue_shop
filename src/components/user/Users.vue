<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="paramsInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="id" label="用户ID" width="100"></el-table-column>
        <el-table-column prop="username" label="姓名" width="100"></el-table-column>
        <el-table-column prop="email" label="邮箱地址" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="100"></el-table-column>
        <el-table-column label="用户状态" width="100">
          <template slot-scope="scope">
            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="getEditUser(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :nterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="paramsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="resetAddUserForm">
      <!-- 表单填写区域 -->
      <el-form :model="addUserForm" ref="addUserFormRef" :rules="addUserRules" label-width="100px">
        <!-- 用户名 -->
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码:" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item label="手机号码:" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="resetEditUserForm">
      <!-- 表单填写区域 -->
      <el-form label-width="100px" :model="editUserForm" :rules="editUserRules" ref="editUserFormRef">
        <!-- 用户名 -->
        <el-form-item label="用户名:">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item label="手机号码:" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 邮箱正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法邮箱
        return cb()
      }
      cb(new Error('请输入正确的邮箱'))
    }
    // 验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      // 手机号码正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法手机号码
        return cb()
      }
      cb(new Error('请输入正确的手机号'))
    }
    return {
      // 获取用户列表时要传递的的参数对象
      paramsInfo: {
        query: '',
        // 当前是第几页
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 2
      },
      userList: [],
      // 总共有多少条数据
      total: 1,
      pagenum: 1,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户信息对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户表单信息
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户表单信息
      editUserForm: {},
      // 添加用户表单的验证规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 16, message: '用户名长度在3-16个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度在6-16个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户表单的验证规则
      editUserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取用户列表
    getUserList: async function () {
      const { data: result } = await this.$http.get('users', {
        params: this.paramsInfo
      })
      console.log(result.data)
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = result.data.users
      this.total = result.data.total
      this.pagenum = result.data.pagenum
    },
    // 每页显示数据条数改变事件 触发时 执行的函数
    handleSizeChange: function (newSize) {
      this.paramsInfo.pagesize = newSize
      this.getUserList()
    },
    // 当前页码值改变事件 触发时 执行的函数
    handleCurrentChange: function (newPage) {
      this.paramsInfo.pagenum = newPage
      this.getUserList()
    },
    // 修改用户状态
    userStateChange: async function (newInfo) {
      const { data: result } = await this.$http.put(`users/${newInfo.id}/state/${newInfo.mg_state}`)
      if (result.meta.status !== 200) {
        newInfo.mg_state = !newInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },
    // 添加用户对话框关闭事件 触发时 执行的函数
    resetAddUserForm: function () {
      this.$refs.addUserFormRef.resetFields()
    },
    // 添加用户
    addUser: function () {
      // 表单预验证
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送添加用户请求
        const { data: result } = await this.$http.post('users', this.addUserForm)
        if (result.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 更新用户列表页面
        this.getUserList()
      })
    },
    // 点击修改显示修改用户对话框并获取要修改的用户信息
    getEditUser: async function (id) {
      // 根据id，向服务器发送请求获取对应的用户信息
      const { data: result } = await this.$http.get('users/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      // 显示修改用户对话框
      this.editDialogVisible = true
      this.editUserForm = result.data
    },
    // 修改用户对话框关闭事件 触发时 执行的函数
    resetEditUserForm: function () {
      this.$refs.editUserFormRef.resetFields()
    },
    // 修改用户
    editUser: function () {
      // 表单预验证
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送修改用户请求
        const { data: result } = await this.$http.put('users/' + this.editUserForm.id, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        console.log(result)
        if (result.meta.status !== 200) {
          return this.$message.error('修改用户失败')
        }
        this.$message.success('修改用户成功')
        // 隐藏添加用户对话框
        this.editDialogVisible = false
        // 更新用户列表页面
        this.getUserList()
      })
    },
    // 删除用户
    deleteUser: async function (id) {
      const res = await this.$confirm('是否要删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message('已取消删除用户操作')
      }
      // 向服务器发送请求，删除对应用户
      const { data: result } = await this.$http.delete('users/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // 重新获取用户列表
      this.getUserList()
    }
  },
  created () {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
</style>
