import { startApp } from "./server";
import { main } from "./client/client";
import { initDatabase } from "./client/helpers/database";

initDatabase();
startApp();
main();
