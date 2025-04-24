// Common JavaScript functionality for all pages

/**
 * Creates a socket.io connection with the correct port
 * @returns {Socket} The socket.io connection
 */
function createSocketConnection() {
  const origin = window.location.origin;
  const socketUrl = origin.endsWith(":3000")
    ? origin.replace("3000", "3001")
    : origin.concat(":3001");

  return io(socketUrl);
}
