import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

/**
 * Parse Telegram HTML export and generate a result.json compatible with import_from_json.ts
 *
 * Usage: node ./scripts/parse_html.ts "<export_directory>"
 */
const exportDir = process.argv[2];
if (!exportDir) {
  console.error('❌ Export directory argument missing');
  process.exit(1);
}
const absExportDir = path.resolve(exportDir);
if (!fs.existsSync(absExportDir) || !fs.statSync(absExportDir).isDirectory()) {
  console.error(`❌ Export directory not found: ${absExportDir}`);
  process.exit(1);
}

// Find all messages*.html files recursively
function findHtmlFiles(dir: string): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (entry.isFile() && /^messages.*\.html$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(absExportDir);
if (htmlFiles.length === 0) {
  console.error('❌ No messages*.html files found in export directory');
  process.exit(1);
}

let messages: any[] = [];
let nextId = 1;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  // Telegram HTML groups messages by div.message (or .message).
  $('.message').each((_, el) => {
    const $el = $(el);
    // Extract text – look for .text or .body
    let textContent = '';
    const textEl = $el.find('.text, .body');
    if (textEl.length) {
      textContent = textEl.text().trim();
    }
    // Extract photo – check for img inside .photo_wrap or .media_wrap
    let photoPath: string | undefined;
    const imgEl = $el.find('.photo_wrap img, .media_wrap img');
    if (imgEl.length) {
      const src = imgEl.attr('src') || '';
      // src is usually relative to export directory, e.g., "photos/xxx.jpg"
      if (src) {
        photoPath = src.replace(/^\.\//, ''); // remove leading ./ if present
      }
    }
    // Extract date – usually in .date or .forwarded_date
    let dateStr = '';
    const dateEl = $el.find('.date, .forwarded_date');
    if (dateEl.length) {
      dateStr = dateEl.attr('data-original-title') || dateEl.text();
    }
    // Build message object compatible with import_from_json
    const msgObj: any = {
      id: nextId++,
      type: 'message',
      date: dateStr || new Date().toISOString(),
      text: textContent,
    };
    if (photoPath) {
      msgObj.photo = photoPath;
    }
    if (textContent) {
      messages.push(msgObj);
    }
  });
}

const result = { messages };
const resultPath = path.join(absExportDir, 'result.json');
fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf8');
console.log(`✅ Parsed ${messages.length} messages. result.json written to ${resultPath}`);
