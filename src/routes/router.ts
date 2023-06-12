import { Router, type RequestHandler } from 'express';
import UserController from '../controllers/UserController';

const router = Router();

const userController = new UserController();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary:  API to register students to a teacher
 *     description: API to register students to a teacher
 *     tags:
 *       - Registration
 *     requestBody:
 *         description: input
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       204:
 *         description: Student registration completed successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/InvalidInputError'
 *                 - $ref: '#/components/schemas/StudentAlreadyRegisteredError'
 *                 - $ref: '#/components/schemas/MalformedJson'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ServerError'
 */
router.post('/register', userController.registerStudents.bind(userController) as RequestHandler);

/**
 * @swagger
 * /api/commonstudents:
 *   get:
 *     summary:  API to fetch list of common students
 *     description: API to login to the server
 *     tags:
 *       - User Management
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: teacher[]
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: ok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonStudents'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/InvalidInputError'
 *                 - $ref: '#/components/schemas/TeacherNotExistError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ServerError'
 */
router.get('/commonstudents', userController.getCommonStudents.bind(userController) as RequestHandler);

/**
 * @swagger
 * /api/suspend:
 *   post:
 *     summary:  API to suspend student
 *     description: API to suspend student
 *     tags:
 *       - User Management
 *     requestBody:
 *         description: input
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentSuspendInput'
 *     responses:
 *       204:
 *         description: Student account suspended successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/InvalidInputError'
 *                 - $ref: '#/components/schemas/StudentNotExistError'
 *                 - $ref: '#/components/schemas/MalformedJson'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ServerError'
 */
router.post('/suspend', userController.suspendStudent.bind(userController) as RequestHandler);

/**
 * @swagger
 * /api/retrievefornotifications:
 *   post:
 *     summary:  API to retrieve list of notification recipients
 *     description: API to retrieve list of notification recipients
 *     tags:
 *       - User Management
 *     requestBody:
 *         description: input
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationsInput'
 *     responses:
 *       200:
 *         description: ok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationRecipientsList'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/InvalidInputError'
 *                 - $ref: '#/components/schemas/StudentNotExistError'
 *                 - $ref: '#/components/schemas/MalformedJson'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ServerError'
 */

router.post(
  '/retrievefornotifications',
  userController.retrieveNotificationRecipients.bind(userController) as RequestHandler,
);

export default router;

/**
 * @swagger
 *  components:
 *    schemas:
 *      RegisterInput:
 *       type: object
 *       properties:
 *         teacher:
 *           type: string
 *           example: teacherken@gmail.com
 *         students:
 *           type: array
 *           items:
 *             type: string
 *           example: ["studentjon@gmail.com", "studenthon@gmail.com"]
 *      StudentSuspendInput:
 *        type: object
 *        properties:
 *         student:
 *           type: string
 *           example: studenthon@gmail.com
 *      NotificationsInput:
 *        type: object
 *        properties:
 *         teacher:
 *           type: string
 *           example: teacherken@gmail.com
 *         notification:
 *           type: string
 *           example: Hello students! @studentagnes@gmail.com @studentmiche@gmail.com
 *      CommonStudents:
 *        type: object
 *        properties:
 *          students:
 *            type: array
 *            items:
 *              type: string
 *            example: ["studentjon@gmail.com", "studenthon@gmail.com"]
 *      NotificationRecipientsList:
 *        type: object
 *        properties:
 *          recipients:
 *            type: array
 *            items:
 *              type: string
 *            example: ["studentjon@gmail.com", "studentmiche@gmail.com", "studentagnes@gmail.com"]
 *      MalformedJson:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example:  Malformed json!
 *      InvalidInputError:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example:  Invalid input format!
 *      StudentAlreadyRegisteredError:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example: Student(s) "<emails>" are already regsitered to the teacher
 *      TeacherNotExistError:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example: Teacher(s) "<emails>" do not exist
 *      StudentNotExistError:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example: Student with this email does not exist
 *    responses:
 *      ServerError:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example: Internal server error
 *
 *
 *
 *
 *
 */
