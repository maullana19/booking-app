import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserRole } from './enums/user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // CRUD Method
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Bcrypt password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Instance Entity
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.first_name,
      lastName: createUserDto.last_name,
      phone: createUserDto.phone,
      dateOfBirth: createUserDto.date_of_birth,
      role: UserRole.GUEST,
    });

    return this.usersRepository.save(user);
  }

  // View All
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // View By UUID
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id: ${id} is not found.`);
    }

    return user;
  }

  // FindByEmail
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // Update
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: { id: string; role: string },
  ): Promise<User> {
    // Checking Access
    if (id !== currentUser.id && currentUser.role !== 'admin') {
      throw new ForbiddenException('You can only edit your own profile.');
    }

    const user = await this.findOne(id);

    // 2. Pisahkan field yang boleh diubah
    const { password, ...rest } = updateUserDto;

    // 3. Hash password If any
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // 4. Merge hanya field yang diizinkan
    //    (role, email, isActive TIDAK ada di UpdateUserDto)
    this.usersRepository.merge(user, rest);

    return this.usersRepository.save(user);
  }

  // Delete
  async remove(
    id: string,
    currentUser: { id: string; role: string },
  ): Promise<void> {
    if (id !== currentUser.id && currentUser.role !== 'admin') {
      throw new ForbiddenException('You just only delete on your account');
    }
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  // Verify Email
  // async verifyEmail(token: string): Promise<User> {

  //   const payload = await this.verifyEmailToken(token);

  //   const user = await this.usersRepository.findOne({
  //     where: { id: payload.userId },
  //   });
  //   if (!user) throw new NotFoundException('User tidak ditemukan');

  //   user.emailVerified = true;
  //   user.role = UserRole.CUST;

  //   return this.usersRepository.save(user);
  // }
}
