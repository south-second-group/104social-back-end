import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({ path: "./.env" })

const DB = process.env.DATABASE?.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD ?? ""
)

mongoose
  .connect(DB + "testDB", {})
  .then(() => { console.warn("連線資料庫成功") })
  .catch((error) => { console.error("連線資料庫失敗:", error) })
