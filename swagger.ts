import swaggerAutogen from "swagger-autogen"
import testUser from "./models/testUsersModel"

const doc = {
  info: {
    title: "104social",
    description: "A social networking website for connecting people."
  },
  host: ["one04social-back-end.onrender.com"], // 正式機 one04social-back-end.onrender.com  / 本地 localhost:3000
  // host: ["localhost:3000"],
  schemes: ["https"], // 正式機 https / 本地 http
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
