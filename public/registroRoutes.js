router.post('/register', async (req, res) => {
  const { nombre, mail, contraseña } = req.body;
  //validar que todos los campos estén completos
  if (!nombre || !mail || !contraseña){
    return res.json({ success: false, message: 'Todos los campos son obligatorios' });
  }
  //validar que el nombre de usuario no esté en uso
  const usuarioExistente = await Usuario.findOne({ nombre });
  if (usuarioExistente) {
    return res.json({ success: false, message: 'El usuario ya existe' });
  }
  //validar que el mail no esté en uso
  const mailExistente = await Usuario.findOne({ mail });
  if (mailExistente){
    return res.json({ success: false, message: 'El correo ya está registrado' });
  }
  //hashea la contraseña para que se vuelva segura
  const contraseñaHash = await bcrypt.hash(contraseña, 10);
  //crea un nuevo usuario con los datos proporcionados
  const nuevoUsuario = new Usuario({ nombre, mail, contraseña: contraseñaHash
  });
  //guarda el nuevo usuario en la base de datos
  await nuevoUsuario.save();
  //envía una respuesta de EXITO
  res.json({ success: true });
});

module.exports = router;