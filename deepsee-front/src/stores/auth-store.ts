import { defineStore } from 'pinia';
import { ref } from 'vue';

import { Company, CompanyInvite } from '../models/recruiter-model';
import { User } from '../models/user-model';
import { signIn as authSignIn, signOut as authSignOut } from '../services/auth-service';

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref<User | null>(null);
    const token = ref(localStorage.getItem('token') || null);

    const companyData = ref<Partial<Company> | null>(null);
    const companyInviteData = ref<Partial<CompanyInvite> | null>(null);

    const getUser = () => currentUser.value;
    const setUser = ({ user }: { user: User | null }) => currentUser.value = user;

    const isUserSigned = () => !!(token.value);
    const isUserRecruiter = () => currentUser.value?.role === 'recruiter';
    const isUserTalent = () => currentUser.value?.role === 'talent';

    const getCompany = () => companyData.value;
    const setCompany = ({ company }: { company: Partial<Company> | null }) => companyData.value = company;

    const getCompanyInvite = () => companyInviteData.value;
    const setCompanyInvite = ({ companyInvite }: {
        companyInvite: Partial<CompanyInvite> | null,
    }) => companyInviteData.value = companyInvite;

    const signIn = async ({ email, password }: {
        email: string,
        password: string,
    }) => {
        const user = await authSignIn({ email, password });
        currentUser.value = user;
        token.value = localStorage.getItem('token');
    };

    const signOut = async () => {
        await authSignOut();
        currentUser.value = null;
        token.value = null;
    };

    const resetToken = () => {
        token.value = null;
        currentUser.value = null;
    };

    return {
        getCompany,
        getCompanyInvite,
        getUser,
        isUserRecruiter,
        isUserSigned,
        isUserTalent,
        resetToken,
        setCompany,
        setCompanyInvite,
        setUser,
        signIn,
        signOut,
    };
});
