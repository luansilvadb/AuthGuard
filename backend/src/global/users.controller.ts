import {
  Controller,
  Post,
  Body,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { AppMessages } from '../common/messages'; // Import AppMessages

interface PostgresError {
  code: string;
  detail: string;
}

@ApiTags('1-users (cadastro)')
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    user.password = await bcrypt.hash(user.password, 10);
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as PostgresError;
        if (driverError && driverError.code === '23505') {
          // Unique violation
          throw new ConflictException(AppMessages.USER_EMAIL_ALREADY_EXISTS);
        }
      }
      throw new InternalServerErrorException(AppMessages.INTERNAL_SERVER_ERROR); // Generic error for others
    }
  }
}
