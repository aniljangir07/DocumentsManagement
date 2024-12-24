import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { Users } from 'src/common/entity/user.entity';
import { ResponseService } from 'src/common/responsive.service';
import { EmailDto, OtpDto, PasswordDto, SignInDto, SignupUserDto, UpdateProfileDto } from './dto/signupUser.dto';
import { calculateTimeDiffInMinutes, generateOtp, hashPassword } from 'src/common/utils';
import { generateToken } from 'src/common/utils';

interface DecodedToken {
      id: string;
}


@Injectable()
export class UserService {

      constructor(
            @InjectRepository(Users)
            private readonly userRepository: Repository<Users>,
            private readonly responsiveService: ResponseService
      ) { }

      signupUser = async (req, res, next, body: SignupUserDto): Promise<object> => {
            try {
                  const { fullName, email, password } = body;

                  const lowerCaseEmail = email.toLowerCase();

                  const existingUser = await this.userRepository.findOne({ where: { email: lowerCaseEmail } });

                  if (existingUser) {
                        if (existingUser.otp && existingUser.otpExpiry && !existingUser.isVerified) {
                              await this.userRepository.delete({ email: lowerCaseEmail });

                              const hashedPassword = await hashPassword(password);
                              const { otp, otpExpiry } = generateOtp(1);

                              const newUser = this.userRepository.create({
                                    fullName,
                                    email: lowerCaseEmail,
                                    password: hashedPassword,
                                    otp: otp,
                                    otpExpiry: otpExpiry,
                                    isVerified: false
                              });

                              let registeredUser = await this.userRepository.save(newUser);
                              delete registeredUser.password
                              delete registeredUser.role
                              delete registeredUser.isVerified

                              return this.responsiveService.sendSuccessResponse(res, registeredUser, 'User successfully registered! Please verify OTP.');
                        } else {
                              throw new Error('User already registered.');
                        }
                  }

                  const hashedPassword = await hashPassword(password);
                  const { otp, otpExpiry } = generateOtp(1);

                  const newUser = this.userRepository.create({
                        fullName,
                        email: lowerCaseEmail,
                        password: hashedPassword,
                        otp: otp,
                        otpExpiry: otpExpiry,
                        isVerified: false
                  });

                  let registeredUser = await this.userRepository.save(newUser);

                  return this.responsiveService.sendSuccessResponse(res, registeredUser, 'User successfully registered! Please verify OTP.');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      verifyOtp = async (req, res, next, body: OtpDto): Promise<object> => {
            try {
                  const { email, OTP } = body;

                  const lowerCaseEmail = email.toLowerCase();
                  const existingUser = await this.userRepository
                        .createQueryBuilder("user")
                        .where("user.email = :email", { email })
                        .andWhere("user.otp IS NOT NULL")
                        .getOne();

                  if (!existingUser) {
                        throw new Error('User not found');
                  }

                  const currentTime = new Date();
                  const otpExpiryTime = existingUser.otpExpiry;

                  const timeDiff = calculateTimeDiffInMinutes(currentTime, otpExpiryTime);

                  if (timeDiff > 60) {
                        const { otp, otpExpiry } = generateOtp(1);

                        existingUser.otp = otp;
                        existingUser.otpExpiry = otpExpiry;

                        await this.userRepository.save(existingUser);

                        return this.responsiveService.sendSuccessResponse(res, null, 'OTP has expired. A new OTP has been sent to your email.');
                  }

                  if (existingUser.otp === OTP) {
                        existingUser.otp = null;
                        existingUser.otpExpiry = null;

                        existingUser.isVerified = true;

                        await this.userRepository.save(existingUser);

                        return this.responsiveService.sendSuccessResponse(res, null, 'OTP verified successfully!');
                  } else {
                        return this.responsiveService.sendBadRequest(res, 'Invalid OTP');
                  }
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      forgetPassword = async (req, res, next, body: EmailDto): Promise<object> => {
            try {
                  let { email } = body;

                  email = email.toLowerCase()

                  const user = await this.userRepository.findOne({ where: { email } });

                  if (!user) {
                        return this.responsiveService.sendBadRequest(res, 'User not found');
                  }

                  const { otp, otpExpiry } = generateOtp(1); //Passing 1 hour

                  user.otp = otp;
                  user.otpExpiry = otpExpiry;

                  await this.userRepository.save(user);

                  return this.responsiveService.sendSuccessResponse(res, null, 'OTP sent to your email');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      changePassword = async (req, res, next, body: PasswordDto): Promise<object> => {
            try {
                  let { password, confirmPassword, email, otp } = body;

                  email = email.toLowerCase();

                  const user = await this.userRepository.findOne({ where: { email } });

                  if (!user) {
                        return this.responsiveService.sendBadRequest(res, 'User not found');
                  }

                  if (user.otp !== otp) {
                        return this.responsiveService.sendBadRequest(res, 'Invalid OTP');
                  }

                  if (new Date() > new Date(user.otpExpiry)) {
                        return this.responsiveService.sendBadRequest(res, 'OTP has expired');
                  }

                  if (password !== confirmPassword) {
                        return this.responsiveService.sendBadRequest(res, 'Password and confirm password should be the same');
                  }

                  const hashedPassword = await bcrypt.hash(password, 10);
                  user.password = hashedPassword;

                  user.otp = undefined;
                  user.otpExpiry = undefined;

                  user.otp = null
                  user.otpExpiry = null

                  await this.userRepository.save(user);

                  return this.responsiveService.sendSuccessResponse(res, null, 'Password updated successfully');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      signIn = async (req, res, next, body: SignInDto): Promise<object> => {
            try {
                  const { email, password } = body;

                  const emailLower = email.toLowerCase();
                  const user = await this.userRepository.findOne({ where: { email: emailLower } });

                  if (!user) {
                        return this.responsiveService.sendBadRequest(res, 'User not found');
                  }

                  const isPasswordValid = await bcrypt.compare(password, user.password);
                  if (!isPasswordValid) {
                        return this.responsiveService.sendBadRequest(res, 'Invalid credentials');
                  }

                  delete user.password
                  delete user.otpExpiry
                  delete user.otp

                  const token = generateToken((user.id).toString(), user.email, user.role);

                  this.responsiveService.sendSuccessResponse(res, { ...user, token }, 'Successfully login.');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      updateUserProfile = async (
            req,
            res,
            next,
            body: UpdateProfileDto,
      ): Promise<object> => {
            try {
                  const {userId} = req.user

                  const user = await this.userRepository.findOne({ where: { id:userId } });

                  if (!user) {
                        throw new NotFoundException(`User with ID ${userId} not found`);
                  }

                  Object.assign(user, body);

                  const updatedUser = await this.userRepository.save(user);

                  delete updatedUser.password;
                  delete updatedUser.otpExpiry;
                  delete updatedUser.otp;

                  return this.responsiveService.sendSuccessResponse(
                        res,
                        { ...updatedUser},
                        'Profile updated successfully.',
                  );
            } catch (error) {
                  console.error('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };
}
