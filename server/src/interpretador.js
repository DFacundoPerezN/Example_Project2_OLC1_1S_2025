// Tabla de símbolos
const tablaSimbolos = new Map();

// Lista de errores
const errores = [];

// Consola de salida
let consola = "";

function interpretar(instrucciones) {
    tablaSimbolos.clear();
    errores.length = 0;
    consola = "";
  
    try {
      for (const instr of instrucciones) {
        ejecutar(instr);
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

  function ejecutar(instr) {
    switch (instr.tipo) {
      case "DECLARACION":
        if (tablaSimbolos.has(instr.id)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Variable ${instr.id} ya declarada`
          });
          return;
        }
        const valDecl = evaluar(instr.valor);
        tablaSimbolos.set(instr.id, { tipo: instr.tipoDato, valor: valDecl });
        break;
  
      case "ASIGNACION":
        if (!tablaSimbolos.has(instr.id)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Variable ${instr.id} no declarada`
          });
          return;
        }
        const valAsignado = evaluar(instr.valor);
        tablaSimbolos.get(instr.id).valor = valAsignado;
        break;
  
      case "IMPRIMIR":
        const valImp = evaluar(instr.valor);
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

      default:
        errores.push({
          tipo: "Sintáctico",
          descripcion: `Instrucción desconocida: ${JSON.stringify(instr)}`
        });    
    }
  }
  function evaluar(expr) {
    switch (expr.tipo) {
      case "NUMERO":
        return expr.valor;
  
      case "CADENA":
        return expr.valor;
      
      case "BOOLEANO":
        return expr.valor === "verdadero" ;

      case "ID":
        if (!tablaSimbolos.has(expr.nombre)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Variable ${expr.nombre} no declarada`
          });
          return null;
        }
        return tablaSimbolos.get(expr.nombre).valor;
  
      case "SUMA":
        if (expr.izquierda.tipo === "CADENA" || expr.derecha.tipo === "CADENA") {
          return `${evaluar(expr.izquierda)}${evaluar(expr.derecha)}`;
        }
        if (expr.izquierda.tipo === "BOOLEANO" || expr.derecha.tipo === "BOOLEANO") {
          return evaluar(expr.izquierda) + evaluar(expr.derecha);
        }
        return evaluar(expr.izquierda) + evaluar(expr.derecha);
      case "RESTA":
        if (expr.izquierda.tipo === "BOOLEANO" || expr.derecha.tipo === "BOOLEANO") {
          return evaluar(expr.izquierda) - evaluar(expr.derecha);
        }
        return evaluar(expr.izquierda) - evaluar(expr.derecha);
        
      case "MULT":
        return evaluar(expr.izquierda) * evaluar(expr.derecha);
      case "DIV":
        return evaluar(expr.izquierda) / evaluar(expr.derecha);
        
      case "VALOR_LISTA":
        if (!tablaSimbolos.has(expr.id)) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Lista ${expr.id} no declarada`
          });
          return null;
        }
        const lista = tablaSimbolos.get(expr.id).valor;
        console.log(lista, expr.indice);
        if (expr.indice < 0 || expr.indice >= lista.length) {
          errores.push({
            tipo: "Semántico",
            descripcion: `Índice: ${expr.indice} fuera de rango para la lista ${expr.id}`
          });
          return null;
        }
        return evaluar(lista[expr.indice.valor]);
      default:
        errores.push({
          tipo: "Interno",
          descripcion: `Expresión desconocida: ${JSON.stringify(expr)}`
        });
        return null;
    }
  }
module.exports = interpretar;