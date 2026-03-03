const { obfuscate } = require('./dist/index.js');

const code = `
function calc() {
  const msg = "hello";
  return msg.length;
}
`;

const r = obfuscate(code, { deadCodeInjection: false, controlFlowFlattening: false });
console.log(r);
console.log('---');
// Verifica que o código ofuscado executa sem erro
try {
  eval(r);
  console.log('Execução OK (código ofuscado válido)');
} catch (e) {
  console.error('Erro:', e.message);
}
