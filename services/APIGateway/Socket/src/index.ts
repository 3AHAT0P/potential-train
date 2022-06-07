import { AMQPAdapter, amqpAdapterInjectionToken } from '@modules/AMQP';
import { MessageContainer } from '@modules/APIGatewayShared';
import { inject, provide } from '@modules/utils/DIContainer';
import { listen } from './socket';

interface Config {
  messageBrokerPath: string;
}

const CONFIG: Config = {
  messageBrokerPath: 'amqp://messagebroker',
};

const sendMessage = async (queueName: string, message: MessageContainer) => {
  const adapter = inject(amqpAdapterInjectionToken);
  const readyToNext = await adapter.sendMessage(queueName, message);
  console.log(" [x] Sent '%s'", message, readyToNext);
};

const initAMQPProvider = async (connectionURL: string): Promise<void> => {
  const adapter = new AMQPAdapter({ connectionURL });

  await adapter.init();

  provide(amqpAdapterInjectionToken, adapter);
}

const main = async (config: Config) => {
  try {
    await initAMQPProvider(config.messageBrokerPath);
    listen();

    const queueName = 'ACTION_FROM_CLIENT';
    const message = <const>{ sessionId: '123', messageType: 'FROM_CLIENT', message: { action: 'SOME_ACTION' } };

    setTimeout(sendMessage, 1000, queueName, message);

    // await adapter.destructor();
  } catch (error) {
    console.error(error);
    throw new Error('!');
  }
};

main(CONFIG).finally(() => console.log('FINAL!'));
