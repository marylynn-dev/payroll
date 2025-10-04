const router = require('express').Router();
const { create, list, get, update, del } = require('../controllers/employee');
const roles = require('../middleware/roles');
const { verifyAccessToken } = require('../middleware/jwt')


router.post('/', verifyAccessToken, roles(['admin', 'hr']), create);
router.get('/', verifyAccessToken, roles(['admin', 'hr']), list);
router.get('/:id', verifyAccessToken, get);
router.put('/:id', verifyAccessToken, roles(['admin', 'hr']), update);
router.delete('/:id', verifyAccessToken, roles(['admin', 'hr']), del);

module.exports = router;
