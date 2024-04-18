# 轉ts
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
npm i --save-dev @types/node

# 錯誤筆記
1. tsc 錯誤 （包含 require,export module ,ts type defind...
2. 登入時報錯，因為require 還有 @types/套件
3. mongo連線錯誤，環境變數密碼大小寫錯誤
4. 使用js套件開發和使用ts定義型別 ：In your case, you are trying to import @types/swagger-ui-express directly, which is causing the error.
 You should import swagger-ui-express instead, and TypeScript will automatically use the type definitions from @types/swagger-ui-express if they are installed in your project.
5. 
 ts-node 是一個工具，它允許你直接運行 TypeScript 文件，而不需要先將其轉換為 JavaScript。它在內部使用 TypeScript 編譯器將 TypeScript 代碼轉換為 JavaScript，然後使用 Node.js 執行轉換後的 JavaScript 代碼。這使得在開發過程中能夠更快速地運行和測試 TypeScript 代碼。
@types/node 是一個包含 Node.js 的 TypeScript 声明文件的包。這些声明文件為 Node.js 的 API 提供了 TypeScript 类型信息，使得在 TypeScript 代碼中使用 Node.js API 時能夠得到类型检查和自动完成。这对于在 TypeScript 中编写 Node.js 代码非常有用。

# 開發環境
# lint 檢查（比較不影響） 和 type 檢查 有錯可能還可以正常運作 
"lint:watch": "nodemon --exec 'npm run lint' --watch ."
"typeCheck": "npx tsc --watch",
"start:dev": "NODE_ENV=develop nodemon --exec npx ts-node ./bin/www.ts",

#  firebase-admin
# nvm use 21.5
# 先準備好檔案，並同時檢查格式和型別，確認只有套件安裝的問題，再去安裝套件
npm install firebase-admin 
```bash
william@william 104social-back-end % npm i firebase-admin
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: '104social@0.0.0',
npm WARN EBADENGINE   required: { node: 'v16.x' },
npm WARN EBADENGINE   current: { node: 'v21.5.0', npm: '10.2.4' }
npm WARN EBADENGINE }

added 143 packages, and audited 545 packages in 11s

120 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

