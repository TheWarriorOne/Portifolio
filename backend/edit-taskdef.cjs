const fs = require('fs');
const NEW_IMAGE = process.env.NEW_IMAGE || process.argv[2];
if (!NEW_IMAGE) {
  console.error('Erro: defina a nova imagem em NEW_IMAGE ou passe como argumento');
  process.exit(2);
}
const fn = 'taskdef.json';
const out = 'new-taskdef.json';
let j;
try {
  j = JSON.parse(fs.readFileSync(fn,'utf8'));
} catch (e) {
  console.error('Erro lendo taskdef.json:', e.message);
  process.exit(2);
}
const td = j.taskDefinition || j;
const cdefs = td.containerDefinitions || [];
if (!cdefs.length) {
  console.error('taskdef não tem containerDefinitions');
  process.exit(2);
}
let found = false;
let old;
for (const c of cdefs) {
  if (c.name === 'ecogram-backend') {
    old = c.image;
    c.image = NEW_IMAGE;
    found = true;
    break;
  }
}
if (!found) {
  console.warn("Aviso: container 'ecogram-backend' não encontrado. Disponíveis:", cdefs.map(x=>x.name));
  // fallback: altera o primeiro container
  old = cdefs[0].image;
  cdefs[0].image = NEW_IMAGE;
}
const payload = {
  family: td.family,
  containerDefinitions: cdefs
};
for (const k of ['taskRoleArn','executionRoleArn','networkMode','volumes','placementConstraints','requiresCompatibilities','cpu','memory','proxyConfiguration','inferenceAccelerators','ephemeralStorage']) {
  if (td[k] !== undefined) payload[k] = td[k];
}
fs.writeFileSync(out, JSON.stringify(payload, null, 2), 'utf8');
console.log('Escrito', out);
console.log('Substituição de imagem:', old || '<none>', '=>', NEW_IMAGE);
