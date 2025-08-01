import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './_base/base.entity';
import { GalleryCategory } from './gallery-category.entity';

@Entity('gallery_items')
export class GalleryItem extends BaseEntity {
  @Column({ type: 'jsonb' })
  title: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb', nullable: true })
  description: { az: string; en?: string; ru?: string };

  @Column({ nullable: true })
  mainImage: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageList: string[];

  @ManyToOne(() => GalleryCategory, (category) => category.items, { nullable: false })
  galleryCategory: GalleryCategory;

  @Column({ default: true })
  isActive: boolean;
} 