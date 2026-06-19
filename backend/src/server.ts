import app from './app';
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.io
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
