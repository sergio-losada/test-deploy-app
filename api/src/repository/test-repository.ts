import { databaseHost, databaseName, databaseUser, databasePort } from '../config';
import mysql from 'mysql2/promise';

class TestRepository {
    private connection: mysql.Connection | null = null;

    constructor() {
        this.connect();
    }

    async connect(): Promise<void> {
        this.connection = await mysql.createConnection({
            host: databaseHost,
            user: databaseUser,
            password: '',
            database: databaseName,
            port: databasePort
        });
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            console.log('DB connection closed');
        }
    }

    async getTestResponse(): Promise<any> {
        if (!this.connection) {
            throw new Error('Database not connected');
        }

        const [rows] = await this.connection.execute('SELECT * FROM `profile` LIMIT 1');
        return rows;
    }
}

export { TestRepository };
