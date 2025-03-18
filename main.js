const parser = require('./Parser/calculadora.js');

const result = parser.parse('2 + 2');
console.log("Resultado de la entrada: "+result); // 4
