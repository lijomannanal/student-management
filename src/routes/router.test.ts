import chai from 'chai';
import chaiHttp from 'chai-http';
import * as dotenv from 'dotenv';
import server from '../index';
import DbConnection from '../config/db';
import { Student, Teacher } from '../models';
import * as path from 'path';

dotenv.config({
  path: path.resolve('./', `.env.${process.env.NODE_ENV as string}`),
});

chai.use(chaiHttp);
const should = chai.should();

describe('router', () => {
  beforeEach(async () => {
    await DbConnection.sync();
  });

  afterEach(async () => {
    await DbConnection.drop();
  });

  describe('/POST api/register', () => {
    it('should not register teacher/ students if the request body is invalid', (done) => {
      chai
        .request(server)
        .post('/api/register')
        .send({})
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          done();
        });
    });

    it('should register teacher/ students if the request body is valid', (done) => {
      const validInput = {
        teacher: 'teacherken@gmail.com',
        students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
      };
      chai
        .request(server)
        .post('/api/register')
        .send(validInput)
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(204);
          done();
        });
    });
  });

  describe('/GET api/commonstudents', () => {
    beforeEach(async () => {
      await DbConnection.sync();
      const teacher1Input = { email: 'teacher1@123.com' };
      const teacher2Input = { email: 'teacher2@123.com' };
      const student1Input = { email: 'student1@123.com' };
      const student2Input = { email: 'student2@123.com' };
      const [teacher1, teacher2, student1, student2] = await Promise.all([
        Teacher.create(teacher1Input),
        Teacher.create(teacher2Input),
        Student.create(student1Input),
        Student.create(student2Input),
      ]);
      await Promise.all([teacher1.addStudents([student1, student2]), teacher2.addStudents([student2])]);
    });

    it('should not fetch common students if the query param is not present', (done) => {
      chai
        .request(server)
        .get('/api/commonstudents')
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          done();
        });
    });

    it('should fetch common students of teacher1', (done) => {
      chai
        .request(server)
        .get('/api/commonstudents?teacher%5B%5D=teacher1@123.com')
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('students');
          res.body.students.length.should.be.eql(2);
          res.body.students.should.have.members(['student1@123.com', 'student2@123.com']);
          done();
        });
    });

    it('should fetch common students of teacher1 & teacher2', (done) => {
      chai
        .request(server)
        .get('/api/commonstudents?teacher%5B%5D=teacher1%40123.com&teacher%5B%5D=teacher2%40123.com')
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('students');
          res.body.students.length.should.be.eql(1);
          res.body.students.should.have.members(['student2@123.com']);
          done();
        });
    });
  });

  describe('/POST api/suspend', () => {
    beforeEach(async () => {
      await DbConnection.sync();
      const student1Input = { email: 'student1@123.com' };
      await Student.create(student1Input);
    });

    it('should return error if the the request body is of invalid format', (done) => {
      chai
        .request(server)
        .post('/api/suspend')
        .send({})
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should return error if the student email being suspended is not registered', (done) => {
      chai
        .request(server)
        .post('/api/suspend')
        .send({ student: 'student2@123.com' })
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          done();
        });
    });

    it('should suspend student if it is already registered', (done) => {
      const validInput = {
        student: 'student1@123.com',
      };
      chai
        .request(server)
        .post('/api/suspend')
        .send(validInput)
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(204);
          done();
        });
    });
  });

  describe('/POST api/retrievefornotifications', () => {
    beforeEach(async () => {
      await DbConnection.sync();
      const teacher1Input = { email: 'teacher1@123.com' };
      const student1Input = { email: 'student1@123.com' };
      const student2Input = { email: 'student2@123.com' };
      const [teacher1, student1] = await Promise.all([
        Teacher.create(teacher1Input),
        Student.create(student1Input),
        Student.create(student2Input),
      ]);
      await teacher1.addStudents([student1]);
    });

    it('should return error if the the request body is of invalid format', (done) => {
      chai
        .request(server)
        .post('/api/retrievefornotifications')
        .send({})
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should fetch the recipents list if the request body is valid', (done) => {
      const validInput = {
        teacher: 'teacher1@123.com',
        notification: 'Hello students! @student2@123.com',
      };
      chai
        .request(server)
        .post('/api/retrievefornotifications')
        .send(validInput)
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('recipients');
          res.body.recipients.length.should.be.eql(2);
          res.body.recipients.should.have.members(['student1@123.com', 'student2@123.com']);
          done();
        });
    });

    it('should return the recipients list without duplicates if the student registered under teacher is being mentioned in the notification', (done) => {
      const validInput = {
        teacher: 'teacher1@123.com',
        notification: 'Hello students! @student1@123.com @student2@123.com', // registered student -> student1@123.com
      };
      chai
        .request(server)
        .post('/api/retrievefornotifications')
        .send(validInput)
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('recipients');
          res.body.recipients.length.should.be.eql(2);
          res.body.recipients.should.have.members(['student1@123.com', 'student2@123.com']);
          done();
        });
    });

    it('should return the recipients list  by excluding suspended student', (done) => {
      void Student.update({ isActive: false }, { where: { email: 'student1@123.com' } }).then(() => {
        const validInput = {
          teacher: 'teacher1@123.com',
          notification: 'Hello students! @student1@123.com @student2@123.com', // suspended student -> student1@123.com
        };
        chai
          .request(server)
          .post('/api/retrievefornotifications')
          .send(validInput)
          .end((_err, res) => {
            should.exist(res);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('recipients');
            res.body.recipients.length.should.be.eql(1);
            res.body.recipients.should.have.members(['student2@123.com']);
            done();
          });
      });
    });

    it('should return the recipients list  by excluding unregistered student', (done) => {
      const validInput = {
        teacher: 'teacher1@123.com',
        notification: 'Hello students! @student1@123.com @student2@123.com @unregistered@123.com', // unregistered student -> student1@123.com
      };
      chai
        .request(server)
        .post('/api/retrievefornotifications')
        .send(validInput)
        .end((_err, res) => {
          should.exist(res);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('recipients');
          res.body.recipients.length.should.be.eql(2);
          res.body.recipients.should.have.members(['student1@123.com', 'student2@123.com']);
          done();
        });
    });
  });
});
