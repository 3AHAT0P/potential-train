import { AMQPAdapter } from '../modules/AMQP';

interface Config {
  messageBrokerPath: string;
}

const CONFIG: Config = {
  messageBrokerPath: 'amqp://messagebroker',
};

const main = async (config: Config) => {
  try {
    const adapter = new AMQPAdapter({ connectionURL: config.messageBrokerPath });

    await adapter.init();

    const queueName = 'ACTION_FROM_CLIENT';
    const message = { action: 'SOME_ACTION' };

    const readyToNext = await adapter.sendMessage(queueName, message);
    console.log(" [x] Sent '%s'", message, readyToNext);

    await adapter.destructor();
  } catch (error) {
    console.error(error);
    throw new Error('!');
  }
};

main(CONFIG).finally(() => console.log('FINAL!'));
