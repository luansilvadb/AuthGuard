import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@email.com', description: 'E-mail do usuário' })
    email: string;

    @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
    password: string;

    @ApiProperty({ example: 'João Silva', description: 'Nome do usuário' })
    name: string;
}