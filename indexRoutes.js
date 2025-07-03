const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: String,
  contraseña: String
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { nombreUsuario, contraseña } = req.body;

  const usuario = await Usuario.findOne({ nombreUsuario });
  if (!usuario) return res.json({ success: false, message: 'Usuario no encontrado' });

  const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
  if (!coincide) return res.json({ success: false, message: 'Contraseña incorrecta' });

  req.session.usuario_id = usuario._id;
  res.json({ success: true });
});

// Cierre de sesión
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/index.html');
  });
});

module.exports = router;