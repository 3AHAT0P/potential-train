import amqp, { Channel, Connection } from 'amqplib';

import { sleep } from '../utils/sleep';

export interface AMQPAdapterOptions {
  connectionURL: string;
  retries?: number;
  delay?: number;
}

export class AMQPAdapter {
  private _connectionURL: string;

  private _retries: number = 5;

  private _delay: number = 10;

  private _connection!: Connection;

  private _channel!: Channel;

  private _isReady: boolean = false;

  private async _waitAMQPConnection(): Promise<Connection> {
    for (let retriesLeft = this._retries; retriesLeft > 0; retriesLeft -= 1) {
      try {
        return await amqp.connect(this._connectionURL);
      } catch (error) {
        console.log(`Retries left: ${retriesLeft}`);
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

  public async sendMessage(queueName: string, message: any) {
    if (!this._isReady) throw new Error('Adapter is not ready!');

    await this._channel.assertQueue(queueName, { durable: false });

    return this._channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }

  public async consume(
    queueName: string,
    onMessage: (msg: amqp.ConsumeMessage | null) => void,
    options?: amqp.Options.Consume,
  ) {
    if (!this._isReady) throw new Error('Adapter is not ready!');

    await this._channel.assertQueue(queueName, { durable: false });

    return this._channel.consume(queueName, onMessage, options);
  }

  async destructor() {
    this._isReady = false;
    await this._channel.close();
    await this._connection.close();
  }
}
