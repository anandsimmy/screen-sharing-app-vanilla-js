const videoElement= document.getElementById('video')
const startButton= document.getElementById('start')

startButton.addEventListener('click', async () => {
    const signaling= new WebSocket('ws://127.0.0.1:1337')

    // creating peer connection
    const peerConnection= new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.test.com:19000' }] })

    // adding audio and video tracks to peer connection
    const stream= await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))
    // videoElement.srcObject= stream
    // video.play()

    // creating SDP offer
    const offer= await peerConnection.createOffer()

    // setting local description
    await peerConnection.setLocalDescription(offer)

    // sending offer
    signaling.send(JSON.stringify({ message_type: MESSAGE_TYPE.SDP, content: offer }))
})

let connection;

document.addEventListener('click', (event) => {
    switch(event.target.id){
        case 'connect':
            createSocketConnection();
            break;
        case 'start':
            connection.send('hello')
            break;
        case 'close':
            connection.close()
            break;
    }
})

const createSocketConnection= () => {
    connection= new WebSocket('ws://127.0.0.1:1337')

    connection.onopen= () => {
        connection.send('I joined')
    }

    connection.onerror= () => {
        console.log('error occured');
    }

    connection.onmessage= (message) => {
        data= JSON.parse(message.data)
        console.log(`${data.client} says ${data.text}`);
    }

}