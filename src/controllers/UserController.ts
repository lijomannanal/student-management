import Logger from '../config/logger';
import { validate } from 'class-validator';
import { type Request, type Response, type NextFunction } from 'express';
import {
  type RegisterSchema,
  RegisterInput,
  type CommonStudentsQuerySchema,
  CommonStudentsQueryInput,
  type SuspendStudentSchema,
  SuspendStudentInput,
  type NotificationSchema,
  NotificationInput,
} from '../models/validationSchema';
import UserReposiory from '../repositories/UserRepository';
import ErrorBase from '../errors/ErrorBase';
const LOG = new Logger('UserController.js');

class UserController {
  private readonly userReposiory;
  constructor() {
    this.userReposiory = new UserReposiory();
  }

  /**
   * Function to validate register input
   * @function validateRegisterInput
   * @param {Object} input - RegisterSchema
   */
  public async validateRegisterInput(input: RegisterSchema): Promise<void> {
    LOG.info(`validating register input`);
    const newInput = new RegisterInput();
    newInput.teacher = input.teacher;
    newInput.students = input.students;
    const errors = await validate(newInput);
    if (errors.length > 0) {
      LOG.info(errors as unknown as string);
      throw new ErrorBase('Invalid input format!', 400);
    }
  }

  /**
   * Function to register students to specified teacher
   * @function registerStudents
   * @param {Object} req - ExpressJS req
   * @param {Object} res - ExpressJS res
   * @param {requestCallback} next - Callback that handles request
   */
  public async registerStudents(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<any, Record<string, any>> | undefined> {
    try {
      LOG.info(`Request received to register students`);
      await this.validateRegisterInput(req.body);
      await this.userReposiory.registerStudents(req.body);
      return res.status(204).send();
    } catch (error) {
      LOG.error(error as string);
      next(error);
    }
  }

  /**
   * Function to validate common students input
   * @function validateCommonStudentsInput
   * @param {Object} input - CommonStudentsQuerySchema
   */
  public async validateCommonStudentsInput(input: CommonStudentsQuerySchema): Promise<void> {
    LOG.info(`Validating commonstudents query input`);
    const newInput = new CommonStudentsQueryInput();
    newInput.teacher = input.teacher;
    const errors = await validate(newInput);
    if (errors.length > 0) {
      LOG.info(errors as unknown as string);
      throw new ErrorBase('Invalid input format!', 400);
    }
  }

  /**
   * Function to fetch all common students of teachers
   * @function getCommonStudents
   * @param {Object} req - ExpressJS req
   * @param {Object} res - ExpressJS res
   * @param {requestCallback} next - Callback that handles request
   */
  public async getCommonStudents(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<any, Record<string, any>> | undefined> {
    try {
      LOG.info(`Request received to fetch common students`);
      await this.validateCommonStudentsInput(req.query as unknown as CommonStudentsQuerySchema);
      const result = await this.userReposiory.getCommonStudents(req.query.teacher as string[]);
      // LOG.info(`Returning ${result.length} users`);
      return res.json({ students: result });
    } catch (error) {
      LOG.error(error as string);
      next(error);
    }
  }

  /**
   * Function to validate suspend student input
   * @function validateStudentSuspendInput
   * @param {Object} input - SuspendStudentSchema
   */
  public async validateStudentSuspendInput(input: SuspendStudentSchema): Promise<void> {
    LOG.info(`Validating suspendStudent input body`);
    const newInput = new SuspendStudentInput();
    newInput.student = input.student;
    const errors = await validate(newInput);
    if (errors.length > 0) {
      LOG.info(errors as unknown as string);
      throw new ErrorBase('Invalid input format!', 400);
    }
  }

  /**
   * Function to suspend student by email address
   * @function suspendStudent
   * @param {Object} req - ExpressJS req
   * @param {Object} res - ExpressJS res
   * @param {requestCallback} next - Callback that handles request
   */
  public async suspendStudent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<any, Record<string, any>> | undefined> {
    try {
      LOG.info(`Request received to suspend student`);
      await this.validateStudentSuspendInput(req.body);
      await this.userReposiory.suspendStudent(req.body.student);
      // LOG.info(`Returning ${result.length} users`);
      return res.status(204).send();
    } catch (error) {
      LOG.error(error as string);
      next(error);
    }
  }

  /**
   * Function to validate notification input
   * @function validateNotificationsInput
   * @param {Object} input - NotificationSchema
   */
  public async validateNotificationsInput(input: NotificationSchema): Promise<void> {
    LOG.info(`Validating retrieveNotificationRecipients input body`);
    const newInput = new NotificationInput();
    newInput.teacher = input.teacher;
    newInput.notification = input.notification;
    const errors = await validate(newInput);
    if (errors.length > 0) {
      LOG.info(errors as unknown as string);
      throw new ErrorBase('Invalid input format!', 400);
    }
  }

  /**
   * Function to retieve notification recipients
   * @function retrieveNotificationRecipients
   * @param {Object} req - ExpressJS req
   * @param {Object} res - ExpressJS res
   * @param {requestCallback} next - Callback that handles request
   */
  public async retrieveNotificationRecipients(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<any, Record<string, any>> | undefined> {
    try {
      LOG.info(`Request received to retrieve notification recipients list`);
      await this.validateNotificationsInput(req.body);
      const { teacher, notification } = req.body;
      const mentionedStudents = this.parseNotificationBody(notification);
      const recipients = await this.userReposiory.retrieveNotificationsRecipients(teacher, mentionedStudents);
      return res.json({ recipients });
    } catch (error) {
      LOG.error(error as string);
      next(error);
    }
  }

  /**
   * Function to extract mentioned students from the notification message
   * @function parseNotificationBody
   * @param {String} notification - notification message
   * @return {Array<String>} list of student emails mentioned in the notification
   */
  public parseNotificationBody(notification: string): string[] {
    let recipients = [] as string[];
    try {
      if (notification.includes('@')) {
        const mentionParts = notification.split(' ').filter((item) => item.startsWith('@'));
        recipients = mentionParts.map((item) => item.substring(1));
      }
      return recipients;
    } catch (error) {
      LOG.error(error as string);
      throw error;
    }
  }
}

export default UserController;
