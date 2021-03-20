import Vue from "vue";
import {
  Aside,
  Button,
  Checkbox,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Header,
  Input,
  Main,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tree
} from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";

Vue.use(Aside);
Vue.use(Button);
Vue.use(Checkbox);
Vue.use(Container);
Vue.use(Dropdown);
Vue.use(DropdownItem);
Vue.use(DropdownMenu);
Vue.use(Header);
Vue.use(Input);
Vue.use(Main);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(TabPane);
Vue.use(Tabs);
Vue.use(Tree);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
