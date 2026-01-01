const TERRENO = {
    LIBRE: 0,
    EDIFICIO: 1,
    AGUA: 2,
    BLOQUEO: 3,
    CAMINO: 5,
    INICIO: 6,
    FIN: 7
}

let tablero = [];

function main() {
    //Botones para generar tablero y enviar coordenadas de inicio y fin.
    const btnGenerar = document.getElementById('btnGenerar');
    const btnEnviar = document.getElementById('btnEnviar');

    btnGenerar.addEventListener('click', crear_tablero);
    btnEnviar.addEventListener('click', coordenadas_inicio_fin);
}

function crear_tablero() {
    const numFila = parseInt(document.getElementById('fila').value);
    const numColumna = parseInt(document.getElementById('columna').value);

    if (numFila < 5 || numColumna < 5) {
        alert("El tamaño debe ser mayor que 5.");
        return 1;
    }

    tablero = [];
    for (let y = 0; y < numFila; y++) {
        let fila_actual = [];
        for (let x = 0; x < numColumna; x++) {
            fila_actual.push(TERRENO.LIBRE);
        }
        tablero.push(fila_actual);
    }
    generar_obstaculos(numFila, numColumna);
    mostrar_tablero(numFila, numColumna);
}

function generar_obstaculos(fila, columna) {
    const numObstaculos = Math.floor((fila * columna) * 0.3);
    for (let i = 0; i < numObstaculos; i++) {
        const valor_fila = Math.floor(Math.random() * fila);
        const valor_columna = Math.floor(Math.random() * columna);
        const tipo_terreno = Math.floor(Math.random() * 3) + 1;

        const actual = tablero[valor_fila][valor_columna];

        if (actual !== TERRENO.INICIO && actual !== TERRENO.FIN) {
            tablero[valor_fila][valor_columna] = tipo_terreno;
        }
    }
}

function coordenadas_inicio_fin() {
    if (tablero.length === 0) {
        alert('Por favor, genere un tablero antes de ingresar las coordenadas.');
        return;
    }

    const fila = tablero.length;
    const columna = tablero[0].length;

    const inicio_x = parseInt(document.getElementById('inicial_x').value) - 1;
    const inicio_y = parseInt(document.getElementById('inicial_y').value) - 1;
    const fin_x = parseInt(document.getElementById('fin_x').value) - 1;
    const fin_y = parseInt(document.getElementById('fin_y').value) - 1;

    if (isNaN(inicio_x) || isNaN(inicio_y) || isNaN(fin_x) || isNaN(fin_y)) {
        alert('Por favor, ingrese coordenadas validas.');
        return 1;
    }

    if (inicio_x < 0 || inicio_x >= fila || inicio_y < 0 || inicio_y >= columna) {
        alert('Coordenadas de inicio invalidas');
        return 1;
    }

    if (fin_x < 0 || fin_x >= fila || fin_y < 0 || fin_y >= columna) {
        alert('Coordenadas de fin invalidas');
        return 1;
    }

    if (tablero[inicio_y][inicio_x] === TERRENO.INICIO || tablero[fin_y][fin_x] === TERRENO.FIN ||
        tablero[inicio_y][inicio_x] === TERRENO.BLOQUEO || tablero[fin_y][fin_x] === TERRENO.BLOQUEO ||
        tablero[inicio_y][inicio_x] === TERRENO.AGUA || tablero[fin_y][fin_x] === TERRENO.AGUA ||
        tablero[inicio_y][inicio_x] === TERRENO.EDIFICIO || tablero[fin_y][fin_x] === TERRENO.EDIFICIO) {
        alert('Coordenadas de inicio o fin sobre terreno no valido');
        return 1;
    }

    tablero[inicio_y][inicio_x] = TERRENO.INICIO;
    tablero[fin_y][fin_x] = TERRENO.FIN;

    buscar_ruta_a_start(inicio_x, inicio_y, fin_x, fin_y);

    mostrar_tablero(fila, columna);
}

function calcular_distancia(valor_x1, valor_y1, valor_x2, valor_y2) {
    return Math.abs(valor_x1 - valor_x2) + Math.abs(valor_y1 - valor_y2);
}

function buscar_ruta_a_start(inicio_x, inicio_y, fin_x, fin_y) {
    let lista_abierta = [];
    let lista_cerrada = [];

    let inicio = {
        x: inicio_x,
        y: inicio_y,
        g: 0,
        h: calcular_distancia(inicio_x, inicio_y, fin_x, fin_y),
        f: 0,
        padre: null
    };

    inicio.f = inicio.g + inicio.h;

    lista_abierta.push(inicio);

    while (lista_abierta.length > 0) {
        let indice_actual = 0;
        for (let i = 0; i < lista_abierta.length; i++) {
            if (lista_abierta[i].f < lista_abierta[indice_actual].f) {
                indice_actual = i;
            }
        }
        let actual = lista_abierta[indice_actual];

        if(actual.x === fin_x && actual.y === fin_y){
            reconstruir_camino_final(actual);
            return;
        }

        lista_abierta.splice(indice_actual, 1);
        lista_cerrada.push(actual);

        let movimientos = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for(let m = 0; m < movimientos.length; m++){
            let nuevo_x = actual.x + movimientos[m][0];
            let nuevo_y = actual.y + movimientos[m][1];

            if(nuevo_x >= 0 && nuevo_x < tablero[0].length & nuevo_y >= 0 && nuevo_y < tablero.length){
                let tipo_terreno = tablero[nuevo_y][nuevo_x];

                if(tipo_terreno === TERRENO.EDIFICIO || tipo_terreno === TERRENO.BLOQUEO) continue;

                if(lista_cerrada.find(nodo => nodo.x === nuevo_x && nodo.y === nuevo_y)) continue;

                let costo_paso = (tipo_terreno === TERRENO.AGUA) ? 3 : 1;
                let g_tentativo = actual.g + costo_paso;

                let vecino = lista_abierta.find(nodo => nodo.x === nuevo_x && nodo.y === nuevo_y);

                if(!vecino || g_tentativo < vecino.g){
                    let nuevo_nodo = {
                        x: nuevo_x,
                        y: nuevo_y,
                        g: g_tentativo,
                        h: calcular_distancia(nuevo_x, nuevo_y, fin_x, fin_y),
                        padre: actual
                    };
                    nuevo_nodo.f = nuevo_nodo.g + nuevo_nodo.h;

                    if(!vecino){
                        lista_abierta.push(nuevo_nodo);
                    }else{
                        vecino.g = nuevo_nodo.g;
                        vecino.f = nuevo_nodo.f;
                        vecino.padre = actual;
                    }
                }
            }
        }
    }
    return null;
}

function reconstruir_camino_final(nodo_final){
    let temporal = nodo_final;
    let pasos = 0;

    while(temporal.padre !== null){
        if(tablero[temporal.y][temporal.x] !== TERRENO.FIN &&
            tablero[temporal.y][temporal.x] !== TERRENO.INICIO){ 
            tablero[temporal.y][temporal.x] = TERRENO.CAMINO;
        }
        temporal = temporal.padre;
        pasos++;        
    }
    document.getElementById('distancia').innerText = pasos + " pasos";
}

function mostrar_tablero(fila, columna) {
    const contenedorID = document.getElementById('mapaVisual');

    contenedorID.innerHTML = '';
    contenedorID.style.display = 'grid';
    contenedorID.style.gridTemplateColumns = `repeat(${columna}, 35px)`;
    contenedorID.style.gridTemplateRows = `repeat(${fila}, 35px)`;

    for (let y = 0; y < fila; y++) {
        for (let x = 0; x < columna; x++) {
            const celdaDiv = document.createElement('div');
            celdaDiv.classList.add('cell'); // Añadir clase común a todas las celdas
            celdaDiv.dataset.fila = y; // Almacenar fila en dataset
            celdaDiv.dataset.columna = x; // Almacenar columna en dataset

            const valor = tablero[y][x]; // Obtener el valor del terreno en la celda

            switch (valor) { // Asignar clase y contenido según el tipo de terreno
                case TERRENO.EDIFICIO: // Edificio
                    celdaDiv.textContent = 'X';
                    celdaDiv.classList.add('edificio');
                    break;
                case TERRENO.AGUA: // Agua
                    celdaDiv.textContent = 'a';
                    celdaDiv.classList.add('agua');
                    break
                case TERRENO.BLOQUEO: // Bloqueo
                    celdaDiv.textContent = 'B';
                    celdaDiv.classList.add('bloqueo');
                    break;
                case TERRENO.INICIO: // Inicio
                    celdaDiv.textContent = 'E';
                    celdaDiv.classList.add('entrada');
                    break;
                case TERRENO.FIN: // Fin
                    celdaDiv.textContent = 'S';
                    celdaDiv.classList.add('salida');
                    break;
                case TERRENO.CAMINO:
                    celdaDiv.textContent = '*';
                    celdaDiv.classList.add('camino');
                    break;
                default: // Terreno libre
                    celdaDiv.textContent = '.';
                    celdaDiv.classList.add('libre');
                    break;
            }
            contenedorID.appendChild(celdaDiv);
        }
    }
}

document.addEventListener('DOMContentLoaded', main);