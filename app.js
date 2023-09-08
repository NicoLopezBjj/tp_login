const express = require ('express')
const mysql = require ('mysql')
const path= require ('path')


const app = express ()


app.get('/home', (req,res)=>{
    res.send('<h1>Hola mundo</h1>')
})

app.listen(4000, ()=>{
    console.log('servidor ejecutandose')
})