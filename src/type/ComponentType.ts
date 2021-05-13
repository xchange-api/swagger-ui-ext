import { RequestData } from "@/type/RequestData";

/**
 * 标签
 */
export interface Tab {
  title: string;
  name: string;
  content: RequestData;
}

/**
 * 菜单项
 */
interface MenuItem {
  command: string;
  text: string;
  tips?: string;
}

export interface MenuData {
  items: Array<MenuItem>;
  position: { [key: string]: string };
}

/**
 * api树结构
 */
export interface TreeNodeData {
  label: string;
  children?: Array<TreeNodeData>;
  reqData?: RequestData;
}

/**
 * 事件
 */
export class BusEvent {
  static OPEN_IN_NEW_TAB = "open_in_new_tab"; //EventData: RequestData
  static OPEN_IN_CURRENT_TAB = "open_in_current_tab"; //EventData: RequestData
  static OPEN_IN_BACKGROUND_TAB = "open_in_background_tab"; //EventData: RequestData
  static OPEN_TAB = "open_tab";
  static ADD_HISTORY = "add_history"; //EventData: RequestData
  static SEARCH_API = "search_api";
  static SEARCH_HISTORY = "search_history";
}

/**
 * 下拉选项
 */
export interface OptionData {
  value: string;
  label: string;
}
