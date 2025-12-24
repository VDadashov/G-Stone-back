import { Module } from '@nestjs/common';
import { SliderController } from './slider.controller';
import { SliderService } from './slider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slider } from '../_common/entities/slider.entity';
import { I18nModule } from '../i18n/i18n.module';

@Module({
  imports: [TypeOrmModule.forFeature([Slider]), I18nModule],
  controllers: [SliderController],
  providers: [SliderService]
})
export class SliderModule {}

