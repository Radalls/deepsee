const nodemailer = {
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true),
        verify: jest.fn().mockImplementation((callback) => callback(null)),
    }),
};

export default nodemailer;
