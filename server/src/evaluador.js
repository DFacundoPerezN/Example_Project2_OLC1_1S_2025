const errores = require('./errores');

function evaluar(expr, contexto) {
   const tablaSimbolos = contexto.tablaSimbolos;
    switch (expr.tipo) {
      case "NUMERO":
        return expr.valor;
  
      case "CADENA":
        return expr.valor;
      
      case "BOOLEANO":
        return expr.valor == "verdadero" ? "verdadero" : "falso";

      case "ID":
        //console.log(expr.nombre, contexto);
        const simbolo = contexto.getSimbolo(expr.nombre);
        return simbolo.valor;
  
      case "SUMA":
        if (expr.izquierda.tipo === "CADENA" || expr.derecha.tipo === "CADENA") {
          return `${evaluar(expr.izquierda, contexto)}${evaluar(expr.derecha, contexto)}`;
        }
        if (expr.izquierda.tipo === "BOOLEANO" || expr.derecha.tipo === "BOOLEANO") {
          return evaluar(expr.izquierda, contexto) + evaluar(expr.derecha, contexto);
        }
        return evaluar(expr.izquierda, contexto) + evaluar(expr.derecha, contexto);
      case "RESTA":
        if (expr.izquierda.tipo === "BOOLEANO" || expr.derecha.tipo === "BOOLEANO") {
          return evaluar(expr.izquierda, contexto) - evaluar(expr.derecha, contexto);
        }
        return evaluar(expr.izquierda, contexto) - evaluar(expr.derecha, contexto);
        
      case "MULT":
        return evaluar(expr.izquierda, contexto) * evaluar(expr.derecha, contexto);
      case "DIV":
        return evaluar(expr.izquierda, contexto) / evaluar(expr.derecha, contexto);

      case "MODULO":
        return evaluar(expr.izquierda, contexto) % evaluar(expr.derecha, contexto);

      case "MENOR":
        return evaluar(expr.izquierda, contexto) < evaluar(expr.derecha, contexto);
        
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
        indice = evaluar(expr.indice, contexto);
        return evaluar(lista[indice], contexto);

      case "VALOR_OBJETO":
        const objeto = tablaSimbolos.get(expr.id).valor;
        return evaluar(objeto[expr.atributo], contexto);

      case "LISTA":
        if(expr.elementos.length !== 1){
          errores.push({
            tipo: "Semántico",
            descripcion: `Intentando operar una lista con más de un elemento`
          });
        }
        return evaluar(expr.elementos[0], contexto);
        
      default:
        errores.push({
          tipo: "Interno", 
          descripcion: `Expresión desconocida: ${JSON.stringify(expr)}`
        });
        return null;
    }
  }

module.exports = { evaluar };