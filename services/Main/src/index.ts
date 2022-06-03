import { AMQPAdapter } from '../modules/AMQP';

interface Config {
  messageBrokerPath: string;
}

const CONFIG: Config = {
  messageBrokerPath: 'amqp://messagebroker',
};

const onActionFromClientRecieve = (msg: any): void => {
  console.log(" [x] Received '%s'", msg.content.toString());
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
