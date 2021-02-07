import { RequesterData } from "@/type/RequesterData";

export interface Tab {
  title: string;
  name: string;
  content: RequesterData;
}

interface MenuItem {
  command: string;
  text: string;
}

export interface MenuData {
  items: Array<MenuItem>;
  position: { [key: string]: string };
}
