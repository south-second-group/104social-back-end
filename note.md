
# 開發環境
# lint 檢查（比較不影響） 和 type 檢查 有錯可能還可以正常運作 
"dev": "tsx watch ./bin/www.ts",  // x eslint 無監聽，但ts 和 伺服器有共用監聽，所以typeCheck 可不用吧 > interface註解無報錯
"start:dev": "NODE_ENV=develop nodemon --exec npx ts-node ./bin/www.ts",
"start:prod": "NODE_ENV=production nodemon --exec npx ts-node ./bin/www.ts",
"typeCheck": "npx tsc --watch",
"lint:watch": "nodemon --exec 'npm run lint' --watch ."


1. swagger要注意 網域要一樣才拿得到token
2. 要用swagger去取得token 才能在/createOrder拿到 id 