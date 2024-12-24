import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';

@Entity('documents')
export class Document extends BaseEntity {
      @PrimaryGeneratedColumn()
      id: number;

      @Column()
      title: string;

      @Column()
      pageSize: number;

      @Column({ default: 'active' })
      status: string;

      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;

      @ManyToOne(() => Users, user => user.documents)
      @JoinColumn({ name: 'userId' })
      user: Users;

      @Column()
      userId: number;
}
