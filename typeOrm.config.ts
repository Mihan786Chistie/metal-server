import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    host: configService.getOrThrow('POSTGRES_HOST'),
    port: configService.getOrThrow('POSTGRES_PORT'),
    database: configService.getOrThrow('POSTGRES_DB'),
    username: configService.getOrThrow('POSTGRES_USERNAME'),
    password: configService.getOrThrow('POSTGRES_PASSWORD'),
    entities: ['src/**/entities/*.entity.ts'],
    migrations: ['migrations/*.ts'],
    synchronize: false,
});