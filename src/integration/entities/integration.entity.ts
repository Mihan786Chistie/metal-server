import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  omBotToken: string;

  @Column()
  slackTeamId: string;

  @Column()
  slackBotToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => User, (user) => user.integration, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
