import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token-here' })
  @IsString({ message: 'Refresh token must be a string' })
  refresh_token: string;
} 