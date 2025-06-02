import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ParseEmailDto {
  @IsString({ message: 'Email content must be a string.' })
  @IsNotEmpty({ message: 'Email content cannot be empty.' })
  email: string;
}