import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../_common/entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Page } from 'src/_common/entities/page.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  // 🔹 Yeni Section yaratmaq
  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    try {
      // Page mövcudluğunu yoxla
      const page = await this.pageRepository.findOne({
        where: { id: createSectionDto.pageId },
      });

      if (!page) {
        throw new NotFoundException('Göstərilən page tapılmadı');
      }

      // Order avtomatik hesabla (əgər verilməyibsə)
      if (createSectionDto.order === undefined) {
        const lastSection = await this.sectionRepository.findOne({
          where: { pageId: createSectionDto.pageId },
          order: { order: 'DESC' },
        });

        createSectionDto.order = lastSection ? lastSection.order + 1 : 0;
      }

      const section = this.sectionRepository.create(createSectionDto);
      const savedSection = await this.sectionRepository.save(section);

      return savedSection;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Section yaradılarkən xəta baş verdi');
    }
  }

  // 🔹 Bütün Section-ları gətirmək (opsional: pageId filter)
  async findAll(pageId?: number): Promise<Section[]> {
    const where = pageId ? { pageId } : {};
    return await this.sectionRepository.find({
      where,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  // 🔹 ID ilə tapmaq
  async findOne(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }
    return section;
  }

  // 🔹 Yeniləmək
  async update(
    id: number,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const section = await this.findOne(id);
    Object.assign(section, updateSectionDto);
    return await this.sectionRepository.save(section);
  }

  async remove(id: number): Promise<void> {
    const result = await this.sectionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }
  }
}
