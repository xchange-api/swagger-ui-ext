<!---->
<template>
  <div>
    <span>{{ response }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class Response extends Vue {
  @Prop()
  private response: any = "";
}
</script>

<style></style>
