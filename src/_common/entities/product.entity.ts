import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './_base/base.entity';
import { Category } from './category.entity';
import { Company } from './company.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'jsonb' })
  title: { az: string; en?: string; ru?: string };

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'jsonb', nullable: true })
  description: { az: string; en?: string; ru?: string };

  @Column({ nullable: true })
  mainImage: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageList: string[];

  @Column({ nullable: true })
  detailPdf: string;

  @ManyToOne(() => Category, (category) => category.products, { nullable: false })
  category: Category;

  @ManyToOne(() => Company, (company) => company.products, { nullable: false })
  company: Company;

  @Column({ default: true })
  isActive: boolean;
} 