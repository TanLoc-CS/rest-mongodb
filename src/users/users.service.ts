import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from "bcrypt"
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { encodePassword } from './utils /bcrypt/bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }
  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    if ((await this.userModel.find({ username: username })).length !== 0)
      throw new HttpException('This username has been used', HttpStatus.UNAUTHORIZED);
    if ((await this.userModel.find({ email: email })).length !== 0)
      throw new HttpException('This email has been used', HttpStatus.UNAUTHORIZED);

    const newUser = createUserDto;
    newUser.password = encodePassword(password);
    return new this.userModel(newUser).save();
  }

  async getAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  async getById(id: string) {
    const user = await this.userModel.find({ _id: id });
    if (user.length === 0)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.getById(id);
    if (user.length === 0)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    updateUserDto.password = encodePassword(updateUserDto.password);
    return this.userModel.updateOne({ _id: id }, { $set: { ...updateUserDto } });
  }

  async remove(id: string, password: string) {
    const user = await this.userModel.find({ _id: id });
    if (user.length === 0)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const key = await bcrypt.compare(password, user[0]?.password);
    if (!key)
      throw new HttpException('Wrong password', HttpStatus.FORBIDDEN)
    return this.userModel.deleteOne({ _id: id });
  }
}
