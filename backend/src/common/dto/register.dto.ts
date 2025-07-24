import { IsEmail, IsString, IsOptional, MinLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';

/**
 * DTO para registro público de usuário.
 * No onboarding inicial, NÃO envie o campo tenant_id.
 * O tenant será criado/associado após o primeiro login.
 */
export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString({ message: 'First name must be a string' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString({ message: 'Last name must be a string' })
  last_name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    example: 'b3b7c7e2-8e2a-4e2a-9e2a-8e2a4e2a9e2a',
    description: 'Tenant ID (UUID v4). NÃO envie no onboarding inicial.'
  })
  @IsOptional()
  @IsUUID('4', { message: 'Tenant ID must be a valid UUID' })
  tenant_id?: string;

  @ApiPropertyOptional({ example: 'USER' })
  @IsOptional()
  @IsString()
  role?: string;
} 