<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getGoodsList" v-model="getGoodsListForm.query">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="toAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodsList" border style="width: 100%">
        <el-table-column align="center" type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column align="center" prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
        <el-table-column align="center" prop="goods_weight" label="商品重量" width="100px"></el-table-column>
        <el-table-column align="center" label="创建时间" width="200px">
          <template slot-scope="scope">
            <span>{{scope.row.add_time | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getGoodsListForm.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="getGoodsListForm.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取商品列表时传递的参数
      getGoodsListForm: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总共有多少条数据
      total: 1,
      // 商品列表数据
      goodsList: []
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表数据
    getGoodsList: async function () {
      const { data: result } = await this.$http.get('goods', {
        params: this.getGoodsListForm
      })
      if (result.meta.status !== 200) {
        this.$message.error('获取商品列表失败')
      }
      this.goodsList = result.data.goods
      this.total = result.data.total
      console.log(this.goodsList)
    },
    // 点击切换每页显示数据条数时执行的函数
    handleSizeChange: function (newSize) {
      this.getGoodsListForm.pagesize = newSize
      this.getGoodsList()
    },
    // 当前也切换时执行的函数
    handleCurrentChange: function (newPage) {
      this.getGoodsListForm.pagenum = newPage
      this.getGoodsList()
    },
    // 添加商品
    toAddGoodsPage: function () {
      this.$router.push('/goods/add')
    },
    // 删除商品
    deleteGoods: async function (id) {
      const res = await this.$confirm('是否要删除该商品', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message('已取消删除操作')
      }
      // 向服务器发送请求，删除指定商品
      const { data: result } = await this.$http.delete('goods/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
