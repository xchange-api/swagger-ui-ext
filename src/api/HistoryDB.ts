import Dexie from "dexie";
import { RequesterData } from "@/type/RequesterData";

class HistoryDB extends Dexie {
  public history: Dexie.Table<RequesterData, number>;

  // TODO 版本不一致时提醒用户更新数据库
  public constructor(dbName: string) {
    super(dbName);
    this.version(20201126).stores({
      // just declare index and key column
      history: "&id,url"
    });
    this.history = this.table("history");
  }

  public all() {
    this.history.mapToClass(RequesterData);
    return this.history.toArray();
  }

  public add(reqData: RequesterData) {
    return this.history.add(reqData);
  }

  public remove(reqData: RequesterData) {
    return this.history.delete(reqData.id);
  }
}

const historyDB = new HistoryDB("swagger-ui-ext");
export default historyDB;
