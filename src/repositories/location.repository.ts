import { injectable, postConstruct, preDestroy } from "inversify";
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import {
  ILocationRepository,
  IPLocation,
} from "../ioc/repositories/location-repository.interfaces";

@injectable()
export class LocationRepository implements ILocationRepository {
  private db: Database | null = null;

  @postConstruct()
  async initialize() {
    if (!this.db) {
      this.db = await open({
        filename: process.env.DB_HOST ?? "ips.db",
        driver: sqlite3.Database,
      });
    }
  }

  @preDestroy()
  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async findLocation(id: number): Promise<IPLocation | null> {
    const result = await this.db!.get(
      `SELECT country_name, country_code, city FROM ip 
      WHERE ? BETWEEN lower_ip_id AND upper_ip_id
      LIMIT 1`,
      id
    );

    return result || null;
  }
}
