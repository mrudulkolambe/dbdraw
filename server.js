const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/api/socket',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-board', (boardId) => {
      socket.join(boardId);
      console.log(`User ${socket.id} joined board ${boardId}`);
    });

    socket.on('leave-board', (boardId) => {
      socket.leave(boardId);
      console.log(`User ${socket.id} left board ${boardId}`);
    });

    socket.on('node-change', (data) => {
      socket.to(data.boardId).emit('node-updated', data);
    });

    socket.on('edge-change', (data) => {
      socket.to(data.boardId).emit('edge-updated', data);
    });

    socket.on('collection-added', (data) => {
      socket.to(data.boardId).emit('collection-created', data);
    });

    socket.on('collection-deleted', (data) => {
      socket.to(data.boardId).emit('collection-removed', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
