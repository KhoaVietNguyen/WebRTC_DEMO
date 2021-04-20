import IO from 'socket.io-client';
import Peer from 'react-native-peerjs';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ID } from './authActions';

/** Web RTC */
import { mediaDevices, MediaStream } from 'react-native-webrtc';
import { ADD_REMOTE_STREAM, ADD_STREAM, ALL_USERS, MY_STREAM } from './types';

//** API_URI */
export const API_URI = `http://192.168.50.32:5000`;

// const peerServer = new Peer(undefined, {
//   host: "https://0.peerjs.com/",
//   secure: false,
//   port: 5000,
//   path: '/mypeer'
// })

export var peerServer = new Peer()

peerServer.on('error', console.log);
// const peerServer = new Peer(undefined, {
//   secure: false,
//   config: {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//   },
// });

//** Socket Config */
export const socket = IO(`${API_URI}`, {
  forceNew: true
})

socket.on("connect", () => {
  console.log(socket.id);
});

export const joinRoom = (stream) => async (dispatch) => {
  peerServer = new Peer()
  const roomID = '123456';

  dispatch({ type: MY_STREAM, payload: stream });

  peerServer.on('open', function (peerID) {
    console.log('peerID', peerID)
    socket.emit("join-room", {
      peerID, roomID,
    })
  })

  socket.on('user-connected', (peerID) => {
    connectToNewUser(peerID, stream, dispatch)
  })

  peerServer.on('call', function (call) {
    call.answer(stream);
    //stream back the call
    // call.on('stream', (stream) => {
    //   console.log('RemotePeerID', stream)
    //   dispatch({
    //     type: ADD_STREAM,
    //     payload: stream,
    //   })
    // })
  })
}

function connectToNewUser(peerID, stream, dispatch) {

  console.log('LocalPeerID', peerID.peerID)

  peerServer.call(peerID.peerID, stream).on('stream', (remoteStream) => {
    console.log('remoteStream', remoteStream)
    if (remoteStream) {
      dispatch({
        type: ADD_REMOTE_STREAM,
        payload: remoteStream
      })
    }
  })
}

// const peerServer = new Peer({
//   secure: false,
//   config: {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//   },
// });



// peerServer.on('open', function (id) {
//   console.log('My peer ID is: ' + id);
// });


// socket.on("connect", () => {
//   console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
// });



// export const joinGeneralRoom = () => async (dispatch) => {
//   console.log("join room")
//   socket.emit("join-general-room", 'ajsdflajslkdfuaisfjwioerwqiheriyqw87ery');
// };

// export const localStream = () => async (dispatch) => {
//   return stream.toURL()
// }


// export const userJoin = () => async (dispatch, getState) => {
//   const roomID = 'active_room_id'
//   const allUsersRoomID = "fsdfsdfsdfsdfffhfsd"
//   const { user, allUsers } = getState().auth

//   socket.emit("user-exits", { user, socketID: socket.id })

//   socket.on("user-found", (currentUser) => {
//     if (currentUser) {
//       socket.emit('update-user', {
//         user,
//         socketID: socket.id,
//         allUsersRoomID,
//       })
//     } else {
//       socket.emit('user-join', { user, socketID: socket.id, allUsersRoomID, })
//     }
//   })

//   socket.on('activeUsers', user => {
//     const eUsers = allUsers.map(({ email }) => email)
//     const fUsers = user.map(({ email, name, socketID, uid, _id }) => {
//       if (!eUsers.includes(email)) {
//         return {
//           email, name, socketID, uid, _id
//         }
//       }
//     }).filter(data => data !== undefined);
//     dispatch({ type: ALL_USERS, payload: fUsers })

//   })

//   socket.on('new-user-join', user => {
//     dispatch({ type: "ADD_NEW_USER", payload: user })
//   })
// };

// Stream Actions
// export const joinStream = (stream) => async (dispatch, getState) => {
//   const { user } = getState().auth;
//   const roomID = 'stream_general_room';

//   dispatch({ type: MY_STREAM, payload: stream });

//   dispatch({
//     type: ADD_STREAM,
//     payload: {
//       stream,
//       ...user
//     }
//   })

//   peerServer.on('open', function (peerID) {
//     console.log('peerID', peerID)
//     socket.emit("join-stream-room", {
//       roomID,
//       peerID,
//       socketID: socket.id,
//       user
//     })
//     console.log('peerID', peerID)
//   })

//   socket.on("user-connected", ({ peerID, user, roomID, socketID }) => {
//     connectToNewUser(peerID, user, roomID, socketID, stream)
//   })


//   // Recieve a call

//   peerServer.on('call', function (call) {

//     call.answer(stream)
//     //stream back the call
//     call.on('stream', (remoteStreams) => {
//       console.log('RemotePeerID', remoteStreams)
//       dispatch({
//         type: ADD_STREAM,
//         payload: {
//           stream: remoteStreams,
//           name: `user_${ID()}`,
//           uid: `id_${ID()}`,
//           email: 'k@gmail.com'
//         }
//       })
//     })
//   })
// };

// function connectToNewUser({ peerID, user, roomID, socketID, stream }) {
//   console.log('LocalPeerID', peerID)
//   const call = peerServer.call(peerID, stream)

//   call.on('stream', (lastuserstream) => {
//     if (lastuserstream) {
//       dispatch({
//         type: ADD_REMOTE_STREAM,
//         payload: {
//           stream, lastuserstream, ...user
//         }

//       })
//     }
//   })
// }


// export const disconnect = () => async () => {
//   //peerServer.disconnect();
// };

// export const stream = () => async (dispatch) => {
//   let isFront = true;
//   mediaDevices.enumerateDevices().then((sourceInfos) => {
//     let videoSourceId;
//     for (let i = 0; i < sourceInfos.length; i++) {
//       const sourceInfo = sourceInfos[i];
//       if (
//         sourceInfo.kind == 'videoinput' &&
//         sourceInfo.facing == (isFront ? 'front' : 'environment')
//       ) {
//         videoSourceId = sourceInfo.deviceId;
//       }
//     }

//     mediaDevices
//       .getUserMedia({
//         audio: false,
//         video: {
//           mandatory: {
//             minWidth: 500,
//             minHeight: 300,
//             minFrameRate: 30,
//           },
//           facingMode: isFront ? 'user' : 'environment',
//           optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
//         },
//       })
//       .then((stream) => {
//         dispatch(joinStream(stream));
//         console.log("stream", stream.toURL())
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   });
//};
