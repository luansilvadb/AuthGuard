import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
    @ApiProperty({ example: 'Minha Empresa', description: 'Nome do tenant' })
    name: string;
}