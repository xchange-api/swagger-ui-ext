import { RequestData } from "@/type/RequestData";

export interface Tab {
  title: string;
  name: string;
  content: RequestData;
}

interface MenuItem {
  command: string;
  text: string;
  tips?: string;
}

export interface MenuData {
  items: Array<MenuItem>;
  position: { [key: string]: string };
}

export interface TreeNodeData {
  label: string;
  children?: Array<TreeNodeData>;
  reqData?: RequestData;
}

export class BusEvent {
  static OPEN_IN_NEW_TAB = "open_in_new_tab"; //EventData: RequestData
  static OPEN_IN_CURRENT_TAB = "open_in_current_tab"; //EventData: RequestData
  static OPEN_IN_BACKGROUND_TAB = "open_in_background_tab"; //EventData: RequestData
  static OPEN_TAB = "open_tab";
  static ADD_HISTORY = "add_history"; //EventData: RequestData
  static SEARCH_API = "search_api";
  static SEARCH_HISTORY = "search_history";
}

export interface OptionData {
  value: string;
  label: string;
}
