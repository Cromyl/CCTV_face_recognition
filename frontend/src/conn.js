// const net = require('net');
import net from 'net';

const client = new net.Socket();
const PORT = 65432; // Make sure this matches the port your server is listening on
const HOST = 'localhost'; // Replace with the server's IP if not running locally

// Connect to the server
client.connect(PORT, HOST, () => {
    console.log('Connected to server');

});

export default client;