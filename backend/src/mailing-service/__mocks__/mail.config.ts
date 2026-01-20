export const mailjetClient = {
  post: jest.fn().mockReturnValue({
    request: jest.fn().mockResolvedValue({ body: { success: true } }),
  }),
};

export const sender = {
  email: "test@example.com",
  name: "Test Sender",
};
