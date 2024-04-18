"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const testUsersModel_1 = __importDefault(require("./models/testUsersModel"));
const doc = {
    info: {
        title: "104social",
        description: "A social networking website for connecting people."
    },
    host: ["localhost:3000"], // 正式機 one04social-back-end.onrender.com  / 本地 localhost:3000
    schemes: ["http"], // 正式機 https / 本地 http
    securityDefinitions: {
        Bearer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description: "Enter \"Bearer+space+{token}\"。Example: \"Bearer eyXXX.XXX.XXX\""
        }
    },
    definitions: {
        testUser: {
            type: "object",
            properties: {}
        }
    }
};
// testUser schema
Object.keys(testUsersModel_1.default.schema.paths).forEach((field) => {
    const type = testUsersModel_1.default.schema.paths[field].instance.toLowerCase();
    doc.definitions.testUser.properties[field] = { type };
});
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.ts"];
(0, swagger_autogen_1.default)(outputFile, endpointsFiles, doc);
