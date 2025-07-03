const Partida = require('../models/Partida');  // Modelo de Partida
const Usuario = require('../models/Usuario');  // Modelo de Usuario

// Crear partida pública
exports.crearPartidaPublica = async (req, res) => {
  const jugador1Id = req.session.usuario_id;  // ID del jugador 1 (obtenido de la sesión del usuario)

  try {
    // Crear una nueva partida pública
    const nuevaPartida = new Partida({
      nombre: 'Partida Pública',
      jugador1: jugador1Id,
      resultado: 'en_curso',
      jugadores: '1/2',  // Indica que un jugador está en la partida
      tipo: 'publica',  // Especifica que es una partida pública
    });

    // Guardar la nueva partida en la base de datos
    await nuevaPartida.save();

    // Respuesta exitosa
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la partida pública' });
  }
};

// Crear partida privada
exports.crearPartidaPrivada = async (req, res) => {
  const jugador1Id = req.session.usuario_id;  // ID del jugador 1 (obtenido de la sesión del usuario)

  try {
    // Crear una nueva partida privada
    const nuevaPartida = new Partida({
      nombre: 'Partida Privada',
      jugador1: jugador1Id,
      resultado: 'en_curso',
      jugadores: '1/2',  // Indica que un jugador está en la partida
      tipo: 'privada',  // Especifica que es una partida privada
    });

    // Guardar la nueva partida en la base de datos
    await nuevaPartida.save();

    // Respuesta exitosa
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la partida privada' });
  }
};

// Obtener las partidas del usuario (partidas en las que está involucrado)
exports.obtenerPartidas = async (req, res) => {
  try {
    const usuarioId = req.session.usuario_id;  // Obtener el ID del usuario desde la sesión

    // Buscar las partidas en las que el usuario esté involucrado (como jugador1 o jugador2)
    const partidas = await Partida.find({
      $or: [{ jugador1: usuarioId }, { jugador2: usuarioId }]
    }).populate('jugador1 jugador2');  // Poblar los detalles de los jugadores (si es necesario)

    // Devolver las partidas encontradas
    res.json(partidas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las partidas' });
  }
};

// Unirse a una partida
exports.unirseAPartida = async (req, res) => {
  const partidaId = req.params.id;  // Obtener el ID de la partida a la que se va a unir
  const usuarioId = req.session.usuario_id;  // Obtener el ID del usuario que quiere unirse

  try {
    // Buscar la partida por su ID
    const partida = await Partida.findById(partidaId);

    if (!partida) {
      return res.status(404).json({ error: 'Partida no encontrada' });  // Si no existe la partida
    }

    // Verificar si la partida ya tiene dos jugadores
    if (partida.jugador2) {
      return res.status(400).json({ error: 'La partida ya está completa' });  // Ya hay dos jugadores en la partida
    }

    // Asignar al usuario como jugador2
    partida.jugador2 = usuarioId;
    await partida.save();  // Guardar la partida actualizada

    // Respuesta exitosa
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al unirse a la partida' });
  }
};

// Obtener información de una partida específica (para jugar en línea)
exports.obtenerPartida = async (req, res) => {
  const partidaId = req.params.id;  // ID de la partida

  try {
    // Buscar la partida por ID
    const partida = await Partida.findById(partidaId).populate('jugador1 jugador2');

    if (!partida) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    // Retornar la información de la partida
    res.json(partida);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la partida' });
  }
};

// Actualizar el estado de la partida (por ejemplo, los movimientos)
exports.actualizarPartida = async (req, res) => {
  const partidaId = req.params.id;
  const { movimientos, resultado } = req.body;  // Obtener los movimientos y el resultado de la partida

  try {
    // Buscar la partida por ID
    const partida = await Partida.findById(partidaId);

    if (!partida) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    // Actualizar los movimientos y el resultado
    partida.movimientos = movimientos;
    partida.resultado = resultado;

    // Guardar la partida actualizada
    await partida.save();

    // Responder con la partida actualizada
    res.json({ success: true, partida });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la partida' });
  }
};
