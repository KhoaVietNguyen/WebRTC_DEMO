const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { ExpressPeerServer } = require("peer");
const mongoose = require("mongoose");
const config = require("config");

const app = express();

app.use(express.json())

const server = http.createServer(app);

const io = socketio(server).sockets;

//** Peer Server */
const customGenerationFunction = () =>
  (Math.random().toString(36) + "0000000000000000000").substr(2, 16);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/",
  generateClientId: customGenerationFunction,
});

app.use("/mypeer", peerServer);



//** Config */
// const db = config.get("mongoURI");
// // const db = mongoose.createConnection(uri)
// const Active = require('./schema/Active')


// mongoose.connect(db, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   useFindAndModify: true
// })
//   .then(() => console.log(`MongoDB connected`))
//   .catch((err) => console.log(err))

//* Websocket *//
io.on("connection", socket => {
  socket.on('join-room', ({ peerID, roomID }) => {
    console.log("peerID", peerID)
    socket.join(roomID)
    socket.to(roomID).broadcast.emit('user-connected', { peerID })
  })

  // socket.on("join-general-room", roomID => {
  //   console.log("Room connected", roomID)
  //   socket.join(roomID)

  // });

  // socket.on("user-exits", ({ user, socketID }) => {
  //   console.log("User connected", user)
  //   Active.findOne({ email: user.email })
  //     .then((user) => {
  //       io.in(socketID).emit('user-found', user);
  //     })

  //   socket.on('update-user', ({ user, socketID, allUserRoomID }) => {
  //     socket.join(allUserRoomID);

  //     Active.findByIdAndUpdate(
  //       { email: user.email },
  //       { $set: { socketID } },
  //       { new: true },
  //       (err, doc) => {
  //         if (doc) {
  //           Active.find({}).then(allUsers => {
  //             const otherUsers = allUsers.filter(({ email: otherEmails }) => otherEmails !== user.email)
  //             io.in(socketID).emit('activeUsers', otherUsers)
  //           })
  //         }
  //       }
  //     )
  //     socket.to(allUserRoomID)
  //       .broadcast.emit('new-user-join', [{ ...user, socketID }])
  //   })

  //   socket.on('user-join', ({ user, socketID, allUserRoomID }) => {

  //     socket.join(allUserRoomID);

  //     const active = new Active({ ...user, socketID })

  //     Active.findOne({ email: user.email }).then(user => {
  //       if (!user) {
  //         active.save().then(({ email }) => {
  //           Active.find({}).then(users => {
  //             const otherUsers = users.filter(({ email: otherEmails }) => otherEmails !== email)
  //             io.in(socketID).emit('activeUsers', otherUsers);

  //           })
  //         })
  //       } else {
  //         socket.to(allUserRoomID).broadcast.emit('new-user-join', user);
  //       }
  //     })
  //   })

  // })

  // socket.on('join-stream-room', ({ roomID, peerID, socketID, user }) => {
  //   socket.join(roomID)

  //   socket.to(roomID).broadcast.emit('user-connected', {
  //     peerID, user, roomID, socketID
  //   })
  // })
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server started on port ${port}`));
