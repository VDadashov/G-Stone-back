import { Entity, Column } from 'typeorm';
import { BaseEntity } from './_base/base.entity';

@Entity('settings')
export class Settings extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column()
  type: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;
} 