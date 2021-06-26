const http= require('http')
const WebSocketServer= require('websocket').server
let clients= []

const httpServer= http.createServer(() => {})
httpServer.listen(1337, () => {
    console.log('http server listening at port 1337')
})

const wsServer= new WebSocketServer({
    httpServer: httpServer
})



wsServer.on('request', request => {
    const connection= request.accept()
    const id= Math.floor(Math.random() * 100)
    console.log('request recieved')
    
    clients.forEach(client => client.connection.send(JSON.stringify({
        client: id,
        text: 'I am connected'
        })
    ))

    clients.push({ connection, id })

    connection.on('message', message => {
        console.log('message',message)
        clients
            .filter(client => client.id !== id)
            .forEach(client => client.connection.send(JSON.stringify({
                client: id,
                text: message.utf8Data
            })
        ))
    })

    connection.on('close', () => {
        console.log('closing')
        clients= clients.filter(client => client.id !== id)
        clients.forEach(client => client.connection.send(JSON.stringify({
                client: id,
                text: 'I am leaving'
            })
        ))
    })
})