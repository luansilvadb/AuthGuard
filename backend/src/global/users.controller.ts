import { Controller, Post, Body } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';

@ApiTags('1-users (cadastro)')
@Controller('users')
export class UsersController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        user.password = await bcrypt.hash(user.password, 10);
        return this.userRepository.save(user);
    }
}