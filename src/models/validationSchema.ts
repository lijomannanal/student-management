import { IsString, IsEmail, ArrayNotEmpty } from 'class-validator';
export interface RegisterSchema {
  teacher: string;
  students: string[];
}

export class RegisterInput implements RegisterSchema {
  @IsString()
  @IsEmail({}, { message: 'Invalid email' })
  teacher!: string;

  @IsString({
    each: true,
  })
  @IsEmail({}, { message: 'Invalid email', each: true })
  @ArrayNotEmpty()
  students!: string[];
}

export interface CommonStudentsQuerySchema {
  teacher: string[];
}

export class CommonStudentsQueryInput implements CommonStudentsQuerySchema {
  @IsString({
    each: true,
  })
  @IsEmail({}, { message: 'Invalid email', each: true })
  @ArrayNotEmpty()
  teacher!: string[];
}

export interface SuspendStudentSchema {
  student: string;
}

export class SuspendStudentInput implements SuspendStudentSchema {
  @IsString()
  @IsEmail({}, { message: 'Invalid email' })
  student!: string;
}

export interface NotificationSchema {
  teacher: string;
  notification: string;
}

export class NotificationInput implements NotificationSchema {
  @IsString()
  @IsEmail({}, { message: 'Invalid email' })
  teacher!: string;

  @IsString()
  notification!: string;
}
