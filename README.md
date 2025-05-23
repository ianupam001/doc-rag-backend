# Document Management Backend

This is a backend service built with NestJS, Prisma, and PostgreSQL. It provides user authentication, role-based access, document management, and a scalable architecture. The app is Dockerized and ready for local development or production deployment.

## Features

- JWT-based authentication (Access/Refresh Tokens)
- Role-based access control (Admin, Editor, Viewer)
- Prisma ORM with PostgreSQL
- Document CRUD APIs
- Swagger API documentation
- Microservice-ready structure
- Docker + Docker Compose support

## Project Structure

```
src/
├── auth/             Auth module
├── users/            User management
├── documents/        Document CRUD and logic
├── ingestion/        Microservice integration (Python etc.)
├── common/           Guards, interceptors, utils
├── main.ts           Entrypoint

scripts/
└── seed.ts           Admin seeding script
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/doc-rag-backend.git
cd doc-rag-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env
```

Update values such as:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/document-management
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
PORT=5000
```

### 4. Setup Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed Admin User

To create the initial Admin user, run the following script:

```bash
npx ts-node scripts/seed.ts
```

Make sure `ts-node` is installed (`npm install -D ts-node` if missing).

### 6. Start the server

```bash
npm run start:dev
```

Server will be running at `http://localhost:5000`

## API Documentation

Swagger is available at:

```
http://localhost:5000/docs
```

## Running Tests

```bash
npm run test
```

## Docker Setup

Make sure Docker and Docker Compose are installed on your machine.

### 1. Create `.env` file as shown above

### 2. Create `uploads` directory

```bash
mkdir uploads
```

This is required so Docker doesn't fail during build.

### 3. Build and start with Docker

```bash
docker-compose up --build
```

This starts both the NestJS app and PostgreSQL.

## Production Deployment

1. Set up environment variables in `.env`
2. Ensure `uploads/` directory exists
3. Build and run containers

```bash
docker-compose up --build -d
```

4. Optionally, use NGINX as a reverse proxy with SSL

## Authentication Overview

- Login API returns access and refresh tokens
- Use access token in `Authorization: Bearer <token>` header
- When expired, use refresh token to get a new access/refresh token pair
