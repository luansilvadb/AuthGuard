import {
  Controller,
  Post,
  Body,
  ConflictException,
  InternalServerErrorException,
  Logger,
  Get,
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
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('test')
  async test() {
    return { message: 'Users controller is working' };
  }

  @Post('test-create')
  async testCreate(@Body() body: any) {
    this.logger.log(`Test create with body: ${JSON.stringify(body)}`);
    return { message: 'Test endpoint working', received: body };
  }

  @Post('test-validation')
  async testValidation(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Validation test with DTO: ${JSON.stringify(createUserDto)}`);
    return {
      message: 'Validation passed successfully',
      received: createUserDto,
      validationRules: {
        name: 'min 2 characters',
        email: 'valid email format',
        password: 'min 8 chars, 1 lowercase, 1 uppercase, 1 number',
      },
    };
  }

  @Post('create-simple')
  async createSimple(@Body() body: any): Promise<any> {
    this.logger.log(`Creating user with body: ${JSON.stringify(body)}`);
    
    const user = this.userRepository.create({
      email: body.email,
      password: await bcrypt.hash(body.password, 10),
      name: body.name,
    });
    
    try {
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
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

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    const user = this.userRepository.create(createUserDto);
    user.password = await bcrypt.hash(user.password, 10);

    try {
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
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
