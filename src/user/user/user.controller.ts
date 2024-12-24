import { Body, Controller, Post, Req, Res, Next, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

import { ResponseService } from 'src/common/responsive.service';
import { Request, Response, NextFunction } from 'express';
import { EmailDto, OtpDto, PasswordDto, SignInDto, SignupUserDto, UpdateProfileDto } from './dto/signupUser.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guards';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/common/constants.service';

@Controller('user')
export class UserController {
      constructor(
            private readonly userService: UserService,
            private readonly responsiveService: ResponseService
      ) { }

      @Post('/signup')
      async signupUser(
            @Body() body: SignupUserDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  this.userService.signupUser(req, res, next, body)
            } catch (error) {
                  console.log('Error ', error)
                  this.responsiveService.sendBadRequest(res, error.message)
            }
      }

      @Post('/verify-otp')
      async verifyOtp(
            @Body() body: OtpDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  this.userService.verifyOtp(req, res, next, body)
            } catch (error) {
                  console.log('Error ', error)
                  this.responsiveService.sendBadRequest(res, error.message)
            }
      }

      @Post("/forget-password")
      async forgetPassword(
            @Body() body: EmailDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  this.userService.forgetPassword(req, res, next, body)
            } catch (error) {
                  console.log('Error ', error)
                  this.responsiveService.sendBadRequest(res, error.message)
            }
      }

      @Post("/change-password")
      async changePassword(
            @Body() body: PasswordDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  this.userService.changePassword(req, res, next, body)
            } catch (error) {
                  console.log('Error ', error)
                  this.responsiveService.sendBadRequest(res, error.message)
            }
      }

      @Post("/signin")
      async signIn(
            @Body() body: SignInDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  this.userService.signIn(req, res, next, body)
            } catch (error) {
                  console.log('Error ', error)
                  this.responsiveService.sendBadRequest(res, error.message)
            }
      }

      @Post("/update-profile")
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin, Role.Editor, Role.Viewer)
      async updateProfile(
            @Body() body: UpdateProfileDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction,
      ): Promise<any> {
            try {
                  this.userService.updateUserProfile(req, res, next, body)
            } catch (error) {
                  console.log('Error ', error)
                  this.responsiveService.sendBadRequest(res, error.message)
            }
      }

}
