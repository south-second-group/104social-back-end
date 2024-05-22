import swaggerAutogen from "swagger-autogen"
import testUser from "./models/testUsersModel"
import dotenv from "dotenv"

dotenv.config({ path: "./.env" })

const doc = {
  info: {
    title: "104social",
    description: "A social networking website for connecting people."
  },
  host: [process.env.PORT ? `localhost:${process.env.PORT}` :"one04social-back-end.onrender.com"],
  schemes: ["http","https"], // 正式機 https / 本地 http
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "Enter \"Bearer+space+{token}\"。Example: \"Bearer eyXXX.XXX.XXX\""
    }
  },
  definitions: {
    testUser: {
      type: "object",
      properties: {} as Record<string, any>
    }
  }
}

// testUser schema
Object.keys(testUser.schema.paths).forEach((field) => {
  const type = testUser.schema.paths[field].instance.toLowerCase()
  doc.definitions.testUser.properties[field] = { type }
})

const outputFile = "./swagger-output.json"
const endpointsFiles = ["./app.ts"]

swaggerAutogen(outputFile, endpointsFiles, doc)
