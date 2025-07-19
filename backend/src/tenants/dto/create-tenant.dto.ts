import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches, IsOptional, IsNumber } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Minha Empresa',
    description: 'Nome da organização/tenant',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome deve conter apenas letras e espaços',
  })
  name: string;

  @ApiProperty({
    example: 1,
    description: 'ID do tenant pai (opcional - para criar sub-tenants)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do tenant pai deve ser um número' })
  parentTenantId?: number;
}
