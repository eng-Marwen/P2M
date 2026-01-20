/// <reference types="jest" />

import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import {
  checkAuth,
  deleteAccount,
  forgotPassword,
  getHouseOwner,
  google,
  login,
  logout,
  resetPassword,
  signup,
  updateProfile,
  verifyMail,
  verifyResetOtp,
} from "../controllers/auth.controller.js";
import * as emails from "../mailing-service/emails.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import House from "../models/house.model.js";
import { User } from "../models/user.model.js";

// Mock dependencies
jest.mock("../models/user.model.js");
jest.mock("../models/house.model.js");
jest.mock("../mailing-service/emails.js");
jest.mock("../mailing-service/mail.config.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller Tests", () => {
  let app: Express;

  beforeAll(() => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Setup routes
    app.post("/api/auth/signup", signup);
    app.post("/api/auth/signin", login);
    app.post("/api/auth/verify-email", verifyMail);
    app.post("/api/auth/logout", logout);
    app.post("/api/auth/forgot-password", forgotPassword);
    app.post("/api/auth/verify-reset-otp", verifyResetOtp);
    app.post("/api/auth/reset-password", resetPassword);
    app.get("/api/auth/check-auth", verifyToken, checkAuth);
    app.post("/api/auth/google", google);
    app.delete("/api/auth/delete", verifyToken, deleteAccount);
    app.patch("/api/auth/update-profile", verifyToken, updateProfile);
    app.get("/api/auth/houseOwner/:id", getHouseOwner);

    // Set environment variable
    process.env.SECRET_KEY = "test-secret-key";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user successfully", async () => {
      const mockUser = {
        _id: "userId123",
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
        isVerified: false,
        verificationToken: "123456",
        toObject: jest.fn().mockReturnValue({
          _id: "userId123",
          username: "testuser",
          email: "test@example.com",
          isVerified: false,
        }),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (emails.sendVerificatinMail as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post("/api/auth/signup").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "verification email sent successfully",
      );
      expect(User.create).toHaveBeenCalled();
      expect(emails.sendVerificatinMail).toHaveBeenCalledWith(
        "test@example.com",
        expect.any(String),
      );
    });

    it("should return error if email, username, or password is missing", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        email: "test@example.com",
        // missing username and password
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("REQUIRED");
    });

    it("should return error if user already exists and is verified", async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          email: "test@example.com",
          isVerified: true,
        }),
      });

      const response = await request(app).post("/api/auth/signup").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("USER ALREADY EXISTS");
    });

    it("should update user if exists but not verified", async () => {
      const mockExistingUser = {
        email: "test@example.com",
        isVerified: false,
      };

      const mockUpdatedUser = {
        _id: "userId123",
        username: "testuser",
        email: "test@example.com",
        isVerified: false,
        toObject: jest.fn().mockReturnValue({
          _id: "userId123",
          username: "testuser",
          email: "test@example.com",
        }),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockExistingUser),
      });
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (emails.sendVerificatinMail as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post("/api/auth/signup").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(User.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/verify-email", () => {
    it("should verify email successfully with valid code", async () => {
      const mockUser = {
        _id: "userId123",
        username: "testuser",
        email: "test@example.com",
        isVerified: false,
        verificationToken: "123456",
        verificationTokenExpiresAt: new Date(Date.now() + 3600000),
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: "userId123",
          username: "testuser",
          email: "test@example.com",
          isVerified: true,
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (emails.sendWemcomeEmail as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/auth/verify-email")
        .send({ code: "123456" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("email verified successfully");
      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(emails.sendWemcomeEmail).toHaveBeenCalled();
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return error with invalid verification code", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/verify-email")
        .send({ code: "999999" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe(
        "invalid or expired verification code",
      );
    });
  });

  describe("POST /api/auth/signin", () => {
    it("should login user successfully with valid credentials", async () => {
      const mockUser = {
        _id: "userId123",
        id: "userId123",
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
        isVerified: true,
        lastLogin: null,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: "userId123",
          username: "testuser",
          email: "test@example.com",
          isVerified: true,
        }),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app).post("/api/auth/signin").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("user logged in successfully");
      expect(mockUser.save).toHaveBeenCalled();
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return error if email or password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/signin")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain(
        "missing email or password field",
      );
    });

    it("should return error if user does not exist", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/api/auth/signin").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("does not exit");
    });

    it("should return error if password is invalid", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app).post("/api/auth/signin").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("invalid password");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout user successfully", async () => {
      const response = await request(app).post("/api/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("user logged out successfully");
      // Check that the cookie is cleared
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send OTP email successfully", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (emails.sendResetPasswordOtpEmail as jest.Mock).mockResolvedValue(
        undefined,
      );

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("OTP sent successfully.");
      expect(mockUser.save).toHaveBeenCalled();
      expect(emails.sendResetPasswordOtpEmail).toHaveBeenCalled();
    });

    it("should return error if email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.status).toBe("failed");
    });

    it("should return error if user not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("POST /api/auth/verify-reset-otp", () => {
    it.skip("should verify OTP successfully and set temp token", async () => {
      const mockUser = {
        _id: "userId123",
        email: "test@example.com",
        resetPasswordToken:
          "d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2",
        resetPasswordTokenExpiresAt: new Date(Date.now() + 900000),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });
      (jwt.sign as jest.Mock).mockReturnValue("tempToken123");

      const response = await request(app)
        .post("/api/auth/verify-reset-otp")
        .send({
          email: "test@example.com",
          otp: "123456",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("OTP verified successfully");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return error if email or OTP is missing", async () => {
      const response = await request(app)
        .post("/api/auth/verify-reset-otp")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Email and OTP are required");
    });

    it("should return error if OTP is invalid", async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app)
        .post("/api/auth/verify-reset-otp")
        .send({
          email: "test@example.com",
          otp: "999999",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Invalid or expired OTP");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should reset password successfully with valid token", async () => {
      const mockUser = {
        _id: "userId123",
        email: "test@example.com",
        username: "testuser",
        password: "oldHashedPassword",
        save: jest.fn().mockResolvedValue(true),
      };

      (jwt.verify as jest.Mock).mockReturnValue({ userId: "userId123" });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
      (emails.sendResetPwdSuccessfullyMail as jest.Mock).mockResolvedValue(
        undefined,
      );

      const response = await request(app)
        .post("/api/auth/reset-password")
        .set("Cookie", ["tempResetToken=validToken123"])
        .send({
          newPassword: "newPassword123",
          confirmPassword: "newPassword123",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Password updated successfully");
      expect(mockUser.save).toHaveBeenCalled();
      expect(emails.sendResetPwdSuccessfullyMail).toHaveBeenCalled();
    });

    it("should return error if passwords do not match", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .set("Cookie", ["tempResetToken=validToken123"])
        .send({
          newPassword: "newPassword123",
          confirmPassword: "differentPassword",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Passwords do not match");
    });

    it("should return error if temp token is missing", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          newPassword: "newPassword123",
          confirmPassword: "newPassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Missing reset token");
    });
  });

  describe("POST /api/auth/google", () => {
    it("should create new user and login with Google OAuth", async () => {
      const mockNewUser = {
        _id: "userId123",
        username: "testuser",
        email: "test@gmail.com",
        avatar: "https://avatar.url",
        isVerified: true,
        toObject: jest.fn().mockReturnValue({
          _id: "userId123",
          username: "testuser",
          email: "test@gmail.com",
          avatar: "https://avatar.url",
        }),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      (User.create as jest.Mock).mockResolvedValue(mockNewUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("randomHashedPassword");

      const response = await request(app).post("/api/auth/google").send({
        email: "test@gmail.com",
        username: "testuser",
        avatar: "https://avatar.url",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "user logged in with google successfully",
      );
      expect(User.create).toHaveBeenCalled();
    });

    it("should login existing Google user", async () => {
      const mockExistingUser = {
        _id: "userId123",
        username: "testuser",
        email: "test@gmail.com",
        avatar: "https://avatar.url",
        isVerified: true,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockExistingUser),
      });

      const response = await request(app).post("/api/auth/google").send({
        email: "test@gmail.com",
        username: "testuser",
        avatar: "https://avatar.url",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/auth/houseOwner/:id", () => {
    it("should return house owner information", async () => {
      const mockHouse = {
        _id: "houseId123",
        userRef: {
          _id: "userId123",
          username: "testuser",
          email: "test@example.com",
        },
      };

      (House.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockHouse),
      });

      const response = await request(app).get(
        "/api/auth/houseOwner/houseId123",
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toEqual(mockHouse.userRef);
    });

    it("should return 404 if house not found", async () => {
      (House.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app).get(
        "/api/auth/houseOwner/nonexistentId",
      );

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("HOUSE NOT FOUND");
    });
  });

  describe("Protected Routes (with verifyToken middleware)", () => {
    describe("GET /api/auth/check-auth", () => {
      it("should return user data when authenticated", async () => {
        const mockUser = {
          _id: "userId123",
          username: "testuser",
          email: "test@example.com",
          select: jest.fn().mockResolvedValue({
            _id: "userId123",
            username: "testuser",
            email: "test@example.com",
          }),
        };

        (jwt.verify as jest.Mock).mockReturnValue({ userId: "userId123" });
        (User.findById as jest.Mock).mockReturnValue(mockUser);

        const response = await request(app)
          .get("/api/auth/check-auth")
          .set("Cookie", ["auth-token=validToken123"]);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
      });
    });

    describe("DELETE /api/auth/delete", () => {
      it("should delete user account successfully", async () => {
        (jwt.verify as jest.Mock).mockReturnValue({ userId: "userId123" });
        (User.findByIdAndDelete as jest.Mock).mockResolvedValue({
          _id: "userId123",
        });

        const response = await request(app)
          .delete("/api/auth/delete")
          .set("Cookie", ["auth-token=validToken123"]);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe("user account deleted successfully");
      });
    });

    describe("PATCH /api/auth/update-profile", () => {
      it("should update user profile successfully", async () => {
        const mockUser = {
          _id: "userId123",
          username: "oldusername",
          password: "hashedPassword",
        };

        const mockUpdatedUser = {
          _id: "userId123",
          username: "newusername",
          avatar: "https://new-avatar.url",
        };

        (jwt.verify as jest.Mock).mockReturnValue({ userId: "userId123" });
        (User.findById as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
        (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUpdatedUser),
        });

        const response = await request(app)
          .patch("/api/auth/update-profile")
          .set("Cookie", ["auth-token=validToken123"])
          .send({
            username: "newusername",
            avatar: "https://new-avatar.url",
            oldPassword: "oldPassword123",
            newPassword: "newPassword123",
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe("Profile updated successfully");
      });

      it("should return error if old password is incorrect", async () => {
        const mockUser = {
          _id: "userId123",
          password: "hashedPassword",
        };

        (jwt.verify as jest.Mock).mockReturnValue({ userId: "userId123" });
        (User.findById as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const response = await request(app)
          .patch("/api/auth/update-profile")
          .set("Cookie", ["auth-token=validToken123"])
          .send({
            oldPassword: "wrongPassword",
            newPassword: "newPassword123",
          });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("fail");
        expect(response.body.message).toBe("Current password is incorrect");
      });
    });
  });
});
