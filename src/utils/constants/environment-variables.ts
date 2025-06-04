import 'dotenv/config';

export type Environment = {
  PORT: number;
  DB_CONNECTION: string;
  DATASET_FILE_PATH: string;
};

const { PORT, DB_CONNECTION, DATASET_FILE_PATH } = process.env as Partial<
  Record<keyof Environment, string | undefined>
>;

export const EnvironmentVariables: Environment = {
  PORT: Number(PORT) || 3000,
  DB_CONNECTION: DB_CONNECTION ?? 'database/ips.db',
  DATASET_FILE_PATH: DATASET_FILE_PATH ?? 'iplocation-dataset.csv',
};
