
# 🇹🇼 台灣 MSG 資料庫 （Taiwan Movies, Series & Games Database）

[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://gnu.org)

一個彙整台灣相關電影、影集與電子遊戲作品的資料網站。

本專案致力於建立一個便利、完整且易於探索的台灣作品目錄，讓使用者能更容易發現與台灣相關的影視及遊戲作品。

> ⚠️ 本網站目前處於**測試階段**，仍在持續開發與整理資料中，內容尚不完整。

## 網站

* **正式網站**：*（待上線後填入）*
* **前台進度**：資料蒐集中 / 網站測試中

## 收錄範圍

### 電影

收錄已公開發行，片長40分鐘以上，並與台灣關聯的電影作品。

包含：
* 台灣製作
* 國際合作
* 台灣取景
* 故事設定在台灣

### 影集

收錄已公開發行，並與台灣有關聯的影集作品。

包含：
* 台灣製作
* 國際合作
* 台灣取景
* 故事設定在台灣

影集以「單季」作為基本收錄單位。

### 電子遊戲

僅收錄已公開發行的台灣製作電子遊戲作品，不包含大型電玩(街機)作品。


## 目前功能與開發藍圖
### 已實現功能
* **基礎瀏覽**：完整檢視電影、影集與電子遊戲作品清單。
* **關鍵字搜尋**：支援作品各欄位綜合檢索或指定欄位搜索。
* **條件排序**：可依各欄位資訊進行排序。
* **進階篩選**：可對各欄位資訊進行交叉篩選。
* **作品詳細頁**：完整展示作品在此網站上的基本資訊。
### 待開發功能
- [ ] 提供回報連結
- [ ] 完整電影資料蒐集
- [ ] 完整影集資料蒐集
- [ ] 完整遊戲資料蒐集
- [ ] 人工智慧搜尋功能
- [ ] 統計匯出功能

## 專案結構


<details open>
  <summary><strong>📂 src</strong></summary>
  
  <table style="border: none; border-collapse: collapse; margin-left: 20px;">
    <!-- API -->
    <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 api</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 處理 Google Apps Script API 請求</td></tr>
    <!-- APP -->
    <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 app</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 主元件組裝，負責頁面切換、資料載入與全域視窗狀態</td></tr>
    <!-- ASSETS -->
    <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 assets</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 靜態資源（圖片、CSS等）</td></tr>
    
    <!-- COMPONENTS (可折疊) -->
    <tr style="border: none;">
      <td colspan="2" style="border: none; padding: 2px 10px;">
        <details>
          <summary>📁 components <span style="color: #6a737d; margin-left: 15px; font-weight: normal;"># 可複用 UI 組件</span></summary>
          <table style="border: none; border-collapse: collapse; margin-left: 20px; font-size: 0.95em;">
            <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 about</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 關於按鈕、視窗與相關組件</td></tr>
            <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 common</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 全局通用組件（Navbar, Footer, Button）</td></tr>
            <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 detail</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 作品詳細資料頁組件</td></tr>
            <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 filters</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 進階篩選器組件</td></tr>
            <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 works</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 作品列表與卡片頁組件</td></tr>
          </table>
        </details>
      </td>
    </tr>
    
    <!-- CONFIG -->
    <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 config</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 網站全域設定與專案資訊</td></tr>
    <!-- HOOKS -->
    <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 hooks</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 自定義 React Hooks</td></tr>
    <!-- PAGES -->
    <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 pages</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 頁面組成</td></tr>
    <!-- UTILS -->
    <tr style="border: none;"><td style="border: none; padding: 2px 10px;">📁 utils</td><td style="border: none; padding: 2px 10px; color: #6a737d;"># 通用工具函式（日期格式化、字串處理等）</td></tr>
  </table>
</details>

專案仍在持續重構，因此實際結構可能有所變動。

## 本機執行

請確保您的開發環境已安裝：
* [Node.js](https://nodejs.org) (建議 v18 以上 LTS 版本)
* `npm` 或 `pnpm`

在專案根目錄建立 `.env.local` 檔案，並填入 API Endpoint：
```ini
# .env.local
VITE_GOOGLE_SHEET_API_URL=https://script.google.com/macros/s/AKfycbytuJYd3_LhkzHWhkQwJyDVyBpE1BTcNkAY4Bj3dxNHsrHwBasokEZIciOEfuyehLH8SA/exec
```

1. **Clone 專案**
   ```bash
   git clone https://github.com.git
   cd TaiwanMSGProject
   ```

2. **安裝依賴套件**
   ```bash
   npm install
   ```

3. **啟動本地開發伺服器 (Development)**
   ```bash
   npm run dev
   ```

4. **打包正式環境版本 (Production Build)**
   ```bash
   npm run build
   ```

5. **預覽打包後的產物 (Preview)**
   ```bash
   npm run preview
   ```

## 版本

目前專案仍處於 ![Version](https://img.shields.io/github/package-json/v/Tiroyang/TaiwanMSGProject) 。

盡可能嘗試 [語意化版本 (Semantic Versioning)](https://semver.org) 規範，放在這裡不然我忘記：
 * **Patch (`npm version patch`)** -> +`0.0.1`：Bug 修正、小型功能改善或 UI 樣式微調。
 * **Minor (`npm version minor`)** -> +`0.1.0`：新增獨立功能、或進行中型架構優化（向下相容）。 
 * **Major (`npm version major`)** -> +`1.0.0`：核心功能、資料結構達到穩定狀態後的正式發布。

## 資料與 API

作品資料目前主要透過 Google Sheets 維護，並使用 Google Apps Script 作為 API 提供給前端網站。

## 問題回報與貢獻

目前專案主要由個人維護，相關回報連結待更新。

🚧 開發中

## 相關 YouTube 播放清單（本站前身）

### 台灣電影列表 Taiwan Movie List

https://www.youtube.com/playlist?list=PLh4a4i9E4dzR166Af6Vwcu-QhCQw6AXLg

### 台灣影集列表 Taiwan Drama List

https://www.youtube.com/playlist?list=PLh4a4i9E4dzR4QG5Uy0GUXi042ZU6XMbZ

### 台灣遊戲列表 Taiwan Game List

https://www.youtube.com/playlist?list=PLh4a4i9E4dzT5lr3D_8MFQc2h7byUJQHK

### 取景或設定在台灣的外國影視作品 Films set or/and shot in Taiwan

https://www.youtube.com/playlist?list=PLh4a4i9E4dzT0RuvCrQgKZY46B1zrieKc

### Hololive 成員玩台灣遊戲 Hololive Members play Taiwanese Games ホロライブと台湾ゲーム

https://www.youtube.com/playlist?list=PLh4a4i9E4dzT2LMsI9wSzJmuIRQqsjh1M