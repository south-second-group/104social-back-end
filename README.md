<!-- 底下標籤來源參考寫法可至：https://github.com/Envoy-VC/awesome-badges#github-stats -->

![](https://img.shields.io/github/stars/hsiangfeng/README-Example-Template.svg)｜![](https://img.shields.io/github/forks/hsiangfeng/README-Example-Template.svg)｜![](https://img.shields.io/github/issues-pr/hsiangfeng/README-Example-Template.svg)｜![](https://img.shields.io/github/issues/hsiangfeng/README-Example-Template.svg)


# README Template

![專案封面圖](https://fakeimg.pl/800x400/282828/FFF/?text=Cover)

> 此專案是一份 README 的撰寫範本，主要是方便所有人可以快速撰寫 README，讓大家可以更有方向的去寫出 README。

<!-- - [線上觀看連結](https://israynotarray.com/) -->

- [swagger 文件](https://one04social-back-end.onrender.com/api-doc/#/)

## 功能

測試帳號密碼 **（請斟酌提供，建議只提供僅能觀看不能操作的帳號密碼）**

```bash
帳號： example@example.com
密碼： example
```

- [x] 登入
- [x] 登出
- [x] 產品列表
...

## 畫面

> 可提供 1~3 張圖片，讓觀看者透過 README 了解整體畫面

![範例圖片 1](https://fakeimg.pl/500/)

## 安裝

> 請務必依據你的專案來調整內容。

以下將會引導你如何安裝此專案到你的電腦上。

Node.js 版本建議為：`16.0` 以上...

### 取得專案

```bash
git clone https://github.com/south-second-group/104social-back-end.git
```

### 移動到專案內

```bash
cd 104social-back-end
```

### 安裝套件

```bash
npm ci

#npm install 可能會有套件版本不同的問題，建議使用 npm ci
```

### 環境變數設定

請在終端機輸入 `cp .env.example .env` 來複製 .env.example 檔案，並依據 `.env` 內容調整相關欄位。

### 運行專案

```bash
npm run start:dev
```

### 開啟專案

在瀏覽器網址列輸入以下即可看到畫面

```bash
http://localhost:3000/
```

若要查看 swagger 文件

```bash
npm run swagger

http://localhost:3000/api-doc
```

## 環境變數說明

```bash
PORT=3000
#本地資料庫位置，雲端資料庫請自行調整
DATABASE=mongodb://localhost:27018/ 
#資料庫密碼（群組索取）
DATABASE_PASSWORD= 
#JWT 有效時間
JWT_EXPIRES_DAY=1D 
#JWT 密鑰 請自行輸入隨機亂碼（英文數字符號）
JWT_SECRET= 
```
...
```

## 資料夾說明

- views - 畫面放置處
- controllers - 控制器放置處
- modules - 模組放置處
- assets - 靜態資源放置處
  - scss - scss 檔案放置處
  - images - 圖片放置處
...

## 專案技術

- Node.js v16.15.0
- Vue v3.2.20
- Vite v4.0.4
- Vue Router v4.0.11
- Axios v0.24.0
- Bootstrap v5.1.3
...

## 第三方服務

- Algolia
- Google Analytics
...

## CI/CD 說明

此專案有使用 Github Actions，所以發起 PR 時會自動執行以下動作：

- 建立 Node.js 環境
- 安裝相依套件
- 編譯程式碼
- 執行 ESLint 掃描
- 執行測試
...

當專案 merge 到 main 時會自動執行以下動作：

- 建立 Node.js 環境
- 安裝相依套件
- 編譯程式碼
- 執行 ESLint 掃描
- 執行測試
- 部署到 Github Pages
...

## 聯絡作者

> ps. 這邊絕對不是業配，而是要適當提供一些方式讓觀看者知道你的聯絡方式，讓他們可以更方便的找到你。

你可以透過以下方式與我聯絡

- [部落格](https://israynotarray.com/)
- [Facebook](https://www.facebook.com/israynotarray)
- [Instagram](https://www.instagram.com/isray_notarray/)
...
