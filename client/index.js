const myVideo= document.getElementById('my-video')
const userVideo= document.getElementById('user-video')
const startButton= document.getElementById('start')

const MESSAGE_TYPE= {
    SDP: 'SDP',
    CANDIDATE: 'CANDIDATE',
}

startButton.addEventListener('click', async () => {
    const signaling= new WebSocket('ws://127.0.0.1:1337')

    // adding audio and video tracks to peer connection
    const stream= await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    myVideo.srcObject= stream

    createPeerConnection(signaling, stream)
})

const createPeerConnection= (signaling, stream) => {
    // creating peer connection
    const peerConnection= new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.test.com:19000' }]
    })

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))

    addMessageHandler(signaling, peerConnection)

    peerConnection.onnegotiationneeded= () => {
        createAndSendOffer(signaling, peerConnection)
    }

    peerConnection.onicecandidate= (iceEvent) => {
        signaling.send(
            JSON.stringify({
                message_type: MESSAGE_TYPE.CANDIDATE,
                content: iceEvent.candidate
        }))
    }

    peerConnection.ontrack= (event) => {
        if(!userVideo.srcObject){
            userVideo.srcObject= event.streams[0]
        }
    }
}

const addMessageHandler= (signaling, peerConnection) => {
    signaling.onmessage= async (message) => {
        console.log(message)
        message= JSON.parse(message.data)
        const { message_type, content }= JSON.parse(message.text)
        if(message_type === MESSAGE_TYPE.SDP){
            if(content.type === 'offer'){
                await peerConnection.setRemoteDescription(content)
                const answer= await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answer)
                signaling.send(
                    JSON.stringify({
                        message_type: MESSAGE_TYPE.SDP,
                        content: answer
                    })
                )
            }
            else if(content.type ==='answer'){
                peerConnection.setRemoteDescription(content)
            }
        }else if(message_type === MESSAGE_TYPE.CANDIDATE){
            peerConnection.addIceCandidate(content)
        }
    }

}

const createAndSendOffer= async (signaling, peerConnection) => {
    // creating SDP offer (Session Description Protocol)
    const offer= await peerConnection.createOffer()

    // setting local description
    await peerConnection.setLocalDescription(offer)

    // sending offer
    signaling.send(
        JSON.stringify({
            message_type: MESSAGE_TYPE.SDP,
            content: offer
        })
    )
}