<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示框 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps align-center :active="activeStep - 0" finish-status="wait">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页区域 -->
      <el-form :model="addGoodsForm" :rules="addGoodsrules" ref="addGoodsFormRef" label-position="top">
        <el-tabs v-model="activeStep" tab-position="left" @tab-click="tabClick" :before-leave="beforeChange">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addGoodsForm.goods_cat" :options="cateList" :props="cascaderProps" clearable @change="cateChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in paramsList" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(item1, index) in item.attr_vals" :key="index" :label="item1"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in attributeList" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersInfo" :on-success="setPics">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"/>
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 上传图片预览 -->
    <el-dialog title="图片预览" :visible.sync="picdialogVisible" width="50%">
      <img :src="previewUrl" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 控制步骤条当前步骤以及绑定标签页的name值
      activeStep: '0',
      // 添加商品表单
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_introduce: '',
        goods_cat: [],
        pics: [],
        attrs: []
      },
      // 添加商品表单的验证规则
      addGoodsrules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 级联选择框显示的数据(向服务器获取的商品分类列表)
      cateList: [],
      // 控制级联选择框的显示方式
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      paramsList: [],
      // 静态属性列表
      attributeList: [],
      // 上传文件请求头信息
      headersInfo: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制预览图片对话框的显示与隐藏
      picdialogVisible: false,
      // 预览图片的url
      previewUrl: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    getCateList: async function () {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = result.data
    },
    // 当商品分类选中项发生改变时，执行的函数
    cateChange: function () {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
      console.log(this.addGoodsForm)
    },
    // 在点击标签页后，标签页切换前进行判断是否允许切换
    beforeChange: function (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 点击标签页时执行的函数
    tabClick: async function () {
      if (this.activeStep === '1') {
        // 根据分类id获取分类的动态参数
        const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        result.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.paramsList = result.data
        console.log(this.paramsList)
      }
      if (this.activeStep === '2') {
        // 根据分类id获取分类的静态属性
        const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        console.log(result.data)
        this.attributeList = result.data
      }
    },
    // 上传图片界面，点击图片进行预览
    handlePreview: function (file) {
      this.previewUrl = file.url
      this.picdialogVisible = true
    },
    // 上传图片界面，点击x移除图片
    handleRemove: async function (file) {
      const index = await this.addGoodsForm.pics.findIndex(value => {
        return value.pics === file.response.data.tmp_path
      })
      this.addGoodsForm.pics.splice(index, 1)
      console.log(this.addGoodsForm)
    },
    // 图片上传成功时执行的函数，获取上传文件的响应信息，并设置pics
    setPics: function (res) {
      const picsInfo = {
        pics: res.data.tmp_path
      }
      this.addGoodsForm.pics.push(picsInfo)
      console.log(this.addGoodsForm)
    },
    // 添加商品
    add: function () {
      // 预验证
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        const form = _.cloneDeep(this.addGoodsForm)
        const paramsList = _.cloneDeep(this.paramsList)
        const attributeList = _.cloneDeep(this.attributeList)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        paramsList.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          form.attrs.push(obj)
        })
        // 处理静态属性
        attributeList.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          form.attrs.push(obj)
        })
        console.log(form)
        // 向服务器发送请求，添加商品
        const { data: result } = await this.$http.post('goods', form)
        if (result.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId: function () {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[this.addGoodsForm.goods_cat.length - 1]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-tabs,
.el-steps {
  margin-top: 20px;
}
.el-checkbox {
  margin: 0 10px 0 0;
}
.previewImg {
  width: 100%;
}
.addBtn {
  margin-top: 20px;
}
</style>
