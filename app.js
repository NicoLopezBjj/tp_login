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

})

app.listen(4000, ()=>{
    console.log('servidor ejecutandose')
})