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

}

export { TestService };