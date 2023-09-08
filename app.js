const express = require ('express')
const mysql = require ('mysql')
const path= require ('path')
const session = require ('express-session')
require('dotenv').config()


const app = express ()


// para recibir datos json en los registro
app.use(express.json()) 
// para recibir datos del formulario
app.use(express.urlencoded({extended:false}))

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

app.post('/send',(req,res)=>{
    
    let usuario = req.body.email
    let full_name = req.body.fullname
    let password = req.body.password

    if (usuario && full_name && password){
        conection.query('INSERT INTO username (emailOrPhone,fullName,password) VALUES (?,?,?)',[usuario,full_name,password],(error,resultado,fields)=>{
            if (error) throw error;
            if (resultado.length>0){
                console.log('usuario se registro')
                req.session.loggedin=true
                req.session.username=usuario
            }else{
                console.log('el usuario no se registro')
            }
            res.redirect('/home')
        })
    }else {
        res.redirect ('home')
        res.end()
    }
})

app.listen(4000, ()=>{
    console.log('servidor ejecutandose')
})