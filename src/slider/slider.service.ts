import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slider } from '../_common/entities/slider.entity';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class SliderService {
  constructor(
    @InjectRepository(Slider)
    private readonly sliderRepo: Repository<Slider>,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateSliderDto) {
    const slider = this.sliderRepo.create(dto);
    return this.sliderRepo.save(slider);
  }

  async findAll(lang?: string, isActive?: boolean) {
    lang = lang || 'az';

    const queryBuilder = this.sliderRepo.createQueryBuilder('slider');

    // Active status filter (optional)
    if (isActive !== undefined) {
      queryBuilder.andWhere('slider.isActive = :isActive', { isActive });
    }

    // Order by order field, then by createdAt
    queryBuilder.orderBy('slider.order', 'ASC');
    queryBuilder.addOrderBy('slider.createdAt', 'DESC');

    const sliders = await queryBuilder.getMany();
    return sliders.map((s) => ({
      ...s,
      title: this.i18n.translateField(s.title, lang),
      subtitle: this.i18n.translateField(s.subtitle, lang),
    }));
  }

  async findAllForAdmin() {
    const sliders = await this.sliderRepo.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
    return sliders.map((s) => ({
      ...s,
      title: s.title,
      subtitle: s.subtitle,
    }));
  }

  async findOne(id: number, lang?: string) {
    lang = lang || 'az';
    const slider = await this.sliderRepo.findOneBy({ id });
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }
    return {
      ...slider,
      title: this.i18n.translateField(slider.title, lang),
      subtitle: this.i18n.translateField(slider.subtitle, lang),
    };
  }

  async findOneForAdmin(id: number) {
    const slider = await this.sliderRepo.findOneBy({ id });
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }
    return {
      ...slider,
      title: slider.title,
      subtitle: slider.subtitle,
    };
  }

  async update(id: number, dto: UpdateSliderDto) {
    const slider = await this.sliderRepo.findOneBy({ id });
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }
    Object.assign(slider, dto);
    return this.sliderRepo.save(slider);
  }

  async remove(id: number) {
    const slider = await this.sliderRepo.findOneBy({ id });
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }
    await this.sliderRepo.remove(slider);
    return { deleted: true };
  }
}

