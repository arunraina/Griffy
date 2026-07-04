import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type SavedItemType = 'contractor' | 'labour' | 'material';

@Entity('saved_items')
@Index(['userId', 'type', 'targetId'], { unique: true })
export class SavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  type: SavedItemType;

  @Column()
  targetId: string;

  @CreateDateColumn()
  createdAt: Date;
}
