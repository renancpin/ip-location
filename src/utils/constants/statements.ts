export const StoredStatements = {
  GetIpLocation: `
    SELECT country_name, country_code, state_region, city
    FROM ip 
    WHERE ?id BETWEEN lower_ip_id AND upper_ip_id
    LIMIT 1
  `,
  InsertIpLocation: `
    INSERT INTO ip_shadow (
      lower_ip_id,
      upper_ip_id,
      country_code,
      country_name,
      state_region,
      city
    ) VALUES (?, ?, ?, ?, ?, ?);
  `,
};
export type StoredStatementKeys = keyof typeof StoredStatements;

export function getInsertStatement(rows: number): string {
  const placeholders = '(?, ?, ?, ?, ?, ?),\n'.repeat(rows).slice(0, -2);
  return `
    INSERT INTO ip_shadow (
      lower_ip_id,
      upper_ip_id,
      country_code,
      country_name,
      state_region,
      city
    ) VALUES ${placeholders};
  `;
}

export const StoredDDLStatements = {
  SetWALMode: `
    PRAGMA journal_mode=WAL;
  `,
  CreateShadowIpTable: `
    DROP TABLE IF EXISTS ip_shadow;
    CREATE TABLE IF NOT EXISTS ip_shadow (
      lower_ip_id INTEGER,
      upper_ip_id INTEGER,
      country_code TEXT,
      country_name TEXT,
      state_region TEXT,
      city TEXT
    );
  `,
  ReplaceIpTableForShadow: `
    DROP TABLE IF EXISTS ip;
    ALTER TABLE ip_shadow RENAME TO ip;
  `,
  CreateIpRangeIndex: `
    DROP INDEX IF EXISTS ip_range;
    CREATE INDEX ip_range ON ip (
      upper_ip_id,
      lower_ip_id
    );
  `,
};
