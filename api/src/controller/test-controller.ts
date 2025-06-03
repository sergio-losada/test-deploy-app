import { Request, Response } from 'express';
import { TestService } from '../service/test-service';

class TestController {

  private service: TestService;

  constructor() {
    this.service = new TestService();
  }

  /**
   * Get a test response from the server.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   * @returns JSON test response or an error response.
   */
  async getTestResponse(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.service.getTestResponse();
      if (response === null) {
        res.status(404).json({ error: 'Requested response does not exist' });
        return;  // Solo se retorna en este caso
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: "Unexpected API error" });
    }
  }
  

}

export { TestController };