import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { makePath } from '@utils/make-path';
import { progressWatcher } from '@utils/progress-watcher';
import {
  getInsertStatement,
  StoredDDLStatements,
} from '@utils/constants/statements';
import { EnvironmentVariables } from '@utils/constants/environment-variables';

export async function importCSVToSQLite(options?: {
  databasePath?: string;
  csvPath?: string;
  batchSize?: number;
}) {
  const {
    databasePath = 'database/ips.db',
    csvPath = 'iplocation-dataset.csv',
    batchSize = 5000,
  } = options ?? {};

  const fileStream = createReadStream(csvPath);
  fileStream.on('error', (err) => {
    throw err;
  });

  makePath(databasePath);

  const db = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    ${StoredDDLStatements.SetWALMode}
    ${StoredDDLStatements.CreateShadowIpTable}
  `);

  const loadRowsWatcher = progressWatcher({
    interval: 100,
    message: ({ progress, elapsed }) =>
      `Loaded ${progress} rows in ${Math.round(elapsed / 1000)}s`,
  }).start();

  let rows: Array<string | number>[] = [];
  const insertStatement = await db.prepare(getInsertStatement(batchSize));
  const readInterface = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of readInterface) {
    const [lowerIpId, upperIpId, countryCode, countryName, stateRegion, city] =
      line.split(',').map((field) => field.trim().replace(/\"/g, ''));

    rows.push([
      parseInt(lowerIpId),
      parseInt(upperIpId),
      countryCode,
      countryName,
      stateRegion,
      city,
    ]);

    loadRowsWatcher.increment();

    if (rows.length >= batchSize) {
      await insertStatement.run(...rows.flat());
      rows = [];
    }
  }
  await insertStatement.finalize();

  if (rows.length) {
    const insertRowsLeft = await db.prepare(getInsertStatement(rows.length));
    await insertRowsLeft.run(...rows.flat());
    await insertRowsLeft.finalize();
  }

  const loadedRows = loadRowsWatcher.stop().getCurrent();
  console.log(
    `Successfully loaded ${loadedRows.progress} rows in ${loadedRows.elapsed}ms`,
  );

  const createIndexWatcher = progressWatcher({
    interval: 1000,
    message: ({ elapsed }) =>
      `Creating index. Time elapsed: ${Math.round(elapsed / 1000)}s`,
  }).start();

  await db.exec(`
    ${StoredDDLStatements.ReplaceIpTableForShadow}
    ${StoredDDLStatements.CreateIpRangeIndex}
  `);

  await db.close();

  const indexingProgress = createIndexWatcher.stop().getCurrent();
  console.log(`Successfully created index in ${indexingProgress.elapsed}ms`);
}

if (process.argv.includes('--run')) {
  import('dotenv/config');

  console.log('Started import script');

  importCSVToSQLite({
    databasePath: EnvironmentVariables.DB_CONNECTION,
    csvPath: EnvironmentVariables.DATASET_FILE_PATH,
  }).catch((error) => {
    console.error('Something went wrong!\n', error);
  });
}
