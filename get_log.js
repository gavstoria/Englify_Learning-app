const { execSync } = require('child_process');
const fs = require('fs');
const reflog = execSync('git reflog -n 20', {encoding: 'utf-8'});
const log = execSync('git log --oneline -n 20', {encoding: 'utf-8'});
fs.writeFileSync('git_history.txt', reflog + '\n\n' + log, 'utf-8');
