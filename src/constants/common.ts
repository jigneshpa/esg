export const URLS = {
  SIGN_UP: '/sign-up',
  VERIFICATION: '/verification/:redirectPage/:userId',
  LOG_IN: '/log-in',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:userId',
  FAQ: '/faq',
  SUPPORT: '/support',
  NOTIFICATION: '/notification',
  PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  HOME: '/',
  TABLE_BUILDER_DEMO: '/table-builder-demo',

  // Admin site:
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_DISCLOSURE_APPROVAL: '/admin/asset-assignments',
  ADMIN_DISCLOSURE_APPROVAL_REVIEW: '/admin/:companyId/asset-assignments/:questionnaireId/review/:userId',
  ADMIN_ASSET_MANAGEMENT: '/admin/asset-management',
  ADMIN_ASSET_LIST: '/admin/:companyId/asset',
  ADMIN_USER_MANAGEMENT: '/admin/user-management',
  ADMIN_QUESTIONNAIRE_DETAIL: '/admin/:companyId/submissions/:categoryId',
  ADMIN_EDIT_QUESTIONNAIRE: '/admin/submissions/:categoryId/edit',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_REPORTING_STATUS: '/admin/reporting-status',
  ADMIN_COMPANY_REPORTING_STATUS: '/admin/reporting-status/company/:companyId',
  ADMIN_QUESTIONNAIRE: '/admin/submissions',
  QUESTION_BANK: '/admin/question-bank/:qbankId',
  ADMIN_QUESTION_BANK_VIEW: '/admin/view-question-bank/:qbankId/:companySelected?',
  ADMIN_QUESTION_BANK_CREATE: '/admin/question-bank',
  ADMIN_SURVEY_LIST: '/admin/survey-list/:userQuestionnaireId',
  ADMIN_QUESTIONNAIRE_LIST: '/admin/questonnaire-list/:industryId/:frameworkId',
  ADMIN_CHANGE_PASSWORD: '/admin/change-password',
  // User site:

  USER_SURVEY_LIST: '/user/survey-list/:userQuestionnaireId',
  USER: '/user',
  USER_SUBMISSIONS: '/user-submissions',
  USER_ASSIGNMENTS: '/user-assignments',
  USER_ASSET_DETAILS: '/asset-details/:assetId',
  USER_QUESTIONNAIRE_SUBMIT: '/questionnaire-submit/:questionnaireId',
  ASSET_EMISSIONS: '/asset-emissions',
  ASSET_LIST: '/:companyId/asset',
  COMPANY_NEW: '/company/new',
  COMPANY_UPDATE: '/:companyId/update',
  QUESTIONNAIRE: '/:companyId/submissions',
  QUESTIONNAIRE_DETAIL: '/:companyId/submissions/:categoryId',
  COMPANY_MAP: '/:companyId/map',

  // Manager site:
  MANAGER: '/manager',
  MANAGERL2: '/manager',
  MANAGER_SURVEY_LIST: '/manager/survey-list/:userQuestionnaireId',
  MANAGER_REPORTING_STATUS: '/manager/reporting-status',
  MANAGER_USER_MANAGEMENT: '/manager/user-management',
  MANAGER_CHANGE_PASSWORD: '/manager/change-password',
  MANAGER_PROFILE: '/manager/profile',
  MANAGER_QUESTIONNAIRE: '/manager/submissions',
  MANAGER_QUESTIONNAIRE_LIST: '/manager/questonnaire-list/:industryId/:frameworkId',
  MANAGER_QUESTION_BANK: '/manager/question-bank/:qbankId',
  MANAGER_QUESTION_BANK_VIEW: '/manager/view-question-bank/:qbankId/:companySelected?',
  MANAGER_QUESTION_BANK_CREATE: '/manager/question-bank',
  MANAGER_COMPANY_REPORTING_STATUS: '/manager/reporting-status/company/:companyId'
};

export const CHART_TIME_RANGE = {
  Week: '1W',
  Month: '1M',
  Year: '1Y'
};

export const QUESTION_FORM_PAGE_TYPE = {
  QUESTION_BANK_EDIT: 'question-bank-edit',
  QUESTION_BANK_ADD_QUESTION: 'question-bank-add-question',
  SUBMISSION_REVIEW: 'submission-review',
  USER_ANSWER: 'user-answer',
  QUESTION_BANK_VIEW: 'question-bank-view',
}

export enum MESSAGE {
  DELETE_COMPANY_FAIL = 'Error when deleting subsidiaries',
  ACCOUNT_DEACTIVATED = 'Your account has been deactivated!',
  CREATE_COMPANY_SUCCESS = 'Subsidiary created successfully',
  CREATE_QUESTION_SUCCESS = 'Question created successfully',
  CREATE_QUESTION_BANK_SUCCESS = 'ESG standard created successfully',
  CREATE_INSTITUTION_SUCCESS = 'Institution created successfully',
  CREATE_DEPARTMENT_SUCCESS = 'Department created successfully',
  CREATE_SCOPE_SUCCESS = 'Scope created successfully',
  DELETE_COMPANY_SUCCESS = 'Company deleted successfully',
  DELETE_SUBSIDIARY_SUCCESS='Subsidiary deleted successfully',
  DELETE_ASSET_SUCCESS = 'Asset deleted successfully',
  DELETE_ASSET_FAIL = 'Error when deleting asset',
  DELETE_USER_SUCCESS = 'User deleted successfully',
  DELETE_USER_FAIL = 'Error when deleting user',
  DELETE_QUESTIONNAIRE_BANK_FAIL = 'Error when deleting Reporting Framework',
  UPDATE_USER_FAIL = 'Error when updating user',
  UPDATE_COMPANY_SUCCESS = 'Company updated successfully',
  UPDATE_ASSET_SUCCESS = 'Asset updated successfully',
  UPDATE_USER_SUCCESS = 'User updated successfully',
  UPDATE_USER_STATUS_SUCCESS = 'User Status updated successfully',
  DELETE_QUESTIONNAIRE_BANK_SUCCESS = 'Reporting Standard deleted successfully',
  CREATE_ASSET_SUCCESS = 'Created asset successfully',
  CREATE_USER_SUCCESS = 'User created successfully',
  CREATE_BILL_SUCCESS = 'Created bill successfully',
  CREATE_USER_FAIL = 'Error when creating user',
  GET_USER_FAIL = 'Error when fetching user info', // Temporary
  LOG_IN_FAIL = 'Error when log in', // Temporary
  LOG_OUT_FAIL = 'Error when logging out', // Temporary
  SEND_MAIL_ADDRESS_FAIL = 'Error when sending mail address',
  SEND_NOTIFICATION_SUCCESS = 'Notification sent successfully',
  SIGN_UP_FAIL = 'Sign up failed', // Temporary
  RESET_PASSWORD_FAIL = 'Error when reseting password', // Temporary
  RESET_PASSWORD_SUCCESS = 'Password updated', // Temporary
  SUBMISSION_RECORDED = 'Your submission is recorded.',
  SUBMISSION_DELETE = 'Your submission is deleted.',
  SUBMIT_ANSWER_SUCCESS = 'Your submission is sent for approval!',
  SUPPORT_FORM_SUCCESS = 'A representative will get back to you shortly!',
  TWO_LEVEL_APPROVE_UPDATE_SUCCESS = 'Two level approval updated successfully',
  VERIFICATION_FAIL = 'Verify failed', // Temporary
  VERIFICATION_SUCCESS = 'Your account has been successfully created. Please wait for the admin approval!',
  UPLOAD_USER_LIST_SUCCESS = 'Upload user list successfully',
  UPLOAD_COMPANY_LIST_SUCCESS = 'Upload company list successfully',
  UPLOAD_ASSET_LIST_SUCCESS = 'Upload asset list successfully',
  UPLOAD_QUESTIONNAIRE_LIST_SUCCESS = 'Questionnaire list uploaded successfully',
  UPDATE_PROFILE_SUCCESS = 'Profile updated',
  EDIT_QUESTIONNAIRE_SUCCESS = 'Questionnaire updated',
  BILLTYPE_IS_USED = "You can't delete this bill type because it's used in some bills.",
  BILLTYPE_IS_CREATED = 'Created bill type successfully',

  ASSETS_UPLOAD_SUCCESS = 'Assets have been successfully uploaded.',
  UPLOAD_FAIL = 'There was an error during the upload process. Please try again.',

  COMPANIES_UPLOAD_SUCCESS = 'Companies have been successfully uploaded.',
  USERS_UPLOAD_SUCCESS = 'Users have been successfully uploaded.',
  SEND_NOTIFICATION_FAIL = 'Error when sending notification',
  BILL_UPDATED_SUCCESS = 'Bill type updated successfully',
  BILLTYPE_IS_EXISTED = 'Bill Type already exists',
  SOMEHING_WENT_WRONG = ' Something went wrong'
}

export enum STATUS {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  NEW = 'New',
  APPROVED = 'Approved',
  SUBMITTED = 'Submitted',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DOWNLOAD = 'Download'
}

export const GREENFI_STORAGE_KEY = 'greenFiToken';
export const GREENFI_NOTIFICATION_KEY = 'greenFiNotificationToken';
export const GREENFI_ACCOUNT_DEACTIVATED = 'greenFiAccountDeactivated';

export enum USER_ROLE {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MANAGERL2 = 'manager-l2',
  USER = 'user',
  USER_ADMIN='user-admin'

}

export const ROLE_TITLE = {
  user: 'Employee',
  admin: 'Administrator',
  manager: 'Manager-L1'
};

export enum USER_STATUS {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending'
}

export const FILE_TYPE = {
  PDF: 'pdf',
  CSV: 'csv'
};

export const QUESTIONNAIRE_CATEGORY = {
  EP: 'EP',
  RF: 'RF',
  ERQ: 'ERQ'
};

export const YEAR_RANGE = [2023, 2024, 2025];

export const ADDRESS_TYPE = {
  regd: 'Registered',
  mailing: 'Mailing',
  operational: 'Operational'
};

export const FORM_TYPE = {
  CREATE: 'create',
  EDIT: 'edit'
};

export const FILE_SIZE_LIMIT = 3000000;

export const PHONE_NUM_REG_EX = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/g;

export const LEI_ID_REGEX = /^[0-9]{4}[0]{2}[A-Z0-9]{12}[0-9]{2}$/g;

export const NAME_REG_EX = /^[^\d,!@#$%^&*(),.?":;'{}|<>_\-\\+=[\]/]+$/gi;

export const PASSWORD_REG_EX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":;'{}|<>_\-\\+=[\]/])/g;

export const UPLOAD_STATUS = {
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAIL: 'Fail'
};

export const LAST_LOGIN_NOTIFICATION = 'Last login was on';

export enum BILL_STATE {
  SUBMITTED = 'Submitted',
  REJECTED = 'Rejected',
  PASSED = 'Passed'
}

export enum BULK_RECOMEDTIONS {
  BULK_ASSETS = 'Please ensure your XLSX or CSV file is formatted with the following headers:\n\ncountryName,\nleiID,\nname,\nreps_buildingId,\ntype,\nsquareFeet,\nfloorArea,\ngps_location,\nleaseId,\naddress,\npostalCode.\n\n',
  BULK_USERS = 'Please ensure your XLSX or CSV file is formatted with the following headers:\n\nuserName,\nfirstName,\nlastName,\ncountry,\nrole,\nemail,\ndepartment_name\n\n',
  BULK_COMPANIES = 'Please ensure your XLSX or CSV file is formatted with the following headers:\n\nlei_id,\nname,\naddress,\npostal_code,\ncountry_name,\nindustry_name,\nrevenue\n\n',
  BULK_QUESTIONS = 'Please ensure your XLSX or CSV file is formatted with the following headers:\n\ntitle,\ntype,\nis_required,\ninstitution_name,\nESG_standard_name,\nindustry_name,\ndepartment_name,\nquestion_bank_id,\ncontent\n\n'
}

export enum FieldNames {
  Question = 'title',
  Type = 'type',
  Department = 'department',
  Scope = 'scope',
  Institution = 'institution',
  Framework = 'framework',
  Industry = 'industry',
  IsRequired = 'is_required'
}
export const IS_SIDEBAR_OPEN = 'IsSideBarOpen';
