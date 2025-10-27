/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Navigate } from 'react-router-dom';

import WithAuth from '@/components/WithAuth';
import { URLS, USER_ROLE } from '@/constants';
import { AttributesProvider } from '@/context/AtrributesContext';
import Layout from '@/layouts/Layout';
import CreateQuestionBank from '@/pages/Admin/Questionnaire/question-bank/components/CreateQuestionBank';

import QuestionBank from '../../pages/Admin/Questionnaire/question-bank';
import QuestionnairesList from '../../pages/Admin/Questionnaire/questionnaires-list/questionnairesList';
import ViewQuestionBank from '../../pages/Admin/Questionnaire/view-question-bank';
import SurveyWrapper from '../../pages/User/survey-list/SurveyWrapper';
import { RedirectPage } from './Redirect';

const SignUp = React.lazy(() => import('@/pages/common/sign-up'));
const Verification = React.lazy(() => import('@/pages/common/verification'));
const LogIn = React.lazy(() => import('@/pages/common/logIn'));
const ForgotPassword = React.lazy(() => import('@/pages/common/forgot-password'));
const ResetPassword = React.lazy(() => import('@/pages/common/reset-password'));
const NotFoundPage = React.lazy(() => import('@/pages/common/not-found-page'));
const Notification = React.lazy(() => import('@/pages/common/notification'));
const Profile = React.lazy(() => import('@/pages/common/profile'));
const ChangePassword = React.lazy(() => import('@/pages/common/change-password'));
const Questionnaire = React.lazy(() => import('@/pages/Admin/Questionnaire'));
const ReportingStatus = React.lazy(() => import('@/pages/Admin/ReportingStatus'));
const CompanyReportingStatus = React.lazy(() => import('@/pages/Admin/CompanyReportingStatus'));
const CompanyManagement = React.lazy(() => import('@/pages/Admin/CompanyManagement'));
const Support = React.lazy(() => import('@/pages/Support'));
const FAQ = React.lazy(() => import('@/pages/FAQ'));
const TableBuilderDemo = React.lazy(() => import('@/pages/TableBuilderDemo'));

const UsersManagement = React.lazy(() => import('@/pages/Admin/UserManagement'));
const UserSubmissions = React.lazy(() => import('@/pages/User/UserSubmissions'));

const renderWithAuth = (children: React.ReactNode, role: USER_ROLE | USER_ROLE[]) => {
  return <WithAuth role={role}>{children}</WithAuth>;
};

export const routes = [
  // Table Builder Demo Route (for testing)
  {
    path: URLS.TABLE_BUILDER_DEMO,
    element: <TableBuilderDemo />
  },
  // {
  //   path: URLS.ADMIN,
  //   element: renderWithAuth(<Layout />, USER_ROLE.USER),
  //   children: [{ path: URLS.ADMIN_QUESTIONNAIRE, element: <Questionnaire /> }]
  // },
  {
    path: URLS.SIGN_UP,
    element: <SignUp />
  },
  { path: URLS.VERIFICATION, element: <Verification /> },
  { path: URLS.LOG_IN, element: <LogIn /> },
  { path: URLS.FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: URLS.RESET_PASSWORD, element: <ResetPassword /> },
  {
    path: URLS.NOTIFICATION,
    element: renderWithAuth(<Notification />, [USER_ROLE.USER, USER_ROLE.MANAGER, USER_ROLE.ADMIN,USER_ROLE.USER_ADMIN])
  },
  {
    path: URLS.SUPPORT,
    element: <Support />
  },
  {
    path: URLS.FAQ,
    element: <FAQ />
  },
  {
    path: URLS.ADMIN,
    element: renderWithAuth(<Layout />, [USER_ROLE.ADMIN, USER_ROLE.USER_ADMIN]),
    children: [
      { path: URLS.ADMIN, element: <Navigate to={URLS.ADMIN_QUESTIONNAIRE} replace /> },
      { path: URLS.ADMIN_QUESTIONNAIRE, element: <Questionnaire /> },
      { path: URLS.ADMIN_REPORTING_STATUS, element: <ReportingStatus /> },
      { path: URLS.ADMIN_COMPANY_REPORTING_STATUS, element: <CompanyReportingStatus /> },
      { path: URLS.ADMIN_ASSET_MANAGEMENT, element: <CompanyManagement /> },
      {
        path: URLS.QUESTION_BANK,
        element: (
          <AttributesProvider>
            <QuestionBank />
          </AttributesProvider>
        )
      },
      { 
        path: URLS.ADMIN_QUESTION_BANK_VIEW, 
        element: (
          <AttributesProvider>
            <ViewQuestionBank />
          </AttributesProvider>
        ) 
      },
      { path: URLS.ADMIN_USER_MANAGEMENT, element: <UsersManagement /> },
      {
        path: URLS.ADMIN_SURVEY_LIST,
        element: (
          <AttributesProvider>
            <SurveyWrapper />
          </AttributesProvider>
        )
      },
      { path: URLS.ADMIN_QUESTIONNAIRE_LIST, element: <QuestionnairesList /> },
      { path: URLS.ADMIN_PROFILE, element: <Profile /> },
      { path: URLS.ADMIN_CHANGE_PASSWORD, element: <ChangePassword /> },
      { path: URLS.ADMIN_QUESTION_BANK_CREATE, element: <CreateQuestionBank /> }
    ]
  },
  {
    path: URLS.MANAGERL2,
    element: renderWithAuth(<Layout />, USER_ROLE.MANAGERL2),
    children: [
      { path: URLS.MANAGER, element: <Navigate to={URLS.MANAGER_QUESTIONNAIRE} replace /> },
      { path: URLS.MANAGER_QUESTIONNAIRE, element: <Questionnaire /> },
      { path: URLS.MANAGER_REPORTING_STATUS, element: <CompanyReportingStatus /> },
      // { path: URLS.MANAGER_COMPANY_REPORTING_STATUS, element: <CompanyReportingStatus /> },
      { path: URLS.MANAGER_USER_MANAGEMENT, element: <UsersManagement /> },
      {
        path: URLS.MANAGER_SURVEY_LIST,
        element: (
          <AttributesProvider>
            <SurveyWrapper />
          </AttributesProvider>
        )
      },
      { path: URLS.MANAGER_PROFILE, element: <Profile /> },
      { path: URLS.MANAGER_CHANGE_PASSWORD, element: <ChangePassword /> },
      { path: URLS.MANAGER_QUESTIONNAIRE_LIST, element: <QuestionnairesList /> },
      {
        path: URLS.MANAGER_QUESTION_BANK,
        element: (
          <AttributesProvider>
            <QuestionBank />
          </AttributesProvider>
        )
      },
      { 
        path: URLS.MANAGER_QUESTION_BANK_VIEW, 
        element: (
          <AttributesProvider>
            <ViewQuestionBank />
          </AttributesProvider>
        ) 
      },
      { path: URLS.MANAGER_QUESTION_BANK_CREATE, element: <CreateQuestionBank /> }
    ]
  },
  {
    path: URLS.MANAGER,
    element: renderWithAuth(<Layout />, USER_ROLE.MANAGER),
    children: [
      { path: URLS.MANAGER, element: <Navigate to={URLS.MANAGER_QUESTIONNAIRE} replace /> },
      { path: URLS.MANAGER_QUESTIONNAIRE, element: <Questionnaire /> },
      { path: URLS.MANAGER_REPORTING_STATUS, element: <CompanyReportingStatus /> },
      // { path: URLS.MANAGER_COMPANY_REPORTING_STATUS, element: <CompanyReportingStatus /> },
      { path: URLS.MANAGER_USER_MANAGEMENT, element: <UsersManagement /> },
      { path: URLS.MANAGER_COMPANY_REPORTING_STATUS, element: <CompanyReportingStatus /> },
      {
        path: URLS.MANAGER_SURVEY_LIST,
        element: (
          <AttributesProvider>
            <SurveyWrapper />
          </AttributesProvider>
        )
      },
      { path: URLS.MANAGER_PROFILE, element: <Profile /> },
      { path: URLS.MANAGER_CHANGE_PASSWORD, element: <ChangePassword /> },
      { path: URLS.MANAGER_QUESTIONNAIRE_LIST, element: <QuestionnairesList /> },
      {
        path: URLS.MANAGER_QUESTION_BANK,
        element: (
          <AttributesProvider>
            <QuestionBank />
          </AttributesProvider>
        )
      },
      { 
        path: URLS.MANAGER_QUESTION_BANK_VIEW, 
        element: (
          <AttributesProvider>
            <ViewQuestionBank />
          </AttributesProvider>
        ) 
      },
      { path: URLS.MANAGER_QUESTION_BANK_CREATE, element: <CreateQuestionBank /> }
    ]
  },
  {
    path: URLS.USER,
    element: renderWithAuth(<Layout />, USER_ROLE.USER),
    children: [
      { path: URLS.USER, element: <UserSubmissions /> },
      { path: URLS.USER, element: <Navigate to={URLS.USER_SUBMISSIONS} replace /> },
      {
        path: URLS.USER_SURVEY_LIST,
        element: (
          <AttributesProvider>
            <SurveyWrapper />
          </AttributesProvider>
        )
      },
      { path: URLS.CHANGE_PASSWORD, element: <ChangePassword /> },
      { path: URLS.PROFILE, element: <Profile /> }
    ]
  },
  { path: '/', element: <RedirectPage /> },
  { path: '*', element: <NotFoundPage /> }
];
