# TLS 專案

*[English](README.md) | 繁體中文*

這是一個全面的 TLS（傳輸層安全協定）實作專案。

## 功能特色

- **安全通訊協定**：完整支援 TLS 1.2 與 1.3
- **加密解密能力**：支援現代 AEAD 加密套件
- **憑證管理**：X.509 憑證鏈驗證與管理
- **完美前向保密**：ECDHE 金鑰交換支援

## 系統需求

開始使用前，請確保已安裝以下軟體：

- **Node.js 18+**（用於 JavaScript 實作）
- **OpenSSL 1.1.1+**（用於加密操作）
- **Git**（用於版本控制）

## 安裝方式

### 選項 1：NPM 套件安裝（推薦）
```bash
npm install tls-project
```

### 選項 2：從原始碼建置
```bash
# 複製存儲庫
git clone https://github.com/HansChung/TLS.git
cd TLS

# 安裝依賴套件
npm install

# 建置專案
npm run build

# 執行測試
npm test
```

### 選項 3：Docker 容器
```bash
docker pull hanschung/tls-project:latest
docker run -p 8443:8443 hanschung/tls-project
```

## 快速開始

### 基本使用範例

```javascript
const { TLSClient, TLSServer } = require('tls-project');

// 建立 TLS 伺服器
const server = new TLSServer({
  port: 8443,
  cert: './certs/server.crt',
  key: './certs/server.key'
});

server.start();
console.log('TLS 伺服器運行於 8443 埠');

// 建立 TLS 客戶端
const client = new TLSClient({
  host: 'localhost',
  port: 8443,
  rejectUnauthorized: false // 僅限開發環境使用
});

client.connect()
  .then(() => console.log('已連接至 TLS 伺服器'))
  .catch(err => console.error('連接失敗：', err));
```

### 憑證生成

開發和測試用途：

```bash
# 生成私鑰
openssl genrsa -out server.key 2048

# 生成憑證簽名請求
openssl req -new -key server.key -out server.csr

# 生成自簽憑證
openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365
```

## 專案結構

```
TLS/
├── src/                 # 主要源碼
│   ├── client/         # TLS 客戶端實作
│   ├── server/         # TLS 伺服器實作
│   ├── crypto/         # 加密相關功能
│   ├── utils/          # 工具類別
│   └── types/          # TypeScript 型別定義
├── tests/              # 測試檔案
│   ├── unit/           # 單元測試
│   └── integration/    # 整合測試
├── examples/           # 使用範例
├── scripts/            # 開發腳本
├── certs/              # 憑證檔案（開發用）
└── docs/               # 文件
```

## 開發指令

```bash
# 開發模式執行
npm run dev

# 建置專案
npm run build

# 執行測試
npm test

# 監視模式測試
npm run test:watch

# 程式碼覆蓋率
npm run test:coverage

# 程式碼檢查
npm run lint

# 自動修復程式碼風格
npm run lint:fix

# 格式化程式碼
npm run format

# 清理建置檔案
npm run clean
```

## API 文件

### TLSServer 類別

建立和管理 TLS 伺服器連接。

```typescript
import { TLSServer, TLSServerOptions } from 'tls-project';

const options: TLSServerOptions = {
  port: 8443,
  host: 'localhost',
  cert: './certs/server.crt',
  key: './certs/server.key',
  requestCert: false,
  rejectUnauthorized: true
};

const server = new TLSServer(options);
```

#### 事件

- `listening` - 伺服器開始監聽
- `connection` - 新客戶端連接
- `data` - 接收到資料
- `disconnect` - 客戶端斷線
- `error` - 伺服器錯誤

### TLSClient 類別

建立和管理 TLS 客戶端連接。

```typescript
import { TLSClient, TLSClientOptions } from 'tls-project';

const options: TLSClientOptions = {
  host: 'localhost',
  port: 8443,
  timeout: 5000,
  rejectUnauthorized: true
};

const client = new TLSClient(options);
```

#### 事件

- `connect` - 連接建立
- `data` - 接收到資料
- `end` - 連接結束
- `close` - 連接關閉
- `error` - 連接錯誤
- `timeout` - 連接逾時

## 範例

### 伺服器範例

```typescript
import { TLSServer, DefaultLogger } from 'tls-project';

const logger = new DefaultLogger('info');
const server = new TLSServer({
  port: 8443,
  cert: './certs/server.crt',
  key: './certs/server.key'
}, logger);

// 處理連接
server.on('connection', (socket, connectionInfo) => {
  console.log('新客戶端連接：', connectionInfo);
  socket.write('歡迎使用 TLS 伺服器！\n');
});

// 處理資料
server.on('data', (data, socket) => {
  console.log('收到資料：', data.toString());
  socket.write(`回音：${data.toString()}`);
});

await server.start();
```

### 客戶端範例

```typescript
import { TLSClient, DefaultLogger } from 'tls-project';

const logger = new DefaultLogger('info');
const client = new TLSClient({
  host: 'localhost',
  port: 8443,
  timeout: 5000
}, logger);

client.on('connect', () => {
  console.log('已連接到伺服器');
  client.write('哈囉，伺服器！\n');
});

client.on('data', (data) => {
  console.log('伺服器回應：', data.toString());
});

await client.connect();
```

## 測試

執行完整測試套件：

```bash
# 執行所有測試
npm test

# 執行特定測試
npm test -- --testNamePattern="TLSServer"

# 生成覆蓋率報告
npm run test:coverage

# 監視模式
npm run test:watch
```

## 安全考量

### 開發環境

- 使用 `rejectUnauthorized: false` 僅限開發和測試
- 自簽憑證不應用於生產環境
- 定期更新依賴套件以獲得安全修補

### 生產環境

- 使用來自受信任憑證授權機構的憑證
- 啟用嚴格的憑證驗證
- 定期輪換憑證和私鑰
- 監控 TLS 連接和異常活動

## 效能優化

### 連接管理

- 使用連接池管理多個客戶端
- 實作適當的逾時和重試機制
- 監控記憶體使用和連接洩漏

### 加密效能

- 選擇適當的加密套件
- 啟用 TLS 工作階段重用
- 考慮硬體加速支援

## 故障排除

### 常見問題

**憑證錯誤**
```bash
# 檢查憑證有效性
openssl x509 -in server.crt -text -noout

# 驗證私鑰匹配
openssl x509 -noout -modulus -in server.crt | openssl md5
openssl rsa -noout -modulus -in server.key | openssl md5
```

**連接問題**
- 檢查防火牆設定
- 驗證埠號可用性
- 確認憑證路徑正確

**效能問題**
- 啟用詳細日誌記錄
- 監控系統資源使用
- 檢查網路延遲

## 貢獻

我們歡迎社群貢獻！請遵循以下步驟：

1. **Fork 此專案**
2. **建立功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交變更** (`git commit -m 'Add amazing feature'`)
4. **推送到分支** (`git push origin feature/amazing-feature`)
5. **開啟 Pull Request**

### 開發指引

- 遵循現有的程式碼風格
- 為新功能添加測試
- 更新相關文件
- 確保所有測試通過

## 授權條款

本專案採用 MIT 授權條款。詳見 [LICENSE](LICENSE) 檔案。

## 聯絡資訊

- **作者**：HansChung
- **專案連結**：https://github.com/HansChung/TLS
- **問題回報**：https://github.com/HansChung/TLS/issues

## 致謝

感謝所有貢獻者和開源社群的支持。

---

**⚠️ 重要提醒**：此專案僅供學習和開發用途。在生產環境中使用前，請確保進行適當的安全評估和測試。