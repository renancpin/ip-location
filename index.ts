import { start } from './src/server';
import { EnvironmentVariables } from '@utils/constants/environment-variables';

start(EnvironmentVariables.PORT);
