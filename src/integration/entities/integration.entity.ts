import { User } from 'src/user/entities/user.entity';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { encrypt } from '../util/crypt';

function isEncrypted(value: string): boolean {
    return value.includes(':') && value.split(':').length === 2;
}

@Entity()
export class Integration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    omBotToken: string;

    @Column({ nullable: true })
    slackTeamId: string;

    @Column({ nullable: true })
    slackBotToken: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => User, (user) => user.integration, { cascade: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @BeforeInsert()
    @BeforeUpdate()
    encryptTokens() {
        if (this.slackBotToken && !isEncrypted(this.slackBotToken)) {
            this.slackBotToken = encrypt(this.slackBotToken);
        }

        if (this.omBotToken && !isEncrypted(this.omBotToken)) {
            this.omBotToken = encrypt(this.omBotToken);
        }
    }
}