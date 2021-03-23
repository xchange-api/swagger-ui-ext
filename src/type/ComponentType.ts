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
