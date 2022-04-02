import { Model } from 'mongoose';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { User, UserDocument } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser({ username, password }: UserDto): Promise<User> {
    if (await this.checkUsername(username)) {
      throw new HttpException(
        { text: 'Username already exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user: User = {
      username: username,
      password: bcrypt.hashSync(password, 1),
      token: sign({ username: username }, 'secret'),
    };

    const newUser = new this.userModel(user);
    await newUser.save();

    return newUser;
  }

  async getToken({ username, password }: UserDto) {
    const user = await this.getUserByName(username);

    if (user === null || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException();
    }

    return user.token;
  }

  async getUserByToken(token: string) {
    return await this.userModel.findOne({ token: token });
  }

  async getUserByName(username: string) {
    return await this.userModel.findOne({ username });
  }

  async checkUsername(username: string) {
    return Boolean(await this.getUserByName(username));
  }
}
