<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="danger" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="aqua" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" router :default-active="selected">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <i :class="item.icon"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveSelected('/' + subItem.path)">
              <!-- 二级菜单模板 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 菜单数据
      menuList: [],
      // 是否折叠菜单
      isCollapse: false,
      // 记录当前选定的页面
      selectedPage: ''
    }
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
    },
    // 获取菜单
    getMenuList: async function () {
      const { data: result } = await this.$http.get('menus')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.menuList = result.data
      this.menuList[0].icon = 'iconfont icon-users'
      this.menuList[1].icon = 'iconfont icon-tijikongjian'
      this.menuList[2].icon = 'iconfont icon-shangpin'
      this.menuList[3].icon = 'iconfont icon-danju'
      this.menuList[4].icon = 'iconfont icon-baobiao'
      console.log(this.menuList)
    },
    // 菜单折叠与展开
    toggleCollapse: function () {
      this.isCollapse = !this.isCollapse
    },
    saveSelected: function (selectedPage) {
      window.sessionStorage.setItem('selectedPage', selectedPage)
      this.selectedPage = selectedPage
    },
    changeSelected: function () {
      this.selected = window.sessionStorage.getItem('selectedPage')
    }
  },
  created () {
    this.getMenuList()
    this.changeSelected()
  }
}
</script>

<style lang="less" scoped>
.home-container {
  width: 100%;
  height: 100%;
}
.el-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  div {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 20px;
    span {
      margin-left: 10px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px!important;
}
.toggle-button {
  background: #4A5064;
  font-size: 10px;
  text-align: center;
  line-height: 24px;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
