# 🦎 Gecko JS

> **O obfuscador JavaScript que se camufla perfeitamente no seu código**

[![npm version](https://img.shields.io/npm/v/@alexwca/gecko-js.svg)](https://www.npmjs.com/package/@alexwca/gecko-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/@alexwca/gecko-js.svg)](https://www.npmjs.com/package/@alexwca/gecko-js)

**Gecko JS** é um obfuscador JavaScript de código aberto projetado para proteger sua lógica de negócio no front-end. Assim como o gecko se camufla na natureza, seu código se torna praticamente invisível para engenharia reversa e cópia não autorizada.

## Por que escolher Gecko JS?

- **100% Gratuito** - Sem planos Pro, sem banners, sem limitações
- **Proteção Multi-Camadas** - Ofusca identificadores, strings, números e fluxo de controle
- **Fácil Integração** - Use programaticamente ou como plugin Webpack
- **Focado em Performance** - Ofuscação eficiente sem quebrar a execução
- **Altamente Configurável** - Ajuste o nível de proteção conforme sua necessidade
- **Zero Dependências Pesadas** - Leve e rápido

## Quick Start

### Instalação

```bash
npm install @alexwca/gecko-js
```

### Uso Básico (Programático)

```javascript
const { obfuscate } = require('@alexwca/gecko-js');

const codigo = `
  function calcularTotal(itens) {
    const taxa = 0.1;
    return itens.reduce((s, i) => s + i.preco, 0) * (1 + taxa);
  }
`;

const ofuscado = obfuscate(codigo, {
  compact: true,
  stringArray: true,
  rotateStringArray: true,
  numbersToExpressions: true,
  deadCodeInjection: true
});

console.log(ofuscado);
// Código completamente ofuscado e protegido!
```

### Uso com Webpack

```javascript
const GeckoObfuscatorPlugin = require('@alexwca/gecko-js/webpack');

module.exports = {
  plugins: [
    new GeckoObfuscatorPlugin(
      {
        compact: true,
        identifierNamesGenerator: 'hexadecimal',
        stringArray: true,
        rotateStringArray: true,
        numbersToExpressions: true,
        deadCodeInjection: true,
        controlFlowFlattening: false
      },
      ['runtime.*.js', 'polyfills.*.js', 'main.*.js'] // chunks específicos
    )
  ]
};
```

> **Dica**: Se o segundo argumento for omitido ou `[]`, todos os arquivos `.js` emitidos serão ofuscados automaticamente.

## Recursos de Proteção

Gecko JS oferece múltiplas camadas de ofuscação para tornar seu código extremamente difícil de analisar:

### Ofuscação de Identificadores
- Renomeia variáveis, funções e parâmetros com nomes hexadecimal ou mangled
- Torna o código ilegível mantendo a funcionalidade

### Ofuscação de Strings
- Armazena strings em arrays embaralhados
- Decodifica em runtime usando XOR
- Rotaciona a ordem do array para maior segurança

### Ofuscação de Números
- Converte números em expressões hexadecimais ou cálculos complexos
- Dificulta a identificação de valores críticos

### Injeção de Código Morto
- Injeta blocos `if(false){ ... }` para confundir analisadores
- Configurável a quantidade de blocos injetados

### Control Flow Flattening
- Achata o fluxo de controle usando switch/estado
- Proteção extra (pode aumentar o tamanho do bundle)

## Opções de Configuração

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `compact` | `boolean` | `true` | Saída minificada em uma linha |
| `identifierNamesGenerator` | `string` | `'hexadecimal'` | `'hexadecimal'` ou `'mangled'` para nomes de variáveis/funções |
| `stringArray` | `boolean` | `true` | Coloca strings em um array e decodifica em runtime (XOR) |
| `rotateStringArray` | `boolean` | `true` | Embaralha a ordem do array de strings |
| `numbersToExpressions` | `boolean` | `true` | Ofusca números (hex ou expressões). Apenas 30% dos números são ofuscados para manter performance |
| `deadCodeInjection` | `boolean` | `true` | Injeta blocos `if(false){ ... }` para confundir análise |
| `deadCodeCount` | `number` | `2` | Quantidade de blocos mortos injetados |
| `controlFlowFlattening` | `boolean` | `false` | Achata o fluxo com switch/estado (proteção forte, aumenta tamanho) |
| `minStringLength` | `number` | `3` | Tamanho mínimo de string para ofuscar (strings menores são ignoradas para performance) |

## Exemplos de Uso

### Exemplo 1: Proteção Básica

```javascript
const { obfuscate } = require('@alexwca/gecko-js');

const codigo = `
  const API_KEY = 'sk-1234567890';
  function authenticate(key) {
    return key === API_KEY;
  }
`;

const protegido = obfuscate(codigo, {
  compact: true,
  stringArray: true,
  numbersToExpressions: true
});
```

### Exemplo 2: Proteção Máxima

```javascript
const { obfuscate } = require('@alexwca/gecko-js');

const codigo = `
  // Sua lógica de negócio crítica aqui
`;

const ultraProtegido = obfuscate(codigo, {
  compact: true,
  identifierNamesGenerator: 'hexadecimal',
  stringArray: true,
  rotateStringArray: true,
  numbersToExpressions: true,
  deadCodeInjection: true,
  deadCodeCount: 5,
  controlFlowFlattening: true // Aviso: Aumenta o tamanho do bundle
});
```

### Exemplo 3: Webpack com Filtros

```javascript
const GeckoObfuscatorPlugin = require('@alexwca/gecko-js/webpack');

module.exports = {
  plugins: [
    new GeckoObfuscatorPlugin(
      { /* opções */ },
      [
        'main.*.js',      // Apenas o bundle principal
        'vendor.*.js',    // E o vendor
        '!*.min.js'       // Mas não os já minificados
      ]
    )
  ]
};
```

## Desenvolvimento

### Build do Projeto

```bash
git clone https://github.com/alexwca/gecko-js.git
cd gecko-js
npm install
npm run build
```

### Testar Localmente

Para testar:

```bash
# No diretório gecko-js
npm link

# No seu projeto
npm link @alexwca/gecko-js
```

Ou instale diretamente do caminho:

```bash
npm install /caminho/absoluto/para/gecko-js
```

## Limitações e Considerações

### Realidade sobre Proteção de Código Front-end

- **Código no navegador nunca é 100% indetectável**: Qualquer pessoa com acesso ao bundle pode inspecioná-lo. O objetivo do Gecko JS é tornar a análise **extremamente difícil e demorada**, não impossível.

### Performance

Gecko JS foi projetado para manter segurança sem impactar significativamente a performance:

- **Overhead de runtime**: ~3-8% com configurações padrão
- **Tamanho do bundle**: +10-20% com configurações padrão
- **String decoder**: Utiliza array join para decodificação eficiente
- **Numbers to expressions**: Apenas 30% dos números são ofuscados para manter performance
- **Dead code**: 2 blocos injetados por padrão
- **Strings curtas**: Strings menores que 3 caracteres não são ofuscadas (configurável via `minStringLength`)
- **Control flow flattening**: Desativado por padrão. Use apenas em trechos críticos que precisam de proteção extra (pode aumentar o bundle em 50-200% e reduzir performance em 20-40%)

### Compatibilidade

- Propriedades obrigatórias de APIs (ex.: nomes de métodos chamados por bibliotecas externas) não são renomeadas automaticamente.
- O obfuscator foca em identificadores (variáveis, parâmetros, funções) e em strings/números.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir novas features
- Melhorar a documentação
- Enviar pull requests

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Agradecimentos

Gecko JS foi criado para a comunidade de desenvolvedores que precisam proteger seu código sem depender de serviços pagos ou planos Pro. Esperamos que seja útil para você!

---

<div align="center">

**Feito com Gecko por desenvolvedores, para desenvolvedores**

[Dê uma estrela](https://github.com/alexwca/gecko-js) | [npm](https://www.npmjs.com/package/@alexwca/gecko-js) | [Issues](https://github.com/alexwca/gecko-js/issues)

</div>
