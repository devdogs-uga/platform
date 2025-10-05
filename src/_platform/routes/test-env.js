// test env for functions/routes

import express from 'express';
var testEnvRouter = express.Router();

testEnvRouter.get("/", async (req, res) => {
    res.send('Hey, this is the testing env.')
});

export default testEnvRouter;