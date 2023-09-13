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

app.get('/send', (req,res) =>{{
    res.sendFile(path.join(__dirname, '/public/send.html'))
}})

app.post('/send',(req,res)=>{
    
    let usuario = req.body.email
    let full_name = req.body.fullname
    let password = req.body.password

    // Verificar que todos los campos estan presentes
    if (!usuario || !full_name || !password){
        return res.status(400).send('Todos los campos son obligatorios. Por favor vuelva a la pagina principal (/home)')
    }


    // Ingresar un nuevo usuario
    if (usuario && full_name && password){
        conection.query('INSERT INTO usuarios (email_phone,full_name,password) VALUES (?,?,?)',[usuario,full_name,password],(error,resultado,fields)=>{
            if (error) throw error;
            if (resultado.affectedRows>0){
                console.log('usuario se registro')
                req.session.loggedin=true
                req.session.username=usuario
            }else{
                console.log('el usuario no se registro')
            }
            res.redirect('/send')
        })
    }else {
        res.redirect ('home')
        res.end()
    }
})

app.listen(4000, ()=>{
    console.log('servidor ejecutandose')
})
