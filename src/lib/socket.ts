import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

const initSocket = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-board', (boardId: string) => {
        socket.join(boardId);
        console.log(`User ${socket.id} joined board ${boardId}`);
      });

      socket.on('leave-board', (boardId: string) => {
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

    res.socket.server.io = io;
  }
  return res.socket.server.io;
};

export default initSocket;
