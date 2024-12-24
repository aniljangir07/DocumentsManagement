import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../constants.service';

@Entity()
export class Users {
      documents: any;
      save() {
            throw new Error('Method not implemented.');
      }
      @PrimaryGeneratedColumn()
      id: number;

      @Column()
      fullName: string;

      @Column()
      email: string;

      @Column()
      password: string;

      @Column()
      isVerified: boolean;

      @Column({
            type: 'enum',
            enum: Role,
            default: Role.Viewer,
      })
      role: Role;

      @Column({ nullable: true })
      otp: number;

      @Column({ type: 'timestamp', nullable: true })
      otpExpiry: Date;
}
