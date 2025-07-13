import { register } from '../controllers/authController.js';
import { hashPassword } from '../utils/hash';
import prisma from '../config/db';
import { generateToken } from '../utils/jwt.js';


jest.mock('../config/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../utils/hash', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../utils/jwt', () => ({
  generateToken: jest.fn(),
}));

describe('register function', () => {
  it('should register a new user successfully', async () => {
    const req = {
      body: {
        username: 'new_user',
        email: 'newuser@example.com',
        password: 'password123',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Prisma to simulate no existing user
    prisma.user.findUnique.mockResolvedValue(null);

    // Mock hashPassword function
    hashPassword.mockResolvedValue('hashed_password');

    // Mock user creation
    prisma.user.create.mockResolvedValue({
      id: 1,
      username: 'new_user',
      email: 'newuser@example.com',
      password: 'hashed_password',
    });

    // Mock token generation
    const token = 'mock_token';
    generateToken.mockReturnValue(token);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      token,
      user: { id: 1, username: 'new_user', email: 'newuser@example.com' },
    });
  });

  it('should return error if the user already exists', async () => {
    const req = {
      body: {
        username: 'existing_user',
        email: 'existinguser@example.com',
        password: 'password123',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Prisma to simulate an existing user
    prisma.user.findUnique.mockResolvedValue({ id: 1, username: 'existing_user' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('should handle internal server errors gracefully', async () => {
    const req = {
      body: {
        username: 'new_user',
        email: 'newuser@example.com',
        password: 'password123',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Simulating an error in the database call
    prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
