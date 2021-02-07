<template>
  <div v-show="show" class="menu" :style="{ ...data.position }" @mousedown.stop>
    <ul>
      <li v-for="item in data.items" :key="item.text" @click="notify(item.command)">{{ item.text }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { MenuData } from "@/type/ComponentType";

@Component({
  components: {}
})
export default class ContextMenu extends Vue {
  @Prop()
  private data!: MenuData;

  @Prop()
  private show!: boolean;

  private notify(command: string) {
    this.$emit("select", command);
    this.hideMenu();
  }

  @Watch("show", { immediate: false, deep: true })
  private showChange(newShow: boolean) {
    if (newShow) {
      document.addEventListener("mousedown", this.hideMenu);
    } else {
      document.removeEventListener("mousedown", this.hideMenu);
    }
  }

  private hideMenu() {
    this.$emit("update:show", false);
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
