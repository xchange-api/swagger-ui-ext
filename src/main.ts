import Vue from "vue";
import { Aside, Button, Container, Header, Input, Main, Table, TableColumn, TabPane, Tabs, Tree } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";

Vue.use(Button);
Vue.use(Input);
Vue.use(TabPane);
Vue.use(Tabs);
Vue.use(Container);
Vue.use(Header);
Vue.use(Main);
Vue.use(Aside);
Vue.use(Tree);
Vue.use(Table);
Vue.use(TableColumn);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
