import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '../stores/auth-store';

const routes: RouteRecordRaw[] = [
    {
        children: [
            {
                component: () => import('../pages/auth/choose-roles-page.vue'),
                path: '/welcome',
            },
            {
                component: () => import('../pages/auth/signup-page.vue'),
                path: '/signup',
            },
            {
                component: () => import('../pages/auth/signin-page.vue'),
                path: '/signin',
            },
            {
                component: () => import('../pages/auth/company-start-page.vue'),
                path: '/recruiter/start',
            },
            {
                component: () => import('../pages/auth/company-join-page.vue'),
                path: 'recruiter/join',
            },
            {
                component: () => import('../pages/auth/forgot-password-page.vue'),
                path: '/forgot-password',
            },
            {
                component: () => import('../pages/auth/reset-password-page.vue'),
                path: '/reset-password',
            },
        ],
        component: () => import('../layouts/auth-layout.vue'),
        path: '',
        redirect: '/signin',
    },
    {
        children: [
            // TALENT
            {
                component: () => import('../pages/talent/profile/profile-page.vue'),
                meta: { requiresAuth: true },
                path: 'talent/:talentId',
            },
            {
                component: () => import('../pages/talent/job-search-page.vue'),
                meta: { requiresAuth: true },
                path: '/talent/:talentId/search',
            },
            {
                component: () => import('../pages/recruiter/job-detail-page.vue'),
                meta: { requiresAuth: true },
                path: '/talent/:talentId/search/:jobOfferId',
            },
            {
                component: () => import('../pages/recruiter/job-test-page.vue'),
                meta: { requiresAuth: true },
                path: '/talent/:talentId/search/:jobOfferId/test',
            },
            {
                component: () => import('../pages/talent/candidacies-page.vue'),
                meta: { requiresAuth: true },
                path: '/talent/:talentId/candidacies',
            },
            {
                component: () => import('../pages/recruiter/company-profile-page.vue'),
                meta: { requiresAuth: true },
                path: '/talent/:talentId/company/:companyName',
            },
            {
                component: () => import('../pages/chat-page.vue'),
                meta: { requiresAuth: true },
                name: 'chat-talent',
                path: '/talent/:talentId/chat/:conversationId?',
            },
            {
                component: () => import('../pages/account-page.vue'),
                path: '/talent/:talentId/account',
            },
            // RECRUITER
            {
                component: () => import('../pages/recruiter/company-profile-page.vue'),
                meta: { requiresAuth: true },
                path: '/recruiter/:companyName',
            },
            {
                component: () => import('../pages/recruiter/job-list-page.vue'),
                meta: { requiresAuth: true },
                path: '/recruiter/:companyName/jobs',
            },
            {
                component: () => import('../pages/recruiter/job-draft-page.vue'),
                meta: { requiresAuth: true },
                path: '/recruiter/:companyName/jobs/draft/:jobOfferId?',
            },
            {
                component: () => import('../pages/recruiter/job-detail-page.vue'),
                meta: { requiresAuth: true },
                path: '/recruiter/:companyName/jobs/:jobOfferId',
            },
            {
                component: () => import('../pages/recruiter/candidacies/candidacies-page.vue'),
                meta: { requiresAuth: true },
                path: '/recruiter/:companyName/jobs/:jobOfferId/candidacies',
            },
            {
                component: () => import('../pages/recruiter/candidacy-detail-page.vue'),
                meta: { requiresAuth: true },
                path: '/recruiter/:companyName/jobs/:jobOfferId/candidacies/:candidacyId',
            },
            {
                component: () => import('../pages/chat-page.vue'),
                meta: { requiresAuth: true },
                name: 'chat-recruiter',
                path: '/recruiter/:companyName/chat/:conversationId?',
            },
            {
                component: () => import('../pages/talent/profile/profile-page.vue'),
                meta: { requiresAuth: true },
                path: '/recruiter/:companyName/talent/:talentId',
            },
            {
                component: () => import('../pages/account-page.vue'),
                path: '/recruiter/:companyName/account',
            },
        ],
        component: () => import('../layouts/main-layout.vue'),
        path: '',
    },
    {
        component: () => import('../pages/404-page.vue'),
        path: '/:pathMatch(.*)*',
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const { isUserSigned } = useAuthStore();

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!(isUserSigned())) {
            next({ path: '/signin' });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
