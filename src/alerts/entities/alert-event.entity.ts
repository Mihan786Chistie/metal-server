import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Alert } from './alert.entity';

@Entity('alert_event')
export class AlertEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  alertId: string;

  @ManyToOne(() => Alert)
  @JoinColumn({ name: 'alertId' })
  alert: Alert;

  @Column({ type: 'jsonb' })
  eventPayload: any;

  @Column({ default: false })
  acknowledged: boolean;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
