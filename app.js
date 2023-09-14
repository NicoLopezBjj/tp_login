const express = require ('express')
const mysql = require ('mysql')
const path= require ('path')
const session = require ('express-session')
const bodyParser = require ('body-parser')
require('dotenv').config()


const app = express ()


// para recibir datos json en los registro
app.use(express.json()) 
// para recibir datos del formulario
app.use(bodyParser.urlencoded({extended:false}))

// files static
app.use(express.static(path.join(__dirname,'public')))

// para configurar DataBase
const dbConfig={
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

const conection =mysql.createConnection(dbConfig)

conection.connect((error)=>{
    if (error){
        console.log('error al conectar',error)
    }else{
        console.log('conexion existosa')
    }
})

// gestion de sesiones
app.use(session({
    secret:'secreto',
    resave:true,
    saveUninitialized:true
}))

// peticiones
app.get('/home', (req,res)=>{
    res.sendFile(path.join(__dirname,'/public/index.html'))
})

app.get('/send', (req,res) =>{
    res.sendFile(path.join(__dirname, '/public/send.html'))
})

//peticion para insertar usuario en sing up
app.post('/send', async (req, res) => {
    try {
        let usuario = req.body.email;
        let full_name = req.body.fullname;
        let password = req.body.password;

        // Verificar que todos los campos estan presentes
        if (!usuario || !full_name || !password) {
            return res.status(400).send('Todos los campos son obligatorios. Por favor vuelva a la pagina principal <a href="index.html">Click aqui para volver.</a>');
        }

        // Verificacion de email
        const emailCount = await getEmailCount(usuario);

        if (emailCount > 0) {
            return res.status(400).send('El correo electrónico ya está en uso. Por favor, vuelva a la pagina principal y elija otro.');
        }

        // Ingresar un nuevo usuario
        if (usuario && full_name && password) {
            const insertResult = await insertUsuario(usuario, full_name, password);

            if (insertResult.affectedRows > 0) {
                console.log('usuario se registro');
                req.session.loggedin = true;
                req.session.username = usuario;
            } else {
                console.log('el usuario no se registro');
            }
            res.redirect('/send');
        } else {
            res.redirect('home');
            res.end();
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno en el servidor.');
    }
});

// Función para obtener el recuento de correos electrónicos duplicados
function getEmailCount(email) {
    return new Promise((resolve, reject) => {
        conection.query('SELECT COUNT(*) AS count FROM usuarios WHERE email_phone = ?', [email], (error, rows) => {
            if (error) {
                console.error(error);
            } else {
                resolve(rows[0].count);
            }
        });
    });
}

// Función para insertar un nuevo usuario
function insertUsuario(email, fullName, password) {
    return new Promise((resolve, reject) => {
        conection.query('INSERT INTO usuarios (email_phone, full_name, password) VALUES (?, ?, ?)', [email, fullName, password], (error, resultado) => {
            if (error) {
                console.error(error);
            } else {
                resolve(resultado);
            }
        });
    });
}

//peticion para usuario ya registrado sing in
app.post('/sign-in.html', async (req, res) => {
    try {
        let usuario = req.body.email;
        let password = req.body.password;

        // Verificar que ambos campos estén presentes
        if (!usuario || !password) {
            return res.status(400).send('Todos los campos son obligatorios. Por favor, vuelva a la pagina principal <a href="index.html">Click aqui para volver.</a>');
        }

        // Verificar si el usuario y la contraseña coinciden
        const user = await getUser(usuario, password);

        if (user) {
            req.session.loggedin = true;
            req.session.username = usuario;
            return res.redirect('/send'); 
        } else {
            return res.status(401).send('Datos incorrectos. Por favor, inténtelo de nuevo. <a href="sign-in.html">Click aqui para volver a intentar.</a>');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno en el servidor.');
    }
});

// Función para obtener un usuario por email y contraseña
function getUser(email, password) {
    return new Promise((resolve, reject) => {
        conection.query('SELECT * FROM usuarios WHERE email_phone = ? AND password = ?', [email, password], (error, rows) => {
            if (error) {
                console.error(error);
                resolve(null);
            } else {
                resolve(rows[0]);
            }
        });
    });
}

app.listen(4000, ()=>{
    console.log('servidor ejecutandose')
})
