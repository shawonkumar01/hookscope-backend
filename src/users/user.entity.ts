import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum Plan {
  FREE = 'free',
  PRO = 'pro',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: Plan, default: Plan.FREE })
  plan!: Plan;

  @CreateDateColumn()
  createdAt!: Date;
}
