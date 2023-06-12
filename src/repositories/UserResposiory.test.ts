/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import sinon from 'sinon';
import { Teacher, Student } from '../models';
import UserRepository from './UserRepository';
import { type FindOrCreateOptions, type Optional, type Model, type FindOptions } from 'sequelize';

describe('UserRepository', () => {
  const hasStudentMock = sinon.stub();
  const addStudentsMock = sinon.spy();
  const studentUpdateMock = sinon.spy();
  const teacherStubValue: Partial<Teacher> = {
    id: 1,
    email: 'teacher@123.com',
    createdAt: '2023-6-12 10:34:45',
    updatedAt: '2023-6-12 10:34:45',
    students: [
      {
        id: 1,
        email: 'student@123.com',
        createdAt: '2023-6-12 10:34:45',
        updatedAt: '2023-6-12 10:34:45',
      },
    ],
    hasStudent: hasStudentMock,
    addStudents: addStudentsMock,
  };

  const studentStubValue: Partial<Student> = {
    id: 2,
    email: 'student@223.com',
    createdAt: '2023-6-12 10:34:45',
    updatedAt: '2023-6-12 10:34:45',
    update: studentUpdateMock,
  };

  describe('getTeacherByEmail', () => {
    let findOneMock: any;

    beforeEach(() => {
      findOneMock = sinon.stub(Teacher, 'findOne');
    });

    afterEach(function () {
      findOneMock.restore(); // Unwraps the spy
    });

    it('should retrieve the teacher record with email id', async () => {
      const stub = findOneMock.resolves(teacherStubValue);
      const userRepository = new UserRepository();
      const user = await userRepository.getTeacherByEmail('teacher@123.com');
      expect(stub.calledOnce).to.be.true;
      expect(user?.id).to.equal(teacherStubValue.id);
      expect(user?.name).to.equal(teacherStubValue.name);
      expect(user?.email).to.equal(teacherStubValue.email);
      expect(user?.createdAt).to.equal(teacherStubValue.createdAt);
      expect(user?.updatedAt).to.equal(teacherStubValue.updatedAt);
    });

    it('should return null if the teacher record does not exist', async () => {
      const stub = findOneMock.resolves(null);
      const userRepository = new UserRepository();
      const user = await userRepository.getTeacherByEmail('teacher@121.com');
      expect(stub.calledOnce).to.be.true;
      expect(user).to.equal(null);
    });
  });

  describe('getStudentByEmail', () => {
    let findOneMock: sinon.SinonStub<[options?: FindOptions<any> | undefined], Promise<Model<any, any> | null>>;

    beforeEach(() => {
      findOneMock = sinon.stub(Student, 'findOne');
    });

    afterEach(function () {
      findOneMock.restore(); // Unwraps the spy
    });

    it('should retrieve the student record with email id', async () => {
      const stub = findOneMock.resolves(studentStubValue as Student);
      const userRepository = new UserRepository();
      const user = await userRepository.getStudentByEmail('student@123.com');
      expect(stub.calledOnce).to.be.true;
      expect(user?.id).to.equal(studentStubValue.id);
      expect(user?.name).to.equal(studentStubValue.name);
      expect(user?.email).to.equal(studentStubValue.email);
      expect(user?.createdAt).to.equal(studentStubValue.createdAt);
      expect(user?.updatedAt).to.equal(studentStubValue.updatedAt);
    });

    it('should return null if the student record does not exist', async () => {
      const stub = findOneMock.resolves(null);
      const userRepository = new UserRepository();
      const user = await userRepository.getStudentByEmail('teacher@121.com');
      expect(stub.calledOnce).to.be.true;
      expect(user).to.equal(null);
    });
  });

  describe('registerStudents', () => {
    let teacherFindOrCreatreMock: sinon.SinonStub<
      [options: FindOrCreateOptions<any, Optional<any, string>>],
      Promise<[Model<any, any>, boolean]>
    >;
    let studentFindOrCreatreMock: sinon.SinonStub<
      [options: FindOrCreateOptions<any, Optional<any, string>>],
      Promise<[Model<any, any>, boolean]>
    >;
    let studentFindOneMock: sinon.SinonStub<[options?: FindOptions<any> | undefined], Promise<Model<any, any> | null>>;
    beforeEach(() => {
      studentFindOneMock = sinon.stub(Student, 'findOne');
      teacherFindOrCreatreMock = sinon.stub(Teacher, 'findOrCreate');
      studentFindOrCreatreMock = sinon.stub(Student, 'findOrCreate');
    });
    afterEach(function () {
      studentFindOneMock.restore(); // Unwraps the spy
      teacherFindOrCreatreMock.restore(); // Unwraps the spy
      studentFindOrCreatreMock.restore(); // Unwraps the spy
    });

    it('should throw error if the student already registered to the teacher', async () => {
      const teacherRegisterStub = teacherFindOrCreatreMock.resolves([teacherStubValue as Teacher, true]);
      const studentFindOneStub = studentFindOneMock.resolves(studentStubValue as Student);
      const studentFindOrCreateStub = studentFindOrCreatreMock.resolves([studentStubValue as Student, true]);
      hasStudentMock.resolves(true);
      const userRepository = new UserRepository();
      await userRepository
        .registerStudents({
          teacher: 'teacher@123.com',
          students: ['student@123.com'],
        })
        .catch((error) => {
          expect(error.message).to.eql('Student(s) "student@123.com" are already registered to the teacher');
        });
      expect(teacherRegisterStub.calledOnce).to.be.true;
      expect(studentFindOneStub.calledOnce).to.be.true;
      expect(studentFindOrCreateStub.called).to.be.false;
      expect(addStudentsMock.called).to.be.false;
    });

    it('should register student(s) to the if the association does not exist', async () => {
      const teacherRegisterStub = teacherFindOrCreatreMock.resolves([teacherStubValue as Teacher, true]);
      const studentFindOneStub = studentFindOneMock.resolves(studentStubValue as Student);
      const studentFindOrCreateStub = studentFindOrCreatreMock.resolves([studentStubValue as Student, false]);
      hasStudentMock.resolves(false);
      const userRepository = new UserRepository();
      await userRepository.registerStudents({
        teacher: 'teacher@123.com',
        students: ['student@123.com'],
      });
      expect(teacherRegisterStub.calledOnce).to.be.true;
      expect(studentFindOneStub.calledOnce).to.be.true;
      expect(studentFindOrCreateStub.called).to.be.true;
      expect(addStudentsMock.called).to.be.true;
    });
  });

  describe('getCommonStudents', () => {
    let studentFindOrCreatreMock: sinon.SinonStub<
      [options: FindOrCreateOptions<any, Optional<any, string>>],
      Promise<[Model<any, any>, boolean]>
    >;
    let teacherFindOneMock: sinon.SinonStub<[options?: FindOptions<any> | undefined], Promise<Model<any, any> | null>>;
    let findAllStudentsMock: sinon.SinonStub<[options?: FindOptions<any> | undefined], Promise<Array<Model<any, any>>>>;
    const hasTeachersMockForStudent1 = sinon.stub();
    const hasTeachersMockForStudent2 = sinon.stub();
    const hasTeachersMockForStudent3 = sinon.stub();

    beforeEach(() => {
      teacherFindOneMock = sinon.stub(Teacher, 'findOne');
      studentFindOrCreatreMock = sinon.stub(Student, 'findOrCreate');
      findAllStudentsMock = sinon.stub(Student, 'findAll');
    });

    afterEach(function () {
      teacherFindOneMock.restore(); // Unwraps the spy
      studentFindOrCreatreMock.restore(); // Unwraps the spy
      findAllStudentsMock.restore();
    });

    it('should throw error if the teacher does not exist in the DB', async () => {
      const teacherFindOneStub1 = teacherFindOneMock
        .withArgs({
          where: { email: 'teacher@123.com', isActive: true },
        })
        .resolves(teacherStubValue as Teacher);
      const teacherFindOneStub2 = teacherFindOneMock
        .withArgs({
          where: { email: 'teacher@523.com', isActive: true },
        })
        .resolves(null);
      const userRepository = new UserRepository();
      await userRepository.getCommonStudents(['teacher@123.com', 'teacher@523.com']).catch((error) => {
        expect(error.message).to.eql('Teacher(s) "teacher@523.com" do not exist');
      });
      expect(teacherFindOneStub1.calledOnce).to.be.true;
      expect(teacherFindOneStub2.calledOnce).to.be.true;
    });

    const allDBStudents = [
      {
        id: 1,
        email: 'student@123.com',
        createdAt: '2023-6-12 10:34:45',
        updatedAt: '2023-6-12 10:34:45',
        hasTeachers: hasTeachersMockForStudent1,
      },
      {
        id: 1,
        email: 'student@223.com',
        createdAt: '2023-6-12 10:34:45',
        updatedAt: '2023-6-12 10:34:45',
        hasTeachers: hasTeachersMockForStudent2,
      },
      {
        id: 1,
        email: 'student@323.com',
        createdAt: '2023-6-12 10:34:45',
        updatedAt: '2023-6-12 10:34:45',
        hasTeachers: hasTeachersMockForStudent3,
      },
    ];

    it("should return common students' email address if the common students exist", async () => {
      const teacherFindOneStub1 = teacherFindOneMock
        .withArgs({
          where: { email: 'teacher@123.com', isActive: true },
        })
        .resolves(teacherStubValue as Teacher);
      const teacherFindOneStub2 = teacherFindOneMock
        .withArgs({
          where: { email: 'teacher@523.com', isActive: true },
        })
        .resolves(teacherStubValue as Teacher);
      const findAllStudentsStub = findAllStudentsMock.resolves(allDBStudents as unknown as Student[]);
      hasTeachersMockForStudent1.resolves(true);
      hasTeachersMockForStudent2.resolves(false);
      hasTeachersMockForStudent3.resolves(true);
      const userRepository = new UserRepository();
      const commonStudents = await userRepository.getCommonStudents(['teacher@123.com', 'teacher@523.com']);
      expect(teacherFindOneStub1.calledOnce).to.be.true;
      expect(teacherFindOneStub2.calledOnce).to.be.true;
      expect(findAllStudentsStub.calledOnce).to.be.true;
      expect(commonStudents).to.have.members(['student@123.com', 'student@323.com']);
    });
  });

  describe('suspendStudent', () => {
    let findOneMock: sinon.SinonStub<[options?: FindOptions<any> | undefined], Promise<Model<any, any> | null>>;

    beforeEach(() => {
      findOneMock = sinon.stub(Student, 'findOne');
    });

    afterEach(function () {
      findOneMock.restore(); // Unwraps the spy
    });

    it('should throw error if the student does not exist/ already in suspended status', async () => {
      const studentFindOneStub = findOneMock.resolves(null);
      const userRepository = new UserRepository();
      await userRepository.suspendStudent('student@123.com').catch((error) => {
        expect(error.message).to.eql('Student with this email does not exist');
      });
      expect(studentFindOneStub.calledOnce).to.be.true;
      expect(studentUpdateMock.called).to.be.false;
    });

    it('should update student status to suspended if the student exist', async () => {
      const studentFindOneStub = findOneMock.resolves(studentStubValue as Student);
      const userRepository = new UserRepository();
      await userRepository.suspendStudent('student@123.com');
      expect(studentFindOneStub.calledOnce).to.be.true;
      expect(studentUpdateMock.calledOnce).to.be.true;
      expect(
        studentUpdateMock.calledWith({
          isActive: false,
        }),
      );
    });
  });

  describe('retrieveNotificationsRecipients', () => {
    let teacherFindOneMock: sinon.SinonStub<[options?: FindOptions<any> | undefined], Promise<Model<any, any> | null>>;
    let studentFindOneMock: sinon.SinonStub<[options?: FindOptions<any> | undefined], Promise<Model<any, any> | null>>;

    beforeEach(() => {
      teacherFindOneMock = sinon.stub(Teacher, 'findOne');
      studentFindOneMock = sinon.stub(Student, 'findOne');
    });

    afterEach(function () {
      teacherFindOneMock.restore(); // Unwraps the spy
      studentFindOneMock.restore(); // Unwraps the spy
    });

    it('should throw error if the teacher who sends notification does not exist', async () => {
      const teacherFindOneStub = teacherFindOneMock.resolves(null);
      const userRepository = new UserRepository();
      await userRepository
        .retrieveNotificationsRecipients('teacher@123.com', ['student2@123.com', 'student3@123.com'])
        .catch((error) => {
          expect(error.message).to.eql('Teacher with this email does not exist');
        });
      expect(teacherFindOneStub.calledOnce).to.be.true;
    });

    it('should return the recipients list if the teacher and students mentioned in the email are correct', async () => {
      const teacherFindOneStub = teacherFindOneMock.resolves(teacherStubValue as Teacher);
      const userRepository = new UserRepository();

      studentFindOneMock
        .withArgs({
          where: { email: 'student2@123.com', isActive: true },
        })
        .resolves({ ...studentStubValue, email: 'student2@123.com' } as unknown as Student);
      studentFindOneMock
        .withArgs({
          where: { email: 'student3@123.com', isActive: true },
        })
        .resolves({ ...studentStubValue, email: 'student3@123.com' } as unknown as Student);

      const recipients = await userRepository.retrieveNotificationsRecipients('teacher@123.com', [
        'student2@123.com',
        'student3@123.com',
      ]);
      expect(teacherFindOneStub.calledOnce).to.be.true;
      expect(recipients).to.have.members(['student@123.com', 'student2@123.com', 'student3@123.com']);
    });

    it('should not include the suspended/unregistered student in recipients list', async () => {
      const teacherFindOneStub = teacherFindOneMock.resolves(teacherStubValue as Teacher);
      const userRepository = new UserRepository();

      studentFindOneMock
        .withArgs({
          where: { email: 'student2@123.com', isActive: true },
        })
        .resolves({ ...studentStubValue, email: 'student2@123.com' } as unknown as Student);

      studentFindOneMock
        .withArgs({
          where: { email: 'student3@123.com', isActive: true },
        })
        .resolves(null);

      const recipients = await userRepository.retrieveNotificationsRecipients('teacher@123.com', [
        'student2@123.com',
        'student3@123.com',
      ]);
      expect(teacherFindOneStub.calledOnce).to.be.true;
      expect(recipients).to.have.members(['student@123.com', 'student2@123.com']);
    });

    it("should not include duplicate student emails in the recipients list if the student comes under the mentioned list and teacher's registered list", async () => {
      const teacherFindOneStub = teacherFindOneMock.resolves(teacherStubValue as Teacher);
      const userRepository = new UserRepository();

      studentFindOneMock
        .withArgs({
          where: { email: 'student2@123.com', isActive: true },
        })
        .resolves({ ...studentStubValue, email: 'student2@123.com' } as unknown as Student);

      studentFindOneMock
        .withArgs({
          where: { email: 'student3@123.com', isActive: true },
        })
        .resolves(null);

      const recipients = await userRepository.retrieveNotificationsRecipients('teacher@123.com', [
        'student2@123.com',
        'student3@123.com',
        'student@123.com', // registered student
      ]);
      expect(teacherFindOneStub.calledOnce).to.be.true;
      expect(recipients).to.have.members(['student@123.com', 'student2@123.com']);
    });
  });
});
