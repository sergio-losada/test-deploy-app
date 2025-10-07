import { databaseHost, databaseName, databaseUser, databasePort } from '../config';
import mysql from 'mysql2/promise';
import { Profile } from '../model/profile';

class TestRepository {
    private connection: mysql.Connection | null = null;

    constructor() { }

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
        const [rows] = await this.connection!.execute('SELECT * FROM `profiles`');
        return rows;
    }

    async getOne(id: string): Promise<any | null> {
        await this.connect();
        const [rows] = await this.connection!.execute('SELECT * FROM profiles WHERE id = ?', [id]);
        const data = rows as any[];
        return data.length ? data[0] : null;
    }

    async create(data: Profile): Promise<Profile> {
        await this.connect();
        const [result]: any = await this.connection!.execute(
            'INSERT INTO profiles (name, email) VALUES (?, ?)',
            [data.name, data.email]
        );
        return { ...data, id: result.insertId };
    }

    async update(id: string, data: Profile): Promise<any | null> {
        await this.connect();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.email) {
            fields.push('email = ?');
            values.push(data.email);
        }

        if (fields.length === 0) return null;

        values.push(id);
        await this.connection!.execute(`UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.getOne(id);
    }

    async delete(id: string): Promise<boolean> {
        await this.connect();
        const [result]: any = await this.connection!.execute('DELETE FROM profiles WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

}

export { TestRepository };
