import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name: string;

  @ApiProperty({ example: 'user@email.com', description: 'E-mail do usuário' })
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter ao menos 1 letra minúscula, 1 maiúscula e 1 número'
  })  password: string;
}
