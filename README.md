# GreenFi App

### Table of Contents

1. [Setting up Firebase](#setting-up-firebase)
2. [Local Setup](#local-setup)
    - [Step 1: Download the Source Code](#step-1-download-the-source-code)
    - [Step 2: Set up Environment Variables](#step-2-set-up-environment-variables)
    - [Step 3: Install Dependencies](#step-3-install-dependencies)
    - [Step 4: Start the Development Server](#step-4-start-the-development-server)
3. [Deployment to AWS S3](#deployment-to-aws-s3)
    - [Step 1: Provision AWS Resources with CloudFormation](#step-1-provision-aws-resources-with-cloudformation)
    - [Step 2: Set Up IAM Account and Configure AWS CLI](#step-2-set-up-iam-account-and-configure-aws-cli)
    - [Step 3: Deploy Your Code to S3](#step-3-deploy-your-code-to-s3)
4. [Additional Notes](#additional-notes)

# Setting up Firebase

To set up Firebase in this project, follow these steps:

1. Copy `firebase.config.json.example` file in the root directory of the project and rename it to `firebase.config.json`.

2. Add the following content to `firebase.config.json`:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "vapidKey": "YOUR_VAPID_KEY",
}
```

Replace the placeholders with your actual Firebase configuration values.

## Local Setup

To run this project locally on your machine, follow these steps:

### Step 1: Download the Source Code

Download the source code provided and navigate to the project directory.

### Step 2: Set up Environment Variables

Copy `.env.example` file in the root directory of the project and rename it to `.env`.

```plaintext
VITE_GOOGLE_MAP_API_KEY="<YOUR_GOOGLE_MAP_API_KEY>"
VITE_GREENFI_API="<YOUR_GREENFI_API>"
````

Replace `<YOUR_GOOGLE_MAP_API_KEY>` with your actual Google Map API key. For `<YOUR_GREENFI_API>`, use the URL you will obtain after deploying the backend part of the application.

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the `Development Server`

```bash
npm run dev
```

Runs the app in the development mode.\
Open [http://localhost:3002](http://localhost:3002) to view it in your browser.

## Deployment to AWS S3

Before proceeding with the deployment, make sure you have completed the steps in the "Local Setup" section above. This ensures that your local environment is properly configured.

This project is designed to be deployed as a static website on AWS S3. Follow the steps below to deploy the application:

### Step 1: Provision AWS Resources with CloudFormation

If you have already provisioned the necessary AWS resources, including the S3 bucket and permissions, using a CloudFormation template, you can skip this step. The resources required for deployment are already set up.

Once you've completed the CloudFormation process, proceed to Step 2 for configuring your local environment and deploying the application.

### Step 2: Set Up IAM Account and Configure AWS CLI

Before pushing the code to S3, it's essential to set up an IAM (Identity and Access Management) account and configure it in the AWS CLI. This ensures secure and controlled access to your S3 bucket.

Follow these steps:

1. Create an IAM user with S3 permissions in the AWS Console.
2. Obtain the Access Key ID and Secret Access Key for the IAM user.
3. Configure the AWS CLI on your local machine using these credentials:

### Step 3: Deploy Your Code to S3

Now that your environment is properly configured and you have the necessary permissions, you can deploy your code to the S3 bucket.

Before deploying, make sure to create a .env file for the environment you want to deploy. For example, create a .env.uat file for the UAT environment, .env.stag for the staging environment, .env.prod for the production environment. These files should contain the appropriate environment variables.

After creating the .env file, replace `<YOUR_BUCKET_NAME>` with the actual name of your S3 bucket as defined in your CloudFormation stack. The deploy script can be found in the `package.json` file:

```json
"deploy": "aws s3 sync dist/ s3://<YOUR_BUCKET_NAME>"
```

After replacing `<YOUR_BUCKET_NAME>`, you can run the following command to deploy your code with your chosen environment:

```bash
npm run <environment>
```

For example, to deploy to the UAT environment, run:

```bash
npm run uat
```

This command will synchronize the contents of the dist/ directory with your specified S3 bucket.

After completing the deployment, you can access your website by navigating to the endpoint you obtained in the earlier step when you enabled website hosting.

## Additional Notes

**Note:** Please ensure that your website is running under the HTTPS protocol for secure access and to ensure that all features work correctly. Some features, such as detecting location and notifications, might not work properly if HTTPS is not set up for the website.
