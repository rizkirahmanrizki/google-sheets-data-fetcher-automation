/**
 * GOOGLE APPS SCRIPT – DEMO DATA RUNNER
 * -----------------------------------------------------------------
 * Fetches dummy JSON data from a mock API,
 * formats date/time fields, renders avatars as images,
 * and adds an "Age" column using =ROUND(YEARFRAC(...),0).
 */

const API_BASE_URL = 'https://68e228678943bf6bb3c5cbea.mockapi.io/api/dummy1/dummy_data'; // change to your API endpoint
const CHAT_WEBHOOK_URL = '';  // optional: set your Chat webhook if desired
const TIMEZONE = 'Asia/Jakarta';

/**
 * Run the demo job
 */
function runDemoJob() {
  try {
    const rows = fetchDummyData();
    if (!rows || rows.length === 0) {
      postChat('DemoData: FAILED – no data');
      return;
    }
    writeSheet('DemoData', rows);
    postChat(`DemoData: UPDATED – ${rows.length - 1} rows`);
  } catch (err) {
    Logger.log('❌ Error: ' + err);
    postChat('DemoData: FAILED – ' + err.message);
  }
}

/**
 * Fetch and format data from the API
 */
function fetchDummyData() {
  const resp = UrlFetchApp.fetch(API_BASE_URL, { method: 'get', muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200)
    throw new Error(`API error ${resp.getResponseCode()}: ${resp.getContentText()}`);

  const arr = JSON.parse(resp.getContentText());
  if (!Array.isArray(arr)) throw new Error('Unexpected API response (not an array)');

  const keys = Object.keys(arr[0]);
  const data = [keys];

  arr.forEach(obj => {
    const row = keys.map(k => {
      let v = obj[k];
      if (k === 'createdAt' || k === 'birthdate') {
        const dt = new Date(v);
        v = Utilities.formatDate(dt, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
      }
      return v;
    });
    data.push(row);
  });

  // Insert an "age" column after birthdate
  const birthIdx = keys.indexOf('birthdate');
  if (birthIdx !== -1) {
    data[0].splice(birthIdx + 1, 0, 'age');
    for (let i = 1; i < data.length; i++) data[i].splice(birthIdx + 1, 0, '');
  }

  return data;
}

/**
 * Write data into the sheet
 */
function writeSheet(sheetName, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sh.clear();

  // Write all rows
  sh.getRange(1, 1, data.length, data[0].length).setValues(data);

  const header = data[0];
  const lastRow = data.length;

  // 🖼️ Convert avatar URLs into images
  const avatarCol = header.indexOf('avatar') + 1;
  if (avatarCol > 0) {
    for (let r = 2; r <= lastRow; r++) {
      const url = sh.getRange(r, avatarCol).getValue();
      if (url && url.startsWith('http')) {
        sh.getRange(r, avatarCol).setFormula(`=IMAGE("${url}")`);
      }
    }
  }

  // 🎂 Add age formulas using YEARFRAC
  const birthCol = header.indexOf('birthdate') + 1;
  const ageCol = header.indexOf('age') + 1;
  if (birthCol > 0 && ageCol > 0) {
    const birthColLetter = sh.getRange(1, birthCol).getA1Notation().replace(/\d+$/, '');
    const ageRange = sh.getRange(2, ageCol, lastRow - 1);
    ageRange.setFormula(`=IF(LEN(${birthColLetter}2); ROUND(YEARFRAC(${birthColLetter}2; TODAY()); 0); "")`);
  }

  sh.autoResizeColumns(1, data[0].length);
  Logger.log(`✅ Wrote ${data.length - 1} rows to "${sheetName}"`);
}

/**
 * Optional Chat notification or log
 */
function postChat(text) {
  if (!CHAT_WEBHOOK_URL) {
    Logger.log('[Chat] ' + text);
    return;
  }
  UrlFetchApp.fetch(CHAT_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text }),
    muteHttpExceptions: true
  });
}
