import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { MemberRole } from '../member.entity';

export class CreateMemberDto {
  @ApiProperty({ example: 'Alice Johnson' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alice@ops.dev' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: MemberRole, example: MemberRole.MEMBER })
  @IsEnum(MemberRole)
  role: MemberRole;

  @ApiPropertyOptional({ example: 'https://i.pravatar.cc/150?u=alice' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
