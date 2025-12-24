import { Entity, Column } from 'typeorm';
import { BaseEntity } from './_base/base.entity';

@Entity('sliders')
export class Slider extends BaseEntity {
  @Column({ type: 'jsonb' })
  title: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb' })
  subtitle: { az: string; en?: string; ru?: string };

  @Column()
  imageUrl: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;
}

