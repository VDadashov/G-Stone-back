import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './_base/base.entity';
import { Product } from './product.entity';
import { Company } from './company.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ type: 'jsonb' })
  title: { az: string; en?: string; ru?: string };

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToMany(() => Company, (company) => company.categories)
  @JoinTable()
  companies: Company[];

  @Column({ default: true })
  isActive: boolean;
} 