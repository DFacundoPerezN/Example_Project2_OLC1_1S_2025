%lex
%%
[ \t\r]+                      /* skip horizontal whitespace */
//PALABRAS RESERVADAS
"ingresar"                    return 'INGRESAR';
"como"                        return 'COMO';
"con"                         return 'CON';
"con valor"                   return 'CONVALOR';
"entero"                      return 'TIPO_ENTERO';
"Entero"                      return 'TIPO_ENTERO';
"cadena"                      return 'TIPO_CADENA';
"Cadena"                    return 'TIPO_CADENA';
"booleano"                    return 'TIPO_BOOLEANO';
"Booleano"                    return 'TIPO_BOOLEANO';
"->"                          return 'ASIGNAR';
"="                          return 'IGUAL';
"imprimir"                    return 'IMPRIMIR';
"mientras"                  return 'MIENTRAS';
"hacer"                      return 'HACER';
"fin"                         return 'FIN';
"si"                          return 'SI';
[0-9]+                        return 'NUMERO';
"8"                          return 'NUMERO';
"verdadero"                   return 'VERDADERO';
"falso"                      return 'FALSO';
"Lista"                     return 'LISTA';
"inc"                        return 'INC'; 
"funcion"                    return 'FUNCION';
"objeto"                    return 'OBJETO';
"metodo"                    return 'METODO';
"procedimiento"              return 'PROCEDIMIENTO';
"parametros"                return 'PARAMETROS';
"retornar"                 return 'RETORNAR';   
"ejecutar"                  return 'EJECUTAR';
\"[^"]*\"                     return 'CADENA';
//IDENTIFICADORES
[a-zA-Z_][a-zA-Z0-9_]*        return 'ID';
"+"                           return '+';
"-"                           return '-';
"*"                           return '*';
"/"                           return '/';
"%"                           return '%';
"<"                           return '<';
"("                           return '(';
")"                           return ')';
"["                           return '[';
"]"                           return ']';
","                           return ',';
"."                           return '.';
";"                           return ';';
\n                            return 'NEWLINE';
<<EOF>>                       return 'EOF';
. {
    console.error(`Carácter no reconocido: '${yytext}'`);
    return 'INVALIDO';
}
/lex

/* Operator precedence - lowest to highest */
%left '+' '-'
%left '*' '/'
%left '%'
%left '<'


%start programa
%token INGRESAR COMO CONVALOR TIPO_ENTERO TIPO_CADENA IMPRIMIR ID NUMERO CADENA NEWLINE
%token ASIGNAR VERDADERO FALSO

%%

programa
    : sentencias EOF
        { return $1; }
    ;

sentencias
    : sentencias sentencia
        { 
          if ($2 !== null) {
            $$ = $1.concat([$2]); 
          } else {
            $$ = $1;
          }
        }
    | /* empty */
        { $$ = []; }
    ;

sentencia
    : instruccion separador
        { $$ = $1; }
    | separador
        { $$ = null; }
    ;

separador
    : NEWLINE
    | ';'
    ;

instruccion
    : INGRESAR ID COMO TIPO_ENTERO CONVALOR expresion
        { $$ = { tipo: 'DECLARACION', id: $2, tipoDato: 'entero', valor: $6 }; }
    | INGRESAR ID COMO TIPO_CADENA CONVALOR CADENA
        { $$ = { tipo: 'DECLARACION', id: $2, tipoDato: 'cadena', valor: { tipo: 'CADENA', valor: $6.slice(1, -1) } }; }
    | ID ASIGNAR expresion
        { $$ = { tipo: 'ASIGNACION', id: $1, valor: $3 }; }
    | IMPRIMIR expresion
        { $$ = { tipo: 'IMPRIMIR', valor: $2 }; }
    | ingresar_lista
        { $$ = $1; }
    | valor_lista IGUAL expresion
        { console.log("asignar valor lista", $1, $3);
            $$ = { tipo: 'ASIGNACION_VALOR_LISTA', id: $1.id, indice: $1.indice, valor: $3 }; }
    | def_objeto
        {  $$ = $1; }
    | ing_objeto
        { $$ = $1; }
    | flujos
        { $$ = $1; }
    | cambio
        { $$ = $1; }
    | funcion
        { $$ = $1; }
    | procedimiento
        { $$ = $1; }
    | 'EJECUTAR' 'ID' '('  ')'
        { $$ = { tipo: 'LLAMAR_PROCEDIMIENTO', id: $2 }; }
    | 'EJECUTAR' 'ID' '(' lista ')'
        { $$ = { tipo: 'LLAMAR_PROCEDIMIENTO', id: $2, parametros: $4.elementos }; }
    | 'RETORNAR' expresion
        { $$ = { tipo: 'RETORNAR', valor: $2 }; }
    ;

def_objeto
    : 'OBJETO' 'ID' '(' separador lista_atributos ')'
        { console.log("def objeto", $2, $4);
            $$ = { tipo: 'DEF_OBJETO', id: $2, atributos: $5 }; }
    ;

lista_atributos :
    'ID' tipo separador lista_atributos
        { $$ = [{ id: $1, tipo: $2 }].concat($4); }
    | 'ID' tipo separador
        { $$ = [{ id: $1, tipo: $2 }]; }
    ;
    
ing_objeto
    : 'INGRESAR' 'OBJETO' 'ID' 'ID' 'ASIGNAR' 'ID' '(' separador lista_ingresar ')'
        { console.log("ingresar objeto", $3, $4, $9);
            $$ = { tipo: 'INGRESAR_OBJETO', tipoObjeto: $3, id: $4, atributos: $9 }; }
        
    ;
lista_ingresar
    : expresion ',' separador lista_ingresar
        { $$ = [$1].concat($4) ; } // (1 ,2,3 )
    | expresion separador
        { $$ = [$1]; } // (2)
    ;

flujos
    : 'MIENTRAS' expresion 'HACER' sentencias 'FIN' 'MIENTRAS'
        { console.log("mientras", $2, $4);
            $$ = { tipo: 'CICLO_MIENTRAS', condicion: $2, sentencias: $4 }; }
    | si
        { $$ = $1; }
    ;

si 
    : 'SI' expresion 'HACER' sentencias 'FIN' 'SI'
        { console.log("si ", $2, $4);
            $$ = { tipo: 'SI', condicion: $2, sentencias: $4 }; }
;

cambio
    : incremento 
    { $$ = $1; }    
;

incremento
    : 'INC' '(' 'ID' ')'
        {$$ = { tipo: 'INCREMENTO', id: $3 }; }
    | 'ID' '+' '+'
        { $$ = { tipo: 'INCREMENTO', id: $1 }; }
;

procedimiento 
    : 'PROCEDIMIENTO' 'ID' sentencias 'FIN' 'PROCEDIMIENTO'
        { console.log("procedimiento", $2, $3);
            $$ = { tipo: 'DEFINIR_PROCEDIMIENTO', id: $2, sentencias: $3 }; }
    | 'PROCEDIMIENTO' 'ID' 'CON' 'PARAMETROS' '(' lista_parametros ')' sentencias 'FIN' 'PROCEDIMIENTO'
        { $$ = { tipo: 'DEFINIR_PROCEDIMIENTO', id: $2, parametros: $6, sentencias: $8 }; }
;

funcion 
    : 'FUNCION' 'ID' tipo sentencias 'FIN' 'FUNCION'
        { console.log("funcion", $2, $3, $4);
            $$ = { tipo: 'DEFINIR_FUNCION', id: $2, tipoRetorno: $3, sentencias: $4 }; }
    | 'FUNCION' 'ID' tipo 'CON' 'PARAMETROS' '(' lista_parametros ')'  sentencias 'FIN' 'FUNCION'
        { $$ = { tipo: 'DEFINIR_FUNCION', id: $2, tipoRetorno: $3, parametros: $6, sentencias: $10 }; }
;

lista_parametros
    : 'ID' tipo ',' lista_parametros
        { $$ = [{ id: $1, tipo: $2 }].concat($4); }
    | 'ID' tipo
        { $$ = [{ id: $1, tipo: $2 }]; }
    ;

ingresar_lista
    : 'INGRESAR' 'LISTA' '(' expresion ',' 'TIPO_ENTERO' ')' 'ID' 'ASIGNAR'  '(' lista ')'
        { console.log("ingresar lista", $6, $8, $11);
            $$ = { tipo: 'INGRESAR_LISTA', id: $8, tipoDato: $6, lista: $11.elementos }; }
    ;

valor_lista
    : 'ID' '[' expresion ']'
        { $$ = { tipo: 'VALOR_LISTA', id: $1, indice: $3 }; }
    | 'ID' '[' expresion ']' '[' expresion ']'
        { $$ = { tipo: 'VALOR_LISTA_2D', id: $1, indice1: $3, indice2: $5 }; }
    | 'ID' '[' expresion ']' '[' expresion ']' '[' expresion ']'
        { $$ = { tipo: 'VALOR_LISTA_3D', id: $1, indice1: $3, indice2: $5, indice3: $7 }; }
    ;

lista :
    expresion ',' lista
        { $$ = { tipo: 'LISTA', elementos: [$1].concat($3.elementos) }; } // (1 ,2,3 )
    | expresion
        { $$ = { tipo: 'LISTA', elementos: [$1] }; } // (2)
    ;

expresion
    : expresion '+' expresion
        { $$ = { tipo: 'SUMA', izquierda: $1, derecha: $3 }; }
    | expresion '-' expresion
        { $$ = { tipo: 'RESTA', izquierda: $1, derecha: $3 }; }
    | expresion '*' expresion
        { $$ = { tipo: 'MULTIPLICACION', izquierda: $1, derecha: $3 }; }
    | expresion '/' expresion
        { $$ = { tipo: 'DIVISION', izquierda: $1, derecha: $3 }; }
    | expresion '%' expresion
        { $$ = { tipo: 'MODULO', izquierda: $1, derecha: $3 }; }
    | expresion '<' expresion
        { $$ = { tipo: 'MENOR', izquierda: $1, derecha: $3 }; }
    | NUMERO
        { $$ = { tipo: 'NUMERO', valor: Number($1) }; }
    | ID        { $$ = { tipo: 'ID', nombre: $1 }; }
    | ID '.' ID 
        { $$ = { tipo: 'VALOR_OBJETO', id: $1, atributo: $3 }; }
    | CADENA
        { $$ = { tipo: 'CADENA', valor: $1.slice(1, -1) }; }
    | valor_lista
        { $$ = $1; }
    | booleano
        { $$ = $1; }
    | 'ID' '(' ')'
        { $$ = { tipo: 'LLAMAR_FUNCION', id: $1 }; }
    | 'ID' '(' lista ')'
        { $$ = { tipo: 'LLAMAR_FUNCION', id: $1, parametros: $3.elementos }; }
    | '(' lista ')'
        { $$ = { tipo: 'LISTA', elementos: $2.elementos };  }
    
    ;

booleano 
    :   VERDADERO
        { console.log("booleano", $1);
            $$ = { tipo: 'BOOLEANO', valor: 'verdadero' }; }
    | FALSO
        { $$ = { tipo: 'BOOLEANO', valor: 'falso' }; }
    ;

tipo 
    : TIPO_ENTERO
        { $$ = 'entero'; }
    | TIPO_CADENA
        { $$ = 'cadena'; }
    | TIPO_BOOLEANO
        { $$ = 'booleano'; }
    ;