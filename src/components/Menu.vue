<template>
  <div v-show="data.display" class="menu" :style="{ ...data.position }">
    <ul>
      <li v-for="item in data.items" :key="item.text" @click="notify(item.command)">{{ item.text }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { MenuData } from "@/type/ComponentType";

@Component({
  components: {}
})
export default class Menu extends Vue {
  @Prop()
  private data!: MenuData;

  private notify(command: string) {
    this.$emit("select", command);
  }
}
</script>

<style lang="scss" scoped>
.menu {
  position: fixed;
  display: block;
  z-index: 20000;
  background-color: #fff;
  padding: 5px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  ul {
    margin: 0;
    padding: 0;
  }
  ul li {
    list-style: none;
    margin: 0;
    padding: 0 10px;
    font-size: 14px;
    line-height: 30px;
    cursor: pointer;
  }
  ul li:hover {
    background-color: #f5f7fa;
  }
}
</style>
