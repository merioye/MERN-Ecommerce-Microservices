# Storage Microservice

## Project Overview

This is a production-ready microservice for handling secure file uploads and deletions, providing secure and efficient storage management.

## 📖 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
- [Scripts](#scripts)
- [Linting and Formatting](#linting-and-formatting)
- [Testing](#testing)
- [Environment Configuration](#environment-configuration)
- [License](#license)

## 📋 Features

- Secure File Management
- Multi-environment Configuration
- API Documentation with Swagger
- Unit and End-to-End Testing
- Docker for Containerized Deployment

## ❇️ Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Swagger**: A tool for documenting RESTful APIs.
- **Jest**: A delightful JavaScript testing framework.
- **ESLint**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.
- **Prettier**: An opinionated code formatter.
- **Nestjs-i18n**: Internationalization framework for Nestjs.
- **PM2**: A production process manager for Node.js applications.
- **Docker**: A platform designed to help developers build, share, and run container applications.
- **AWS S3**: A scalable object storage service.

## ⚙️ Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-repo/repo.git
   cd storage-service
   ```

2. **Install Dependencies**
   Make sure you have Node.js (>=20) installed. Then run:

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.development`, `.env.test`, `.env.production` files in the root directory and copy environment variables from `.env.example` file and configure their values according to the environment. For example in `.env.development`:

   ```env
   NODE_ENV=development
   ```

4. **Start the Application**
   ```bash
   npm run start:dev
   ```

## 🖇️ Development Workflow

- **Build the Project**

  ```bash
  npm run build
  ```

- **Start the Development Server**

  ```bash
  npm run start:dev
  ```

- **Start the Production Server**

  ```bash
  npm run start:prod
  ```

- **Run Tests**
  ```bash
  npm test
  ```

## 📝 Scripts

- `npm run prebuild`: Prebuild script.
- `npm run build`: Build the project.
- `npm run start`: Start the application in development mode.
- `npm run start:dev`: Start the application in watch mode for development.
- `npm run start:debug`: Start the application in debug mode.
- `npm run start:prod`: Start the application in production mode using PM2.
- `npm run lint`: Lint the codebase.
- `npm run lint:fix`: Fix linting errors.
- `npm run format:check`: Check code formatting.
- `npm run format:fix`: Fix code formatting.
- `npm run test`: Run all tests.
- `npm run test:watch`: Run tests in watch mode.
- `npm run test:e2e`: Run end-to-end tests.
- `npm run clean`: Clean the project.

## 🔖 Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting. Ensure your code follows the defined standards by running:

```bash
npm run lint
npm run format:check
```

You can automatically fix issues with:

```bash
npm run lint:fix
npm run format:fix
```

## 🧪 Testing

This project uses Jest for unit and end-to-end testing. You can run the tests with the following commands:

```bash
npm run test
npm run test:watch
npm run test:e2e
```

## 🛠️ Environment Configuration

Ensure you have a env files with all necessary environment variables set up. Example:

```bash
NODE_ENV=development
```

## 🗎 License

This project is licensed under the MIT license.
Created by Umair Saleem.
