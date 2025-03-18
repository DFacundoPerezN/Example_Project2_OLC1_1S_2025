/*Definicion */

%{
    //Codigo de inicialización
    function calcular( operador, a, b){
        switch(operador){
            case '+': return a + b;
            }
    }
%}

/* Tokens o simbolos */
%lex

%% 

\s+                 /* Ignorar espacios en blanco */
[0-9]+\b              return 'NUMERO';
"+"                 return '+';
"*"                 return '*';

<<EOF>>             return 'FIN_ENTRADA';

/lex

/* Reglas de gramaticales */
%%
inicio : expresion FIN_ENTRADA
    { console.log($1); /*$1 = expresion*/}
    ;

expresion : expresion '+' termino {$$ = calcular('+', $1, $3);}
    | termino {$$ = $1;}
    ;

termino : termino '*' factor {$$ = calcular('*', $1, $3);}
    | factor        {$$ = $1;}
    ;

factor : NUMERO {$$ = parseInt($1);}
    ;

%%