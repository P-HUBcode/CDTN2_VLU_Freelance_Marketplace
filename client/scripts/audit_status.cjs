const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res.push(...walk(p));
    else res.push(p);
  });
  return res;
}

const keys = ['applied', 'pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'hired', 'rejected'];
const files = walk('client/src').filter(f => f.match(/\.[jt]sx?$/));

console.log('=== APPLICATION STATUS OCCURRENCES IN CLIENT/SRC ===');
keys.forEach(k => {
  const matched = [];
  files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes(`'${k}'`) || content.includes(`"${k}"`)) {
      matched.push(path.basename(f));
    }
  });
  console.log(`${k} (${matched.length} files): ${matched.join(', ')}`);
});
