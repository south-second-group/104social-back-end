npm install --save-dev typescript ts-node
npx tsc --watch

npm i --save-dev @types/express
npm i --save-dev @types/cookie-parser
npm i --save-dev @types/morgan
npm i --save-dev @types/cors
npm i --save-dev @types/swagger-ui-express
npm i --save-dev @types/debug
npm i --save-dev @types/bcryptjs
npm i --save-dev @types/validator
npm i --save-dev @types/jsonwebtoken


# 錯誤筆記
1. tsc 錯誤 （包含 require,export module ,ts type defind...
2. 登入時報錯，因為require 還有 @types/套件
3. mongo連線錯誤，環境變數密碼大小寫錯誤
4. 使用js套件開發和使用ts定義型別 ：In your case, you are trying to import @types/swagger-ui-express directly, which is causing the error.
 You should import swagger-ui-express instead, and TypeScript will automatically use the type definitions from @types/swagger-ui-express if they are installed in your project.