# 🚀 Monorepo Template

Welcome to the cutting-edge monorepo template! This powerhouse setup combines the efficiency of pnpm workspaces with the blazing-fast build orchestration of Turborepo. Designed for scalability and developer productivity, this template includes a Next.js application, a React.js application, a NestJS application, and a simple Node.js application, all working in harmony.

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Project Structure](#-project-structure)
3. [Prerequisites](#-prerequisites)
4. [Getting Started](#-getting-started)
5. [Available Scripts](#-available-scripts)
6. [Workspace Management](#-workspace-management)
7. [Development Workflow](#-development-workflow)
8. [Testing](#-testing)
9. [Docker](#-docker)
10. [Contributing](#-contributing)
11. [License](#-license)

## 🌟 Overview

This monorepo template is your gateway to a world of streamlined development. It's not just a collection of projects; it's a carefully crafted ecosystem where your applications can thrive together. With pnpm workspaces managing your dependencies and Turborepo optimizing your builds, you'll experience a level of development efficiency you've never known before.

Key features:

- 🔗 Seamless integration between projects
- 🚄 Lightning-fast builds with Turborepo
- 📦 Efficient package management using pnpm
- 🛠 Pre-configured development tools and scripts
- 🐳 Docker support for consistent development and deployment environments

## 🏗 Project Structure

    ├── apps
    │   ├── api
    │   │   └── auth        # Nestjs application
    |   |   └── sample      # Nodejs application
    │   ├── client
    │   │   ├── admin       # Reactjs application
    │   │   └── web         # Nextjs application
    ├── packages
    │   └── *               # Reusable packages
    ├── libraries
    │   └── config-*        # Shared configurations
    ├── package.json        # Root package.json for project-wide scripts and dependencies
    ├── pnpm-workspace.yaml # pnpm workspace configuration
    └── turbo.json          # Turborepo configuration

This structure is designed to keep your codebase organized and maintainable as it grows. Each application, package, and library has its own space, promoting modularity and reusability.

## 🛠 Prerequisites

Before you embark on your development journey, make sure you have the following tools installed:

- 🟢 Node.js (version 20.15.0 or later)
- 📦 pnpm (version 9.5.0 or later)
- 🐳 Docker

These versions ensure compatibility with all the features and optimizations in this template.

## 🚦 Getting Started

Let's get your development environment up and running in no time:

1. Clone the repository:

   ```bash
   git clone https://github.com/merioye/Turborepo-Template.git
   cd Turborepo-Template

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

## 🐳 Docker

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

We hope this monorepo template supercharges your development process! If you have any questions or suggestions, please open an issue or contribute to the project. Happy coding! 🎉
