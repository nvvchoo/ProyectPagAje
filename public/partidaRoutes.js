const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');

// Crear partida pública
router.post('/publica', partidaController.crearPartidaPublica);

// Crear partida privada
router.post('/privada', partidaController.crearPartidaPrivada);

// Obtener todas las partidas del usuario
router.get('/', partidaController.obtenerPartidas);

// Unirse a una partida
router.post('/unirse/:id', partidaController.unirseAPartida);

// Obtener detalles de una partida específica
router.get('/:id', partidaController.obtenerPartida);

// Actualizar los movimientos y el estado de la partida
router.post('/actualizar/:id', partidaController.actualizarPartida);

module.exports = router;
