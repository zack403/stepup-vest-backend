import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'
import { CardEntity } from 'src/modules/user/entities/card.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { CardIssueEmail } from './templates/card-issue-email-template';
import { CardNotReuseableEmail } from './templates/card-not-reuseable-template';
import { ConfirmEmail } from './templates/confirm-email-template';
import { ResetPasswordEmail } from './templates/reset-password-template';


@Injectable()
export class EmailService {
  private readonly transporter: any;
  constructor(private configService: ConfigService  
    ) {
    this.transporter = nodemailer.createTransport({
      host:  this.configService.get('EMAIL_HOST'),
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
      logger: true
    });
  }

  public sendConfirmEmail = async (user: UserEntity, link: string) => {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: user.email,
        subject: `${user.firstName}, Your Verification Link For StepupVest.`,
        text: ConfirmEmail(user, link),
        html: ConfirmEmail(user, link),
        headers: { 'x-myheader': 'test header' }
      });
    } catch (error) {
      console.log(error);      
      Logger.error(`NODE-MAILER.sendHtmlMailAsync: ${error.toString()}`);
    }
  }


  public sendResetPasswordEmail = async (user: UserEntity, link: string) => {
      try {
        await this.transporter.sendMail({
          from: this.configService.get('EMAIL_FROM'),
          to: user.email,
          subject: 'Password reset for StepupVest',
          text: ResetPasswordEmail(user, link),
          html: ResetPasswordEmail(user, link),
          headers: { 'x-myheader': 'test header' }
        });
      } catch (error) {
        console.log(error);      
        Logger.error(`NODE-MAILER.sendHtmlMailAsync: ${error.toString()}`);
      }
  }

  public sendCardNotReUsableEmail = async (request: any) => {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: request.email,
        subject: 'New added card cannot be used',
        text: CardNotReuseableEmail(request.user, request),
        html: CardNotReuseableEmail(request.user, request),
        headers: { 'x-myheader': 'test header' }
      });
    } catch (error) {
      console.log(error);      
      Logger.error(`NODE-MAILER.sendHtmlMailAsync: ${error.toString()}`);
    }
  }

  public sendCardIssueEmail = async (card: CardEntity) => {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: card.email,
        subject: 'Unable to charge your card',
        text: CardIssueEmail(card.user, card),
        html: CardIssueEmail(card.user, card),
        headers: { 'x-myheader': 'test header' }
      });
    } catch (error) {
      console.log(error);      
      Logger.error(`NODE-MAILER.sendHtmlMailAsync: ${error.toString()}`);
    }
  }

}
