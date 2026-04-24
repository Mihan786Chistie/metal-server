import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}