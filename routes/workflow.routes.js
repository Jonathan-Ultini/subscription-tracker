import { Router } from 'express';

const workflowRouter = Router();

workflowRouter.get('/', (req, res) => res.send('GET all workflows'));

export default workflowRouter;