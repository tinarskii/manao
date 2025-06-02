import { startApp } from "./server";
import { main } from "./client/client";
import { initDatabase } from "./helpers/database";

initDatabase();
startApp();
main();
