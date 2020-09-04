<template>
  <div class="container">
    <div class="box">
      <!-- 头像区域 -->
      <div class="avatar">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 表单区域 -->
      <el-form :ref="formName" label-width="0" class="loginForm" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input placeholder="请输入密码" show-password prefix-icon="iconfont icon-3702mima" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login(formName)">登录</el-button>
          <el-button type="info" @click="resetLoginForm(formName)">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      },
      formName: 'loginFormRef'
    }
  },
  methods: {
    // 重置表单
    resetLoginForm: function (formName) {
      this.$refs[formName].resetFields()
    },
    // 登录（验证表单并发送请求）
    login: function (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: result } = await this.$http.post('login', this.loginForm)
        if (result.meta.status !== 200) {
          return this.$message({
            message: '登录失败，请检查用户名或密码是否正确',
            type: 'error'
          })
        }
        this.$message({
          message: '登录成功',
          type: 'success'
        })
        // 1.将登录成功之后的token保存到客户端的sessionStorage中
        // 项目中除了登录之外的其他API接口，必须在登录之后才能访问
        // token只应在当前网站打开期间生效，所以token保存在sessionStorage中
        // sessionStorage为本地存储，生命周期为关闭浏览器窗口，统一窗口下数据共享，以键值对的形式存储使用
        window.sessionStorage.setItem('token', result.data.token)
        // 2.通过编程时导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #2b4b6b;
}
.box {
  width: 450px;
  height: 300px;
  background-color: #ffffff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar {
    box-sizing: border-box;
    height: 152px;
    width: 152px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    padding: 10px;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
  .loginForm {
    box-sizing: border-box;
    width: 100%;
    padding: 20px;
    position: absolute;
    bottom: 0;
  }
}
</style>
