<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data () {
    return {
      // 要拼接的图表信息
      option: {}
    }
  },
  created () {},
  // 执行mounted里面的代码时，页面上的元素已经渲染完毕了
  async mounted () {
    var myChart = echarts.init(document.getElementById('main'))
    // 指定图表的配置项和数据
    var option = {
      title: {
        text: '用户来源'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#E9EEF3'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          boundaryGap: false
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ]
    }
    await this.getReport()
    const result = _.merge(this.option, option)
    // 展示数据
    myChart.setOption(result)
  },
  methods: {
    getReport: async function () {
      const { data: result } = await this.$http.get('reports/type/1')
      if (result.meta.status !== 200) {
        return this.$message.error('获取数据报表失败')
      }
      this.option = result.data
    }
  }
}
</script>

<style lang="less" scoped>
</style>
