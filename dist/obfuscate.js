'use strict';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const { RESERVED, createNameGenerator, randomByte } = require('./utils');

/**
 * Ofusca código JavaScript com múltiplas camadas de proteção.
 * Otimizado para manter segurança sem impactar significativamente a performance.
 *
 * @param {string} source - Código JS original
 * @param {object} options
 * @param {boolean} [options.compact=true]
 * @param {string} [options.identifierNamesGenerator='hexadecimal']
 * @param {boolean} [options.stringArray=true] - Codificar strings em array + decoder
 * @param {boolean} [options.rotateStringArray=true] - Embaralhar ordem do array
 * @param {boolean} [options.numbersToExpressions=true] - Ofuscar números
 * @param {boolean} [options.controlFlowFlattening=false] - Achatar fluxo (switch)
 * @param {boolean} [options.deadCodeInjection=true] - Injetar ramos mortos
 * @param {number} [options.deadCodeCount=2] - Quantidade de blocos mortos (reduzido para performance)
 * @param {number} [options.minStringLength=3] - Tamanho mínimo de string para ofuscar (otimização)
 */
function obfuscate(source, options = {}) {
  const {
    compact = true,
    identifierNamesGenerator = 'hexadecimal',
    stringArray = true,
    rotateStringArray = true,
    numbersToExpressions = true,
    controlFlowFlattening = false,
    deadCodeInjection = true,
    deadCodeCount = 2, // Reduzido de 3 para 2 (melhor performance)
    minStringLength = 3 // Nova opção: não ofusca strings muito curtas
  } = options;

  const genName = createNameGenerator(identifierNamesGenerator);
  const bindingToName = new Map();

  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  // ---- 1) Renomear identificadores (variáveis, parâmetros, funções) ----
  traverse(ast, {
    Identifier(path) {
      const name = path.node.name;
      if (RESERVED.has(name)) return;
      if (path.parentPath.isMemberExpression() && path.parentPath.node.property === path.node && !path.parentPath.node.computed) return;
      if (path.parentPath.isObjectProperty() && !path.parentPath.node.computed && path.parentPath.node.key === path.node) return;
      const binding = path.scope.getBinding(name);
      if (!binding) return;
      if (binding.kind === 'module') return;
      let newName = bindingToName.get(binding.identifier);
      if (!newName) {
        newName = genName();
        bindingToName.set(binding.identifier, newName);
      }
      path.node.name = newName;
    }
  });

  // ---- 2) String array: coletar strings, criar array + decoder otimizado ----
  if (stringArray) {
    const stringNodes = [];
    const nodeToIndex = new Map();
    const stringFrequency = new Map(); // Rastrear frequência para otimização
    
    // Primeira passagem: coletar strings e contar frequência
    traverse(ast, {
      StringLiteral(path) {
        if (path.findParent(p => t.isImportDeclaration(p.node) || t.isExportDeclaration(p.node))) return;
        if (path.parentPath.isObjectProperty() && path.parentPath.node.key === path.node) return;
        const value = path.node.value;
        // Otimização: não ofusca strings muito curtas (overhead não vale a pena)
        if (value.length < minStringLength) return;
        if (!nodeToIndex.has(path.node)) {
          const idx = stringNodes.length;
          nodeToIndex.set(path.node, idx);
          stringNodes.push(value);
          stringFrequency.set(value, (stringFrequency.get(value) || 0) + 1);
        } else {
          stringFrequency.set(value, (stringFrequency.get(value) || 0) + 1);
        }
      }
    });

    if (stringNodes.length > 0) {
      const key = randomByte();
      // Otimização: pré-calcular encoding uma vez
      const encoded = stringNodes.map(s => {
        const chars = new Array(s.length);
        for (let i = 0; i < s.length; i++) {
          chars[i] = String.fromCharCode(s.charCodeAt(i) ^ key);
        }
        return chars.join('');
      });
      
      if (rotateStringArray && encoded.length > 1) {
        // Fisher-Yates shuffle otimizado
        for (let i = encoded.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [encoded[i], encoded[j]] = [encoded[j], encoded[i]];
        }
      }
      
      const arrName = genName();
      const decName = genName();
      const indexMap = new Map();
      encoded.forEach((_, i) => indexMap.set(stringNodes[i], i));

      traverse(ast, {
        StringLiteral(path) {
          if (path.findParent(p => t.isImportDeclaration(p.node) || t.isExportDeclaration(p.node))) return;
          const value = path.node.value;
          if (value.length < minStringLength) return;
          const idx = indexMap.get(value);
          if (idx === undefined) return;
          path.replaceWith(t.callExpression(t.identifier(decName), [t.numericLiteral(idx)]));
        }
      });

      // Decoder otimizado: usa operações mais eficientes
      // Em vez de loop com concatenação, usa array join (mais rápido)
      const decoderBody = [
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('_s'), t.memberExpression(t.identifier(arrName), t.identifier('_i'), true)),
          t.variableDeclarator(t.identifier('_k'), t.numericLiteral(key)),
          t.variableDeclarator(t.identifier('_r'), t.arrayExpression([]))
        ]),
        t.forStatement(
          t.variableDeclaration('var', [t.variableDeclarator(t.identifier('_j'), t.numericLiteral(0))]),
          t.binaryExpression('<', t.identifier('_j'), t.memberExpression(t.identifier('_s'), t.identifier('length'))),
          t.updateExpression('++', t.identifier('_j'), false),
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(t.identifier('_r'), t.identifier('push')),
                [t.callExpression(
                  t.memberExpression(t.identifier('String'), t.identifier('fromCharCode')),
                  [t.binaryExpression(
                    '^',
                    t.callExpression(t.memberExpression(t.identifier('_s'), t.identifier('charCodeAt')), [t.identifier('_j')]),
                    t.identifier('_k')
                  )]
                )]
              )
            )
          ])
        ),
        t.returnStatement(t.callExpression(t.memberExpression(t.identifier('_r'), t.identifier('join')), [t.stringLiteral('')]))
      ];
      
      const decoderFn = t.functionDeclaration(
        t.identifier(decName),
        [t.identifier('_i')],
        t.blockStatement(decoderBody)
      );

      const arrDecl = t.variableDeclaration('var', [
        t.variableDeclarator(
          t.identifier(arrName),
          t.arrayExpression(encoded.map(s => t.stringLiteral(s)))
        )
      ]);

      const program = ast.program;
      program.body.unshift(arrDecl, decoderFn);
    }
  }

  // ---- 3) Números em expressões (otimizado: mais seletivo) ----
  if (numbersToExpressions) {
    traverse(ast, {
      NumericLiteral(path) {
        const value = path.node.value;
        // Otimização: não ofusca números muito pequenos ou muito comuns (0, 1, 2)
        // Eles aparecem muito frequentemente e o overhead não vale
        if (value === 0 || value === 1 || value === 2) return;
        
        // Otimização: não ofusca números muito grandes (overhead de parsing)
        if (!Number.isInteger(value) || value < 3 || value > 0xfff) return;
        
        // Otimização: apenas 30% dos números são ofuscados (reduz overhead)
        if (Math.random() > 0.3) return;
        
        // Preferir hexadecimal (mais rápido que multiplicação)
        if (value <= 0xff) {
          path.replaceWith(t.numericLiteral(value));
          path.node.extra = { raw: '0x' + value.toString(16) };
        } else if (value % 2 === 0 && value >= 4) {
          // Apenas para números pares maiores
          const a = value / 2;
          path.replaceWith(t.binaryExpression('*', t.numericLiteral(a), t.numericLiteral(2)));
        }
      }
    });
  }

  // ---- 4) Dead code injection: otimizado (menos código, mais leve) ----
  if (deadCodeInjection && deadCodeCount > 0) {
    const deadCodeBlock = () => {
      // Código mais leve: apenas uma variável sem operações desnecessárias
      const varName = genName();
      return t.ifStatement(
        t.booleanLiteral(false),
        t.blockStatement([
          t.variableDeclaration('var', [
            t.variableDeclarator(t.identifier(varName), t.numericLiteral(0))
          ])
        ])
      );
    };
    let injected = 0;
    traverse(ast, {
      BlockStatement(path) {
        if (injected >= deadCodeCount) return;
        // Otimização: apenas injetar em blocos maiores (evita overhead em funções pequenas)
        if (path.node.body.length < 3) return;
        const idx = Math.floor(Math.random() * (path.node.body.length - 1)) + 1;
        path.node.body.splice(idx, 0, deadCodeBlock());
        injected++;
      }
    });
  }

  // ---- 5) Control flow flattening (desativado por padrão - alto impacto) ----
  if (controlFlowFlattening) {
    traverse(ast, {
      Function(path) {
        // Otimização: apenas aplicar em funções maiores (evita overhead desnecessário)
        if (path.node.body.body.length < 5) return;
        const body = path.node.body.body;
        const stateVar = genName();
        const cases = body.map((stmt, i) => {
          const next = i < body.length - 1 ? i + 1 : -1;
          const statements = [
            stmt,
            t.expressionStatement(t.assignmentExpression('=', t.identifier(stateVar), t.numericLiteral(next))),
            t.breakStatement()
          ];
          return t.switchCase(t.numericLiteral(i), statements);
        });
        cases.push(t.switchCase(t.numericLiteral(-1), [t.returnStatement()]));
        const newBody = [
          t.variableDeclaration('var', [t.variableDeclarator(t.identifier(stateVar), t.numericLiteral(0))]),
          t.whileStatement(
            t.booleanLiteral(true),
            t.blockStatement([
              t.switchStatement(t.identifier(stateVar), cases)
            ])
          )
        ];
        path.get('body').replaceWith(t.blockStatement(newBody));
      }
    });
  }

  const output = generate(ast, {
    compact,
    comments: false,
    retainLines: false,
    minified: compact
  });

  return output.code;
}

module.exports = { obfuscate };
