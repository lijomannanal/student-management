import { Teacher, Student } from '../models';

import { type RegisterSchema } from '../models/validationSchema';
import ErrorBase from '../errors/ErrorBase';

export class UserReposiory {
  /**
   * Function to fetch teacher by email
   * @function getTeacherByEmail
   * @param {String} email - user email
   */
  public async getTeacherByEmail(email: string): Promise<Teacher | null> {
    return await Teacher.findOne({
      where: { email, isActive: true },
    });
  }

  /**
   * Function to fetch student by email
   * @function getStudentByEmail
   * @param {String} email - user email
   */
  public async getStudentByEmail(email: string): Promise<Student | null> {
    return await Student.findOne({
      where: { email, isActive: true },
    });
  }

  /**
   * Function to insert and associate teacher and student(s)
   * @function registerStudents
   * @param {Object} input - input schema which includes teacher email and student email addresses
   */
  public async registerStudents(input: RegisterSchema): Promise<void> {
    const { teacher, students } = input;
    const [teacherRecord] = await Teacher.findOrCreate({
      where: {
        email: teacher,
      },
      include: [
        {
          model: Student,
          as: 'students',
        },
      ],
    });

    const studentRecords = await Promise.all(students.map(async (email) => await this.getStudentByEmail(email)));
    const existRecords = (await Promise.all(
      studentRecords.map((record) => teacherRecord.hasStudent(record)),
    )) as boolean[];
    if (existRecords.filter((item) => item).length > 0) {
      const existEmails = [] as string[];
      students.forEach((email, index) => {
        if (existRecords[index]) {
          existEmails.push(email);
        }
      });

      throw new ErrorBase(`Student(s) "${existEmails.join(',')}" are already registered to the teacher`, 400);
    } else {
      const studentRecords = await Promise.all(
        students.map(
          async (email) =>
            await Student.findOrCreate({
              where: {
                email,
              },
            }),
        ),
      );

      await teacherRecord.addStudents(studentRecords.map((record) => record[0]));
    }
  }

  /**
   * Function to common students by teacher(s) by email
   * @function getCommonStudents
   * @param {Array<String>} emailList - list of teachers for which the students need to be retrieved
   * @return {Array<String>} list of common student emails
   */
  public async getCommonStudents(emailList: string[]): Promise<string[] | null> {
    const teachersRecords = await Promise.all(
      emailList.map(async (email) => {
        return await this.getTeacherByEmail(email);
      }),
    );

    const hasInValidTeacherEmails = teachersRecords.filter((record) => record === null);
    if (hasInValidTeacherEmails.length > 0) {
      const invalidEmails = [] as string[];
      emailList.forEach((email, index) => {
        if (teachersRecords[index] === null) {
          invalidEmails.push(email);
        }
      });

      throw new ErrorBase(`Teacher(s) "${invalidEmails.join(',')}" do not exist`, 400);
    }

    const allStudents = await Student.findAll({
      where: { isActive: true },
      include: [
        {
          model: Teacher,
          as: 'teachers',
          required: true,
        },
      ],
    });
    const isStudentRegisteredToAllTeachers = await Promise.all(
      allStudents.map((student) => student.hasTeachers(teachersRecords)),
    );
    return allStudents.filter((record, index) => isStudentRegisteredToAllTeachers[index]).map((record) => record.email);
  }

  /**
   * Function to suspend student by email
   * @function suspendStudent
   * @param {String} email - email address for which the suspend action needs to be performed
   */
  public async suspendStudent(email: string): Promise<void> {
    const student = await this.getStudentByEmail(email);
    if (student === null) {
      throw new ErrorBase('Student with this email does not exist', 400);
    }
    await student.update({ isActive: false });
  }

  /**
   * Function to fetch teacher by email
   * @function retrieveNotificationsRecipients
   * @param {String} teacherEmail - email of notification sender
   * @param {Array<String>}  mentionedStudents - list of student emails inlcuded in the notification body
   * @return {Array<String>} list of recipient emails
   */
  public async retrieveNotificationsRecipients(teacherEmail: string, mentionedStudents: string[]): Promise<string[]> {
    const teacher = await Teacher.findOne({
      where: { email: teacherEmail },
      include: [
        {
          model: Student,
          as: 'students',
          where: {
            isActive: true,
          },
          required: false,
        },
      ],
    });

    if (teacher === null) {
      throw new ErrorBase('Teacher with this email does not exist', 400);
    }
    const teacherStudentEmails = teacher.students.map((student: Student) => student.email) as string[];

    const otherTeachersStudentEmails = mentionedStudents.filter(
      (studentEmail: string) => !teacherStudentEmails.includes(studentEmail),
    );

    const otherTeachersStudentRecords = await Promise.all(
      otherTeachersStudentEmails.map(async (email) => {
        return await this.getStudentByEmail(email);
      }),
    );

    const validOtherTeacherStudentEmails = otherTeachersStudentRecords
      .filter((record) => record)
      .map((record) => record?.email);

    return [...teacherStudentEmails, ...validOtherTeacherStudentEmails];
  }
}

export default UserReposiory;
