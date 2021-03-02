import { RequesterData } from "@/type/RequesterData";

export interface Tab {
  title: string;
  name: string;
  content: RequesterData;
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
  reqData?: RequesterData;
}
