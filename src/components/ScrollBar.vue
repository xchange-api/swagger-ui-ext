<template>
  <!--滚动条-->
  <div class="scroll">
    <slot></slot>
  </div>
</template>

<script>
import { Vue } from "vue-property-decorator";
export default class ScrollBar extends Vue {}
</script>

<style lang="scss" scoped>
.scroll {
  overflow-y: scroll;
}
.scroll::-webkit-scrollbar {
  width: 5px;
}
.scroll::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px #dcdfe6;
  background: #dcdfe6;
}
</style>
