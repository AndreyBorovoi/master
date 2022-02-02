import { Length, IsString } from 'class-validator';

export class UserDto {
  @Length(5, 20)
  @IsString()
  username: string;

  @Length(6, 20)
  @IsString()
  password: string;
}
