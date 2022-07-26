<template>
  <div id="app">
    <BaseMap />
  </div>
</template>

<script>

export default {
  name: 'App',
}
</script>

<style lang="less">
html,
body,
#app {
  margin: 0px;
  height: 100%;
  width: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* 滚动条优化 start */
  ::-webkit-scrollbar{
    width:8px;
    height:8px;
  }
  ::-webkit-scrollbar-track{
    background: #f6f6f6;
    border-radius:2px;
  }
  ::-webkit-scrollbar-thumb{
    background: #cdcdcd;
    border-radius:2px;
  }
  ::-webkit-scrollbar-thumb:hover{
    background: #747474;
  }
  ::-webkit-scrollbar-corner {
    background: #f6f6f6;
  }
/* 滚动条优化 end */
</style>
