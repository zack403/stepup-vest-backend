import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { plainToClass } from 'class-transformer';
import { UserEntity } from '../user/entities/user.entity';
import { JwtPayload } from '../../types/jwtPayload';
import { JwtService } from '@nestjs/jwt';
import { EmailVerification } from '../../types/emailVerification';
import { ConfigService } from '@nestjs/config';
import { DataSource, Not, Repository } from 'typeorm';
import { PasswordReset } from '../../types/passwordReset';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { hashPassword, verifyPassword } from 'src/utils/hasher';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationEntity } from './entities/email-verification.entity';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { EmailService } from '../../services/email/email.service';
import { IClientReturnObject } from '../../types/clientReturnObj';
import { clientFeedback } from '../../utils/clientReturnfunction';
import { generateUniqueCode } from 'src/utils/generate-unique-code';
import { UserService } from '../user/user.service';



@Injectable()
export class AuthService {
  logger = new Logger('AuthService');

  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
    private dataSource: DataSource,
    @InjectRepository(EmailVerificationEntity) private emailVerificationRepo: Repository<EmailVerificationEntity>,
    private readonly userSvc: UserService,
    @InjectRepository(PasswordResetEntity) private passwordResetRepo: Repository<PasswordResetEntity>,
    private readonly configService: ConfigService) { }


  async register(request: RegisterDto): Promise<IClientReturnObject> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {


      request.email = request.email.toLocaleLowerCase();

      const exist = await this.userSvc.findByEmail(request.email);

      if(exist) {
        return clientFeedback({
          status: 400,
          message: 'Email already exist'
        })
      }

      const phoneexist = await this.userSvc.findByPhoneNumber(request.phoneNumber);

      if(phoneexist) {
        return clientFeedback({
          status: 400,
          message: 'Phone number already exist'
        })
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();
      

      const hashedPassword = await hashPassword(request.password);
      
      delete request.confirmPassword;

      const userData = plainToClass(UserEntity, request);
      userData.createdBy = request.email;
      userData.password = hashedPassword;
      userData.referralCode = `ref_${generateUniqueCode()}`


      const saved = await queryRunner.manager.save(UserEntity, userData);

      const payload: EmailVerification = {
        userId: saved.id,
        emailToken: generateUniqueCode(),
        createdBy: saved.email
      }

      await queryRunner.manager.save(EmailVerificationEntity, payload);

      const host = this.configService.get("FRONTEND_URL");
      const link = host + '/verify/' + payload.emailToken;

      await this.emailService.sendConfirmEmail(saved, link);

      await queryRunner.commitTransaction();

      //generate auth token
      const { id, email, firstName, lastName} = saved;
      const fullName = `${firstName} ${lastName}`
      const jwt: JwtPayload = { id, email, fullName };
      const token = await this.jwtService.sign(jwt, {
        secret: this.configService.get('JWT_SECRETKEY'),
        expiresIn: this.configService.get('JWT_EXPIRESIN')
      });

      delete saved.password;
      delete saved.isAdmin;


      const dataToReturn = {
        token,
        ...saved
      }

      return ({
        status: HttpStatus.OK,
        message: 'Account created successfully, kindly check your email to verify your email.',
        data: dataToReturn
      });

    } catch (error) {

      await queryRunner.rollbackTransaction();
      this.logger.error(`Error in creating account - ${error.message}`, "AuthSvc.Register");

      return ({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error while creating user - Error: ${error.message}`,
        trace: error
      });

    } finally {
      await queryRunner.release();
    }
  }

  async login(request: LoginDto): Promise<IClientReturnObject> {

    try {

      const user = await this.userSvc.findByEmail( request.email.toLocaleLowerCase());
      if (!user) {
        return clientFeedback({
          message: 'Login Failed, invalid email or password.',
          status: 400
        });
      }

      const isPasswordMatching = await verifyPassword(request.password, user.password);

      if (!isPasswordMatching) {
        return clientFeedback({
          message: 'Login Failed, invalid email or password.',
          status: 400
        });
      }

      //generate auth token
      const { id, email, firstName, lastName} = user;
      const fullName = `${firstName} ${lastName}`
      const jwt: JwtPayload = { id, email, fullName };
      const token = await this.jwtService.sign(jwt, {
        secret: this.configService.get('JWT_SECRETKEY'),
        expiresIn: this.configService.get('JWT_EXPIRESIN')
      });

      delete user.password;
      delete user.isAdmin;

      const dataToReturn = {
        token,
        ...user
      }

      return clientFeedback({
        status: 200,
        message: "Login Successful",
        data: dataToReturn
      });

    } catch (error) {

      this.logger.log(`Error in loggin in - ${error.message}`, "AuthSvc.Login")

      return ({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error while login in - Error: ${error.message}`
      });
    }
  }


  async createEmailToken(email: string): Promise<IClientReturnObject> {
    try {

      const user = await this.userSvc.findByEmail(email);

      if (!user) {
        return clientFeedback({
          message: 'User does not exist',
          status: 404
        })
      }

      const emailVerification = await this.emailVerificationRepo.findOne({ where: {userId: user.id} });

      if (emailVerification) {


        emailVerification.emailToken = generateUniqueCode();
        await this.emailVerificationRepo.save(emailVerification);

        return clientFeedback({
          message: "Email verified successfully",
          data: emailVerification.emailToken,
          status: 200
        });

      } else {

        const payload: EmailVerification = {
          userId: user.id,
          emailToken: generateUniqueCode(),
          createdBy: email
        }

        await this.emailVerificationRepo.save(payload);

        return clientFeedback({
          message: "Email verified successfully",
          data: payload.emailToken,
          status: 200
        });

      }
    } catch (error) {
      this.logger.error(`Error in creating email token - ${error.message}`, "AuthSvc.creatEmailToken")
    }

  }

  public async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const frontednUrl = this.configService.get("FRONTED_URL");
    const user = await this.userSvc.findByEmail(email);

    if (user) {

      const link = frontednUrl + '/verify/' + token;

      await this.emailService.sendConfirmEmail(user, link);

      return true;
    } else {
      return false;
    }
  }

  public async verifyEmail(token: string): Promise<IClientReturnObject> {

    const result = await this.emailVerificationRepo.findOne({ where: { emailToken: token } });
    if (result && result.userId) {

      try {

        const user = await this.userSvc.findByUserId(result.userId);
        if (!user) {
          return clientFeedback({
            message: 'User does not exist',
            status: 404
          })
        }

        if (user.isVerified) {
          return clientFeedback({
            message: 'Account  already verified',
            status: 400
          })
        }

        user.isVerified = true;
        user.updatedAt = new Date();
        user.updatedBy = user.email;

        await user.save();
        await this.emailVerificationRepo.delete({ id: result.id });

        //generate auth token
        const { id, email, firstName, lastName} = user;
      const fullName = `${firstName} ${lastName}`;
      const jwt: JwtPayload = { id, email, fullName };
      const token = await this.jwtService.sign(jwt, {
        secret: this.configService.get('JWT_SECRETKEY'),
        expiresIn: this.configService.get('JWT_EXPIRESIN')
      });

        const dataToReturn = {
          token,
          ...user
        }

        return clientFeedback({
          status: 200,
          message: "Email verified Successfully",
          data: dataToReturn
        });

      } catch (error) {
        this.logger.error(`Error in verifying email - ${error.message}`, "AuthSvc.verifyEmail")

        return clientFeedback({
          message: `An error occurred while trying to verify email - Error: ${error.message}`,
          status: 500
        });
      }
    } else {
      return clientFeedback({
        message: 'An error occurred while trying to verify email - Error: invalid token',
        status: 400
      })
    }
  }

  async createForgottenPasswordToken(userId: string): Promise<PasswordReset> {

    const resetToken = generateUniqueCode();

    const forgottenPasswordPayload: PasswordReset = {
      userId,
      resetToken,
      createdBy: 'vest admin'
    }
    const forgottenPasswordModel = await this.passwordResetRepo.save(forgottenPasswordPayload);
    if (forgottenPasswordModel) {

      // delete all previous user request reset password data
      await this.passwordResetRepo.delete({ userId, resetToken: Not(forgottenPasswordModel.resetToken) });
      return forgottenPasswordModel;
    }
  }

  public async sendEmailForgotPassword(email: string): Promise<IClientReturnObject> {
    try {
      const frontendUrl = this.configService.get("FRONTEND_URL");
      const user = await this.userSvc.findByEmail(email);
      if (!user) {
        return clientFeedback({
          message: `An account with the email ${email} does not exist with us`,
          status: 404
        })
      }
      const tokenModel = await this.createForgottenPasswordToken(user.id);
      const code = tokenModel.resetToken;

      if (tokenModel && tokenModel.resetToken) {
        await this.emailService.sendResetPasswordEmail(user, code);
        return clientFeedback({
          message: `Kindly check your email and follow through link to reset your password`,
          status: 200
        });
      }
    } catch (error) {

      this.logger.log(`Error in sending forgot password email - ${error.message}`, "AuthSvc.sendEmailForgotPassword")

      return clientFeedback({
        message: `Internal server error ${error.message}`,
        status: 500
      })
    }
  }

  async isValidPasswordToken(token: string): Promise<IClientReturnObject> {
    if (!token) {
      return clientFeedback({
        status: HttpStatus.BAD_REQUEST,
        message: "token param is required."
      });
    }
    const user = await this.passwordResetRepo.findOne({ where: { resetToken: token } });
    if (!user) {
      return clientFeedback({
        status: HttpStatus.BAD_REQUEST,
        message: "Invalid token or token expired."
      });
    }

    //check if token has expired
    try {
      this.jwtService.verify(token, { secret: this.configService.get('JWT_SECRETKEY') });
    } catch (ex) {
      return clientFeedback({
        status: HttpStatus.BAD_REQUEST,
        message: "Token expired or is no longer valid! Kindly generate a new token"
      });
    }

    return clientFeedback({
      status: HttpStatus.OK,
      message: "Token verified successfully."
    });
  }


  async setNewPassord(request: ResetPasswordDto): Promise<IClientReturnObject> {

    const userToken = await this.passwordResetRepo.findOne({ where: { resetToken: request.resetCode } });

    if (!userToken) {
      return clientFeedback({
        status: HttpStatus.BAD_REQUEST,
        message: "Token expired or is no longer valid! Kindly generate a new token"
      });
    }

    const user = await this.userSvc.findByUserId(userToken.userId);
    if (!user) {
      return clientFeedback({
        status: HttpStatus.BAD_REQUEST,
        message: "User does not exist"
      });
    }

    const isPreviousPassword = await verifyPassword(request.password, user.password);
    if (isPreviousPassword) {
      return clientFeedback({
        status: HttpStatus.BAD_REQUEST,
        message: "New password cannot be one of previous password."
      });
    }

    const hashedPassword = await hashPassword(request.password);

    user.password = hashedPassword;

    try {
      const updated = await this.userSvc.saveOrUpdateUser(user);
      if (updated) {
        return {
          status: HttpStatus.OK,
          message: 'Password reset successful. Kindly login to your account'
        }
      }
    } catch (error) {

      return clientFeedback({
        message: `An error occured while setting new passwod - Error: ${error.message}`,
        status: 500
      });
    }
  }

  async changedPassword(req: ChangePasswordDto, user: UserEntity): Promise<IClientReturnObject> {
    const { oldPassword, newPassword, confirmNewPassword } = req;
    try {
      if (oldPassword && newPassword && confirmNewPassword) {
        if (newPassword != confirmNewPassword) {
          return clientFeedback({
            status: HttpStatus.BAD_REQUEST,
            message: "Confirm password must match new password."
          });
        }

        const isOldPasswordCorrect = await verifyPassword(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
          return clientFeedback({
            status: HttpStatus.BAD_REQUEST,
            message: "Old password do not match our record."
          });
        }

        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;

        const updated = await this.userSvc.saveOrUpdateUser(user);
        if (updated) {
          
          return ({
            status: HttpStatus.OK,
            message: 'Password change successful. Kindly login again.'
          });
        }
        
      }
      else {
        return clientFeedback({
          message: `Please check your payload.`,
          status: 400
        });
      }

    } catch (error) {
      console.log(error)
    }
  }

}
