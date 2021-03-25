<template>
  <div v-show="show" class="menu" :style="{ ...data.position }" @mousedown.stop>
    <table v-if="tipsExist()">
      <tr v-for="item in data.items" :key="item.text" @click="notify(item.command)">
        <td>{{ item.text }}</td>
        <td>{{ item.tips }}</td>
      </tr>
    </table>

    <table v-else>
      <tr v-for="item in data.items" :key="item.text" @click="notify(item.command)">
        <td>{{ item.text }}</td>
      </tr>
    </table>
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

  private tipsExist(): boolean {
    return this.data.items.find(item => item.tips !== undefined) !== undefined;
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

  table {
    font-size: 14px;
    color: #606266;
    tr {
      cursor: pointer;
    }
    tr:hover {
      background-color: #f5f7fa;
    }
    tr td:nth-child(1) {
      text-align: left;
      padding: 5px 8px;
    }
    tr td:nth-child(2) {
      text-align: right;
      padding: 5px 8px 5px 38px;
    }
  }
}
</style>
