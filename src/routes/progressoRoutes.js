const express = require('express');
const router = express.Router();
const { registrar, listar, editarData, resumo } = require('../controllers/progressoController');
const auth = require('../middlewares/auth');

router.post('/progressos', auth, registrar);
router.get('/progressos', auth, listar);
router.get('/progressos/resumo', auth, resumo);
router.put('/progressos/:id', auth, editarData);

module.exports = router;
