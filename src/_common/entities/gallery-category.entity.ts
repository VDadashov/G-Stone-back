import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './_base/base.entity';
import { GalleryItem } from './gallery-item.entity';

@Entity('gallery_categories')
export class GalleryCategory extends BaseEntity {
  @Column({ type: 'jsonb' })
  title: { az: string; en?: string; ru?: string };

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  mainImage: string;

  @OneToMany(() => GalleryItem, (item) => item.galleryCategory)
  items: GalleryItem[];

  @Column({ default: true })
  isActive: boolean;
} 