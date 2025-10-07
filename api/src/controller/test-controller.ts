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

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.service.getOne(id);
      if (!data) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(data);
    } catch {
      res.status(500).json({ error: 'Unexpected API error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.service.create(req.body);
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: 'Unexpected API error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await this.service.update(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(updated);
    } catch {
      res.status(500).json({ error: 'Unexpected API error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Unexpected API error' });
    }
  }
  

}

export { TestController };