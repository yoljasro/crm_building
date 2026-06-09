import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = (cmd: string) => {
  console.log(`▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
};

try {
  // 1️⃣ fetch raw telegram messages
  run('ts-node scripts/fetch_group.ts');
  // 2️⃣ parse raw messages into db.json structure
  run('ts-node scripts/parse_messages.ts');
  // 3️⃣ download all images and update db.json
  run('ts-node scripts/download_images.ts');
  // 4️⃣ generate final report
  run('node scripts/generate_report.js');
  console.log('✅ Reprocess pipeline completed successfully');
} catch (e) {
  console.error('❌ Reprocess pipeline failed', e);
  process.exit(1);
}
