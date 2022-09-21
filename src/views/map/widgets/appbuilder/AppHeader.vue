<!-- 定制应用页头部-->
<template>
    <div style="display:flex; height:100%; justify-content:space-between;">
      <div style="position:relative;height:100%;display:flex">
        <div class="title">
          <img src="../../../../img/map.png"/>
        </div>
        <div class="title firstTitle">{{$attrs.appTitle[0].name}}</div>
        <div class="title secondTitle">{{$attrs.appTitle[1].name}}</div>
      </div>
    </div>
</template>
<script>
</script>
<style scoped>
  .title{
    color: white;
    display:flex;
    align-items: center;
    cursor: pointer;
  }
  .firstTitle{
    font-size: 20px;
    margin-left:5px;
  }
  .secondTitle{
    font-size: 14px;
    margin-left:5px;
  }
</style>
