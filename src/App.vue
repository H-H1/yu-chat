<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
/*每个页面公共css */
page {
  height: 100%;
  background-color: #0a0a14;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 禁用按钮默认样式 */
button {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: transparent;
  line-height: normal;
  
  &::after {
    display: none;
  }
}
</style>
