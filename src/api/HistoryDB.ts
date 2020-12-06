import Dexie from "dexie";
import { RequesterData } from "@/type/RequesterData";

class HistoryDB extends Dexie {
  public history: Dexie.Table<RequesterData, number>;

  public constructor(dbName: string) {
    super("swagger-ui-ext");
    this.version(20201126).stores({
      // just declare index and key column
      history: "++id,url"
    });
    this.history = this.table("history");
  }

  public all() {
    return this.history.toArray();
  }

  public add(reqData: RequesterData) {
    return this.history.add(reqData);
  }
}

const historyDB = new HistoryDB("swagger-ui-ext");
export default historyDB;
