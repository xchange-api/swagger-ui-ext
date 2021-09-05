import Vue from "vue";
import {
  Aside,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Container,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Header,
  Input,
  Loading,
  Main,
  Option,
  Select,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tree
} from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/style.scss";
import App from "./App.vue";
import { Message } from "element-ui";

Vue.use(Aside);
Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Container);
Vue.use(Divider);
Vue.use(Dropdown);
Vue.use(DropdownItem);
Vue.use(DropdownMenu);
Vue.use(Header);
Vue.use(Input);
Vue.use(Loading);
Vue.use(Main);
Vue.use(Option);
Vue.use(Select);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(TabPane);
Vue.use(Tabs);
Vue.use(Tree);

Vue.config.productionTip = false;
Vue.prototype.$message = Message;

new Vue({
  render: h => h(App)
}).$mount("#app");
