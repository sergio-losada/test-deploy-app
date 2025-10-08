import bcrypt from "bcryptjs";
import { TestRepository } from "../repository/test-repository";
import { Profile } from "../model/profile";

class TestService {

  private repository: TestRepository;

  constructor() {
    this.repository = new TestRepository();
  }

  async getTestResponse() {
    const response: Profile[] = await this.repository.getTestResponse();
    // Quitar todas las password de response:

    if (response) {
      return response;
    }
    else {
      return null;
    }
  }

  async getOne(id: string) {
    return await this.repository.getOne(id);
  }

 async create(data: any): Promise<Profile> {
  if (!data.password) {
    throw new Error('La contraseña es obligatoria');
  }
	// Hasheamos la contraseña y se la pasamos a repository para guardar en BBDD
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newProfile = { ...data, password: hashedPassword };

  return await this.repository.create(newProfile);
}

  async update(id: string, data: any) {
    return await this.repository.update(id, data);
  }

  async delete(id: string) {
    return await this.repository.delete(id);
  }

  async authenticate(email: string, plainPassword: string) {
    const user = await this.repository.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(plainPassword, user.password || '');
    if (!match) return null;

    // password nunca se devuelve
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    } as Profile;
  }

}

export { TestService };