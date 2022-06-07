import amqp, { Channel, Connection } from 'amqplib';

import { sleep } from '../utils/sleep';
import { logerror, loginfo, logwarn } from '../utils/Logger';
import { MessageContainer } from '../APIGatewayShared';
import type { InjectionToken } from '../utils/DIContainer';

export interface AMQPAdapterOptions {
  connectionURL: string;
  retries?: number;
  delay?: number;
}

export class AMQPAdapter {
  private _connectionURL: string;

  private _retries: number = 5;

  private _delay: number = 10 * 1000;

  private _connection!: Connection;

  private _channel!: Channel;

  private _isReady: boolean = false;

  private async _waitAMQPConnection(): Promise<Connection> {
    for (let retriesLeft = this._retries; retriesLeft > 0; retriesLeft -= 1) {
      try {
        const connection = await amqp.connect(this._connectionURL);
        loginfo('AMQPAdapter::_waitAMQPConnection', 'Connected!');
        return connection;
      } catch (error) {
        logwarn('AMQPAdapter::_waitAMQPConnection', `Retries left: ${retriesLeft}`);
        await sleep(this._delay);
      }
    }
    throw new Error('AMQP Transport is not available!');
  }

  constructor(options: AMQPAdapterOptions) {
    this._connectionURL = options.connectionURL;
    if (options.retries != null) this._retries = options.retries;
    if (options.delay != null) this._delay = options.delay;

    this.destructor = this.destructor.bind(this);
  }

  public async init() {
    this._connection = await this._waitAMQPConnection();

    this._channel = await this._connection.createChannel();

    process.once('SIGINT', this.destructor);
    process.once('SIGTERM', this.destructor);

    this._isReady = true;
  }

  public async sendMessage(queueName: string, message: MessageContainer) {
    if (!this._isReady) throw new Error('Adapter is not ready!');

    await this._channel.assertQueue(queueName, { durable: false });

    return this._channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }

  public async deleteQueue(queueName: string) {
    await this._channel.deleteQueue(queueName);
  }

  public async consume(
    queueName: string,
    onMessage: (messageContainer: MessageContainer) => void,
    options?: amqp.Options.Consume,
  ) {
    if (!this._isReady) throw new Error('Adapter is not ready!');

    await this._channel.assertQueue(queueName, { durable: false });

    let consumerTag: string | null = null;

    const messageNormalizer = (msg: amqp.ConsumeMessage | null): void => {
      if (msg == null) {
        logwarn('AMQPAdapter::messageNormalizer', 'message is null');
        if (consumerTag != null) {
          this._channel.cancel(consumerTag)
            .then(() => {
              loginfo('AMQPAdapter::messageNormalizer', 'Consumer canceled');
            }).catch((error) => {
              logerror('AMQPAdapter::messageNormalizer', error);
            });
        } else logerror('AMQPAdapter::messageNormalizer', 'consumerTag is null');
        return;
      }
      const messageContainer: MessageContainer = JSON.parse(msg.content.toString());
      // const messageMeta = {
      //   fields: msg.fields,
      //   properties: msg.properties,
      // };

      onMessage(messageContainer);
    };

    consumerTag = (await this._channel.consume(queueName, messageNormalizer, options)).consumerTag;

    return consumerTag;
  }

  public async subscribe(
    queueName: string,
    onMessage: (messageContainer: MessageContainer) => void,
    options?: amqp.Options.Consume,
  ) {
    const consumerTag = await this.consume(queueName, onMessage, options);
    return async () => { await this._channel.cancel(consumerTag); };
  }

  async destructor() {
    this._isReady = false;
    await this._channel.close();
    await this._connection.close();
  }
}

export const amqpAdapterInjectionToken: InjectionToken<AMQPAdapter> = {
  id: Symbol('AMQPAdapter'),
  guard(value: unknown): value is AMQPAdapter {
    return value instanceof AMQPAdapter;
  },
};
