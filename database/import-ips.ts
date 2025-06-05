import "dotenv/config";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const {
  IPLOCATION_CSV_PATH = "iplocation-dataset.csv",
  DB_HOST = "database/ips;db",
} = process.env;

async function importCSVToSQLite() {
  try {
    // Get start time
    const start = Date.now();

    // Open SQLite database
    const db = await open({
      filename: DB_HOST,
      driver: sqlite3.Database,
    });

    // Set up ip table
    await db.exec(`
      -- Drop ip table if it exists
      DROP TABLE IF EXISTS ip;

      -- Create/Recreate ip table
      CREATE TABLE IF NOT EXISTS ip (
        lower_ip_id INTEGER,
        upper_ip_id INTEGER,
        country_code TEXT,
        country_name TEXT,
        state_region TEXT,
        city TEXT
      );

      -- Create index on ip_id columns
      CREATE INDEX "ip_range" ON "ip" (
        "lower_ip_id",
        "upper_ip_id" DESC
      )
    `);

    // Create read stream for CSV
    const fileStream = createReadStream(IPLOCATION_CSV_PATH);
    const readInterface = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // Process rows in batches
    const batchSize = 5000;
    let rows: Array<string | number>[] = [];
    let loadedRows = 0;

    // Insertion helper function
    const insertRows = async () => {
      if (rows.length < 1) {
        return;
      }

      // Prepare statement
      const placeholders = `(?, ?, ?, ?, ?, ?),\n`
        .repeat(rows.length)
        .slice(0, -2);
      const insertStmt = await db.prepare(`
        INSERT INTO ip (lower_ip_id, upper_ip_id, country_code, country_name, state_region, city)
        VALUES ${placeholders}
      `);

      // Run prepared statement with values
      await insertStmt.run(...rows.flat());

      // Finalize prepared statement
      await insertStmt.finalize();
    };

    // Process each row
    for await (const line of readInterface) {
      const [
        lowerIpId,
        upperIpId,
        countryCode,
        countryName,
        stateRegion,
        city,
      ] = line.split(",").map((field) => field.trim().replace(/\"/g, ""));

      rows.push([
        parseInt(lowerIpId),
        parseInt(upperIpId),
        countryCode,
        countryName,
        stateRegion,
        city,
      ]);

      if (rows.length === batchSize) {
        await insertRows();
        rows = [];
      }

      loadedRows++;
    }

    // Insert remaining rows
    await insertRows();

    // Close database connection
    await db.close();

    // Get time elapsed
    const end = Date.now();
    const elapsed = end - start;

    console.log(`Successfully loaded ${loadedRows} rows in ${elapsed}ms`);
  } catch (error) {
    console.error("Something went wrong!", error);
  }
}

// Run the import
importCSVToSQLite();
