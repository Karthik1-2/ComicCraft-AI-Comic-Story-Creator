import { Router } from 'express';
import * as controller from '../controllers/comicController.ts';

const router = Router();

// Core Comic Creation and CRUD
router.post('/generate', controller.generateComic);
router.get('/', controller.getComics);
router.post('/', controller.saveNewComic);
router.get('/:id', controller.getComicById);
router.put('/:id', controller.updateComic);
router.delete('/:id', controller.deleteComic);

// Panel Actions
router.post('/:id/regenerate-panel/:panelNumber', controller.regeneratePanel);
router.post('/:id/improve-dialogue/:panelNumber', controller.improveDialogue);

// AI Assist Story Transformations
router.post('/:id/make-funnier', controller.makeFunnier);
router.post('/:id/make-dramatic', controller.makeDramatic);
router.post('/:id/add-plot-twist', controller.addPlotTwist);
router.post('/:id/change-ending', controller.changeEnding);
router.post('/:id/add-panel', controller.addPanel);

export default router;
