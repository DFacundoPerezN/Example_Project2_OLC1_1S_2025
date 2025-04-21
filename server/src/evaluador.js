const errores = require('./errores');

function evaluar(expr, tablaSimbolos) {
    switch (expr.tipo) {
      case "NUMERO":
        return expr.valor;
  
      case "CADENA":
        return expr.valor;
      
      case "BOOLEANO":
        return expr.valor == "verdadero" ? "verdadero" : "falso";

      case "ID":
        //console.log(expr.nombre, tablaSimbolos);
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
          return `${evaluar(expr.izquierda, tablaSimbolos)}${evaluar(expr.derecha, tablaSimbolos)}`;
        }
        if (expr.izquierda.tipo === "BOOLEANO" || expr.derecha.tipo === "BOOLEANO") {
          return evaluar(expr.izquierda, tablaSimbolos) + evaluar(expr.derecha, tablaSimbolos);
        }
        return evaluar(expr.izquierda, tablaSimbolos) + evaluar(expr.derecha, tablaSimbolos);
      case "RESTA":
        if (expr.izquierda.tipo === "BOOLEANO" || expr.derecha.tipo === "BOOLEANO") {
          return evaluar(expr.izquierda, tablaSimbolos) - evaluar(expr.derecha, tablaSimbolos);
        }
        return evaluar(expr.izquierda, tablaSimbolos) - evaluar(expr.derecha, tablaSimbolos);
        
      case "MULT":
        return evaluar(expr.izquierda, tablaSimbolos) * evaluar(expr.derecha, tablaSimbolos);
      case "DIV":
        return evaluar(expr.izquierda, tablaSimbolos) / evaluar(expr.derecha, tablaSimbolos);

      case "MODULO":
        return evaluar(expr.izquierda, tablaSimbolos) % evaluar(expr.derecha, tablaSimbolos);

      case "MENOR":
        return evaluar(expr.izquierda, tablaSimbolos) < evaluar(expr.derecha, tablaSimbolos);
        
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
        return evaluar(lista[expr.indice.valor], tablaSimbolos);

      default:
        errores.push({
          tipo: "Interno", 
          descripcion: `Expresión desconocida: ${JSON.stringify(expr)}`
        });
        return null;
    }
  }

module.exports = { evaluar };