import { ActionFromClient, MessageContainer } from '@modules/APIGatewayShared';
import { amqpAdapterInjectionToken } from '@modules/AMQP';
import { inject } from '@modules/utils/DIContainer';
import { logwarn } from '@modules/utils/Logger';

export const sendFromClientMessageToMain = async (sessionId: string, message: ActionFromClient): Promise<void> => {
  const queueName = `ACTION_FROM_CLIENT=>${sessionId}`;
  const adapter = inject(amqpAdapterInjectionToken);
  const readyToNext = await adapter.sendMessage(queueName, {
    sessionId,
    message,
    messageType: 'FROM_CLIENT',
  });

  if (!readyToNext) logwarn('IternalTransport::sendFromClientMessageToMain', `Queue ${queueName} is not ready`);
};

export const deleteSessionQueue = async (sessionId: string): Promise<void> => {
  const queueName = `ACTION_FROM_CLIENT=>${sessionId}`;
  const adapter = inject(amqpAdapterInjectionToken);
  await adapter.deleteQueue(queueName);
};

export const sendSystemMessageToMain = async (sessionId: string, message: 'CONNECTED' | 'DISCONNECTED'): Promise<void> => {
  const queueName = 'SYSTEM';
  const adapter = inject(amqpAdapterInjectionToken);
  const readyToNext = await adapter.sendMessage(queueName, {
    sessionId,
    message,
    messageType: 'SYSTEM',
  });
  if (!readyToNext) logwarn('IternalTransport::sendSystemMessageToMain', `Queue ${queueName} is not ready`);
};

export const subscribeToClientMessageFromMain = (
  sessionId: string,
  onMessageRecieve: (messageContainer: MessageContainer) => void,
): Promise<() => Promise<void>> => { // eslint-disable-line function-paren-newline
  const queueName = `ACTION_TO_CLIENT=>${sessionId}`;
  const adapter = inject(amqpAdapterInjectionToken);
  return adapter.subscribe(queueName, onMessageRecieve);
};
