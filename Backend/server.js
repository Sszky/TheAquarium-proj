const http = require("http");
const app = require("./app");
const { initSockets } = require("./sockets");

const server = http.createServer(app);
initSockets(server);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Port ${PORT} up`));
