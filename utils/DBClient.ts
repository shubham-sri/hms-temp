// prisma.ts

import { PrismaClient } from "@prisma/client";

class PrismaClientSingleton {
    private static instance: PrismaClient;

    public static getInstance(): PrismaClient {
        if (!PrismaClientSingleton.instance) {
            PrismaClientSingleton.instance = new PrismaClient();
            console.log('new client')
        }
        return PrismaClientSingleton.instance;
    }

    public static async disconnect() {
        if (PrismaClientSingleton.instance) {
            await PrismaClientSingleton.instance.$disconnect();
        }
    }


}

const prisma = PrismaClientSingleton.getInstance();

export {prisma};
