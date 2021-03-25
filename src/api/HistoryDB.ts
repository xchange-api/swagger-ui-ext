import Dexie from "dexie";
import { RequestData } from "@/type/RequestData";

class HistoryDB extends Dexie {
  public history: Dexie.Table<RequestData, number>;

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
    this.history.mapToClass(RequestData);
    return this.history.toArray();
  }

  public add(reqData: RequestData) {
    return this.history.add(reqData);
  }

  public remove(reqData: RequestData) {
    return this.history.delete(reqData.id);
  }
}

const historyDB = new HistoryDB("swagger-ui-ext");
export default historyDB;
