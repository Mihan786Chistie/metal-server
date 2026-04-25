import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }
  async create(createUserDto: CreateUserDto) {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) throw new BadRequestException('Email already exists');

    const user = await this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    return user;
  }

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: any) {
    return await this.userRepository.update(
      { id: userId },
      { hashedRefreshToken },
    );
  }

  async findOneWithToken(id: string) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'name', 'hashedRefreshToken'],
    });
  }

  async getPublicProfile(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email'],
    });
  }
}
