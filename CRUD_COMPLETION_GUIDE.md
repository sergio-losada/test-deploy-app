# Guía Completa para Finalizar el CRUD de Usuarios

## Introducción

Esta guía explica cómo completar la implementación del CRUD (Create, Read, Update, Delete) para usuarios en una API REST con Node.js, TypeScript, Express y MySQL.

## Estructura del Proyecto

```
api/
├── src/
│   ├── model/
│   │   └── profile.ts          # Modelo de datos del usuario
│   ├── repository/
│   │   └── test-repository.ts  # Capa de acceso a datos
│   ├── service/
│   │   └── test-service.ts     # Lógica de negocio
│   ├── controller/
│   │   └── test-controller.ts  # Controladores HTTP
│   └── routes/
│       └── test-routes.ts      # Definición de rutas
```

## 3.7 Obtener un Usuario por ID

Esta funcionalidad permite recuperar un usuario específico de la base de datos utilizando su identificador único.

### 3.7.1 Implementación del Repository

La capa de repository se encarga del acceso directo a la base de datos. Aquí implementamos la consulta SQL para obtener un usuario por su ID, manejando el caso donde el usuario no existe.

```typescript
// api/src/repository/test-repository.ts
async getOne(id: string): Promise<Profile | null> {
    await this.connect();
    const [rows] = await this.connection!.execute(
        'SELECT * FROM profiles WHERE id = ?', 
        [id]
    );
    const data = rows as Profile[];
    return data.length ? data[0] : null;
}
```

### 3.7.2 Implementación del Service

La capa de servicio actúa como intermediario entre el controller y el repository. En este caso, simplemente delega la operación al repository, pero aquí podríamos agregar lógica de negocio adicional si fuera necesario.

```typescript
// api/src/service/test-service.ts
async getOne(id: string): Promise<Profile | null> {
    return await this.repository.getOne(id);
}
```

### 3.7.3 Implementación del Controller

El controller maneja las peticiones HTTP y las respuestas. Aquí validamos la existencia del usuario y formateamos las respuestas con códigos de estado HTTP apropiados.

```typescript
// api/src/controller/test-controller.ts
async getOne(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const data = await this.service.getOne(id);
        
        if (!data) {
            res.status(404).json({ 
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID: ${id}` 
            });
            return;
        }
        
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo obtener el usuario' 
        });
    }
}
```

### 3.7.4 Definición de Ruta

Configuramos la ruta HTTP que mapea las peticiones GET con un parámetro ID al método del controller correspondiente.

```typescript
// api/src/routes/test-routes.ts
router.get('/users/:id', (req, res) => controller.getOne(req, res));
```

### 3.7.5 Pruebas Manuales

#### Caso de éxito - Usuario encontrado

**URL:** `GET http://localhost:8080/users/1`

**Headers:**
```
Content-Type: application/json
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan@example.com"
    }
}
```

#### Caso de error - Usuario no encontrado

**URL:** `GET http://localhost:8080/users/999`

**Headers:**
```
Content-Type: application/json
```

**Respuesta Error (404):**
```json
{
    "error": "Usuario no encontrado",
    "message": "No se encontró un usuario con ID: 999"
}
```

## 3.8 Insertar Usuarios

Esta funcionalidad permite crear nuevos usuarios en la base de datos con validaciones de datos y formato.

### 3.8.1 Implementación del Repository

En el repository implementamos la inserción en la base de datos. Validamos que los campos obligatorios estén presentes y retornamos el usuario creado con su nuevo ID.

```typescript
// api/src/repository/test-repository.ts
async create(data: Omit<Profile, 'id'>): Promise<Profile> {
    await this.connect();
    
    // Validar que los campos requeridos estén presentes
    if (!data.name || !data.email) {
        throw new Error('Nombre y email son campos obligatorios');
    }
    
    const [result]: any = await this.connection!.execute(
        'INSERT INTO profiles (name, email) VALUES (?, ?)',
        [data.name, data.email]
    );
    
    return { 
        id: result.insertId, 
        name: data.name, 
        email: data.email 
    };
}
```

### 3.8.2 Implementación del Service

El service implementa las validaciones de negocio, incluyendo la verificación de campos vacíos y el formato del email usando expresiones regulares.

```typescript
// api/src/service/test-service.ts
async create(data: Omit<Profile, 'id'>): Promise<Profile> {
    // Validaciones de negocio
    if (!data.name?.trim()) {
        throw new Error('El nombre no puede estar vacío');
    }
    
    if (!data.email?.trim()) {
        throw new Error('El email no puede estar vacío');
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error('El formato del email no es válido');
    }
    
    return await this.repository.create(data);
}
```

### 3.8.3 Implementación del Controller

El controller maneja la petición HTTP POST, extrae los datos del body, valida la presencia de campos requeridos y maneja diferentes tipos de errores con códigos de estado apropiados.

```typescript
// api/src/controller/test-controller.ts
async create(req: Request, res: Response): Promise<void> {
    try {
        const { name, email } = req.body;
        
        // Validar que se envíen los datos requeridos
        if (!name || !email) {
            res.status(400).json({
                error: 'Datos incompletos',
                message: 'Los campos name y email son obligatorios'
            });
            return;
        }
        
        const created = await this.service.create({ name, email });
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: created
        });
    } catch (error: any) {
        console.error('Error al crear usuario:', error);
        
        if (error.message.includes('obligatorios') || 
            error.message.includes('vacío') || 
            error.message.includes('válido')) {
            res.status(400).json({
                error: 'Datos inválidos',
                message: error.message
            });
        } else {
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo crear el usuario'
            });
        }
    }
}
```

### 3.8.4 Definición de Ruta

Configuramos la ruta HTTP POST que mapea las peticiones de creación al método del controller.

```typescript
// api/src/routes/test-routes.ts
router.post('/users', (req, res) => controller.create(req, res));
```

### 3.8.5 Pruebas Manuales

#### Caso de éxito - Usuario creado correctamente

**URL:** `POST http://localhost:8080/users`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "María García",
    "email": "maria@example.com"
}
```

**Respuesta Exitosa (201):**
```json
{
    "success": true,
    "message": "Usuario creado exitosamente",
    "data": {
        "id": 2,
        "name": "María García",
        "email": "maria@example.com"
    }
}
```

#### Caso de error - Email inválido

**URL:** `POST http://localhost:8080/users`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "Usuario Test",
    "email": "email-invalido"
}
```

**Respuesta Error (400):**
```json
{
    "error": "Datos inválidos",
    "message": "El formato del email no es válido"
}
```

#### Caso de error - Campos faltantes

**URL:** `POST http://localhost:8080/users`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "Usuario Sin Email"
}
```

**Respuesta Error (400):**
```json
{
    "error": "Datos incompletos",
    "message": "Los campos name y email son obligatorios"
}
```

## 3.9 Editar Usuarios

Esta funcionalidad permite actualizar usuarios existentes, soportando actualizaciones parciales (solo algunos campos) o completas.

### 3.9.1 Implementación del Repository

El repository construye dinámicamente la consulta SQL UPDATE basándose en los campos proporcionados. Verifica que se haya actualizado al menos un registro y retorna el usuario actualizado.

```typescript
// api/src/repository/test-repository.ts
async update(id: string, data: Partial<Omit<Profile, 'id'>>): Promise<Profile | null> {
    await this.connect();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    // Construir dinámicamente la consulta UPDATE
    if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
    }
    
    if (data.email !== undefined) {
        fields.push('email = ?');
        values.push(data.email);
    }
    
    // Si no hay campos para actualizar
    if (fields.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar');
    }
    
    values.push(id);
    
    const [result]: any = await this.connection!.execute(
        `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, 
        values
    );
    
    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
        return null;
    }
    
    // Retornar el usuario actualizado
    return await this.getOne(id);
}
```

### 3.9.2 Implementación del Service

El service valida los datos de entrada, verificando que los campos no estén vacíos y que el email tenga un formato válido cuando se proporcione.

```typescript
// api/src/service/test-service.ts
async update(id: string, data: Partial<Omit<Profile, 'id'>>): Promise<Profile | null> {
    // Validaciones de negocio
    if (data.name !== undefined && !data.name.trim()) {
        throw new Error('El nombre no puede estar vacío');
    }
    
    if (data.email !== undefined) {
        if (!data.email.trim()) {
            throw new Error('El email no puede estar vacío');
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('El formato del email no es válido');
        }
    }
    
    return await this.repository.update(id, data);
}
```

### 3.9.3 Implementación del Controller

El controller maneja las peticiones PUT, valida que se proporcione al menos un campo para actualizar y maneja los diferentes escenarios de error.

```typescript
// api/src/controller/test-controller.ts
async update(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Validar que se envíe al menos un campo para actualizar
        if (!updateData || Object.keys(updateData).length === 0) {
            res.status(400).json({
                error: 'Datos incompletos',
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
            return;
        }
        
        const updated = await this.service.update(id, updateData);
        
        if (!updated) {
            res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID: ${id}`
            });
            return;
        }
        
        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: updated
        });
    } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        
        if (error.message.includes('vacío') || 
            error.message.includes('válido') ||
            error.message.includes('actualizar')) {
            res.status(400).json({
                error: 'Datos inválidos',
                message: error.message
            });
        } else {
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo actualizar el usuario'
            });
        }
    }
}
```

### 3.9.4 Definición de Ruta

Configuramos la ruta HTTP PUT que mapea las peticiones de actualización con un parámetro ID al método del controller.

```typescript
// api/src/routes/test-routes.ts
router.put('/users/:id', (req, res) => controller.update(req, res));
```

### 3.9.5 Pruebas Manuales

#### Caso de éxito - Actualización parcial (solo nombre)

**URL:** `PUT http://localhost:8080/users/1`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "Juan Carlos Pérez"
}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Usuario actualizado exitosamente",
    "data": {
        "id": 1,
        "name": "Juan Carlos Pérez",
        "email": "juan@example.com"
    }
}
```

#### Caso de éxito - Actualización completa

**URL:** `PUT http://localhost:8080/users/1`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "Juan Carlos Pérez",
    "email": "juancarlos@example.com"
}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Usuario actualizado exitosamente",
    "data": {
        "id": 1,
        "name": "Juan Carlos Pérez",
        "email": "juancarlos@example.com"
    }
}
```

#### Caso de error - Usuario no encontrado

**URL:** `PUT http://localhost:8080/users/999`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "Usuario Inexistente"
}
```

**Respuesta Error (404):**
```json
{
    "error": "Usuario no encontrado",
    "message": "No se encontró un usuario con ID: 999"
}
```

#### Caso de error - Sin datos para actualizar

**URL:** `PUT http://localhost:8080/users/1`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Respuesta Error (400):**
```json
{
    "error": "Datos incompletos",
    "message": "Debe proporcionar al menos un campo para actualizar"
}
```

## 3.10 Borrar Usuarios

Esta funcionalidad permite eliminar usuarios de la base de datos de forma segura, verificando que el usuario exista antes de eliminarlo.

### 3.10.1 Implementación del Repository

El repository ejecuta la consulta DELETE y retorna un booleano indicando si se eliminó algún registro (basándose en affectedRows).

```typescript
// api/src/repository/test-repository.ts
async delete(id: string): Promise<boolean> {
    await this.connect();
    
    const [result]: any = await this.connection!.execute(
        'DELETE FROM profiles WHERE id = ?', 
        [id]
    );
    
    return result.affectedRows > 0;
}
```

### 3.10.2 Implementación del Service

El service valida que el ID proporcionado sea válido (no vacío y numérico) antes de proceder con la eliminación.

```typescript
// api/src/service/test-service.ts
async delete(id: string): Promise<boolean> {
    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
        throw new Error('ID de usuario inválido');
    }
    
    return await this.repository.delete(id);
}
```

### 3.10.3 Implementación del Controller

El controller maneja las peticiones DELETE, verifica que el usuario exista y retorna una respuesta apropiada. Nota que retornamos 200 con mensaje en lugar de 204 para proporcionar feedback al cliente.

```typescript
// api/src/controller/test-controller.ts
async delete(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        
        const deleted = await this.service.delete(id);
        
        if (!deleted) {
            res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID: ${id}`
            });
            return;
        }
        
        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        
        if (error.message.includes('inválido')) {
            res.status(400).json({
                error: 'Datos inválidos',
                message: error.message
            });
        } else {
            res.status(500).json({
                error: 'Error interno del servidor',
                message: 'No se pudo eliminar el usuario'
            });
        }
    }
}
```

### 3.10.4 Definición de Ruta

Configuramos la ruta HTTP DELETE que mapea las peticiones de eliminación con un parámetro ID al método del controller.

```typescript
// api/src/routes/test-routes.ts
router.delete('/users/:id', (req, res) => controller.delete(req, res));
```

### 3.10.5 Pruebas Manuales

#### Caso de éxito - Usuario eliminado

**URL:** `DELETE http://localhost:8080/users/1`

**Headers:**
```
Content-Type: application/json
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Usuario eliminado exitosamente"
}
```

#### Caso de error - Usuario no encontrado

**URL:** `DELETE http://localhost:8080/users/999`

**Headers:**
```
Content-Type: application/json
```

**Respuesta Error (404):**
```json
{
    "error": "Usuario no encontrado",
    "message": "No se encontró un usuario con ID: 999"
}
```

#### Caso de error - ID inválido

**URL:** `DELETE http://localhost:8080/users/abc`

**Headers:**
```
Content-Type: application/json
```

**Respuesta Error (400):**
```json
{
    "error": "Datos inválidos",
    "message": "ID de usuario inválido"
}
```

## Código Completo de Archivos

### Modelo Profile

El modelo define la estructura de datos del usuario con TypeScript interfaces para type safety.

```typescript
// api/src/model/profile.ts
export interface Profile {
    id: number;
    name: string;
    email: string;
}
```

### Repository Completo

El repository completo incluye todas las operaciones CRUD con manejo de conexiones y validaciones básicas.

```typescript
// api/src/repository/test-repository.ts
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

    async getTestResponse(): Promise<Profile[]> {
        if (!this.connection) {
            await this.connect();
        }
        const [rows] = await this.connection!.execute('SELECT * FROM `profiles`');
        return rows as Profile[];
    }

    async getOne(id: string): Promise<Profile | null> {
        await this.connect();
        const [rows] = await this.connection!.execute('SELECT * FROM profiles WHERE id = ?', [id]);
        const data = rows as Profile[];
        return data.length ? data[0] : null;
    }

    async create(data: Omit<Profile, 'id'>): Promise<Profile> {
        await this.connect();
        
        if (!data.name || !data.email) {
            throw new Error('Nombre y email son campos obligatorios');
        }
        
        const [result]: any = await this.connection!.execute(
            'INSERT INTO profiles (name, email) VALUES (?, ?)',
            [data.name, data.email]
        );
        
        return { 
            id: result.insertId, 
            name: data.name, 
            email: data.email 
        };
    }

    async update(id: string, data: Partial<Omit<Profile, 'id'>>): Promise<Profile | null> {
        await this.connect();
        
        const fields: string[] = [];
        const values: any[] = [];
        
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        
        if (data.email !== undefined) {
            fields.push('email = ?');
            values.push(data.email);
        }
        
        if (fields.length === 0) {
            throw new Error('No se proporcionaron campos para actualizar');
        }
        
        values.push(id);
        
        const [result]: any = await this.connection!.execute(
            `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, 
            values
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return await this.getOne(id);
    }

    async delete(id: string): Promise<boolean> {
        await this.connect();
        const [result]: any = await this.connection!.execute('DELETE FROM profiles WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

export { TestRepository };
```

### Service Completo

El service completo implementa toda la lógica de negocio y validaciones para las operaciones CRUD.

```typescript
// api/src/service/test-service.ts
import { TestRepository } from "../repository/test-repository";
import { Profile } from "../model/profile";

class TestService {
    private repository: TestRepository;

    constructor() {
        this.repository = new TestRepository();
    }

    async getTestResponse(): Promise<Profile[]> {
        const response = await this.repository.getTestResponse();
        return response || [];
    }

    async getOne(id: string): Promise<Profile | null> {
        return await this.repository.getOne(id);
    }

    async create(data: Omit<Profile, 'id'>): Promise<Profile> {
        // Validaciones de negocio
        if (!data.name?.trim()) {
            throw new Error('El nombre no puede estar vacío');
        }
        
        if (!data.email?.trim()) {
            throw new Error('El email no puede estar vacío');
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('El formato del email no es válido');
        }
        
        return await this.repository.create(data);
    }

    async update(id: string, data: Partial<Omit<Profile, 'id'>>): Promise<Profile | null> {
        // Validaciones de negocio
        if (data.name !== undefined && !data.name.trim()) {
            throw new Error('El nombre no puede estar vacío');
        }
        
        if (data.email !== undefined) {
            if (!data.email.trim()) {
                throw new Error('El email no puede estar vacío');
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('El formato del email no es válido');
            }
        }
        
        return await this.repository.update(id, data);
    }

    async delete(id: string): Promise<boolean> {
        // Validar que el ID sea válido
        if (!id || isNaN(Number(id))) {
            throw new Error('ID de usuario inválido');
        }
        
        return await this.repository.delete(id);
    }
}

export { TestService };
```

### Controller Completo

El controller completo maneja todas las peticiones HTTP y respuestas para las operaciones CRUD.

```typescript
// api/src/controller/test-controller.ts
import { Request, Response } from 'express';
import { TestService } from '../service/test-service';

class TestController {
    private service: TestService;

    constructor() {
        this.service = new TestService();
    }

    /**
     * Get all users from the database.
     */
    async getTestResponse(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.service.getTestResponse();
            res.status(200).json({
                success: true,
                data: response,
                count: response.length
            });
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ 
                error: "Error interno del servidor",
                message: "No se pudieron obtener los usuarios"
            });
        }
    }

    /**
     * Get a single user by ID.
     */
    async getOne(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data = await this.service.getOne(id);
            
            if (!data) {
                res.status(404).json({ 
                    error: 'Usuario no encontrado',
                    message: `No se encontró un usuario con ID: ${id}` 
                });
                return;
            }
            
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: 'No se pudo obtener el usuario' 
            });
        }
    }

    /**
     * Create a new user.
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, email } = req.body;
            
            if (!name || !email) {
                res.status(400).json({
                    error: 'Datos incompletos',
                    message: 'Los campos name y email son obligatorios'
                });
                return;
            }
            
            const created = await this.service.create({ name, email });
            
            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: created
            });
        } catch (error: any) {
            console.error('Error al crear usuario:', error);
            
            if (error.message.includes('obligatorios') || 
                error.message.includes('vacío') || 
                error.message.includes('válido')) {
                res.status(400).json({
                    error: 'Datos inválidos',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Error interno del servidor',
                    message: 'No se pudo crear el usuario'
                });
            }
        }
    }

    /**
     * Update an existing user.
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            if (!updateData || Object.keys(updateData).length === 0) {
                res.status(400).json({
                    error: 'Datos incompletos',
                    message: 'Debe proporcionar al menos un campo para actualizar'
                });
                return;
            }
            
            const updated = await this.service.update(id, updateData);
            
            if (!updated) {
                res.status(404).json({
                    error: 'Usuario no encontrado',
                    message: `No se encontró un usuario con ID: ${id}`
                });
                return;
            }
            
            res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: updated
            });
        } catch (error: any) {
            console.error('Error al actualizar usuario:', error);
            
            if (error.message.includes('vacío') || 
                error.message.includes('válido') ||
                error.message.includes('actualizar')) {
                res.status(400).json({
                    error: 'Datos inválidos',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Error interno del servidor',
                    message: 'No se pudo actualizar el usuario'
                });
            }
        }
    }

    /**
     * Delete a user by ID.
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            const deleted = await this.service.delete(id);
            
            if (!deleted) {
                res.status(404).json({
                    error: 'Usuario no encontrado',
                    message: `No se encontró un usuario con ID: ${id}`
                });
                return;
            }
            
            res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error: any) {
            console.error('Error al eliminar usuario:', error);
            
            if (error.message.includes('inválido')) {
                res.status(400).json({
                    error: 'Datos inválidos',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Error interno del servidor',
                    message: 'No se pudo eliminar el usuario'
                });
            }
        }
    }
}

export { TestController };
```

### Rutas Completas

Las rutas mapean cada endpoint HTTP a su método correspondiente en el controller.

```typescript
// api/src/routes/test-routes.ts
import express from 'express';
import { TestController } from '../controller/test-controller';

const router = express.Router();
const controller = new TestController();

// CRUD Routes
router.get('/users', (req, res) => controller.getTestResponse(req, res));      // Obtener todos los usuarios
router.get('/users/:id', (req, res) => controller.getOne(req, res));          // Obtener usuario por ID
router.post('/users', (req, res) => controller.create(req, res));             // Crear nuevo usuario
router.put('/users/:id', (req, res) => controller.update(req, res));          // Actualizar usuario
router.delete('/users/:id', (req, res) => controller.delete(req, res));       // Eliminar usuario

export default router;
```

## Resumen de Endpoints

| Método | Endpoint | Descripción | Códigos de Estado |
|--------|----------|-------------|-------------------|
| GET | `/users` | Obtener todos los usuarios | 200, 500 |
| GET | `/users/:id` | Obtener usuario por ID | 200, 404, 500 |
| POST | `/users` | Crear nuevo usuario | 201, 400, 500 |
| PUT | `/users/:id` | Actualizar usuario | 200, 400, 404, 500 |
| DELETE | `/users/:id` | Eliminar usuario | 200, 400, 404, 500 |

## Herramientas de Testing Recomendadas

1. **Postman**: Para pruebas manuales de API con interfaz gráfica
2. **Thunder Client**: Extensión de VS Code para testing integrado
3. **curl**: Para pruebas desde línea de comandos
4. **Jest + Supertest**: Para pruebas automatizadas y CI/CD

## Ejemplo de Prueba con curl

```bash
# Obtener todos los usuarios
curl -X GET http://localhost:8080/users

# Obtener usuario por ID
curl -X GET http://localhost:8080/users/1

# Crear usuario
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Actualizar usuario
curl -X PUT http://localhost:8080/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Eliminar usuario
curl -X DELETE http://localhost:8080/users/1
```

Esta guía proporciona una implementación completa y robusta del CRUD con validaciones, manejo de errores, explicaciones detalladas y documentación exhaustiva para testing.