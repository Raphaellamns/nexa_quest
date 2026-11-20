const express = require('express');
const router = express.Router();
const { cadastrar, listar, editar, deletar } = require('../controllers/missaoController');
const auth = require('../middlewares/auth');
const permitir = require('../middlewares/checkRole');

router.post('/missoes', auth, permitir('administrador'), cadastrar);
router.get('/missoes', auth, listar);
router.put('/missoes/:id', auth, permitir('administrador'), editar);
router.delete('/missoes/:id', auth, permitir('administrador'), deletar);

module.exports = router;
