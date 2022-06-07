import { MessageContainer } from '@modules/APIGatewayShared';
import { AMQPAdapter } from '@modules/AMQP';

interface Config {
  messageBrokerPath: string;
}

const CONFIG: Config = {
  messageBrokerPath: 'amqp://messagebroker',
};

const onActionFromClientRecieve = (messageContainer: MessageContainer): void => {
  console.log(" [x] Received '%s'", messageContainer);
};

const main = async (config: Config) => {
  try {
    const adapter = new AMQPAdapter({ connectionURL: config.messageBrokerPath });

    await adapter.init();

    const queueName = 'ACTION_FROM_CLIENT';

    await adapter.consume(queueName, onActionFromClientRecieve, { noAck: true });

    console.log(' [*] Waiting for messages. To exit press CTRL+C');
  } catch (error) {
    console.error(error);
    throw new Error('!');
  }
};

main(CONFIG).finally(() => console.log('FINAL!'));
