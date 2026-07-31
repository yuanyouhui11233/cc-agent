-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "userInput" TEXT NOT NULL,
    "taskType" TEXT NOT NULL DEFAULT 'general',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "agentName" TEXT,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
