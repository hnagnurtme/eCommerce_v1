'use strict'
const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const _seconds = 5000

//count connect
const countConnect = () =>{
    const countConnection = mongoose.connections.length()
    console.log(`Number of connection : ${countConnection}`)
}

//count overload
const checkOverload = () =>{
    setInterval( () => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus.length;
        const memmoryUsed = process.memoryUsage().rss;

        console.log(`Memmoryuse : ${ memmoryUsed / 1024 / 1024} MB`);
        console.log(`Actice connection ${numConnection}`)
        const maxConnections = numCores*5;

        if(numConnection > maxConnections){
            console.log('Connection Overload Detected')
        }
    },_seconds)
}

module.exports = { countConnect, checkOverload}