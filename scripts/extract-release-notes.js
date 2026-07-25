const fs = require('fs');
const path = require('path');

const ref = process.env.GITHUB_REF_NAME || 'v1.2.0';
const ver = ref.replace(/^v/, '');

const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const notesPath = path.join(__dirname, '../release/NOTES.md');

let notes = `Production release ${ref} of Gemini Video Watermark Remover.`;

if (fs.existsSync(changelogPath)) {
  const content = fs.readFileSync(changelogPath, 'utf8');
  const escapedVer = ver.replace(/\./g, '\\.');
  const regex = new RegExp(`## \\[${escapedVer}\\][^\\n]*\\n+([\\s\\S]*?)(?=\\n## \\[|$)`);
  const match = content.match(regex);
  if (match && match[1]) {
    notes = match[1].trim();
  }
}

const releaseBody = `## 🚀 Gemini Video Watermark Remover ${ref}

### 📦 What's Changed in this Release

${notes}

---
### 🔒 Verification & Integrity
Verify downloaded binaries using \`SHA256SUMS.txt\` attached below.
`;

const releaseDir = path.dirname(notesPath);
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

fs.writeFileSync(notesPath, releaseBody, 'utf8');
console.log(`Successfully generated release notes for ${ref} at ${notesPath}`);
