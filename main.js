const TERRENO = {
    LIBRE: 0,
    EDIFICIO: 1,
    AGUA: 2,
    BLOQUEO: 3,
    CAMINO: 5,
    INICIO: 6,
    FIN: 7,
    CAMINO_AGUA: 8
} // Definición de tipos de terreno

const TAMANHO_CELDA = 35; // Tamaño de cada celda en píxeles
const PORCENTAJE_OBSTACULO = 0.5; // Porcentaje de obstáculos en el tablero

let tablero = []; // Matriz del tablero
let punto_inicio = null; // Coordenadas de inicio
let punto_fin = null; // Coordenadas de fin

function inicializar() { //Función principal que se ejecuta al cargar la página
    //Botones para generar el tablero, enviar las coordenadas y gestionar clicks en el tablero.
    const btnGenerar = document.getElementById('btnGenerar');
    const btnEnviar = document.getElementById('btnEnviar');
    const mapaContenedor = document.getElementById('mapaVisual');
    const btnLimpiar = document.getElementById('btnLimpiar');

    btnGenerar.addEventListener('click', crear_tablero); // Evento para generar el tablero
    btnEnviar.addEventListener('click', coordenadas_inicio_fin); // Evento para enviar las coordenadas
    mapaContenedor.addEventListener('click', gestionar_click_tablero); // Evento para gestionar clicks en el tablero
    btnLimpiar.addEventListener('click', limpiar_tablero); // Evento para limpiar el tablero
}

function crear_tablero() { //Función para crear el tablero con las dimensiones especificadas
    const numFila = parseInt(document.getElementById('fila').value); // Obtener número de filas
    const numColumna = parseInt(document.getElementById('columna').value); // Obtener número de columnas

    if (numFila < 5 || numColumna < 5) { // Validar tamaño mínimo del tablero
        alert("El tamaño debe ser mayor que 5.");
        return;
    }

    tablero = []; // Reiniciar el tablero
    for (let y = 0; y < numFila; y++) { // Crear filas del tablero
        let fila_actual = []; // Inicializar fila actual
        for (let x = 0; x < numColumna; x++) { // Crear columnas del tablero
            fila_actual.push(TERRENO.LIBRE); // Inicializar cada celda como terreno libre
        }
        tablero.push(fila_actual); // Añadir fila al tablero
    }
    // Colocar puntos de inicio y fin si existen
    if (punto_inicio !== null && punto_inicio.x >= 0 && punto_inicio.x < numColumna && punto_inicio.y >= 0 && punto_inicio.y < numFila) {
        tablero[punto_inicio.y][punto_inicio.x] = TERRENO.INICIO;
    }
    if (punto_fin !== null && punto_fin.x >= 0 && punto_fin.x < numColumna && punto_fin.y >= 0 && punto_fin.y < numFila) {
        tablero[punto_fin.y][punto_fin.x] = TERRENO.FIN;
    }

    generar_obstaculos(numFila, numColumna); // Generar obstáculos en el tablero
    if (punto_inicio !== null && punto_fin !== null) { // Calcular y mostrar camino si existen puntos de inicio y fin
        calcular_pasos_mostrar_camino(punto_inicio.x, punto_inicio.y, punto_fin.x, punto_fin.y, numFila, numColumna); // Calcular y mostrar camino
    } else {
        mostrar_tablero(numFila, numColumna); // Mostrar el tablero sin camino
    }
}

function generar_obstaculos(fila, columna) { //Función para generar obstáculos aleatorios en el tablero
    const numObstaculos = Math.floor((fila * columna) * PORCENTAJE_OBSTACULO); // 40% de las celdas serán obstáculos
    for (let i = 0; i < numObstaculos; i++) { // Generar cada obstáculo
        const valor_fila = Math.floor(Math.random() * fila); // Fila aleatoria
        const valor_columna = Math.floor(Math.random() * columna); // Columna aleatoria
        const tipo_terreno = Math.floor(Math.random() * 3) + 1; // Tipo de terreno aleatorio (1: Edificio, 2: Agua, 3: Bloqueo)

        const actual = tablero[valor_fila][valor_columna]; // Tipo de terreno actual en la celda

        if (actual !== TERRENO.INICIO && actual !== TERRENO.FIN) { // No sobrescribir puntos de inicio o fin
            tablero[valor_fila][valor_columna] = tipo_terreno;
        }
    }
}

function coordenadas_inicio_fin() { //Función para obtener y validar las coordenadas de inicio y fin
    if (tablero.length === 0) {
        alert('Por favor, genere un tablero antes de ingresar las coordenadas.');
        return;
    }

    const fila = tablero.length; // Número de filas del tablero
    const columna = tablero[0].length; // Número de columnas del tablero

    punto_inicio = { x: parseInt(document.getElementById('inicial_x').value) - 1, y: parseInt(document.getElementById('inicial_y').value) - 1 }; // Obtener coordenadas de inicio
    punto_fin = { x: parseInt(document.getElementById('fin_x').value) - 1, y: parseInt(document.getElementById('fin_y').value) - 1 }; // Obtener coordenadas de fin
    // Validar coordenadas ingresadas
    if (isNaN(punto_inicio.x) || isNaN(punto_inicio.y) || isNaN(punto_fin.x) || isNaN(punto_fin.y)) {
        alert('Por favor, ingrese coordenadas validas.');
        return;
    }
    // Validar que las coordenadas estén dentro de los límites del tablero
    if (punto_inicio.x < 0 || punto_inicio.x >= columna || punto_inicio.y < 0 || punto_inicio.y >= fila) {
        alert('Coordenadas de inicio invalidas');
        return;
    }
    // Validar que las coordenadas estén dentro de los límites del tablero
    if (punto_fin.x < 0 || punto_fin.x >= columna || punto_fin.y < 0 || punto_fin.y >= fila) {
        alert('Coordenadas de fin invalidas');
        return;
    }
    // Limpiar caminos anteriores en el tablero
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
    // Validar que las coordenadas no estén sobre terrenos no válidos
    if (tablero[punto_inicio.y][punto_inicio.x] === TERRENO.INICIO || tablero[punto_fin.y][punto_fin.x] === TERRENO.FIN ||
        tablero[punto_inicio.y][punto_inicio.x] === TERRENO.BLOQUEO || tablero[punto_fin.y][punto_fin.x] === TERRENO.BLOQUEO ||
        tablero[punto_inicio.y][punto_inicio.x] === TERRENO.AGUA || tablero[punto_fin.y][punto_fin.x] === TERRENO.AGUA ||
        tablero[punto_inicio.y][punto_inicio.x] === TERRENO.EDIFICIO || tablero[punto_fin.y][punto_fin.x] === TERRENO.EDIFICIO) {
        alert('Coordenadas de inicio o fin sobre terreno no valido');
        return;
    }

    tablero[punto_inicio.y][punto_inicio.x] = TERRENO.INICIO; // Marcar punto de inicio en el tablero
    tablero[punto_fin.y][punto_fin.x] = TERRENO.FIN; // Marcar punto de fin en el tablero

    calcular_pasos_mostrar_camino(punto_inicio.x, punto_inicio.y, punto_fin.x, punto_fin.y, fila, columna); // Calcular y mostrar camino
}

function calcular_pasos_mostrar_camino(inicio_x, inicio_y, fin_x, fin_y, fila, columna) { //Función para calcular pasos y mostrar el camino en el tablero
    document.getElementById('distancia').innerText = "0 pasos";
    const pasos = buscar_ruta_a_star(inicio_x, inicio_y, fin_x, fin_y); // Buscar ruta usando A*

    if (!pasos) { // Si no hay ruta disponible
        document.getElementById('distancia').innerText = "No existe camino disponible.";
    } else { // Mostrar número de pasos en la interfaz
        document.getElementById('distancia').innerText = pasos + " pasos";
    }

    mostrar_tablero(fila, columna); // Mostrar el tablero actualizado
}

function distancia_heuristica(valor_x1, valor_y1, valor_x2, valor_y2) { //Función para calcular la distancia Manhattan entre dos puntos
    return Math.abs(valor_x1 - valor_x2) + Math.abs(valor_y1 - valor_y2); // Distancia Manhattan
}

function buscar_ruta_a_star(inicio_x, inicio_y, fin_x, fin_y) { //Función que implementa el algoritmo A* para encontrar la ruta más corta
    let lista_abierta = []; // Nodos por explorar
    let mapa_abierto = new Map(); // Mapa para nodos en la lista abierta
    let lista_cerrada = new Set(); // Nodos ya explorados

    let inicio = {
        x: inicio_x, // Coordenada x del nodo de inicio
        y: inicio_y, // Coordenada y del nodo de inicio
        g: 0, // Costo desde el inicio hasta el nodo actual
        h: distancia_heuristica(inicio_x, inicio_y, fin_x, fin_y), // Heurística (distancia estimada al nodo final)
        f: 0, // Costo total (g + h)
        padre: null // Nodo padre (ninguno para el inicio)
    }; // Nodo de inicio

    inicio.f = inicio.g + inicio.h; // Calcular f del nodo de inicio

    lista_abierta.push(inicio); // Añadir nodo de inicio a la lista abierta
    mapa_abierto.set(`${inicio.x},${inicio.y}`, inicio); // Añadir nodo de inicio al mapa abierto

    while (lista_abierta.length > 0) { // Mientras haya nodos por explorar
        lista_abierta.sort((a, b) => a.f - b.f); // Ordenar lista abierta por f ascendente
        let actual = lista_abierta[0]; // Nodo con el menor f

        if (actual.x === fin_x && actual.y === fin_y) { // Si se ha llegado al nodo final
            return reconstruir_camino_final(actual); // Reconstruir y retornar el camino final
        }

        lista_abierta.splice(0, 1); // Remover nodo actual de la lista abierta
        mapa_abierto.delete(`${actual.x},${actual.y}`); // Remover nodo actual del mapa abierto
        lista_cerrada.add(`${actual.x},${actual.y}`); // Añadir nodo actual a la lista cerrada

        let movimientos = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Movimientos posibles (arriba, abajo, derecha, izquierda)

        for (let m = 0; m < movimientos.length; m++) { // Explorar cada movimiento posible
            let nuevo_x = actual.x + movimientos[m][0]; // Nueva coordenada x
            let nuevo_y = actual.y + movimientos[m][1]; // Nueva coordenada y

            if (nuevo_x >= 0 && nuevo_x < tablero[0].length && nuevo_y >= 0 && nuevo_y < tablero.length) { // Validar dentro de los límites del tablero
                let tipo_terreno = tablero[nuevo_y][nuevo_x]; // Tipo de terreno en la nueva posición
                let clave = `${nuevo_x},${nuevo_y}`; // Clave para mapas y sets

                if (tipo_terreno === TERRENO.EDIFICIO || tipo_terreno === TERRENO.BLOQUEO) continue; // Saltar terrenos no transitables

                if (lista_cerrada.has(clave)) continue; // Saltar si ya está en la lista cerrada

                let costo_paso = (tipo_terreno === TERRENO.AGUA) ? 5 : 1; // Costo del paso (5 para agua, 1 para libre)
                let g_tentativo = actual.g + costo_paso; // Calcular g tentativo

                let vecino = mapa_abierto.get(clave); // Buscar vecino en el mapa abierto

                if (!vecino || g_tentativo < vecino.g) { // Si no está en la lista abierta o se encontró un mejor camino
                    let nuevo_nodo = {
                        x: nuevo_x,
                        y: nuevo_y,
                        g: g_tentativo,
                        h: distancia_heuristica(nuevo_x, nuevo_y, fin_x, fin_y),
                        padre: actual
                    }; // Crear nuevo nodo
                    nuevo_nodo.f = nuevo_nodo.g + nuevo_nodo.h; // Calcular f del nuevo nodo

                    if (!vecino) { // Si el vecino no está en la lista abierta
                        lista_abierta.push(nuevo_nodo); // Añadir nuevo nodo a la lista abierta
                        mapa_abierto.set(clave, nuevo_nodo); // Añadir nuevo nodo al mapa abierto
                    } else { // Actualizar vecino existente con mejor camino
                        vecino.g = nuevo_nodo.g; // Actualizar g
                        vecino.f = nuevo_nodo.f; // Actualizar f
                        vecino.padre = actual; // Actualizar padre
                    }
                }
            }
        }
    }
    return null; // Retornar null si no se encontró camino
}

function reconstruir_camino_final(nodo_final) { //Función para reconstruir el camino desde el nodo final hasta el inicio
    let temporal = nodo_final; // Nodo temporal para recorrer el camino
    let pasos = 0; // Contador de pasos

    while (temporal.padre !== null) { // Mientras no se llegue al nodo de inicio
        if (tablero[temporal.y][temporal.x] !== TERRENO.FIN &&
            tablero[temporal.y][temporal.x] !== TERRENO.INICIO) { // No sobrescribir puntos de inicio o fin

            if (tablero[temporal.y][temporal.x] === TERRENO.AGUA) { // Marcar camino sobre agua
                tablero[temporal.y][temporal.x] = TERRENO.CAMINO_AGUA;
            } else { // Marcar camino sobre terreno libre
                tablero[temporal.y][temporal.x] = TERRENO.CAMINO;
            }
        }
        temporal = temporal.padre; // Mover al nodo padre
        pasos++; // Incrementar contador de pasos
    }
    return pasos; // Retornar número total de pasos
}

function gestionar_click_tablero(evento) { //Función para gestionar los clicks en el tablero y modificar terrenos
    if (!tablero || !evento.target.classList.contains('cell')) { // Validar que el tablero exista y que se haya hecho click en una celda
        return;
    }

    const fila = parseInt(evento.target.dataset.fila); // Obtener fila desde el dataset
    const columna = parseInt(evento.target.dataset.columna); // Obtener columna desde el dataset
    const valor_actual = tablero[fila][columna]; // Obtener el valor actual del terreno en la celda

    if (valor_actual === TERRENO.INICIO || valor_actual === TERRENO.FIN) { // No permitir modificar puntos de inicio o fin
        return;
    }

    if (punto_inicio && punto_fin) {
        limpiar_camino_viejo(); // Limpiar caminos anteriores antes de modificar el terreno
    }

    if (valor_actual === TERRENO.LIBRE || valor_actual === TERRENO.CAMINO || valor_actual === TERRENO.CAMINO_AGUA) { // Cambiar terreno libre a un tipo de obstáculo aleatorio
        const tipo_terreno = Math.floor(Math.random() * 3) + 1; // Tipo de terreno aleatorio (1: Edificio, 2: Agua, 3: Bloqueo)
        tablero[fila][columna] = tipo_terreno;
    } else {
        tablero[fila][columna] = TERRENO.LIBRE; // Cambiar obstáculo a terreno libre
    }

    if(punto_inicio !== null && punto_fin !== null){ // Recalcular camino si existen puntos de inicio y fin
        calcular_pasos_mostrar_camino(punto_inicio.x, punto_inicio.y, punto_fin.x, punto_fin.y, tablero.length, tablero[0].length); // Recalcular y mostrar camino después de la modificación
    } else{ // Mostrar el tablero actualizado sin camino
        mostrar_tablero(tablero.length, tablero[0].length); // Mostrar el tablero actualizado sin camino
    }    
}

function limpiar_camino_viejo() { //Función para limpiar caminos viejos del tablero antes de recalcular
    for (let y = 0; y < tablero.length; y++) {
        for (let x = 0; x < tablero[y].length; x++) {
            if (tablero[y][x] === TERRENO.CAMINO) {
                tablero[y][x] = TERRENO.LIBRE; // Si es camino normal, lo vuelve libre
            }
            if (tablero[y][x] === TERRENO.CAMINO_AGUA) {
                tablero[y][x] = TERRENO.AGUA; // Si es camino sobre agua, lo vuelve agua
            }
        }
    }
}

function mostrar_tablero(fila, columna) { //Función para mostrar el tablero en la interfaz de usuario
    const contenedorID = document.getElementById('mapaVisual'); // Contenedor del tablero

    contenedorID.style.display = 'grid'; // Usar display grid para el contenedor
    contenedorID.style.gridTemplateColumns = `repeat(${columna}, ${TAMANHO_CELDA}px)`; // Definir columnas del grid
    contenedorID.style.gridTemplateRows = `repeat(${fila}, ${TAMANHO_CELDA}px)`; // Definir filas del grid

    const celdas_existentes = contenedorID.querySelectorAll('.cell'); // Seleccionar todas las celdas existentes

    if(celdas_existentes.length === (fila * columna)){ // Si ya existen las celdas, solo actualizar su contenido
        let i = 0;
        for (let y = 0; y < fila; y++) { // Recorrer filas
            for (let x = 0; x < columna; x++) { // Recorrer columnas
                const celdaDiv = celdas_existentes[i]; // Obtener la celda existente
                const valor_terreno = tablero[y][x]; // Obtener el valor del terreno en la celda
                
                const info = obtener_info_visual(valor_terreno); // Obtener información visual del terreno
                celdaDiv.className = `cell ${info.clase}`; // Actualizar clase de la celda
                celdaDiv.textContent = info.texto; // Actualizar texto de la celda
                i++; // Incrementar índice
            }
        }
    } else{ // Si no existen las celdas, crearlas desde cero
        contenedorID.innerHTML = ''; // Limpiar el contenedor antes de mostrar el tablero

        for (let y = 0; y < fila; y++) { // Recorrer filas
            for (let x = 0; x < columna; x++) { // Recorrer columnas
                const celdaDiv = document.createElement('div'); // Crear div para la celda
                const valor_terreno = tablero[y][x]; // Obtener el valor del terreno en la celda
                const info = obtener_info_visual(valor_terreno); // Obtener información visual del terreno

                celdaDiv.classList.add('cell'); // Añadir clase base 'cell'
                celdaDiv.classList.add(info.clase); // Añadir clase específica del terreno
                celdaDiv.textContent = info.texto; // Establecer texto de la celda

                celdaDiv.dataset.fila = y; // Almacenar fila en el dataset
                celdaDiv.dataset.columna = x; // Almacenar columna en el dataset

                contenedorID.appendChild(celdaDiv); // Añadir celda al contenedor
            }
        }
    }
}

function obtener_info_visual(tipo_terreno) { //Función para obtener la representación visual de un tipo de terreno
    switch (tipo_terreno) {
        case TERRENO.EDIFICIO:
            return { texto: 'X', clase: 'edificio' };
        case TERRENO.AGUA:
            return { texto: 'a', clase: 'agua' };
        case TERRENO.BLOQUEO:
            return { texto: 'B', clase: 'bloqueo' };
        case TERRENO.INICIO:
            return { texto: 'I', clase: 'inicio' };
        case TERRENO.FIN:
            return { texto: 'F', clase: 'fin' };
        case TERRENO.CAMINO:
            return { texto: '*', clase: 'camino' };
        case TERRENO.CAMINO_AGUA:
            return { texto: 'A', clase: 'camino_agua' };
        default:
            return { texto: '.', clase: 'libre' };
    }
}

function limpiar_tablero() { //Función para limpiar el tablero y las coordenadas
    tablero = []; // Reiniciar el tablero
    punto_inicio = null;    // Reiniciar punto de inicio
    punto_fin = null;
    document.getElementById('mapaVisual').textContent = ''; // Limpiar el contenedor del tablero
    document.getElementById('mapaVisual').style.display = 'none'; // Ocultar el contenedor del tablero
    document.getElementById('distancia').innerText = "0 pasos"; // Reiniciar el contador de pasos
    punto_inicio = null;   // Reiniciar punto de inicio
    punto_fin = null; // Reiniciar punto de fin
}   

document.addEventListener('DOMContentLoaded', inicializar); // Ejecutar función principal al cargar el contenido del DOM