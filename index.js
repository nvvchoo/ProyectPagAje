const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Conectar a MongoDB
mongoose.connect('mongodb+srv://Ignacio:Leucoton1470@cluster0.n0tkldp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
})
.then(() => {
  console.log('Conexión exitosa a MongoDB Atlas')
})
.catch(err => {
  console.error('Error conectando a MongoDB', err)
});

// Configuración de Handlebars
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware de session
app.use(session({
  secret: 'mi_clave_secreta',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Cambia a true si usas https
}));

// Servir archivos estáticos
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Modelo de Usuario
const UsuarioSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Ruta de login
app.post('/index', async (req, res) => {
  const { username, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ username, password });
    if (!usuario) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>');
    }
    req.session.usuario_id = usuario._id;
    res.render('welcome', { username });
  } catch (err) {
    console.error('Error al buscar usuario:', err);
    res.send('Error interno del servidor');
  }
});

// Ruta de logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/login');
  });
});

// Middleware para verificar si el usuario está logueado
function asegurarseAutenticado(req, res, next) {
  if (!req.session.usuario_id) {
    return res.redirect('/login');
  }
  next();
}

// Rutas de juego protegidas
app.get('/pantalla', asegurarseAutenticado, (req, res) => {
  res.render('pantalla');
});

app.get('/partida', asegurarseAutenticado, (req, res) => {
  res.render('partida');
});

app.get('/partidapriv', asegurarseAutenticado, (req, res) => {
  res.render('partidapriv');
});

// Otras vistas
app.get('/desarrolladores', (req, res) => {
  res.render('desarrolladores');
});
app.get('/historia', (req, res) => {
  res.render('historia');
});
app.get('/historial', (req, res) => {
  res.render('historial');
});

// Ruta de inicio
app.get('/', (req, res) => {
  res.redirect('/index');
});

app.get('/index', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Iniciar servidor
app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor corriendo en el puerto 3000');
});
