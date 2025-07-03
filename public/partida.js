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

async function soltarPieza(){
  const casillas = document.getElementsByClassName('casilla');
  for (let casilla of casillas){
    casilla.ondragover = function(e){
      e.preventDefault();
    };
    casilla.ondrop = async function(e){
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

      // Guardar estado localmente
      guardarEstado();

      // Enviar el movimiento al servidor
      const res = await fetch('/api/partidas/movimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origen: inicio, destino: salida }),
        credentials: 'include',  // Importante para enviar la cookie de sesión
      });

      const data = await res.json();
      if (!data.success) {
        mostrarError("Error al actualizar el estado en el servidor.");
      }

      turno = (turno === 'blanca') ? 'negra' : 'blanca';
      document.getElementById('cambio').innerText = `Turno pieza ${turno}`;
      DragAndDrop();
    };
  }
}

async function verificarSesion() {
  const res = await fetch('/api/verificar-sesion', { method: 'GET', credentials: 'include' });
  const data = await res.json();

  if (!data.authenticated) {
    window.location.href = '/login';  // Redirige a la página de login si no está autenticado
  }
}

// Verificar sesión al cargar la página
verificarSesion();

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
