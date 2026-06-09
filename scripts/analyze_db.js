const db = JSON.parse(require('fs').readFileSync('src/lib/db.json','utf8'));

console.log('=== BAZA TOLIQ ANALIZI ===\n');

// Floor
const floorDash = db.objects.filter(o => o.floor === '-').length;
const floorNormal = db.objects.filter(o => o.floor !== '-' && o.floor).length;
console.log('Floor = "-":', floorDash);
console.log('Floor normal:', floorNormal);

// Repair
const repairDash = db.objects.filter(o => o.repair === '-').length;
const repairNormal = db.objects.filter(o => o.repair !== '-' && o.repair).length;
console.log('Repair = "-":', repairDash);
console.log('Repair normal:', repairNormal);

// TopicTitle
const noTopic = db.objects.filter(o => !o.topicTitle).length;
const hasTopic = db.objects.filter(o => o.topicTitle).length;
console.log('topicTitle undefined:', noTopic);
console.log('topicTitle mavjud:', hasTopic);

// Description
const hasDesc = db.objects.filter(o => o.description && o.description.length > 50).length;
const shortDesc = db.objects.filter(o => o.description && o.description.length <= 50 && o.description.length > 0).length;
console.log('Tavsif 50+ belgili:', hasDesc);
console.log('Tavsif 1-50 belgili:', shortDesc);

// Narx diapazoni
const prices = db.objects.filter(o => o.price > 0).map(o => o.price).sort((a,b) => a-b);
console.log('\nNarx diapazoni:');
console.log('  Min:', prices[0], '$');
console.log('  Max:', prices[prices.length-1], '$');
console.log('  Ortacha:', Math.round(prices.reduce((a,b) => a+b, 0) / prices.length), '$');

// Rooms taqsimoti
const roomCounts = {};
db.objects.forEach(o => { roomCounts[o.rooms] = (roomCounts[o.rooms]||0) + 1; });
console.log('\nXona soni taqsimoti:', JSON.stringify(roomCounts));

// Owner bog'lanishi
const ownersUsed = new Set(db.objects.map(o => o.ownerId).filter(Boolean));
const orphanOwners = db.owners.filter(o => !ownersUsed.has(o.id)).length;
console.log('\nIshlatilgan ownerlar:', ownersUsed.size);
console.log('Ortiqcha ownerlar (obyektsiz):', orphanOwners);

// Name taqsimoti
const names = {};
db.objects.forEach(o => { const n = o.name || '(bosh)'; names[n] = (names[n]||0) + 1; });
const topNames = Object.entries(names).sort((a,b) => b[1]-a[1]).slice(0,15);
console.log('\nEng kop uchrovchi nomlar (top 15):');
topNames.forEach(([k,v]) => console.log('  ' + v + ' ta - ' + k));

// District taqsimoti
const districts = {};
db.objects.forEach(o => { const d = o.district || '(bosh)'; districts[d] = (districts[d]||0) + 1; });
const topDistricts = Object.entries(districts).sort((a,b) => b[1]-a[1]).slice(0,15);
console.log('\nTumanlar taqsimoti (top 15):');
topDistricts.forEach(([k,v]) => console.log('  ' + v + ' ta - ' + k));

// Sanalar
const dates = db.objects.map(o => o.createdAt).filter(Boolean).sort();
console.log('\nSana diapazoni:');
console.log('  Eng eski:', dates[0]);
console.log('  Eng yangi:', dates[dates.length-1]);
