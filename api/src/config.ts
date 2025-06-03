export const databaseHost = process.env.DB_HOST || 'localhost';
export const databaseUser = process.env.DB_USER || 'root';
export const databasePort = parseInt(process.env.DB_PORT || '3306');
export const databaseName = process.env.DB_NAME || 'test';
export const databasePassword = process.env.DB_PASSWORD || '';

export const JWT_SECRET_KEY = 'jwt_secret'