import { Column, Entity, PrimaryColumn } from "typeorm";

export type RecipientType = 'channel' | 'user' | 'group';

export type Header = {
    title?: string;
}

export type MessageField = {
    key: string;
    value: string;
}

export type ActionButton = {
    id: string;
    label: string;
    type: 'ack' | 'ai' | 'link';
    payload?: any;
};

export type MessageLayout = {
    header?: Header;
    sections: MessageField[];
    buttons?: ActionButton[];
}

@Entity('om_alert')
export class Alert {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    href: string;

    @Column({ type: 'timestamptz' })
    updatedAt: Date;

    @Column()
    updatedBy: string;

    @Column()
    alertType: string;

    @Column({ type: 'enum', enum: ['channel', 'user', 'group'] })
    recipientType: RecipientType;

    @Column()
    recipients: string;

    @Column({ default: false })
    enabled: boolean;

    @Column()
    integrationId: string;

    @Column({
        type: 'jsonb',
        default: [],
    })
    messageLayout: MessageLayout[];
}

