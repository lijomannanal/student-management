import { Model } from 'sequelize';
import sequelizeConnection from '../config/db';
import Teacher from './teacher';
import Student from './student';

class Enrollment extends Model {}

Enrollment.init({}, { sequelize: sequelizeConnection });

Teacher.belongsToMany(Student, {
  through: Enrollment,
  as: 'students',
  foreignKey: 'teacher_id',
});

Student.belongsToMany(Teacher, {
  through: Enrollment,
  as: 'teachers',
  foreignKey: 'student_id',
});

export default Enrollment;
