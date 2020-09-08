<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-row class="rolesList">
        <el-table :data="rolesList" border stripe>
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row  class="vcenter" :class="i1 === 0? 'row-head' : 'row-body'" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag effect="dark" closable @close="removeRight(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="19">
                  <el-row class="vcenter" v-for="(item2, i2) in item1.children" :class="i2 === (item1.children.length - 1)? '' : 'row-body'" :key="item2.id">
                    <!-- 渲染二级权限 -->
                    <el-col :span="6">
                      <el-tag type="success" effect="dark" closable @close="removeRight(scope.row, item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 渲染三级权限 -->
                    <el-col :span="18">
                      <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" effect="dark" closable @close="removeRight(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <!-- 编辑按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="getEditRole(scope.row.id)">编辑</el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
              <!-- 分配角色按钮 -->
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="getAllotRight(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="resetAddRoleForm">
      <!-- 表单填写区域 -->
      <el-form :model="addRoleForm" ref="addRoleFormRef" :rules="addRoleRules" label-width="100px">
        <!-- 角色名称 -->
        <el-form-item label="角色名称:" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item label="角色描述:" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" @close="resetEditRoleForm">
      <!-- 表单填写区域 -->
      <el-form label-width="100px" :model="editRoleForm" :rules="addRoleRules" ref="editRoleFormRef">
        <!-- 角色名称 -->
        <el-form-item label="角色名称:" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item label="角色描述:" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="allotRightDialogVisible" width="50%" @close="resetdefaultRightsId">
      <!-- 表单填写区域 -->
      <el-tree :data="rightsList" show-checkbox default-expand-all :default-checked-keys="defaultRightsId" ref="rightsRef" node-key="id" highlight-current :props="defaultProps"></el-tree>
      <!-- 底部按钮区域 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="allotRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 控制修改角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      // 控制分配对话框的显示与隐藏
      allotRightDialogVisible: false,
      // 所有权限列表(树状)
      rightsList: [],
      // 权限列表展现形式
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点的id(对应的权限id)
      defaultRightsId: [],
      // 当前要修改权限的角色的id
      allotRightRoleid: '',
      // 角色添加表单信息
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色修改表单信息
      editRoleForm: {},
      // 角色表单验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名称长度在2-10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 12, message: '角色描述长度在2-12个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取角色列表数据
    getRolesList: async function () {
      // 向服务器发送请求，获取角色列表数据
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = result.data
      console.log(this.rolesList)
    },
    // 添加角色
    addRole: function () {
      // 表单预验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送添加用户请求
        const { data: result } = await this.$http.post('roles', this.addRoleForm)
        if (result.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 隐藏添加角色对话框
        this.addRoleDialogVisible = false
        // 更新角色列表页面
        this.getRolesList()
      })
    },
    // 添加角色对话框关闭事件 触发时 执行的函数
    resetAddRoleForm: function () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击修改角色按钮显示修改角色对话框并将信息填入表单中
    getEditRole: async function (id) {
      // 根据id，向服务器发送请求获取对应的用户信息
      const { data: result } = await this.$http.get('roles/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      // 显示修改角色对话框
      this.editRoleDialogVisible = true
      this.editRoleForm = result.data
    },
    // 修改角色对话框关闭事件 触发时 执行的函数
    resetEditRoleForm: function () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 修改角色
    editRole: function () {
      // 表单预验证
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送修改用户请求
        const { data: result } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        console.log(result)
        if (result.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        // 隐藏添加用户对话框
        this.editRoleDialogVisible = false
        // 更新用户列表页面
        this.getRolesList()
      })
    },
    // 删除角色
    deleteRole: async function (id) {
      const res = await this.$confirm('是否要删除该角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message('已取消删除角色操作')
      }
      // 向服务器发送请求，删除对应角色
      const { data: result } = await this.$http.delete('roles/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      // 重新获取用户列表
      this.getRolesList()
    },
    // 删除对应的权限
    removeRight: async function (role, rightId) {
      const info = await this.$confirm('是否要移除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (info !== 'confirm') {
        return this.$message('已取消移除权限操作')
      }
      // 向服务器发送请求，删除对应角色的权限
      const { data: result } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (result.meta.status !== 200) {
        return this.$message.error('移除权限失败')
      }
      this.$message.success('移除权限成功')
      // 更新角色列表
      role.children = result.data
    },
    // 点击分配权限按钮显示分配权限对话框并勾选已分配的权限
    getAllotRight: async function (Role) {
      // 获取所有权限的数据
      const { data: rightsTree } = await this.$http.get('rights/tree')
      if (rightsTree.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 将数据填入权限列表rightsList中
      this.rightsList = rightsTree.data
      // 将选中角色的id保存到allotRightRoleid中
      this.allotRightRoleid = Role.id
      // 调用获取权限id的函数
      this.getRightsId(Role, this.defaultRightsId)
      // 显示分配权限对话框
      this.allotRightDialogVisible = true
    },
    // 分配角色对话框关闭事件 触发时 执行的函数
    resetdefaultRightsId: function () {
      this.defaultRightsId = []
    },
    // 分配权限
    allotRight: async function () {
      // 获取所有已选中权限的id
      const ids = [...this.$refs.rightsRef.getHalfCheckedKeys(), ...this.$refs.rightsRef.getCheckedKeys()]
      // 转为字符串
      const str = ids.join(',')
      // 向服务器发送请求，修改权限
      const { data: result } = await this.$http.post(`roles/${this.allotRightRoleid}/rights`, {
        rids: str
      })
      if (result.meta.status !== 200) {
        this.$message.error('分配权限失败')
      }
      this.allotRightDialogVisible = false
      this.$message.success('分配权限成功')
      this.getRolesList()
    },
    // 获取选中角色的所有三级权限的id，并传到defaultRightsId数组中
    getRightsId: function (node, arr) {
      // 如果当前节点不包含children属性，则将id添加到数组中
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getRightsId(item, arr)
      })
    }
  },
  created () {
    // 调用获取角色列表数据的函数
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped>
.vcenter {
  display: flex;
  align-items: center;
}
</style>
