import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(userDto: UserDto): Promise<User> {
    if (await this.checkUsername(userDto.username)) {
      throw new HttpException(
        { text: 'Username already exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user: User = {
      username: userDto.username,
      password: bcrypt.hashSync(userDto.password, 1),
      token: jwt.sign({ username: userDto.username }, 'secret'),
    };

    const newUser = new this.userModel(user);
    await newUser.save();

    return newUser;
  }

  async getToken(userDto: UserDto) {
    if (!(await this.checkUsername(userDto.username))) {
      throw new HttpException(
        { text: 'Username do not exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel.findOne({ username: userDto.username });

    if (bcrypt.compareSync(userDto.password, user.password)) {
      return user.token;
    } else {
      throw new HttpException(
        { text: 'Wrong username or password' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async checkUsername(username: string) {
    return Boolean(await this.userModel.findOne({ username }));
  }
}
