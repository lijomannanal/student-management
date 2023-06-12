import { Model, DataTypes } from 'sequelize';
import sequelizeConnection from '../config/db';

class Teacher extends Model {
  [x: string]: any;
}

Teacher.init(
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

export default Teacher;
