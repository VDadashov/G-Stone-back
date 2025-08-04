import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Slider } from './slider.entity';

@Entity('slider_items')
export class SliderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 500, nullable: true })
  subtitle: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ length: 255 })
  backgroundImage: string;

  @Column({ length: 255, nullable: true })
  buttonText: string;

  @Column({ length: 255, nullable: true })
  buttonUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  decorativeElements: {
    lanterns?: { src: string; position: { x: number; y: number } }[];
    plates?: { src: string; position: { x: number; y: number } }[];
    artwork?: { src: string; position: { x: number; y: number } }[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  sliderId: number;

  @ManyToOne(() => Slider, (slider) => slider.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sliderId' })
  slider: Slider;
}
