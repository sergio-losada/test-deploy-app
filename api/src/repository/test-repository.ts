import { databaseHost, databaseName, databaseUser, databasePort } from '../config';
import mysql from 'mysql2/promise';

class TestRepository {
    private connection: mysql.Connection | null = null;

    constructor() {}

    async connect(): Promise<void> {
        if (!this.connection) {
            this.connection = await mysql.createConnection({
                host: databaseHost,
                user: databaseUser,
                password: '',
                database: databaseName,
                port: databasePort
            });
            console.log('DB connected');
        }
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log('DB connection closed');
        }
    }

    async getTestResponse(): Promise<any> {
        if (!this.connection) {
            await this.connect();
        }
        const [rows] = await this.connection!.execute('SELECT * FROM `profile` LIMIT 1');
        return rows;
    }
}

export { TestRepository };
