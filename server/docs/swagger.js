/**
 * Swagger API documentation configuration
 */
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prodexa API',
      version: '2.0.0',
      description: 'Student Productivity Platform API',
      contact: {
        name: 'Prodexa Team',
        email: 'support@prodexa.app',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['student', 'admin'] },
            bio: { type: 'string' },
            course: { type: 'string' },
            semester: { type: 'integer' },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
            dueDate: { type: 'string', format: 'date' },
            category: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['present', 'absent'] },
            subject: { type: 'string' },
          },
        },
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string' },
            color: { type: 'string' },
            pinned: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        StudyGoal: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['daily', 'weekly'] },
            progress: { type: 'integer' },
            target: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
            nextPage: { type: 'integer', nullable: true },
            prevPage: { type: 'integer', nullable: true },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Tasks', description: 'Task management' },
      { name: 'Attendance', description: 'Attendance tracking' },
      { name: 'Notes', description: 'Notes management' },
      { name: 'Study Goals', description: 'Study planner goals' },
      { name: 'Analytics', description: 'Dashboard analytics' },
      { name: 'Admin', description: 'Admin-only endpoints' },
    ],
  },
  apis: ['./routes/*.js'], // Scan route files for JSDoc comments
};

module.exports = swaggerJsDoc(options);