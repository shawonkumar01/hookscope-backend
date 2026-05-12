import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private publisher: Redis;
  private subscriber: Redis;

  constructor(private config: ConfigService) {
    const options = {
      host: this.config.get('REDIS_HOST'),
      port: this.config.get<number>('REDIS_PORT'),
    };
    this.publisher = new Redis(options);
    this.subscriber = new Redis(options);
  }

  onModuleDestroy() {
    this.publisher.disconnect();
    this.subscriber.disconnect();
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.publisher.publish(channel, message);
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) callback(message);
    });
  }

  subscribePattern(
    pattern: string,
    callback: (channel: string, message: string) => void,
  ): void {
    this.subscriber.psubscribe(pattern);
    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      callback(channel, message);
    });
  }
}
