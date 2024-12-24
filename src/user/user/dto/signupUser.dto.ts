import { IsEmail, IsNotEmpty, Length, Matches, Validate, ValidationArguments, IsOptional, IsString} from 'class-validator';





export class SignupUserDto {
      @IsNotEmpty({ message: 'Full Name is required' })
      @Length(5, 50, { message: 'Full Name must be at least 5 characters long' })
      fullName: string;

      @IsEmail({}, { message: 'Invalid email address' })
      email: string;

      @IsNotEmpty({ message: 'Password is required' })
      @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/, {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, with a minimum length of 5',
      })
      password: string;
}

export class OtpDto {
      @IsNotEmpty({ message: 'OTP is required.' })
      OTP: number;

      @IsEmail({}, { message: 'Invalid email address' })
      email: string;
}

export class EmailDto {

      @IsEmail({}, { message: 'Invalid email address' })
      email: string;
}


export class PasswordMatchValidator {
      validate(value: string, args: ValidationArguments) {
            const { object } = args;
            const passwordDto = object as PasswordDto;

            return value === passwordDto.password;
      }

      defaultMessage(args: ValidationArguments) {
            return 'Password and confirm password should be the same';
      }
}

export class PasswordDto {
      @IsEmail({}, { message: 'Invalid email address' })
      email: string;

      @IsNotEmpty({ message: 'Password is required' })
      @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/, {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, with a minimum length of 5',
      })
      password: string;

      @IsNotEmpty({ message: 'Confirm password is required' })
      @Validate(PasswordMatchValidator)
      confirmPassword: string;

      @IsNotEmpty({ message: 'OTP is required.' })
      otp: number;
}


export class SignInDto {
      @IsEmail({}, { message: 'Invalid email address' })
      email: string;

      @IsNotEmpty({ message: 'Password is required' })
      @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/, {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, with a minimum length of 5',
      })
      password: string;
}


export class UpdateProfileDto {
      @IsOptional()
      @IsEmail()
      email?: string;
  
      @IsOptional()
      @IsString()
      role?: string;
  }