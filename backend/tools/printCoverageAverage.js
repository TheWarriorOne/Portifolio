// tools/printCoverageAverage.cjs
const fs = require('fs');
const path = require('path');

const summaryPath = path.resolve(process.cwd(), 'coverage', 'coverage-summary.json');

function exitWarn(msg) {
  console.log('⚠️', msg);
  process.exit(0);
}

if (!fs.existsSync(summaryPath)) {
  exitWarn('coverage-summary.json não encontrado. Rode jest com --coverage primeiro.');
}

let raw;
try {
  raw = fs.readFileSync(summaryPath, 'utf8');
} catch (err) {
  exitWarn('Erro ao ler coverage-summary.json: ' + (err.message || err));
}

let summary;
try {
  summary = JSON.parse(raw);
} catch (err) {
  exitWarn('coverage-summary.json inválido: ' + (err.message || err));
}

const total = summary.total || summary;

const stmts = (total.statements && total.statements.pct) || 0;
const branches = (total.branches && total.branches.pct) || 0;
const funcs = (total.functions && total.functions.pct) || 0;
const lines = (total.lines && total.lines.pct) || 0;

function fmt(n) {
  return (Math.round(n * 100) / 100).toFixed(2) + '%';
}

const avg = (stmts + branches + funcs + lines) / 4;
const avgStr = fmt(avg);

console.log('');
console.log('---------------------------- Coverage averages ----------------------------');
console.log(`Statements: ${fmt(stmts)}  |  Branches: ${fmt(branches)}  |  Functions: ${fmt(funcs)}  |  Lines: ${fmt(lines)}`);
console.log(`Average of the four metrics: ${avgStr}`);
console.log('--------------------------------------------------------------------------');
console.log('');
