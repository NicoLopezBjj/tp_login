const express = require ('express')
const mysql = require ('mysql')
const path= require ('path')
const session = require ('express-session')


const app = express ()

// para recibir datos json en los registro
app.use(express.json()) 
// para recibir datos del formulario
app.use(express.urlencoded({extended:false}))

app.use(express.static(path.join(__dirname,'public')))

app.get('/home', (req,res)=>{
    res.sendFile(path.join(__dirname,'/public/index.html'))
})

app.listen(4000, ()=>{
    console.log('servidor ejecutandose')
})