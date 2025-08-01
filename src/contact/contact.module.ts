import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from '../_common/entities/contact.entity';
import { EmailService } from '../_common/services/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), ConfigModule],
  controllers: [ContactController],
  providers: [ContactService, EmailService],
  exports: [EmailService], // Başqa modullardan istifadə etmək üçün
})
export class ContactModule {}
