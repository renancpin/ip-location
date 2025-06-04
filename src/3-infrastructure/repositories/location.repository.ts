import { LocationEntity } from '@domain/entities/location.entity';
import { ILocationRepository } from '@domain/repositories/location.repository';
import { EnvironmentVariables } from '@utils/constants/environment-variables';
import {
  StoredStatementKeys,
  StoredStatements,
} from '@utils/constants/statements';
import { injectable, postConstruct, preDestroy } from 'inversify';
import { Database, open, Statement } from 'sqlite';
import sqlite3 from 'sqlite3';

@injectable()
export class LocationRepository implements ILocationRepository {
  private db: Database | null = null;
  private statements: Partial<Record<StoredStatementKeys, Statement>> = {};

  @postConstruct()
  async initialize(databasePath?: string) {
    if (!this.db) {
      await this.getDb(databasePath);
    }
  }

  @preDestroy()
  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async findIpLocation(id: number): Promise<LocationEntity | null> {
    const getIpLocationStatement = await this.getStatement('GetIpLocation');
    const location = await getIpLocationStatement.get<LocationEntity>({ id });
    return location ?? null;
  }

  private async getDb(databasePath?: string): Promise<Database> {
    if (this.db) return this.db;

    this.db = await open({
      filename: databasePath ?? EnvironmentVariables.DB_CONNECTION,
      driver: sqlite3.Database,
    });

    return this.db;
  }

  private async getStatement(key: StoredStatementKeys): Promise<Statement> {
    if (!this.statements[key]) {
      const db = await this.getDb();
      this.statements[key] = await db.prepare(StoredStatements[key]);
    }

    return this.statements[key];
  }
}
