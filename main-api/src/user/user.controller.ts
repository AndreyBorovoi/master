import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async createUser(@Body() userDto: UserDto) {
    const user = await this.userService.createUser(userDto);
    return { token: user.token, status: HttpStatus.CREATED };
  }

  @Get('get_token')
  async getToken(@Body() userDto: UserDto) {
    const token = await this.userService.getToken(userDto);
    return { token: token, status: HttpStatus.OK };
  }
}
