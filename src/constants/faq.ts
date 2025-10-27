export interface FAQStep {
  content: string
  images?: string[]
}

export interface FAQItem {
  title: string
  steps: FAQStep[]
}

const img = (file: string) => new URL(`../assets/${file}`, import.meta.url).href

export const FAQ_LIST_ADMIN: FAQItem[] = [
  {
    title: 'How to assign questions?',
    steps: [
      { content: 'Go to ‘ESG Standard’ Page' },
      { content: 'Click on any standard as per your requirement', images: [img('admin/admin_q1_step2_image1.png')] },
      { content: 'Click on your Company', images: [img('admin/admin_q1_step3_image1.png')] },
      { content: 'You will see the questions in category wise. If you want, you can assign whole category questions to one user.', images: [img('admin/admin_q1_step4_image1.png'),img('admin/admin_q1_step4_image2.png')] },
      { content: 'Or if you want you can also assign individual questions to users , like click on the down arrow , you will find questions , you can assign each questions to users and click assign and click confirm.',  images: [img('admin/admin_q1_step5_image1.png'), img('admin/admin_q1_step5_image2.png'), img('admin/admin_q1_step5_image3.png')] },
      {content: 'Done'}
    ]
  },
  {
    title: 'How to Download Report?',
    steps: [
      { content: 'Go to ‘ESG Standard’ Page' },
      { content: 'Go on to any standard as per your requirement and click the download Icon.', images: [img('admin/admin_q2_step2_image1.png')] },
      { content: 'You will see the company list. Click on your company. Select PDF and click Download.', images: [img('admin/admin_q2_step3_image1.png'),img('admin/admin_q2_step3_image2.png')] },
      { content: 'Now you will get a preview page. Select as pdf and click Save .', images: [img('admin/admin_q2_step4_image1.png')] },
      {content: 'Done'}
    ]
  },
  {
    title: 'How to change Password',
    steps: [
      { content: 'Go to My Profile at the top', images: [img('admin/admin_q3_step1_image1.png')] },
      { content: 'Scroll down you will find Update password. Fill in current and new and confirm new password and click Update Profile. Your password is changed.', images: [img('admin/admin_q3_step2_image1.png')] },
      {content: 'Done'}
    ]
  },
  {
    title: 'How to upload previous documents of a company for autogenerating the answer?',
    steps: [
      { content: 'Go to ‘ESG Standard’ Page' },
      { content: 'Go on to any standard as per your requirement and click on the side CheckBox and click ‘Upload Docs’', images: [img('admin/admin_q4_step2_image1.png')] },
      { content: 'Click on the company you want and upload the document and click Submit.', images: [img('admin/admin_q4_step3_image1.png')] },
      {content: 'Done'}
    ]
  },
  {
    title: 'How to delete a User?',
    steps: [
      { content: 'Go to the user management page.' },
      { content: 'Select a user', images: [img('admin/admin_q5_step2_image1.png')] },
      { content: 'Click the ‘Delete Users’ button' },
      {content: 'Click ‘Confirm’ button', images: [img('admin/admin_q5_step3_image1.png'),img('admin/admin_q5_step3_image2.png')]},
      {content: 'Click ‘OK’ button. Done'}
    ],
  },
{
  title: 'How to add a User?',
  steps: [
    { content: 'Go to the user management page.' },
    { content: 'Click ‘Add Users’ button', images: [img('admin/admin_q6_step2_image1.png')] },
    { content: 'Click to browse or drag the excel sheet if bulk users addition needs to be done. If not, click the ‘Single User’ section.' },
    { content: 'Add all the details, and click the ‘Save’ button.', images: [img('admin/admin_q6_step4_image1.png')] },
    { content: 'Click ‘ OK’.', images: [img('admin/admin_q6_step5_image1.png')] },
    {content: 'Done'}
  ]
},
{
title: 'How to Edit/Delete a User?',
steps: [
  { content: 'Go to the user management page.' },
  { content: 'Select a user by clicking the radio button', images: [img('admin/admin_q7_step2_image1.png')] },
  { content: 'Click the ‘⫶’ button on right side', images: [img('admin/admin_q7_step3_image1.png')] },
  { content: 'Click ‘Edit’ option to edit the user details', images: [img('admin/admin_q7_step4_image1.png')] },
  { content: 'Edit the required details and click Save Button' },
  { content: 'Click Ok' },
  { content: 'Done' },
  { content: 'Click ‘Delete’ option to delete  the single user', images: [img('admin/admin_q7_step6_image1.png')] },
  { content: 'Click Confirm ' },
  { content: 'Click Ok' },
  { content: 'Done' }

]


},
{
title: 'How to download the User data',
steps: [
  { content: 'Go to the user management page.' },
  { content: 'Click ‘Download User data’ Button', images: [img('admin/admin_q8_step2_image1.png')] },
  { content: 'Select the required details in the dialogue box', images: [img('admin/admin_q8_step3_image1.png')] },
  { content: 'Click Download button' },
  { content: 'Done' }
]
},
{
  title: 'How to add a Company and subsidiary /SPV?',
  steps: [
    { content: 'Go to the Company/Subsidiaries Page.' },
    { content: 'Click ‘Add Company’ button', images: [img('admin/admin_q9_step2_image1.png')] },
    { content: 'Click to browse or drag the excel sheet if bulk companies addition needs to be done. If not, click the ‘Single User’ section.', images: [img('admin/admin_q9_step3_image1.png')] },
    { content: 'Add all the details in the single entity, and click the ‘Save Button’.', images: [img('admin/admin_q9_step4_image1.png')] },
    { content: 'Next to add subsidiary for the same company, click on the checkbox of the company and Select ‘Add Subsidiary/SPV button’', images: [img('admin/admin_q9_step5_image1.png')] },
    { content: 'Add all the details of the subsidiary company in the single entity, and click the ‘Save Button’.' },
    { content: 'Finally to view the subsidiary company, click on the ‘subsidiaries’ dropdown button near the original company and can view the sub companies.', images: [img('admin/admin_q9_step7_image1.png')] },
    { content: 'Done' }
  ]
},
{
  title: 'How to add a Reporting Standard and its question?',
  steps: [
    { content: 'Click ‘Add Reporting Standard’ button', images: [img('admin/admin_q10_step1_image1.png')] },
    { content: 'Assign the name of the standard and click on Save.', images: [img('admin/admin_q10_step2_image1.png')] },
  { content: 'For adding questions into the standard, click on the Standard from the list and Click on ‘Add question’ button.', images: [img('admin/admin_q10_step3_image1.png')] },
  { content: 'There are two modes: Add questions and Attributes.', images: [img('admin/admin_q10_step4_image1.png')] },
  { content: 'In the Add Question mode, select the answer type from the dropdown, assign Department, User, Scope, Institution and Industry. Mark if the response is Mandatory, need any attachment or remarks, click on Save.' },
    { content: 'For Attributes, you can simply add the attributes viz, Institution, Department, ESG standard and Industry from the drop down.', images: [img('admin/admin_q10_step7_image1.png')] },
    { content: 'For adding any Sub questions to the given question, click on ‘Add Sub question’ button and follow step 5.', images: [img('admin/admin_q10_step8_image1.png')] },
    { content: 'In case you need to edit/delete within the given standard, you can use the Action button (three dots of top right), click on edit and make changes.', images: [img('admin/admin_q10_step9_image1.png')] },
    { content: 'Done' }


]
},
{
  title: 'How to assign a standard to a company?',
  steps: [
    { content: 'Select the Standard from the list', images: [img('admin/admin_q11_step1_image1.png')] },
    { content: 'Click on Assign Standard button', images: [img('admin/admin_q11_step2_image1.png')] },
    { content: 'From the drop down, select the company and click on Submit.', images: [img('admin/admin_q11_step3_image1.png')] },
    { content: 'Done' }
  ]
},
{
  title: 'How to View User Submissions',
  steps: [
    { content: 'On the sidebar, click on User Submissions.' },
    { content: 'A list of companies or subsidiaries will appear under the Company / Subsidiaries column.' },
    { content: 'Identify the relevant company from the list.' },
    { content: 'Click the Submissions button in the same row as the selected company to view the submitted entries.', images: [img('admin/admin_q12_step4_image1.png')] },
  ]
},
{
  title: 'How to Approve Answers',
  steps: [
    { content: 'On the first bar, click the Submission button to open the Reporting Status tab.' },
    { content: 'In the Reporting Status tab, a list of employee entries from the selected company will appear. Identify the relevant entry with Pending Approval status.' },
    { content: 'In the same row as the pending entry, click the Action button, then select the Review option.' },
    { content: 'In the review screen, click the Approve button, and the status will change from Pending Submission to Approved.', images: [img('admin/admin_q13_step4_image1.png'), img('admin/admin_q13_step4_image2.png')] },
    { content: 'Done' }
  ]
}
];

export const FAQ_LIST_MANAGER: FAQItem[] = [
  {
    title: 'How to assign Questions to a user?',
    steps: [
      { content: 'Click on ESG Standards on Left side', images: [img('manager/manager_q1_step1_image1.png')] },
      { content: 'Click on the required ESG Standard Framework from the table', images: [img('manager/manager_q1_step2_image1.png')] },
      { content: 'From the Pop-Up window, select the Company/Subsidiary from the list', images: [img('manager/manager_q1_step3_image1.png')] },
      { content: 'To Assign whole questions in a category to a single user, click on Assign Category', images: [img('manager/manager_q1_step4_image1.png')] },
      { content: 'Click on the Assign Users', images: [img('manager/manager_q1_step5_image1.png')] },
      { content: 'Select the User by clicking the checkbox and click on Assign User button' , images: [img('manager/manager_q1_step6_image1.png')] },
      { content: 'To Assign a single question to a user, click on the arrow on right side of each category' , images: [img('manager/manager_q1_step7_image1.png')] },
      { content: 'Select the User from the Assign User dropdown and click on Assign button' },
      {content:'Done', images: [img('manager/manager_q1_step8_image1.png')] }
    ]
  },
  {
   title: 'How to Upload documents of a Company for Autogenerating the answers?',
    steps: [
      { content: 'Go to ESG Standards, Select the required ESG Standard Framework, by clicking the check box and click on Upload Docs button', images: [img('manager/manager_q2_step1_image1.png')] },
      { content: 'Select company from the list, Upload the document and click the Submit button', images: [img('manager/manager_q2_step2_image1.png')] },
      { content: 'Done' }
    ]
  },
  {
  title: 'How to Approve/Reject answers submitted by the Users?',
  steps: [
    { content: 'Click on Reporting Status on Left side', images: [img('manager/manager_q3_step1_image1.png')] },
    { content: 'Click on Three dots in Action column, then click Review option', images: [img('manager/manager_q3_step2_image1.png')] },
    { content: 'Review the answer and Approve / Reject it accordingly, by clicking the suitable buttons'},
    { content: 'Done',images: [img('manager/manager_q3_step3_image1.png')]  }
  ]
  },
  {
    title: 'How to change Password',
    steps: [
      { content: 'Go to My Profile at the top', images: [img('manager/manager_q4_step1_image1.png')] },
      { content: 'Scroll down you will find Update password. Fill in current and new and confirm new password and click Update Profile. Your password is changed.', images: [img('manager/manager_q4_step2_image1.png')] }
    ]

  },
{
  title: 'How to download the Report?',
  steps: [
    { content: 'Go to ESG Standards and click on icon in ESG Report table of needed ESG Framework', images: [img('manager/manager_q5_step1_image1.png')] },
    { content: 'Select the company from the list', images: [img('manager/manager_q5_step2_image1.png')] },
    { content: 'Choose the File type and click Download button', images: [img('manager/manager_q5_step3_image1.png')] },
    { content: 'Done' }
  ]
},
{
  title: 'How to add a User?',
  steps: [
    { content: 'Go to the User Management page.' },
    { content: 'Click ‘Add Users’ button', images: [img('manager/manager_q6_step2_image1.png')] },
    { content: 'For Uploading Bulk Users, first download the File format from ‘Click here’ option, Enter the data and upload using ‘Click to browse’ or drag the excel sheet Click ‘Add User’ Button', images: [img('manager/manager_q6_step3_image1.png')] },
    { content: 'For adding a Single User, click the ‘Single User’ button, add all the details and click the ‘Save’ button.', images: [img('manager/manager_q6_step4_image1.png')] },
    { content: 'Click OK' },
    { content: 'Done' }
  ]
},
{
title: 'How to Edit/Delete a User?',
steps: [
  { content: 'Go to the user management page.' },
  { content: 'Select a user by clicking the Checkbox', images: [img('manager/manager_q7_step1_image1.png')] },
  { content: 'Click the ‘Three dots’ button on right side', images: [img('manager/manager_q7_step2_image1.png')] },
  { content: 'Click ‘Edit’ option to edit the user details' },
  { content: 'Edit the required details and click Save Button', images: [img('manager/manager_q7_step4_image1.png')] },
  { content: 'Click Ok' },
  { content: 'Done' },
  { content: 'Click ‘Delete’ option to delete  the single user', images: [img('manager/manager_q7_step6_image1.png')] },
  { content: 'Click Confirm ' },
  { content: 'Click Ok' },
  { content: 'Done' }
]
},
{
  title: 'How to delete multiple Users?',
  steps: [
    { content: 'Go to the User Management page.' },
    { content: 'Select the users by clicking the checkbox and click ‘Delete Users’ button', images: [img('manager/manager_q8_step1_image1.png')] },
    { content: 'Click Confirm' },
    { content: 'Click Ok' },
    { content: 'Done' }
  ]
},
{
  title: 'How to download the User data',
  steps: [
    { content: 'Go to the user management page.' },
    { content: 'Click ‘Download User data’ Button', images: [img('manager/manager_q9_step2_image1.png')] },
    { content: 'Select the required details in the dialogue box' },
    { content: 'Click Download button',images: [img('manager/manager_q9_step4_image1.png')] },
    { content: 'Done' }
  ]
},
]

export const FAQ_LIST_CLIENT_ADMIN: FAQItem[] = [
  {
    title: 'How to assign questions?',
    steps: [
      { content: 'Go to ‘ESG Standard’ Page' },
      { content: 'Click on any standard as per your requirement', images: [img('client_admin/client_admin_q1_step2_image1.png')] },
      { content: 'Click on your Company', images: [img('client_admin/client_admin_q1_step3_image1.png')] },
      { content: 'You will see the questions in category wise. If you want, you can assign whole category questions to one user.',  images: [img('client_admin/client_admin_q1_step4_image1.png'), img('client_admin/client_admin_q1_step4_image2.png')]},
      { content: 'Or if you want you can also assign individual questions to users , like click on the down arrow , you will find questions , you can assign each questions to users and click assign and click confirm.',images: [img('client_admin/client_admin_q1_step5_image1.png'), img('client_admin/client_admin_q1_step5_image2.png'), img('client_admin/client_admin_q1_step5_image3.png')] },
      {content: 'Done'}
    ]    
  },
  {
    title: 'How to Download Report?',
    steps: [
      { content: 'Go to ESG Standard Page'},
      { content: 'Click download icon', images: [img('client_admin/client_admin_q2_step2_image1.png')] },
      { content: 'Select company and file type', images: [img('client_admin/client_admin_q2_step3_image1.png'),img('client_admin/client_admin_q2_step3_image2.png')] },
      { content: 'Preview and save PDF', images: [img('client_admin/client_admin_q2_step4_image1.png')] },
      {content: 'Done'}
    ]
  },
  {
    title: 'How to change Password',
    steps: [
      { content: 'Go to My Profile', images: [img('client_admin/client_admin_q3_step1_image1.png')] },
      { content: 'Scroll to Update Password and submit', images: [img('client_admin/client_admin_q3_step2_image1.png')] },
      {content: 'Done'}
    ]
  },
  {
    title: 'How to upload previous documents for autogenerating answers?',
    steps: [
      { content: 'Go to ESG Standard Page'},
      { content: 'Click Upload Docs', images: [img('client_admin/client_admin_q4_step2_image1.png')] },
      { content: 'Choose file and submit', images: [img('client_admin/client_admin_q4_step3_image1.png')] },
      {content: 'Done'}
    ]
  },
  {
  title: 'How to delete a User?',
  steps: [
    { content: 'Go to the user management page.' },
    { content: 'Select a user', images: [img('client_admin/client_admin_q5_step1_image1.png')] },
    { content: 'Click the ‘Delete Users’ button' },
    { content: 'Click ‘Confirm’ button', images: [img('client_admin/client_admin_q5_step3_image1.png'),img('client_admin/client_admin_q5_step3_image2.png')] },
    { content: 'Click ‘OK’ button. Done' }
  ]
  },
  {
title: 'How to add a User?',
steps: [
  { content: 'Go to the user management page.' },
  { content: 'Click ‘Add Users’ button', images: [img('client_admin/client_admin_q6_step1_image1.png')] },
  { content: 'Click to browse or drag the excel sheet if bulk users addition needs to be done. If not, click the ‘Single User’ section.' },
  { content: 'Add all the details, and click the ‘Save’ button.', images: [img('client_admin/client_admin_q6_step3_image1.png')] },
  { content: 'Click ‘ OK’.', images: [img('client_admin/client_admin_q6_step4_image1.png')] },
  {content: 'Done'}
]
  },
  {
   title: 'How to Edit/Delete a User?',
   steps: [
    { content: 'Go to the user management page.' },
    { content: 'Select a user by clicking the radio button', images: [img('client_admin/client_admin_q7_step1_image1.png')] },
    { content: 'Click the ‘⫶’ button on right side', images: [img('client_admin/client_admin_q7_step2_image2.png')] },
    { content: 'Click ‘Edit’ option to edit the user details', images: [img('client_admin/client_admin_q7_step3_image1.png')] },
    { content: 'Edit the required details and click Save Button' },
    { content: 'Click Ok' },
    { content: 'Done' },
    { content: 'Click ‘Delete’ option to delete  the single user ', images: [img('client_admin/client_admin_q7_step6_image1.png')] },
    {content: 'Click Confirm' },
    {content: 'Click Ok' },
    {content: 'Done'}
   ]
  },
{
  title: 'How to download the User data',
  steps: [
    { content: 'Go to the user management page.' },
    { content: 'Click ‘Download User data’ Button', images: [img('client_admin/client_admin_q10_step2_image1.png')] },
    { content: 'Select the required details in the dialogue box', images: [img('client_admin/client_admin_q10_step3_image1.png')] },
    { content: 'Click Download button' },
    { content: 'Done' }
  ]
},
{
  title: 'How to View User Submissions',
  steps: [
    { content: 'On the sidebar, click on User Submissions.' },
    { content: 'A list of companies or subsidiaries will appear under the Company / Subsidiaries column.' },
    { content: 'Identify the relevant company from the list.' },
    { content: 'Click the Submissions button in the same row as the selected company to view the submitted entries.', images: [img('client_admin/client_admin_q11_step4_image1.png')] },
  ]
},
{
title: 'How to Approve Answers',
steps: [
  { content: 'On the first bar, click the Submission button to open the Reporting Status  tab.' },
  { content: 'In the Reporting Status tab, a list of employee entries from the selected company will appear. Identify the relevant entry with Pending Approval status.' },
  { content: 'In the same row as the pending entry, click the Action button, then select the Review option.' },
  { content: 'In the review screen, click the Approve button, and the status will change from Pending Submission to Approved.', images: [img('client_admin/client_admin_q12_step4_image1.png'),img('client_admin/client_admin_q12_step4_image2.png')] },
  { content: 'Done' }
]

}

]

export const FAQ_LIST_EMPLOYEE: FAQItem[] = [
  {
    title: 'How to answer a question in the questionnaire?',
    steps: [
      { content: 'In the User Submissions section, Click on the row where the Status shows Pending Submission.', images: [img('employee/employee_q0_step0_image1.png')] },
      { content: 'A new screen will appear with a question and a text box.'},
      { content: 'Enter your answer in the “Type your answer here” box.' },
      { content: 'If needed, use the Add Attachment option to upload supporting documents.' },
      { content: 'Click the Submit button to complete the action.',images: [img('employee/employee_q0_step0_image2.png')] },
    ]
  },
  {
    title: 'What happens after submitting an answer?',
    steps: [
      { content: 'Once an employee submits an answer using the Submit button, the status of that entry automatically changes from Pending Submission to Pending Approval.', images: [img('employee/employee_q2_step1_image1.png')] },
    ]
  },
  {
    title: 'What happens after the manager approves a submission?',
    steps: [
      { content: 'Once the submitted answer is reviewed and approved by the Manager, the Status automatically updates from Pending Approval to Approved.' },
      { content: 'This status update confirms that the submission has been successfully accepted, and no further action is needed from the employee.', images: [img('employee/employee_q3_step2_image1.png')] }
    ]
  },
  {
title: 'What to do if a submitted answer gets rejected?',
steps: [
  { content: 'If a manager finds an answer incorrect or incomplete, the Status will change from Pending Approval to Rejected.', images: [img('employee/employee_q4_step1_image1.png')] },
  { content: 'Click the View button next to the rejected submission to open the response screen.' },
  { content: 'A remark will appear at the top of the screen explaining why the answer was rejected.' },
  { content: 'Review the comment and update your answer accordingly in the provided text box.' },
  { content: 'Click the Submit button again to resubmit your response for approval.', images: [img('employee/employee_q4_step5_image1.png')] }
]
  },
  {
    title: 'How to change Password',
    steps: [
      { content: 'Go to my profile at the top.', images: [img('employee/employee_q5_step1_image1.png')] },
      { content: 'Scroll down and you will find the Update password. Fill in current and new and confirm the new password and click Update Profile. Your password is changed.', images: [img('employee/employee_q5_step2_image1.png')] }
    ]
  }
]

export function getFaqListByRoleName(roleName: string): FAQItem[] {
  switch (roleName) {
    case 'admin':
      return FAQ_LIST_ADMIN
    case 'manager':
      return FAQ_LIST_MANAGER
    case 'user-admin':
      return FAQ_LIST_CLIENT_ADMIN
    case 'user':
      return FAQ_LIST_EMPLOYEE
    default:
      return FAQ_LIST_EMPLOYEE
  }
}
