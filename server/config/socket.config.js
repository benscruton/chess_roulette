module.exports = socket => {
  socket.on("joinRoom", roomName => {
    socket.join(roomName);
  });
  socket.on("leaveRoom", roomName => {
    socket.leave(roomName);
  });
  socket.on("madeAMove", data => {
    socket.to(data.gameId).emit("newMoveCameIn", data);
  });
  socket.on("newPlayer", data => {
    socket.to(data.gameId).to("lobby").emit("playerUpdate", data);
  });
  socket.on("startGame", game => {
    socket.to(game._id).emit("gameBegun", game);
  });
  socket.on("finishGame", game => {
    socket.to(game._id).emit("gameFinished", game);
  });
  socket.on("gameDeleted", gameId => {
    socket.to(gameId).to("lobby").emit("removeGame", gameId);
  });
  socket.on("gameCreated", game => {
    socket.to("lobby").emit("addGameToList", game);
  });
  socket.on("updateDraw", game => {
    socket.to(game._id).emit("drawOfferUpdate", game);
  });
  // socket.on("disconnect", () => {});
};