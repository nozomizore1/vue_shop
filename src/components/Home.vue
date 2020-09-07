<template>
  <div>
    <el-button type="danger" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    logout: async function () {
      const result = await this.$confirm('是否要退出登录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (result !== 'confirm') {
        return this.$message('已取消退出操作')
      }
      // 删除token
      window.sessionStorage.removeItem('token')
      // 删除index
      window.sessionStorage.removeItem('selectedPage')
      // 跳转到登录页面
      this.$router.push('/login')
      this.$message({
        type: 'success',
        message: '退出成功!'
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
