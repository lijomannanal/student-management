/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, use as ChaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import UserController from './UserController';
import UserReposiory from '../repositories/UserRepository';
import { type RegisterSchema } from 'models/validationSchema';
ChaiUse(chaiAsPromised);

describe('UserController', function () {
  describe('validateRegisterInput', function () {
    const wrongSchemas = [
      { teacher: 'teacher@123.com' },
      { teacher: '', students: [] },
      { students: ['student@123.com'] },
    ] as any[];
    wrongSchemas.forEach((schema) => {
      it('should throw error if the input passed is of wrong format/has empty values', async () => {
        const userController = new UserController();
        await expect(userController.validateRegisterInput(schema)).to.be.rejectedWith(Error);
      });
    });

    it('should not throw error if the input passed is correct', async () => {
      const userController = new UserController();
      const schema = {
        teacher: 'teacher@123.com',
        students: ['student@123.com'],
      };
      await expect(userController.validateRegisterInput(schema)).to.eventually.equal(undefined);
    });
  });

  describe('registerStudents', function () {
    let status: sinon.SinonStub<any[], any>,
      json: sinon.SinonSpy<any[], any>,
      send,
      res: { json: sinon.SinonSpy<any[], any>; status: sinon.SinonStub<any[], any>; send: any },
      next: sinon.SinonSpy<any[], any>,
      userController: UserController;

    let registerStudentRepoMock: sinon.SinonStub<[input: RegisterSchema], Promise<void>>;

    const wrongInput = {
      teacher: '',
      students: [],
    };

    const correctInput = {
      teacher: 'teacher@123.com',
      students: ['student@123.com'],
    };

    beforeEach(() => {
      status = sinon.stub();
      json = sinon.spy();
      next = sinon.spy();
      send = sinon.spy();
      res = { json, status, send };
      status.returns(res);
      userController = new UserController();
      registerStudentRepoMock = sinon.stub(UserReposiory.prototype, 'registerStudents');
    });

    afterEach(() => {
      registerStudentRepoMock.restore();
      sinon.restore();
    });

    it('should not register the students if the input format is wrong', async function () {
      const req = { body: wrongInput } as unknown as any;
      const registerStudentRepoStub = registerStudentRepoMock.resolves(undefined);
      await userController.registerStudents(req, res as any, next);
      expect(registerStudentRepoStub.called).to.be.false;
      expect(status.calledOnce).to.be.false;
      expect(next.calledOnce).to.be.true;
    });

    it('should not return success response if the reposiory function throws error', async function () {
      const req = { body: correctInput } as unknown as any;
      const registerStudentRepoStub = registerStudentRepoMock.rejects('Sample error');
      await userController.registerStudents(req, res as any, next);
      expect(registerStudentRepoStub.called).to.be.true;
      expect(status.called).to.be.false;
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith('Sample error'));
    });

    it('should  return success response if the reposiory function resolved with no error', async function () {
      const req = { body: correctInput } as unknown as any;
      const registerStudentRepoStub = registerStudentRepoMock.resolves(undefined);
      await userController.registerStudents(req, res as any, next);
      expect(registerStudentRepoStub.called).to.be.true;
      expect(status.calledOnce).to.be.true;
      expect(status.calledWith(204));
      expect(next.called).to.be.false;
    });
  });

  describe('validateCommonStudentsInput', function () {
    const wrongSchemas = [{ teacher: [] }, {}] as any[];

    wrongSchemas.forEach((schema) => {
      it('should throw error if the input passed is of wrong format/has empty values', async () => {
        const userController = new UserController();
        await expect(userController.validateCommonStudentsInput(schema)).to.be.rejectedWith(Error);
      });
    });

    it('should not throw error if the input passed is correct', async () => {
      const userController = new UserController();
      const schema = {
        teacher: ['teacher@123.com', 'teacher@223.com'],
      };
      await expect(userController.validateCommonStudentsInput(schema)).to.eventually.equal(undefined);
    });
  });

  describe('getCommonStudents', function () {
    let status: sinon.SinonStub<any[], any>,
      json: sinon.SinonSpy<any[], any>,
      send,
      res: { json: sinon.SinonSpy<any[], any>; status: sinon.SinonStub<any[], any>; send: any },
      next: sinon.SinonSpy<any[], any>,
      userController: UserController;

    let getCommonStudentsRepoMock: sinon.SinonStub<[emailList: string[]], Promise<string[] | null>>;

    const wrongInput = {
      teacher: [],
    };

    const correctInput = {
      teacher: ['teacher@123.com'],
    };

    beforeEach(() => {
      status = sinon.stub();
      json = sinon.spy();
      next = sinon.spy();
      send = sinon.spy();
      res = { json, status, send };
      status.returns(res);
      userController = new UserController();
      getCommonStudentsRepoMock = sinon.stub(UserReposiory.prototype, 'getCommonStudents');
    });

    afterEach(() => {
      getCommonStudentsRepoMock.restore();
      sinon.restore();
    });

    it('should fetch common students if the input format is wrong', async function () {
      const req = { query: wrongInput } as unknown as any;
      const getCommonStudentsRepoStub = getCommonStudentsRepoMock.resolves([]);
      await userController.getCommonStudents(req, res as any, next);
      expect(getCommonStudentsRepoStub.called).to.be.false;
      expect(json.calledOnce).to.be.false;
      expect(next.calledOnce).to.be.true;
    });

    it('should not return success response if the reposiory function throws error', async function () {
      const req = { query: correctInput } as unknown as any;
      const registerStudentRepoStub = getCommonStudentsRepoMock.rejects('Sample error');
      await userController.getCommonStudents(req, res as any, next);
      expect(registerStudentRepoStub.called).to.be.true;
      expect(json.calledOnce).to.be.false;
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith('Sample error'));
    });

    it('should  return success response if the reposiory function resolved with no error', async function () {
      const commonStudents = ['student@123.com', 'student@223.com'];
      const req = { query: correctInput } as unknown as any;
      const registerStudentRepoStub = getCommonStudentsRepoMock.resolves(commonStudents);
      await userController.getCommonStudents(req, res as any, next);
      expect(registerStudentRepoStub.called).to.be.true;
      expect(next.called).to.be.false;
      expect(json.calledOnce).to.be.true;
      expect(
        json.calledWith({
          students: commonStudents,
        }),
      );
    });
  });

  describe('validateStudentSuspendInput', function () {
    const wrongSchemas = [{ student: '' }, {}] as any[];

    wrongSchemas.forEach((schema) => {
      it('should throw error if the input passed is of wrong format/has empty values', async () => {
        const userController = new UserController();
        await expect(userController.validateStudentSuspendInput(schema)).to.be.rejectedWith(Error);
      });
    });

    it('should not throw error if the input passed is correct', async () => {
      const userController = new UserController();
      const schema = {
        student: 'student1@123.com',
      };
      await expect(userController.validateStudentSuspendInput(schema)).to.eventually.equal(undefined);
    });
  });

  describe('suspendStudent', function () {
    let status: sinon.SinonStub<any[], any>,
      json: sinon.SinonSpy<any[], any>,
      send,
      res: { json: sinon.SinonSpy<any[], any>; status: sinon.SinonStub<any[], any>; send: any },
      next: sinon.SinonSpy<any[], any>,
      userController: UserController;

    let suspendStudentRepoMock: sinon.SinonStub<[email: string], Promise<void>>;

    const wrongInput = {
      student: '',
    };

    const correctInput = {
      student: 'student@123.com',
    };

    beforeEach(() => {
      status = sinon.stub();
      json = sinon.spy();
      next = sinon.spy();
      send = sinon.spy();
      res = { json, status, send };
      status.returns(res);
      userController = new UserController();
      suspendStudentRepoMock = sinon.stub(UserReposiory.prototype, 'suspendStudent');
    });

    afterEach(() => {
      suspendStudentRepoMock.restore();
      sinon.restore();
    });

    it('should not register the students if the input format is wrong', async function () {
      const req = { body: wrongInput } as unknown as any;
      const suspendStudentRepoStub = suspendStudentRepoMock.resolves(undefined);
      await userController.suspendStudent(req, res as any, next);
      expect(suspendStudentRepoStub.called).to.be.false;
      expect(status.calledOnce).to.be.false;
      expect(next.calledOnce).to.be.true;
    });

    it('should not return success response if the reposiory function throws error', async function () {
      const req = { body: correctInput } as unknown as any;
      const suspendStudentRepoStub = suspendStudentRepoMock.rejects('Sample error');
      await userController.suspendStudent(req, res as any, next);
      expect(suspendStudentRepoStub.called).to.be.true;
      expect(status.called).to.be.false;
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith('Sample error'));
    });

    it('should return success response if the reposiory function resolved with no error', async function () {
      const req = { body: correctInput } as unknown as any;
      const suspendStudentRepoStub = suspendStudentRepoMock.resolves(undefined);
      await userController.suspendStudent(req, res as any, next);
      expect(suspendStudentRepoStub.called).to.be.true;
      expect(status.calledOnce).to.be.true;
      expect(status.calledWith(204));
      expect(next.called).to.be.false;
    });
  });

  describe('validateNotificationsInput', function () {
    const wrongSchemas = [{ teacher: '' }, { notification: 'hello' }, { teacher: 'teacher@123.com' }] as any[];

    wrongSchemas.forEach((schema) => {
      it('should throw error if the input passed is of wrong format/has empty values', async () => {
        const userController = new UserController();
        await expect(userController.validateNotificationsInput(schema)).to.be.rejectedWith(Error);
      });
    });

    it('should not throw error if the input passed is correct', async () => {
      const userController = new UserController();
      const schema = {
        teacher: 'teacher@123.com',
        notification: 'hello',
      };
      await expect(userController.validateNotificationsInput(schema)).to.eventually.equal(undefined);
    });
  });

  describe('retrieveNotificationRecipients', function () {
    let status: sinon.SinonStub<any[], any>,
      json: sinon.SinonSpy<any[], any>,
      send,
      res: { json: sinon.SinonSpy<any[], any>; status: sinon.SinonStub<any[], any>; send: any },
      next: sinon.SinonSpy<any[], any>,
      userController: UserController;

    let retrieveNotificationRecipientsRepoMock: sinon.SinonStub<
      [teacherEmail: string, mentionedStudents: string[]],
      Promise<string[]>
    >;

    const wrongInput = {
      teacher: '',
    };

    const correctInput = {
      teacher: 'teacher@123.com',
      notification: 'Hello everybody',
    };

    beforeEach(() => {
      status = sinon.stub();
      json = sinon.spy();
      next = sinon.spy();
      send = sinon.spy();
      res = { json, status, send };
      status.returns(res);
      userController = new UserController();
      retrieveNotificationRecipientsRepoMock = sinon.stub(UserReposiory.prototype, 'retrieveNotificationsRecipients');
    });

    afterEach(() => {
      retrieveNotificationRecipientsRepoMock.restore();
      sinon.restore();
    });

    it('should fetch common students if the input format is wrong', async function () {
      const req = { body: wrongInput } as unknown as any;
      const retrieveNotificationRecipientsRepoStub = retrieveNotificationRecipientsRepoMock.resolves([]);
      await userController.retrieveNotificationRecipients(req, res as any, next);
      expect(retrieveNotificationRecipientsRepoStub.called).to.be.false;
      expect(json.calledOnce).to.be.false;
      expect(next.calledOnce).to.be.true;
    });

    it('should not return success response if the reposiory function throws error', async function () {
      const req = { body: correctInput } as unknown as any;
      const retrieveNotificationRecipientsRepoStub = retrieveNotificationRecipientsRepoMock.rejects('Sample error');
      await userController.retrieveNotificationRecipients(req, res as any, next);
      expect(retrieveNotificationRecipientsRepoStub.called).to.be.true;
      expect(json.calledOnce).to.be.false;
      expect(next.calledOnce).to.be.true;
      expect(next.calledWith('Sample error'));
    });

    it('should  return success response if the reposiory function resolved with no error', async function () {
      const recipients = ['student@123.com', 'student@223.com'];
      const req = { body: correctInput } as unknown as any;
      const retrieveNotificationRecipientsRepoStub = retrieveNotificationRecipientsRepoMock.resolves(recipients);
      await userController.retrieveNotificationRecipients(req, res as any, next);
      expect(retrieveNotificationRecipientsRepoStub.called).to.be.true;
      expect(next.called).to.be.false;
      expect(json.calledOnce).to.be.true;
      expect(
        json.calledWith({
          recipients,
        }),
      );
    });
  });

  describe('parseNotificationBody', function () {
    it("should return empty array if the input doesn't contain mentioned studnet emails", async () => {
      const notification = 'hello';
      const userController = new UserController();
      expect(userController.parseNotificationBody(notification)).to.have.length(0);
    });

    it('should return mentioned emails if the input contains mentioned studnet emails', async () => {
      const notification = 'hello @student@123.com @student@223.com';
      const userController = new UserController();
      expect(userController.parseNotificationBody(notification)).to.have.members([
        'student@123.com',
        'student@223.com',
      ]);
    });
  });
});
