import { MessageContainer } from '@modules/APIGatewayShared';
import { logerror, logwarn } from '@modules/utils/Logger';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { deleteSessionQueue, sendSystemMessageToMain, subscribeToClientMessageFromMain } from './InternalTransport';

export interface ClientConnection {
  socket: Socket;
}

const clients: Map<string, ClientConnection> = new Map();

const onNewClientConnect = async (socket: Socket) => {
  const sessionId = socket.id;
  clients.set(sessionId, { socket });
  const unsubscribe = await subscribeToClientMessageFromMain(sessionId, ({ message }: MessageContainer) => {
    socket.to(sessionId).emit('MESSAGE', message);
  });
  await sendSystemMessageToMain(sessionId, 'CONNECTED');

  socket.on('disconnect', async (reason: string) => {
    try {
      clients.delete(sessionId);
      await unsubscribe();
      await sendSystemMessageToMain(sessionId, 'DISCONNECTED');
      await deleteSessionQueue(sessionId);
      logwarn('Socket::disconnect', `Client is disconnected with reason: ${reason}`);
    } catch (error) {
      logerror('Socket::disconnect', error);
    }
  });
};

export const listen = () => {
  const transport: Server = new Server({ serveClient: false });

  transport.on('connection', onNewClientConnect);

  transport.listen(8888);
  transport.engine.generateId = uuidv4;
};
