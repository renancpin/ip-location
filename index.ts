import "dotenv/config";
import { start } from "./src/server";

start(parseInt(process.env.PORT ?? "3000", 10));
