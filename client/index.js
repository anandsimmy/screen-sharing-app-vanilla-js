const videoElement= document.getElementById('video')
const startButton= document.getElementById('start')

startButton.addEventListener('click', async () => {
    const stream= await window.navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    videoElement.srcObject= stream
    video.play()
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