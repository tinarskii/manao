// Common JavaScript functionality for all pages

// Utility to read query param
function getParam(name) {
  const url = new URL(window.location);
  return url.searchParams.get(name);
}

function getPortSync() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/socket.io-port", false);
  try {
    xhr.send();
    return xhr.status === 200 ? xhr.responseText : "3001";
  } catch {
    return "3001";
  }
}


/**
 * Creates a socket.io connection with the correct port
 * @returns {Socket} The socket.io connection
 */
function createSocketConnection() {
  const { origin } = window.location;
  const port = getPortSync();

  console.log(port);
  const socketUrl = origin.endsWith(":3000")
    ? origin.replace("3000", port)
    : origin.concat(":" + port);

  return io(socketUrl);
}
