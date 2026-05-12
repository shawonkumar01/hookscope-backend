const { io } = require('socket.io-client');

console.log('Attempting to connect...');

const socket = io('http://localhost:3001', {
  transports: ['polling'],
  reconnection: false,
  path: '/socket.io',
});

socket.on('connect', () => {
  console.log('Connected! Socket ID:', socket.id);
  socket.emit('join_room', { slug: 'vRSw57HpdYX2' });
});

socket.on('joined', (data) => {
  console.log('Joined room:', data);
});

socket.on('new_request', (data) => {
  console.log('NEW WEBHOOK RECEIVED:');
  console.log(JSON.stringify(data, null, 2));
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.log('Connection error:', err.message);
  console.log('Description:', err.description);
});