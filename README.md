# 🌐 EcoHatch - Multivendor Ecommerce Application

EcoHatch is a feature-rich, scalable, and modern multivendor ecommerce application built with a microservices architecture. Designed to support multiple client platforms, including web and mobile, EcoHatch offers robust features like user management, catalog management, order processing, payment integrations (Stripe and PayPal), real-time notifications, and more.

With the power of pnpm workspaces and Turborepo, EcoHatch ensures modularity, high performance, and developer efficiency.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Available Scripts](#available-scripts)
6. [Microservices Overview](#microservices-overview)
7. [Microservices List](#microservices-list)
8. [Workspace Management](#workspace-management)
9. [Development Workflow](#development-workflow)
10. [Testing](#testing)
11. [Docker Support](#docker-support)
12. [Contributing](#contributing)
13. [License](#license)

---

## 🖥 Overview

EcoHatch leverages the following technologies:

- **Frontend**: Next.js, React.js, React Native, Material UI, Tanstack Query, Zustand
- **Backend**: NestJS, Node.js, TypeScript, Kafka, Redis
- **Database**: PostgreSQL, MongoDB
- **Payments**: Stripe, PayPal
- **Containerization**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, Jenkins
- **GenAI**: Langchain, Gemini
- **Storage**: AWS S3
- **Build System**: Turborepo
- **Package Management**: pnpm

Key features:

- 🌐 Multivendor support
- 🚀 Scalable and modular microservices architecture
- 🔐 Secure and optimized for performance
- 📱 Cross-platform client applications (web & mobile)
- 🛠 Efficient developer tools
- 📦 Modular and reusable package
- 🚀 Continuous integration and deployments
- 💰 Payment integration (Stripe & PayPal)
- 📊 Real-time notifications
- 💬 Real-time chat
- 🤖 GenAI integration
- 🫙 Containerization and Kubernetes support
- 🌐 Internalization support
- 🛠 Code quality checks (SonarQube, ESLint, Prettier, TypeScript)
- 🧪 Testing with Jest and Cypress

---

## 🏗 Project Structure

    ├── apps
    │   ├── api
    │   │   └── iam-service
    |   |   └── vendor-service
    │   │   └── customer-service
    │   │   └── catalog-service
    │   │   └── order-service
    │   │   └── payment-service
    │   │   └── notification-service
    │   │   └── chat-service
    │   │   └── chatbot-service
    │   │   └── upload-service
    │   │   └── websocket-service
    │   │   └── store-configuration-service
    │   ├── client
    │   │   ├── admin-ui
    │   │   ├── mobile-app
    │   │   └── web-ui
    ├── packages
    │   └── types-shared
    ├── libraries
    │   └── config-*        # Shared configurations
    ├── package.json        # Root package.json for project-wide scripts and dependencies
    ├── pnpm-workspace.yaml # pnpm workspace configuration
    └── turbo.json          # Turborepo configuration

This structure is designed to keep your codebase organized and maintainable as it grows. Each application, package, and library has its own space, promoting modularity and reusability.

---

## ✅ Prerequisites

Ensure you have the following installed:

- **Node.js**: v20.15.0 or later
- **pnpm**: v9.5.0 or later
- **Docker**

---

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/merioye/MERN-Ecommerce-Microservices.git
   cd MERN-Ecommerce-Microservices

   ```

2. Install dependencies:

   ```bash
   pnpm install

   ```

   Watch as pnpm efficiently manages your monorepo's dependencies!

3. Build all packages:

   ```bash
   pnpm build
   ```

   Turborepo will orchestrate the build process, ensuring all interdependencies are respected.

4. Start development servers:

   ```bash
   pnpm dev
   ```

   This command will spin up development servers for all your applications simultaneously.

## 🛠 Available Scripts

Your swiss army knife of development commands:

- `pnpm build`: Construct all packages with optimized production builds
- `pnpm dev`: Launch all development servers for a comprehensive development experience
- `pnpm start`: Ignite all production servers
- `pnpm typecheck`: Ensure type safety across all packages
- `pnpm lint`: Keep your code clean and consistent with linting
- `pnpm lint:fix`: Automatically fix linting issues
- `pnpm format:check`: Verify code formatting
- `pnpm format:fix`: Beautify your code automatically
- `pnpm clean`: Sweep away build artifacts for a fresh start
- `pnpm test`: Run the test suite across all packages
- `pnpm test:watch`: Keep tests running as you code
- `pnpm test:e2e`: Ensure everything works together with end-to-end tests
- `pnpm docker:local:up`: Spin up your local Docker environment
- `pnpm docker:local:down`: Gracefully shut down your local Docker environment

Explore the `scripts` section in the root `package.json` for even more powerful commands!

## 🏗 Microservices Overview

Each microservice in EcoHatch is designed with the single responsibility principle, ensuring high cohesion and low coupling. Microservices communicate through Kafka for event-driven architecture and maintain their own databases for maximum scalability.

### Microservices List

- **IAM Service**:
  Handles user authentication, authorization, and secure access control.

- **Vendor Management**:
  Manages vendor profiles, products, and inventory.

- **Customer Management**:
  Manages customer profiles, addresses, and order history.

- **Catalog Management**:
  Manages products, categories, and inventory.

- **Order Management**:
  Tracks orders, processes order statuses, and ensures order lifecycle consistency.

- **Payment Management**:
  Integrates with Stripe and PayPal for secure and seamless payment processing.

- **Notification Management**:
  Sends real-time notifications via email, SMS, and push notifications.

- **Chat Management**:
  Enables communication between users and vendors through a real-time chat interface.

- **WebSocket Management**:
  Handles live updates and real-time interactions using WebSocket connections.

- **Store Configuration Management**:
  Manages application-wide configurations and vendor-specific settings.

- **Upload Management**:
  Handles file uploads, image processing, and media management.

- **Chatbot Management**:
  Enables GenAI capabilities for chatbot responses.

Each microservice is built for scalability, high availability, and independent deployment, ensuring robust performance for the application.

## 🧩 Workspace Management

Harness the power of pnpm workspaces to manage your monorepo packages effortlessly. The `pnpm-workspace.yaml` file is your control center for workspace configuration.

Adding a new package to your workspace is a breeze:

1. Create a new directory in `apps/`, `packages/`, or `libraries/`.
2. Initialize the package with `pnpm init`.
3. If needed, update the `pnpm-workspace.yaml` file to include your new package.

## 🔄 Development Workflow

Follow these steps for a smooth development process:

1. Branch out: Create a new branch for your feature or bug fix.
2. Code away: Make your changes in the relevant packages.
3. Quality check: Run `pnpm typecheck` and `pnpm lint` to maintain code quality.
4. Test thoroughly: Execute `pnpm test` to ensure everything works as expected.
5. Commit with care: Use conventional commit messages for clarity.
6. Push and propose: Push your branch and create a pull request for review.

## 🧪 Testing

Ensure your code is rock-solid with our comprehensive testing setup:

- 🔬 Unit tests: `pnpm test`
- 🌐 End-to-end tests: `pnpm test:e2e`
- 📊 Test coverage: `pnpm test:cov`

Remember, well-tested code is happy code!

## 🐳 Docker Support

Containerize your development and deployment with the Docker configurations:

- Local environment:
- Start: `pnpm docker:local:up`
- Stop: `pnpm docker:local:down`
- Remote environment:
- Start: `pnpm docker:remote:up`
- Stop: `pnpm docker:remote:down`

These commands manage your Docker environments, ensuring consistency across different machines and environments.

## 👥 Contributing

We welcome contributions! Here's how you can help make this project even better:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💻 Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. 🚀 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔍 Open a Pull Request

Please ensure your code adheres to our coding standards, is well-documented, and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for the full license text. Feel free to use, modify, and distribute this template as you see fit!

---

Enjoy building with EcoHatch! 🚀
