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
        const valDecl = evaluar(instr.valor, context);
        context.addSimbolo(instr.id, instr.tipoDato, valDecl);
        break;
  
      case "ASIGNACION":       
        const valAsignado = evaluar(instr.valor, context);
        context.updateSimbolo(instr.id, valAsignado);
        break;
  
      case "IMPRIMIR":
        const valImp = evaluar(instr.valor, context);
        consola += valImp + "\n";
        break;

      case "INGRESAR_LISTA":
        // if (context.tablaSimbolos.has(instr.id)) {
        //   errores.push({
        //     tipo: "Semántico",
        //     descripcion: `Variable ${instr.id} ya declarada`
        //   });
        //   return;
        // }
        context.tablaSimbolos.set(instr.id, { tipo: "LISTA", valor: instr.lista });
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
        context.tablaSimbolos.set(instr.id, { tipo: "LISTA", valor: lista });
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
      case 'CICLO_MIENTRAS':
        const contextoCiclo = new Contexto(context);
        let condicion = evaluar(instr.condicion, contextoCiclo);
        //console.log("Condicion", condicion); 
        while (condicion == "verdadero" || condicion == true) {
          for (const instrCiclo of instr.sentencias) {
            ejecutar(instrCiclo, contextoCiclo);
          }
          condicion = evaluar(instr.condicion, contextoCiclo); 
          //console.log("Condicion", condicion);
        }
      break;
      case 'SI':
        const contextoSi = new Contexto(context);
        let condicionSi = evaluar(instr.condicion, contextoSi);
        if( condicionSi == "verdadero" || condicionSi == true) {
          for (const instrCiclo of instr.sentencias) {
            ejecutar(instrCiclo, contextoSi);
          }
        }
      break;
        /** Agregar De lo contrario y o si */
      case 'DEFINIR_PROCEDIMIENTO':
        if(contextoGlobal.tablaSimbolos.has(instr.id)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Procedimiento ${instr.id} ya declarado`
          });
          return;
        }
        contextoGlobal.tablaSimbolos.set(instr.id, { tipo: "PROCEDIMIENTO", valor: instr.sentencias, parametros: instr.parametros });
      break;

      case 'LLAMAR_FUNCION':
      case 'LLAMAR_PROCEDIMIENTO':
        const procedimiento = context.getSimbolo(instr.id);
        const contextoProcedimiento = new Contexto(contextoGlobal);
        //console.log("Procedimiento", procedimiento);
        if(!procedimiento) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Procedimiento ${instr.id} no declarado`
          });
          return;
        }
        if(procedimiento.parametros){
          for (let i = 0; i < procedimiento.parametros.length; i++) {
            const parametro = procedimiento.parametros[i];
            //console.log(instr);
            const valorParam = evaluar(instr.parametros[i], context);
            contextoProcedimiento.addSimbolo(parametro.id, parametro.tipo , valorParam);
          }
        }
        for(const instraProc of procedimiento.valor) {
          ejecutar(instraProc, contextoProcedimiento);
        }
      break;
      case 'DEFINIR_FUNCION':
        if(contextoGlobal.tablaSimbolos.has(instr.id)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Función ${instr.id} ya declarada`
          });
          return;
        }
        contextoGlobal.tablaSimbolos.set(instr.id, { tipo: "FUNCION", tipoRetorno: instr.tipoRetorno, sentencias: instr.sentencias, parametros: instr.parametros });
      break;

      case 'RETORNAR':
        console.log("Retorno todavía no listo", instr.valor);
      break;

      default:
        errores.push({
          tipo: "Sintáctico",
          descripcion: `Instrucción desconocida: ${JSON.stringify(instr)}`
        });    
    }
  }

module.exports = interpretar;