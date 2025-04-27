const { errores } = require("./errores");
//const { evaluar } = require("./evaluador");

class Contexto {
  constructor(anterior) {
    this.tablaSimbolos = new Map();
    this.anterior = anterior;
  }
  
  addSimbolo(id, tipo, valor) {
    if (this.tablaSimbolos.has(id)) {
        errores.push({
          tipo: "Semántico",
          descripcion: `Variable ${id} ya declarada`
        });
        return;
    }
    //const valDecl = evaluar(valor, this.tablaSimbolos);
    this.tablaSimbolos.set(id, { tipo: tipo, valor: valor });
  }

  getSimbolo(id) {
    let contextoTemportal = this;
    while (contextoTemportal != null) {
      if (contextoTemportal.tablaSimbolos.has(id)) {        
        return contextoTemportal.tablaSimbolos.get(id);
      }
      contextoTemportal = contextoTemportal.anterior;
    }
    console.log("No se encontró la variable en el contexto actual");
    errores.push({
      tipo: "Semántico",
      descripcion: `Variable ${id} no declarada`
    });
  }

  updateSimbolo(id, valor) {
    let contextoTemportal = this;
    while (contextoTemportal != null) {
      if (contextoTemportal.tablaSimbolos.has(id)) {        
        contextoTemportal.tablaSimbolos.get(id).valor = valor;
        return;
      }
      contextoTemportal = contextoTemportal.anterior;
    }
    console.log("No se encontró la variable en el contexto actual");
    errores.push({
      tipo: "Semántico",
      descripcion: `Variable ${id} no declarada`
    });
    return;
  }
}  

module.exports = { Contexto };