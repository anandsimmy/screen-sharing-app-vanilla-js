const http= require('http')
const WebSocketServer= require('websocket').server
let clients= []
const peersByCode= {}

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
        const { code }= JSON.parse(message.utf8Data)
        console.log('peers', peersByCode[code]);
        if(!peersByCode[code]){
            peersByCode[code]= [{ connection, id }]
        } else if (!peersByCode[code].find(peer => peer.id === id)){
            peersByCode[code].push({ connection, id })
        }
        peersByCode[code]
            .filter(peer => peer.id !== id)
            .forEach(peer => peer.connection.send(JSON.stringify({
                peer: id,
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
