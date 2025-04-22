const { Contexto } = require("./context");
const { evaluar } = require("./evaluador");
const errores = require("./errores");

// Contexto inicial/global
const contextoGlobal = new Contexto();

// Tabla de símbolos
const tablaSimbolos = contextoGlobal.tablaSimbolos;

//Diccionario de objetos
const diccionarioObjetos = new Map();

// Consola de salida
let consola = "";

function interpretar(instrucciones) {
    tablaSimbolos.clear();
    errores.length = 0;
    consola = "";
  
    try {
      for (const instr of instrucciones) {
        ejecutar(instr, contextoGlobal);
      }
    } catch (err) {
      errores.push({ tipo: "Interno", descripcion: err.message });
    }
  
    return {
      consola,
      errores,
      simbolos: [...tablaSimbolos.entries()].map(([id, val]) => ({
        id,
        tipo: val.tipo,
        valor: val.valor
      }))
    };
  }

  function ejecutar(instr, context) {
    switch (instr.tipo) {
      case "DECLARACION":       
        const valDecl = evaluar(instr.valor, context.tablaSimbolos);
        context.addSimbolo(instr.id, instr.tipoDato, instr.valor);
        break;
  
      case "ASIGNACION":
        if (!tablaSimbolos.has(instr.id)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Variable ${instr.id} no declarada`
          });
          return;
        }
        const valAsignado = evaluar(instr.valor, context.tablaSimbolos);
        tablaSimbolos.get(instr.id).valor = valAsignado;
        break;
  
      case "IMPRIMIR":
        const valImp = evaluar(instr.valor, context.tablaSimbolos);
        consola += valImp + "\n";
        break;

      case "INGRESAR_LISTA":
        if (tablaSimbolos.has(instr.id)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Variable ${instr.id} ya declarada`
          });
          return;
        }
        tablaSimbolos.set(instr.id, { tipo: "LISTA", valor: instr.lista });
        break;
  
      case "ASIGNACION_VALOR_LISTA":
        const lista = tablaSimbolos.get(instr.id).valor;
        if (instr.indice < 0 || instr.indice >= lista.length) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Índice: ${instr.indice} fuera de rango para la lista ${instr.id}`
          });
          return;
        }
        let indice = evaluar(instr.indice);
        lista[indice] = instr.valor;
        tablaSimbolos.set(instr.id, { tipo: "LISTA", valor: lista });
        break;

      case "DEF_OBJETO":
        diccionarioObjetos.set(instr.id, instr.atributos);
        break;

      case "INGRESAR_OBJETO":
        const nombresAtributos = diccionarioObjetos.get(instr.tipoObjeto); 
        const valoresAtributos = instr.atributos;
        console.log(instr.atributos ); 
        valor = {};
        for (let i = 0; i < nombresAtributos.length; i++) {
          const nombre = nombresAtributos[i].id; 
          valor[nombre] = valoresAtributos[i];
        }
        console.log("valores", valor);       
        context.tablaSimbolos.set(instr.id, { tipo: instr.tipoObjeto, valor: valor });

      break;
      default:
        errores.push({
          tipo: "Sintáctico",
          descripcion: `Instrucción desconocida: ${JSON.stringify(instr)}`
        });    
    }
  }

module.exports = interpretar;