<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 权限列表区域 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column align="center" prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'" type="" effect="dark">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success" effect="dark">二级</el-tag>
            <el-tag v-else type="danger" effect="dark">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      rightsList: []
    }
  },
  methods: {
    // 获取权限列表数据
    getRightsList: async function () {
      // 向服务器发送请求，获取权限列表数据
      const { data: result } = await this.$http.get('rights/list')
      if (result.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = result.data
      console.log(this.rightsList)
    }
  },
  created () {
    // 获取所有的权限列表数据
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>
</style>
