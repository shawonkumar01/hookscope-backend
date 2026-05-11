import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Endpoint } from '../endpoints/endpoint.entity';

@Entity('requests')
export class WebhookRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Endpoint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'endpoint_id' })
  endpoint!: Endpoint;

  @Column()
  endpointId!: string;

  @Column()
  method!: string;

  @Column({ type: 'jsonb' })
  headers!: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceIp!: string | null;

  @Column({ type: 'varchar', nullable: true })
  contentType!: string | null;

  @CreateDateColumn()
  receivedAt!: Date;
}
