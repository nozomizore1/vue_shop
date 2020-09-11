<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示框 -->
      <el-row>
        <el-col>
          <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false">
          </el-alert>
        </el-col>
      </el-row>
      <!-- 选择商品分类区域 -->
      <el-row class="chooseCate">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedCateKeys" :options="allCateList" :props="cascaderProps" @change="cateChange" clearable></el-cascader>
        </el-col>
      </el-row>
      <el-row>
        <!-- 标签页 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!-- 动态参数数据面板 -->
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyList" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" effect="dark" closable @close="removeParams(scope.row, index)">{{item}}</el-tag>
                  <!-- 添加tag的输入框 -->
                  <el-input
                    class="paramsInput"
                    v-if="scope.row.addParamsValInputVisible"
                    v-model="scope.row.addParamsVal"
                    ref="addParamsValRef"
                    size="small"
                    @keyup.enter.native="addVal(scope.row)"
                    @blur="addVal(scope.row)"
                  >
                  </el-input>
                  <el-button v-else size="small" @click="shouInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column align="center" type="index"></el-table-column>
              <el-table-column prop="attr_name" label="参数名称"></el-table-column>
              <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="toEditParams(scope.row.attr_id)">修改</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 静态属性数据面板 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加属性</el-button>
            <!-- 静态表格 -->
            <el-table :data="onlyList" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" effect="dark" closable @close="removeParams(scope.row, index)">{{item}}</el-tag>
                  <!-- 添加tag的输入框 -->
                  <el-input
                    class="paramsInput"
                    v-if="scope.row.addParamsValInputVisible"
                    v-model="scope.row.addParamsVal"
                    ref="addParamsValRef"
                    size="small"
                    @keyup.enter.native="addVal(scope.row)"
                    @blur="addVal(scope.row)"
                  >
                  </el-input>
                  <el-button v-else size="small" @click="shouInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="attr_name" label="属性名称"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="toEditParams(scope.row.attr_id)">修改</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisible" @close="resetAddParamsForm">
      <el-form :model="addParamsForm" :rules="paramsRules" ref="addParamsFormRef">
        <el-form-item :label="titleText" label-width="90px" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editParamsDialogVisible" @close="resetEditParamsForm">
      <el-form :model="editParamsForm" :rules="paramsRules" ref="editParamsFormRef">
        <el-form-item :label="titleText" label-width="90px" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 全部商品分类
      allCateList: [],
      // cascaderProps级联选择器数据展示配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 关联添加分类时选中的id
      selectedCateKeys: [],
      // 被激活的页签的名称(点击页签标题会变成对应的name值)，现在默认显示的是name为many的页面
      activeName: 'many',
      // 从服务器中获取的动态参数数据
      manyList: [],
      // 从服务器中获取的静态属性数据
      onlyList: [],
      // 控制添加参数对话框显示与隐藏
      addParamsDialogVisible: false,
      // 控制修改参数对话框显示与隐藏
      editParamsDialogVisible: false,
      // 动态参数/静态属性验证规则
      paramsRules: {
        attr_name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' }
        ]
      },
      // 添加动态参数/静态属性的表单数据
      addParamsForm: {
        attr_name: ''
      },
      // 添加动态参数/静态属性的表单数据
      editParamsForm: {}
    }
  },
  methods: {
    // 获取所有商品分类
    getAllCate: async function () {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.allCateList = result.data
      console.log(this.allCateList)
    },
    // 分类改变时执行的函数
    cateChange: function () {
      console.log(this.selectedCateKeys)
      this.getParamsList()
    },
    // tab页签点击事件 触发时 执行的函数
    handleTabClick: function () {
      console.log(this.activeName)
      this.getParamsList()
    },
    // 向服务器发送请求，获取参数数据
    getParamsList: async function () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyList = []
        this.onlyList = []
        return
      }
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      result.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 将数据绑定到各自的属性中，防止造成绑定数据共通的现象
        // 控制是否显示添加参数的文本输入框
        item.addParamsValInputVisible = false
        // 添加参数文本框输入的值
        item.addParamsVal = ''
      })
      if (this.activeName === 'many') {
        this.manyList = result.data
        console.log(this.manyList)
      } else {
        this.onlyList = result.data
        console.log(this.onlyList)
      }
    },
    // 添加参数对话框事件 触发时 执行的函数
    resetAddParamsForm: function () {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 点击确认，添加动态参数或静态属性
    addParams: async function () {
      // 表单预验证
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送添加参数请求
        const { data: result } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 201) {
          return this.$message.error(`添加${this.titleText}失败`)
        }
        this.$message.success(`添加${this.titleText}成功`)
        // 隐藏添加参数对话框
        this.addParamsDialogVisible = false
        // 更新标签页
        this.getParamsList()
      })
    },
    // 点击修改弹出修改参数对话框，并将对应数据填到表单中
    toEditParams: async function (id) {
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editParamsForm = result.data
      this.editParamsDialogVisible = true
    },
    // 修改参数对话框关闭时，执行的函数
    resetEditParamsForm: function () {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 点击确认，修改动态参数或静态属性
    editParams: async function () {
      console.log(this.editParamsForm)
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 预验证通过，向服务器发送修改参数请求
        const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 200) {
          return this.$message.error(`修改${this.titleText}失败`)
        }
        this.$message.success(`修改${this.titleText}成功`)
        // 隐藏修改参数对话框
        this.editParamsDialogVisible = false
        // 更新标签页
        this.getParamsList()
      })
    },
    // 删除参数
    deleteParams: async function (id) {
      const res = await this.$confirm(`是否要删除该${this.titleText}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message(`已取消删除${this.titleText}操作`)
      }
      // 向服务器发送请求，删除对应分类
      const { data: result } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error(`删除${this.titleText}失败`)
      }
      this.$message.success(`删除${this.titleText}成功`)
      // 重新获取分类列表
      this.getParamsList()
    },
    // 控制添加参数文本框的显示
    shouInput: function (params) {
      params.addParamsValInputVisible = true
      // 文本框自动获得焦点
      // $nextTick是当页面上的元素被重新渲染后，才会执行函数内的代码
      this.$nextTick(_ => {
        this.$refs.addParamsValRef.$refs.input.focus()
      })
    },
    // 回车或失去焦点时，添加参数值
    addVal: async function (params) {
      // 假如没有输入值或输入值为空，则重置文本输入框的内容，并让输入框隐藏
      if (params.addParamsVal.trim() === '') {
        params.addParamsVal = ''
        params.addParamsValInputVisible = false
        return
      }
      // 克隆数组,避免在请求响应获取前改变dom元素的内容
      const vals = [...params.attr_vals]
      vals.push(params.addParamsVal.trim())
      const res = await this.editParamsVal(params, vals)
      if (res === 1) {
        params.attr_vals.push(params.addParamsVal.trim())
      }
      params.addParamsVal = ''
      params.addParamsValInputVisible = false
      console.log(params)
    },
    // 点击tag标签的关闭按钮，删除对应的参数
    removeParams: async function (params, index) {
      // 克隆数组,避免在请求响应获取前改变dom元素的内容
      const vals = [...params.attr_vals]
      vals.splice(index, 1)
      const res = await this.editParamsVal(params, vals)
      if (res === 1) {
        params.attr_vals.splice(index, 1)
      }
      console.log(params)
    },
    // 发送修改参数值的请求
    editParamsVal: async function (params, val) {
      // 向服务器发送请求，添加参数值
      const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${params.attr_id}`, {
        attr_name: params.attr_name,
        attr_sel: this.activeName,
        attr_vals: val.join(' ')
      })
      if (result.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
      return 1
    }
  },
  created () {
    this.getAllCate()
  },
  computed: {
    // 按钮禁用则返回true，否则返回false
    isBtnDisabled: function () {
      if (this.selectedCateKeys.length === 3) {
        return false
      }
      return true
    },
    // 要添加参数的分类的ID
    cateId: function () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[this.selectedCateKeys.length - 1]
      }
      return null
    },
    // 计算添加参数对话框显示的内容
    titleText: function () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.chooseCate {
  margin-top: 20px;
  margin-bottom: 20px;
}
.paramsInput {
  width: 120px;
}
</style>
