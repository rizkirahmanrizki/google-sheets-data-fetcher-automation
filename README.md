# google-sheets-data-fetcher-automation
This project demonstrates how to connect **Google Sheets** with an **analytics or business intelligence (BI) platform** (such as Metabase, Looker, Superset, or Power BI) using **Google Apps Script**.  
It retrieves data from an API endpoint, writes it into a sheet, formats the data into readable columns, displays image fields inline, and calculates dynamic metrics such as **Age** — all automatically within Google Sheets.

---

## 🚀 Features

✅ Retrieve data from an analytics or BI platform via API  
✅ Parse and write structured results directly into Google Sheets  
✅ Format `createdAt` and `birthdate` fields into readable date-time strings  
✅ Display image URLs (e.g., user avatars) as inline images  
✅ Automatically calculate an `Age` column using `=ROUND(YEARFRAC(birthdate; TODAY()); 0)`  
✅ Optional Google Chat webhook notifications on completion  

---

## 🧩 Tech Stack

- **Google Apps Script** (JavaScript-based)
- **Google Sheets API**
- `UrlFetchApp` for external API requests  
- `Utilities.formatDate()` for time zone handling  
- Built-in Google Sheets formulas: `IMAGE`, `YEARFRAC`, `ROUND`

---

## ⚙️ Setup Instructions

### 1️⃣ Create a new Google Sheet
1. Open [Google Sheets](https://sheets.google.com)  
2. Go to **Extensions → Apps Script**  
3. Replace the default code with [`Runner.gs`](./Runner.gs)

### 2️⃣ Configure the script
At the top of the file, adjust these constants as needed:

```js
const API_BASE_URL = 'https://your-analytics-platform/api/your-endpoint';
const CHAT_WEBHOOK_URL = '';  // optional Google Chat webhook
const TIMEZONE = 'Asia/Jakarta';
