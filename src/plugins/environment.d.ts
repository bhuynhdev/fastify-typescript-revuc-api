import { type Config } from "./config";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Config {}
  }
}
