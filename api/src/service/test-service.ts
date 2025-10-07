import { TestRepository } from "../repository/test-repository";

class TestService {

  private repository: TestRepository;

  constructor() {
    this.repository = new TestRepository();
  }

  async getTestResponse() {
    const response = await this.repository.getTestResponse();

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

  async create(data: any) {
    return await this.repository.create(data);
  }

  async update(id: string, data: any) {
    return await this.repository.update(id, data);
  }

  async delete(id: string) {
    return await this.repository.delete(id);
  }

}

export { TestService };