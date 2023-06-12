// import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';
import { Model, DataTypes } from 'sequelize';
import sequelizeConnection from '../config/db';

// Valid
class Student extends Model {
  [x: string]: any;
}

Student.init(
  {
    email: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: 'is_active',
      defaultValue: 1,
    },
  },
  { sequelize: sequelizeConnection },
);

export default Student;
