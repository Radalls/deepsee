export const generateCompanyInviteCode = (): string => {
    // random 4 digit code
    return Math.floor(1000 + Math.random() * 9000).toString();
};
