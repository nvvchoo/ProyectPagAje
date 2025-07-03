let turno = 'blanca';
let numeroMovimiento = 1;

const columnas = ['a','b','c','d','e','f','g','h'];
const filas = ['8','7','6','5','4','3','2','1'];

function numeroCasillas(){
  const tablero = document.getElementsByClassName('tablero')[0];
  const filasTablero = tablero.getElementsByClassName('fila');
  for (let i = 0; i < filasTablero.length; i++){
    const casillas = filasTablero[i].getElementsByClassName('casilla');
    for (let j = 0; j < casillas.length; j++){
      casillas[j].setAttribute('data-pos', columnas[j] + filas[i]);
    }
  }
}

function esMovimientoValido(pieza, origen, destino) {
  const color = pieza.classList.contains('pieza-blanca') ? 'blanca' : 'negra';
  const tipo = pieza.textContent.trim();

  const columnaIndex = columnas.indexOf(origen[0]);
  const filaIndex = filas.indexOf(origen[1]);
  const columnaDestino = columnas.indexOf(destino[0]);
  const filaDestino = filas.indexOf(destino[1]);

  const filaDiff = filaDestino - filaIndex;
  const colDiff = Math.abs(columnaDestino - columnaIndex);

  if (tipo === '♙' || tipo === '♟') {
    if (color === 'blanca') {
      if (colDiff === 0 && (filaDiff === -1 || (filaIndex === 6 && filaDiff === -2))) return true;
      if (colDiff === 1 && filaDiff === -1) return true;
    } else {
      if (colDiff === 0 && (filaDiff === 1 || (filaIndex === 1 && filaDiff === 2))) return true;
      if (colDiff === 1 && filaDiff === 1) return true;
    }
    return false;
  }
  return true;
}

function obtenerColorPieza(elementoPieza) {
  if (!elementoPieza) return null;
  if (elementoPieza.classList.contains('pieza-blanca')) return 'blanca';
  if (elementoPieza.classList.contains('pieza-negra')) return 'negra';
  return null;
}

function DragAndDrop(){
  const piezas = document.getElementsByClassName('pieza');
  for (let pieza of piezas){
    pieza.setAttribute('draggable', true);

    pieza.ondragstart = function(e){
      const color = pieza.classList.contains('pieza-blanca') ? 'blanca' : 'negra';
      if (color !== turno){
        e.preventDefault();
        return;
      }

      e.dataTransfer.setData('text/plain', pieza.outerHTML);
      pieza.parentNode.classList.add('origen');

      const origenPos = pieza.parentNode.getAttribute('data-pos');
      limpiarColoresCasillas(); 
      resaltarCasillasValidas(pieza, origenPos); 
    };

    pieza.ondragend = function() {
      limpiarColoresCasillas();
    };
  }
}


function mostrarError(msg) {
  const divError = document.getElementById('mensaje-error');
  divError.textContent = msg;
  setTimeout(() => {
    divError.textContent = '';
  }, 3000);
}

function soltarPieza(){
  const casillas = document.getElementsByClassName('casilla');
  for (let casilla of casillas){
    casilla.ondragover = function(e){
      e.preventDefault();
    };
    casilla.ondrop = function(e){
      e.preventDefault();

      const origen = document.getElementsByClassName('origen')[0];
      if (!origen) return;

      const piezahtml = e.dataTransfer.getData('text/plain');
      const pieza = origen.getElementsByClassName('pieza')[0];
      const destinoPieza = casilla.getElementsByClassName('pieza')[0];

      const inicio = origen.getAttribute('data-pos');
      const salida = casilla.getAttribute('data-pos');

      const colorOrigen = obtenerColorPieza(pieza);
      const colorDestino = obtenerColorPieza(destinoPieza);

      if (!esMovimientoValido(pieza, inicio, salida)) {
        mostrarError("Movimiento inválido");
        origen.classList.remove('origen');
        return;
      }

      if (destinoPieza && colorDestino !== colorOrigen) {
        const bandeja = document.getElementById('bandeja-capturadas');
        const piezaCapturada = destinoPieza.cloneNode(true);
        piezaCapturada.style.fontSize = '28px';
        piezaCapturada.style.opacity = '0';
        piezaCapturada.style.margin = '2px';

        if (colorDestino === 'blanca') {
          piezaCapturada.classList.add('pieza-blanca');
          piezaCapturada.classList.remove('pieza-negra');
        } else if (colorDestino === 'negra') {
          piezaCapturada.classList.add('pieza-negra');
          piezaCapturada.classList.remove('pieza-blanca');
        }

        bandeja.appendChild(piezaCapturada);

        setTimeout(() => {
          piezaCapturada.style.transition = 'opacity 0.5s ease';
          piezaCapturada.style.opacity = '1';
        }, 10);
      }

      if (destinoPieza && colorDestino === colorOrigen) {
        origen.classList.remove('origen');
        return;
      }

      origen.innerHTML = '';
      casilla.innerHTML = piezahtml;
      origen.classList.remove('origen');

      registrarMovimiento(inicio, salida);

      turno = (turno === 'blanca') ? 'negra' : 'blanca';
      document.getElementById('cambio').innerText = `Turno pieza ${turno}`;
      DragAndDrop();

      guardarEstado();
    };
  }
}

function registrarMovimiento(origen, destino){
  const columnaDerecha = document.getElementsByClassName('columna-derecha')[0];
  const lista = columnaDerecha.getElementsByTagName('ul')[0];

  let textoMovimiento = '';
  if (turno === 'blanca'){
    textoMovimiento = `${numeroMovimiento}B: ${origen} a ${destino}`;
  } else{
    textoMovimiento = `${numeroMovimiento}N: ${origen} a ${destino}`;
  }

  const items = lista.getElementsByTagName('li');
  let itemEncontrado = null;

  for (let i = 0; i < items.length; i++){
    if (items[i].getAttribute('data-movimiento') == numeroMovimiento) {
      itemEncontrado = items[i];
      break;
    }
  }

  if (itemEncontrado){
    itemEncontrado.innerText += `\n${textoMovimiento}`;
  } else{
    const nuevo = document.createElement('li');
    nuevo.setAttribute('data-movimiento', numeroMovimiento);
    nuevo.innerText = textoMovimiento;
    lista.appendChild(nuevo);
  }

  if (turno === 'negra'){
    numeroMovimiento++;
  }
}

function guardarEstado() {
  const tablero = document.getElementsByClassName('tablero')[0];
  const estado = {
    tableroHTML: tablero.innerHTML,
    turno,
    numeroMovimiento
  };
  localStorage.setItem('estadoPartida', JSON.stringify(estado));
}

function cargarEstado() {
  const estadoJSON = localStorage.getItem('estadoPartida');
  if (!estadoJSON) return false;
  const estado = JSON.parse(estadoJSON);
  const tablero = document.getElementsByClassName('tablero')[0];
  tablero.innerHTML = estado.tableroHTML;
  turno = estado.turno;
  numeroMovimiento = estado.numeroMovimiento;
  document.getElementById('cambio').innerText = `Turno pieza ${turno}`;
  numeroCasillas();
  DragAndDrop();
  soltarPieza();
  return true;
}

function resaltarCasillasValidas(pieza, origenPos) {
limpiarColoresCasillas();
const casillas = document.getElementsByClassName('casilla');
const tipo = pieza.textContent.trim();
const color = pieza.classList.contains('pieza-blanca') ? 'blanca' : 'negra';

const col = origenPos[0];
const fila = origenPos[1];
const colIdx = columnas.indexOf(col);
const filaIdx = filas.indexOf(fila);

function pintarSiValida(colIndex, filaIndex) {
if (colIndex < 0 || colIndex > 7 || filaIndex < 0 || filaIndex > 7) return;
const pos = columnas[colIndex] + filas[filaIndex];
const casilla = document.querySelector(`[data-pos="${pos}"]`);
if (!casilla) return;
const piezaDestino = casilla.querySelector('.pieza');
if (!piezaDestino || obtenerColorPieza(piezaDestino) !== color) {
casilla.style.backgroundColor = '#d8b4f8';
}
}

if (tipo === '♙' || tipo === '♟') {
const direccion = (color === 'blanca') ? -1 : 1;
const filaUno = filaIdx + direccion;
const filaDos = filaIdx + direccion * 2;
const filaInicial = (color === 'blanca') ? 6 : 1;

if (filaUno >= 0 && filaUno < 8) {
const adelante = document.querySelector(`[data-pos="${columnas[colIdx]}${filas[filaUno]}"]`);
if (adelante && adelante.innerText.trim() === '') {
adelante.style.backgroundColor = '#d8b4f8';
if (filaIdx === filaInicial) {
const adelante2 = document.querySelector(`[data-pos="${columnas[colIdx]}${filas[filaDos]}"]`);
if (adelante2 && adelante2.innerText.trim() === '') {
adelante2.style.backgroundColor = '#d8b4f8';
}
}
}
}


for (let dir of [-1, 1]) {
pintarSiValida(colIdx + dir, filaUno);
}
}

else if (tipo === '♖' || tipo === '♜') {

const direcciones = [[1,0], [-1,0], [0,1], [0,-1]];
for (let [dx, dy] of direcciones) {
for (let i = 1; i < 8; i++) {
const nx = colIdx + dx * i;
const ny = filaIdx + dy * i;
if (nx < 0 || nx > 7 || ny < 0 || ny > 7) break;
const pos = columnas[nx] + filas[ny];
const casilla = document.querySelector(`[data-pos="${pos}"]`);
if (!casilla) break;
const piezaDestino = casilla.querySelector('.pieza');
if (!piezaDestino) {
casilla.style.backgroundColor = '#d8b4f8';
} else {
if (obtenerColorPieza(piezaDestino) !== color) {
casilla.style.backgroundColor = '#d8b4f8';
}
break;
}
}
}
}

else if (tipo === '♗' || tipo === '♝') {
const direcciones = [[1,1], [1,-1], [-1,1], [-1,-1]];
for (let [dx, dy] of direcciones) {
for (let i = 1; i < 8; i++) {
const nx = colIdx + dx * i;
const ny = filaIdx + dy * i;
if (nx < 0 || nx > 7 || ny < 0 || ny > 7) break;
const pos = columnas[nx] + filas[ny];
const casilla = document.querySelector(`[data-pos="${pos}"]`);
if (!casilla) break;
const piezaDestino = casilla.querySelector('.pieza');
if (!piezaDestino) {
casilla.style.backgroundColor = '#d8b4f8';
} else {
if (obtenerColorPieza(piezaDestino) !== color) {
casilla.style.backgroundColor = '#d8b4f8';
}
break;
}
}
}
}

else if (tipo === '♘' || tipo === '♞') {
const movimientos = [
[1, 2], [2, 1], [-1, 2], [-2, 1],
[1, -2], [2, -1], [-1, -2], [-2, -1]
];
for (let [dx, dy] of movimientos) {
pintarSiValida(colIdx + dx, filaIdx + dy);
}
}

else if (tipo === '♕' || tipo === '♛') {
const direcciones = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
for (let [dx, dy] of direcciones) {
for (let i = 1; i < 8; i++) {
const nx = colIdx + dx * i;
const ny = filaIdx + dy * i;
if (nx < 0 || nx > 7 || ny < 0 || ny > 7) break;
const pos = columnas[nx] + filas[ny];
const casilla = document.querySelector(`[data-pos="${pos}"]`);
if (!casilla) break;
const piezaDestino = casilla.querySelector('.pieza');
if (!piezaDestino) {
casilla.style.backgroundColor = '#d8b4f8';
} else {
if (obtenerColorPieza(piezaDestino) !== color) {
casilla.style.backgroundColor = '#d8b4f8';
}
break;
}
}
}
}

else if (tipo === '♔' || tipo === '♚') {
const movimientos = [
[1, 0], [-1, 0], [0, 1], [0, -1],
[1, 1], [1, -1], [-1, 1], [-1, -1]
];
for (let [dx, dy] of movimientos) {
pintarSiValida(colIdx + dx, filaIdx + dy);
}
}
}

function limpiarColoresCasillas() {
  const casillas = document.getElementsByClassName('casilla');
  for (let casilla of casillas) {
    casilla.style.backgroundColor = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!cargarEstado()) {
    numeroCasillas();
    DragAndDrop();
    soltarPieza();
  }

  document.getElementById('nuevo-btn').addEventListener('click', () => {
    localStorage.removeItem('estadoPartida');
    window.location.reload();
  });

  document.getElementById('btn-rendirse').addEventListener('click', () => {
    window.location.href = 'crearlobby.html'; 
  });

  document.getElementById('btn-empatar').addEventListener('click', () => {
    document.getElementById('mensaje-final').textContent = 'Has empatado';
  });
});
