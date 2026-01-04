const TERRENO = {
    LIBRE: 0,
    EDIFICIO: 1,
    AGUA: 2,
    BLOQUEO: 3,
    CAMINO: 5,
    INICIO: 6,
    FIN: 7,
    CAMINO_AGUA: 8
}

let tablero = [];
let punto_inicio = null;
let punto_fin = null;

function main() {
    //Botones para generar tablero y enviar coordenadas de inicio y fin.
    const btnGenerar = document.getElementById('btnGenerar');
    const btnEnviar = document.getElementById('btnEnviar');
    const mapaContenedor = document.getElementById('mapaVisual');

    btnGenerar.addEventListener('click', crear_tablero);
    btnEnviar.addEventListener('click', coordenadas_inicio_fin);
    mapaContenedor.addEventListener('click', gestionar_click_tablero);
}

function crear_tablero() {
    const numFila = parseInt(document.getElementById('fila').value);
    const numColumna = parseInt(document.getElementById('columna').value);

    if (numFila < 5 || numColumna < 5) {
        alert("El tamaño debe ser mayor que 5.");
        return;
    }

    tablero = [];
    for (let y = 0; y < numFila; y++) {
        let fila_actual = [];
        for (let x = 0; x < numColumna; x++) {
            fila_actual.push(TERRENO.LIBRE);
        }
        tablero.push(fila_actual);
    }
    if (punto_inicio !== null && punto_inicio.x >= 0 && punto_inicio.x < numColumna && punto_inicio.y >= 0 && punto_inicio.y < numFila) {
        tablero[punto_inicio.y][punto_inicio.x] = TERRENO.INICIO;
    }

    if (punto_fin !== null && punto_fin.x >= 0 && punto_fin.x < numColumna && punto_fin.y >= 0 && punto_fin.y < numFila) {
        tablero[punto_fin.y][punto_fin.x] = TERRENO.FIN;
    }

    generar_obstaculos(numFila, numColumna);
    if (punto_inicio !== null && punto_fin !== null) {
        calcular_pasos_mostrar_camino(punto_inicio.x, punto_inicio.y, punto_fin.x, punto_fin.y, numFila, numColumna);
    } else {
        mostrar_tablero(numFila, numColumna);
    }
}

function generar_obstaculos(fila, columna) {
    const numObstaculos = Math.floor((fila * columna) * 0.4);
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

    punto_inicio = { x: parseInt(document.getElementById('inicial_x').value) - 1, y: parseInt(document.getElementById('inicial_y').value) - 1 };
    punto_fin = { x: parseInt(document.getElementById('fin_x').value) - 1, y: parseInt(document.getElementById('fin_y').value) - 1 };

    if (isNaN(punto_inicio.x) || isNaN(punto_inicio.y) || isNaN(punto_fin.x) || isNaN(punto_fin.y)) {
        alert('Por favor, ingrese coordenadas validas.');
        return;
    }

    if (punto_inicio.x < 0 || punto_inicio.x >= columna || punto_inicio.y < 0 || punto_inicio.y >= fila) {
        alert('Coordenadas de inicio invalidas');
        return;
    }

    if (punto_fin.x < 0 || punto_fin.x >= columna || punto_fin.y < 0 || punto_fin.y >= fila) {
        alert('Coordenadas de fin invalidas');
        return;
    }

    for (let y = 0; y < fila; y++) {
        for (let x = 0; x < columna; x++) {
            if (tablero[y][x] === TERRENO.CAMINO_AGUA) {
                tablero[y][x] = TERRENO.AGUA;
            } else if (tablero[y][x] === TERRENO.INICIO ||
                tablero[y][x] === TERRENO.FIN ||
                tablero[y][x] === TERRENO.CAMINO) {
                tablero[y][x] = TERRENO.LIBRE;
            }
        }
    }

    if (tablero[punto_inicio.y][punto_inicio.x] === TERRENO.INICIO || tablero[punto_fin.y][punto_fin.x] === TERRENO.FIN ||
        tablero[punto_inicio.y][punto_inicio.x] === TERRENO.BLOQUEO || tablero[punto_fin.y][punto_fin.x] === TERRENO.BLOQUEO ||
        tablero[punto_inicio.y][punto_inicio.x] === TERRENO.AGUA || tablero[punto_fin.y][punto_fin.x] === TERRENO.AGUA ||
        tablero[punto_inicio.y][punto_inicio.x] === TERRENO.EDIFICIO || tablero[punto_fin.y][punto_fin.x] === TERRENO.EDIFICIO) {
        alert('Coordenadas de inicio o fin sobre terreno no valido');
        return;
    }

    tablero[punto_inicio.y][punto_inicio.x] = TERRENO.INICIO;
    tablero[punto_fin.y][punto_fin.x] = TERRENO.FIN;

    calcular_pasos_mostrar_camino(punto_inicio.x, punto_inicio.y, punto_fin.x, punto_fin.y, fila, columna);
}

function calcular_pasos_mostrar_camino(inicio_x, inicio_y, fin_x, fin_y, fila, columna) {
    document.getElementById('distancia').innerText = "0 pasos";
    const pasos = buscar_ruta_a_start(inicio_x, inicio_y, fin_x, fin_y);

    if (!pasos) {
        document.getElementById('distancia').innerText = "No existe camino disponible.";
    } else {
        document.getElementById('distancia').innerText = pasos + " pasos";
    }

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

        if (actual.x === fin_x && actual.y === fin_y) {
            return reconstruir_camino_final(actual);
        }

        lista_abierta.splice(indice_actual, 1);
        lista_cerrada.push(actual);

        let movimientos = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (let m = 0; m < movimientos.length; m++) {
            let nuevo_x = actual.x + movimientos[m][0];
            let nuevo_y = actual.y + movimientos[m][1];

            if (nuevo_x >= 0 && nuevo_x < tablero[0].length && nuevo_y >= 0 && nuevo_y < tablero.length) {
                let tipo_terreno = tablero[nuevo_y][nuevo_x];

                if (tipo_terreno === TERRENO.EDIFICIO || tipo_terreno === TERRENO.BLOQUEO) continue;

                if (lista_cerrada.find(nodo => nodo.x === nuevo_x && nodo.y === nuevo_y)) continue;

                let costo_paso = (tipo_terreno === TERRENO.AGUA) ? 5 : 1; //Costo de movimiento
                let g_tentativo = actual.g + costo_paso;

                let vecino = lista_abierta.find(nodo => nodo.x === nuevo_x && nodo.y === nuevo_y);

                if (!vecino || g_tentativo < vecino.g) {
                    let nuevo_nodo = {
                        x: nuevo_x,
                        y: nuevo_y,
                        g: g_tentativo,
                        h: calcular_distancia(nuevo_x, nuevo_y, fin_x, fin_y),
                        padre: actual
                    };
                    nuevo_nodo.f = nuevo_nodo.g + nuevo_nodo.h;

                    if (!vecino) {
                        lista_abierta.push(nuevo_nodo);
                    } else {
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

function reconstruir_camino_final(nodo_final) {
    let temporal = nodo_final;
    let pasos = 0;

    while (temporal.padre !== null) {
        if (tablero[temporal.y][temporal.x] !== TERRENO.FIN &&
            tablero[temporal.y][temporal.x] !== TERRENO.INICIO) {

            if (tablero[temporal.y][temporal.x] === TERRENO.AGUA) {
                tablero[temporal.y][temporal.x] = TERRENO.CAMINO_AGUA;
            } else {
                tablero[temporal.y][temporal.x] = TERRENO.CAMINO;
            }
        }
        temporal = temporal.padre;
        pasos++;
    }
    return pasos;
}

function gestionar_click_tablero(evento) {
    if (!tablero || !evento.target.classList.contains('cell')) {
        return;
    }

    const fila = parseInt(evento.target.dataset.fila);
    const columna = parseInt(evento.target.dataset.columna);
    const valor_actual = tablero[fila][columna];

    if (valor_actual === TERRENO.INICIO || valor_actual === TERRENO.FIN) {
        return;
    }

    if (punto_inicio && punto_fin) {
        limpiar_camino_viejo();
    }

    if (valor_actual === TERRENO.LIBRE || valor_actual === TERRENO.CAMINO || valor_actual === TERRENO.CAMINO_AGUA) {
        const tipo_terreno = Math.floor(Math.random() * 3) + 1;
        tablero[fila][columna] = tipo_terreno;
    } else {
        tablero[fila][columna] = TERRENO.LIBRE;
    }
    calcular_pasos_mostrar_camino(punto_inicio.x, punto_inicio.y, punto_fin.x, punto_fin.y, tablero.length, tablero[0].length);
}

function limpiar_camino_viejo() {
    for (let y = 0; y < tablero.length; y++) {
        for (let x = 0; x < tablero[y].length; x++) {
            if (tablero[y][x] === TERRENO.CAMINO || tablero[y][x] === TERRENO.CAMINO_AGUA) {
                tablero[y][x] = TERRENO.LIBRE;
            }
        }
    }
}

function mostrar_tablero(fila, columna) {
    const contenedorID = document.getElementById('mapaVisual');
    const TAMANHO = 35;

    contenedorID.innerHTML = '';
    contenedorID.style.display = 'grid';
    contenedorID.style.gridTemplateColumns = `repeat(${columna}, ${TAMANHO}px)`;
    contenedorID.style.gridTemplateRows = `repeat(${fila}, ${TAMANHO}px)`;

    for (let y = 0; y < fila; y++) {
        for (let x = 0; x < columna; x++) {
            const celdaDiv = document.createElement('div');
            celdaDiv.classList.add('cell'); // Añadir clase común a todas las celdas
            celdaDiv.dataset.fila = y; // Almacenar fila en dataset
            celdaDiv.dataset.columna = x; // Almacenar columna en dataset
            celdaDiv.style.cursor = 'pointer'; // Cambiar cursor a puntero

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
                case TERRENO.CAMINO_AGUA:
                    celdaDiv.textContent = 'A';
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