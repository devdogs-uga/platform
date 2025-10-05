import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import indexRouter from './routes/index.js';
import sideQuestRouter from './routes/sideQuest.js';
import mainProjectRouter from './routes/mainProject.js';
import authRouter from './routes/auth.js';
import testEnvRouter from './routes/test-env.js';
import discordBot from './routes/discordBot.js';
import userRouter from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import serveFavicon from 'serve-favicon';

var app = express();
app.use(cors({ credentials: true, origin: ['http://localhost:3000', 'https://dev-dogs-website.vercel.app/', "https://devdogs.uga.edu"] }));
// app.use(cors());

app.use(serveFavicon(path.join(__dirname, 'public', 'favicon.ico'))); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);

app.use('/sideQuest', sideQuestRouter);
app.use('/mainProject', mainProjectRouter);
app.use('/discord', discordBot);
app.use('/testing', testEnvRouter);


// catch 404 and forward to error handler
app.use(function(req, res) {
  res.status(404).send('404: Page not found');
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(4000, () => console.log('Server ready on port 4000.'))

export default app;