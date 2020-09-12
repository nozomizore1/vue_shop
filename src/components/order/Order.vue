<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input clearable @clear="getOrderList" placeholder="请输入内容" v-model="getOrderListForm.query">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column align="center" type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column align="center" prop="order_price" label="订单价格" width="80px"></el-table-column>
        <el-table-column align="center" prop="pay_status" label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === 1" type="success">已发货</el-tag>
            <el-tag v-else type="danger">未发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="is_send" label="是否发货" width="80px"></el-table-column>
        <el-table-column align="center" label="下单时间" width="200px">
          <template slot-scope="scope">
            <span>{{scope.row.create_time | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="180px">
          <template>
            <el-tooltip effect="dark" content="修改订单地址" :enterable="false" placement="top">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="toEditAddress"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="物流进度" :enterable="false" placement="top">
              <el-button type="success" icon="el-icon-location-outline" size="mini" @click="toLogistics"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getOrderListForm.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="getOrderListForm.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改订单地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editAddressdialogVisible" width="50%" @close="resetEditAddressForm">
      <el-form ref="editAddressFormRef" :model="editAddressForm" :rules="editAddressRules" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="editAddressForm.address1" :options="cityData" :props="cascaderProps"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editAddressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="logisticsdialogVisible" width="50%">
      <el-timeline :reverse="true">
        <el-timeline-item v-for="(item, index) in logisticsProgress" :key="index" :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '../../assets/js/citydata'
export default {
  data () {
    return {
      // 获取订单列表携带的参数
      getOrderListForm: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      orderList: [],
      // 订单总数
      total: 0,
      // 控制修改订单地址对话框的显示与隐藏
      editAddressdialogVisible: false,
      // 控制物流对话框的显示与隐藏
      logisticsdialogVisible: false,
      // 修改订单地址表单
      editAddressForm: {
        address1: [],
        address2: ''
      },
      // 修改订单地址表单的验证规则
      editAddressRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 城市信息
      cityData: cityData,
      // 控制级联选择框的显示方式
      cascaderProps: {
        expandTrigger: 'hover'
      },
      // 物流进程信息
      logisticsProgress: []
    }
  },
  methods: {
    // 获取订单列表
    getOrderList: async function () {
      const { data: result } = await this.$http.get('orders', {
        params: this.getOrderListForm
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.orderList = result.data.goods
      this.total = result.data.total
      console.log(this.orderList)
    },
    // 点击切换每页显示数据条数时执行的函数
    handleSizeChange: function (newSize) {
      this.getOrderListForm.pagesize = newSize
      this.getOrderList()
    },
    // 当前也切换时执行的函数
    handleCurrentChange: function (newPage) {
      this.getOrderListForm.pagenum = newPage
      this.getOrderList()
    },
    // 点击修改地址弹出修改地址对话框并将对应信息显示到对话框中
    toEditAddress: function () {
      this.editAddressdialogVisible = true
      this.editAddressForm.address1 = ['河北省', '石家庄市', '长安区']
      this.editAddressForm.address2 = 'www'
    },
    // 当对话框关闭时重置表单
    resetEditAddressForm: function () {
      this.$refs.editAddressFormRef.resetFields()
    },
    // 点击确认时修改订单地址
    editAddress: function () {
      console.log(this.editAddressForm)
    },
    // 显示物流对话框
    toLogistics: async function () {
      const { data: result } = await this.$http.get('/kuaidi/804909574412544580')
      if (result.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.logisticsProgress = result.data
      console.log(this.logisticsProgress)
      this.logisticsdialogVisible = true
    }
  },
  created () {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>
