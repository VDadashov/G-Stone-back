import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from './_base/base.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column({ type: 'jsonb' })
  title: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb', nullable: true })
  description: { az: string; en?: string; ru?: string };

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  slug: string;

  @ManyToMany(() => Category, (category) => category.companies)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.company)
  products: Product[];
} 