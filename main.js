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

function crear_tablero(fila, columna) {
    const numFila = parseInt(document.getElementById('fila').value);
    const numColumna = parseInt(document.getElementById('columna').value);

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
    const fila = tablero.length;
    const columna = tablero[0].length;

    const inicio_x = parseInt(document.getElementById('inicial_x').value) - 1;
    const inicio_y = parseInt(document.getElementById('inicial_y').value) - 1;
    const fin_x = parseInt(document.getElementById('fin_x').value) - 1;
    const fin_y = parseInt(document.getElementById('fin_y').value) - 1;

    if (inicio_x < 0 || inicio_x >= fila || inicio_y < 0 || inicio_y >= columna) {
        alert('Coordenadas de inicio invalidas');
        return 1;
    }

    if (fin_x < 0 || fin_x >= fila || fin_y < 0 || fin_y >= columna) {
        alert('Coordenadas de fin invalidas');
        return 1;
    }

    tablero[inicio_y][inicio_x] = TERRENO.INICIO;
    tablero[fin_y][fin_x] = TERRENO.FIN;

    mostrar_tablero(fila, columna);
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