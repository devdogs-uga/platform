import express from 'express';
var authRouter = express.Router();
import Prisma from '@prisma/client';
import password from 'generate-password';
const prisma = new Prisma.PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
session.Store = connectPgSimple(session);
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendEmailVerification } from '../controllers/emailVerification.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import timestamp from 'unix-timestamp';
timestamp.round = true;

import {v4 as uuidv4} from 'uuid';
import queryString from 'query-string';
import { addUsers } from '../controllers/githubData.controller.js';

export async function checkJWT(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1] || req.query.access_token;
    
    if (!token) {
        return res.status(403).send({message: "A token is required for authentication"});
    }
    
    try {
        // Verify the token using the same secret key used to sign the tokens
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        // Optionally attach user details or decoded token to the request for further use
        req.user = decoded.userId;
        next(); // Proceed to the next middleware or request handler
    } catch (err) {
        // Check if the error is due to token expiration
        if (err.name === 'TokenExpiredError') {
            // create new access token and send it back with the data
            const data = jwt.decode(token);
            console.log(req.session, data.userId)
            if (req.session.refresh_token) {
                let refresh = await prisma.refresh_token.findFirst({
                    where: {
                        refresh_token: req.session.refresh_token
                    },
                    select: {
                        userId: true
                    }
                })

                if (refresh.userId == await data.userId) {
                    const newToken = jwt.sign({
                        sub: process.env.ORG,
                        scopes: "user",
                        userId: data.userId,
                        iat: timestamp.now(),
                        exp: timestamp.add(timestamp.now(), "+5m")
                    }, process.env.SECRET_KEY)
                    req.newToken = newToken;
                    req.user = data.userId;
                }
            next();
        } else {
            return res.status(401).send({message: "Invalid Token"});
        }
    }
}}

function genPass() {
    return password.generate({
        numbers: true,
        length: 95,
        uppercase: false
    });
}
export const sessionObject = session({
    secret: process.env.SESSION_SECRET,
    store: new (connectPgSimple(session))({
        conString: process.env.DATABASE_URL
    }),
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
        secure: true, // Set to true in production for HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        domain: ".uga.edu",
        sameSite: "lax",
        httpOnly: "true"
    },
    genid: function() {
        return uuidv4() // use UUIDs for session IDs
    },
})

authRouter.use(sessionObject);

authRouter.get('/callback', async (req, res) => {
    try {
        const code = req.query?.code;
        const { data: accessTokenData } = await axios({
            url: 'https://github.com/login/oauth/access_token',
            method: 'get',
            params: {
              client_id: process.env.GIT_CLIENT_ID,
              client_secret: process.env.GIT_CLIENT_SECRET,
              code,
            },
          });
        const response = queryString.parse(await accessTokenData);
        const { data: userData } = await axios({
            url: 'https://api.github.com/user',
            method: 'get',
            headers: {
              Authorization: `token ${response.access_token}`,
            },
          });
          
        let data = await prisma.users.findFirst({
            where: {
                githubLogin: await userData.login
            },
            select: {
                id: true
            }
        })

        if (data == null) {
            data = await addUsers(await userData.login);
        }

        await prisma.userInfo.update({
            where: {
                email_address: req.session.user.user_email
            },
            data: {
                github_token: response.access_token,
                user_id: data.id || null
            }
        })
        res.send("You have successfully linked your account with Github. You may now close this window.");
    } catch (error) {
        res.status(500).send("error" + error);
    }
})

authRouter.get('/', function(req, res, next) {
    res.send('Express API is running properly.');
});

authRouter.post('/updatePassword', isAuthenticated, checkJWT, async (req, res) => {
    const {password} = req.body;

    if (password == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'password' field is required."
        })
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await prisma.userInfo.update({
        where: {
            id: req.user
        },
        data: {
            password_hash: hash,
            salt: salt
        }
    })

    res.send({
        code: "200 OK",
        message: "Password updated successfully."
    })
});

authRouter.post('/createUser', async (req, res) => {
    if (req.body.email_address == null) {
        res.status(400).send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'email_address' field is required."
        })
        return;
    }

    if (req.body.password == null) {
        res.status(400).send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'password' field is required."
        })
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    let refresh;
    let newUser;

    try {
        newUser = await prisma.userInfo.create({
            data: {
                first_name: req.body.first_name || null,
                last_name: req.body.last_name,
                email_address: req.body.email_address,
                password_hash: hash,
                salt: salt
            }
        })

        await prisma.user_page.create({
            data: {
                id: newUser.id
            }
        })

        let code = password.generate({
            length: 6,
            numbers: true
        })

        refresh = await prisma.refresh_token.create({
            data: {
                userId: newUser.id,
                refresh_token: genPass()
            }
        })

        var expireTime = new Date(new Date().getTime() + 30 * 60 * 1000);

        await prisma.email_verification.create({
            data: {
                id: newUser.id,
                code: code,
                expireTimestamp: expireTime
            }
        })

        sendEmailVerification(code, req.body.email_address);

        req.session.user = { user_email: req.body.email_address };
        req.session.refresh_token = refresh.refresh_token;
        res.status(200).send({
            code: "200 OK",
            message: "User created successfully.",
            access_token: jwt.sign({
                sub: process.env.ORG,
                scopes: "user",
                userId: newUser.id,
                iat: timestamp.now(),
                exp: timestamp.add(timestamp.now(), "+5m")
            }, process.env.SECRET_KEY),
        })
    } catch (err) {
        if (err.code == "P2002") {
            res.status(409).send({
                code: "409 Conflict",
                message: "The user with the email address: " + req.body.email_address + " already exists."
            })
            return;
        } else {
            res.status(500).send({
                code: "500 INTERNAL SERVER ERROR",
                message: "An error occured while creating the user."
            })
            console.log(err)
            return;
        }
    }
});

// TODO: Add try catch block
authRouter.get('/getAccessToken', async (req, res) => {
    if (isAuthenticated) {
        const userInfo = await prisma.userInfo.findFirst({
            where: {
                email_address: email_address,
            },
        });
    
        const hash = await bcrypt.hash(password, userInfo.salt);
        if (userInfo.password_hash === hash) {
            const token = jwt.sign({
                sub: process.env.ORG,
                scopes: "user",
                userId: userInfo.id,
                iat: timestamp.now(),
                exp: timestamp.add(timestamp.now(), "+5m")
            }, secret_key)
    
            let refresh_token = await prisma.refresh_token.findFirst({
                where: {
                    userId: userInfo.id
                },
                select: {
                    refresh_token: true
                }
            })
            refresh_token = refresh_token.refresh_token
    
            res.send({token, refresh_token});
    }} else {
        const {email_address, password} = req.body;

        if (email_address == null) {
            res.send({
                code: "MISSING_FIELD_REQURED",
                message: "The 'email_address' field is required."
            })
            return;
        }
        
        if (password == null) {
            res.send({
                code: "MISSING_FIELD_REQURED",
                message: "The 'password' field is required."
            })
            return;
        }
    
        const secret_key = process.env.SECRET_KEY;
    
        const userInfo = await prisma.userInfo.findFirst({
            where: {
                email_address: email_address,
            },
        })
    
        const hash = await bcrypt.hash(password, userInfo.salt);
        if (userInfo.password_hash === hash) {
            const token = jwt.sign({
                sub: process.env.ORG,
                scopes: "user",
                userId: userInfo.id,
                iat: timestamp.now(),
                exp: timestamp.add(timestamp.now(), "+5m")
            }, secret_key)
    
            let refresh_token = await prisma.refresh_token.findFirst({
                where: {
                    userId: userInfo.id
                },
                select: {
                    refresh_token: true
                }
            })
            refresh_token = refresh_token.refresh_token
    
            res.send({token, refresh_token});
        } else {
            res.status(401).send({
                code: "401 UNAUTHORIZED",
                message: "Unauthorized access to resource."
            })
        }
    }
});

authRouter.get("/resendEmail", checkJWT, isAuthenticated, async (req, res) => {
    const userId = req.user;

    const code = password.generate({
        length: 6,
        numbers: true
    })

    const expireTime = new Date(new Date().getTime() + 30 * 60 * 1000);

    let email = await prisma.userInfo.findFirst({
        where: {
            id: userId
        },
        select: {
            email_address: true
        }
    })

    email = await email.email_address;

    await prisma.email_verification.update({
        where: {
            id: userId
        },
        data: {
            code: code,
            expireTimestamp: expireTime
        }
    })

    sendEmailVerification(code, email);
    res.status(200).send("Email sent!")
})

// TODO: Convert into a middleware function to check if user is verified
authRouter.get('/getUserData', (req, res) => {
    const token = req.body.token;
    const secret_key = process.env.SECRET_KEY;

    let payload; 
    try {
        payload = jwt.verify(token, secret_key)
        if (payload.exp > timestamp.now()) {
            sendData();
        } else {
            res.send({
                code: "419 Access Token Expired",
                message: "Access token is expired. Regain access to resource by getting a new access token."
            })
        }
    } catch (err) {
        res.send({
            code: "401 UNAUTHORIZED",
            message: "Unauthorized access to resource."
        })
    }

    function sendData() {
        
    }
})

authRouter.get('/getNewToken', async (req, res) => {
    const token = req.body.token;
    const refresh_token = req.body.refresh_token;
    const secret_key = process.env.SECRET_KEY;

    if (token == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'token' field is required."
        })
        return;
    }

    if (refresh_token == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'refresh_token' field is required."
        })
        return;
    }

    var userId;
    try {
        userId = await jwt.decode(token).userId;
    } catch (err) {
        res.send({
            code: "401 UNAUTHORIZED",
            message: "Unauthorized access to resource."
        })
        return;
    }

    try {
        jwt.verify(token, secret_key)
    } catch (err) {
        res.send({
            code: "401 UNAUTHORIZED",
            message: "Unauthorized access to resource."
        })
        return;
    }
    
    const userInfo = await prisma.userInfo.findUnique({
        where: {
            id: userId
        },
    })

    const dbRefresh = await prisma.refresh_token.findUnique({
        where: {
            userId: userInfo.id
        },
        select: {
            refresh_token: true
        }
    })

    let payload;
    try {
        payload = jwt.verify(token, secret_key)
        if (payload.exp > timestamp.now()) {
            res.send({token})
        }
    } catch (err) {
        if (err == "JsonWebTokenError: invalid signature") {
            res.send({
                code: "401 UNAUTHORIZED",
                message: "Unauthorized access to resource."
            })
        }

        if (err == "TokenExpiredError: jwt expired") {
            if (dbRefresh.refresh_token == refresh_token) {
                const newRefresh = genPass();

                try {
                    await prisma.refresh_token.update({
                        where: {
                            userId: userInfo.id
                        },
                        data: {
                            refresh_token: newRefresh
                        }
                    })
                } catch (err) {
                    console.log(err)
                }

                res.send({
                    token: jwt.sign({
                        sub: process.env.ORG,
                        userId: userInfo.id,
                        iat: timestamp.now(),
                        exp: timestamp.add(timestamp.now(), "+5m")
                    }, secret_key),
                    refresh_token: newRefresh
                })
            } else {
                res.send({
                    code: "401 UNAUTHORIZED",
                    message: "The provided refresh token is not valid."
                })
            }
        }
    }

})

authRouter.post('/resetPassword', isAuthenticated, checkJWT, async (req, res) => {
    const {email_address, password} = req.body;

    if (email_address == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'email_address' field is required."
        })
        return;
    }

    let userInfo;
    try {
      userInfo = await prisma.userInfo.findFirst({
          where: {
              email_address: email_address
          }
      })
    } catch (err) {
      res.send({
        code: "404 NOT FOUND",
        message: "The user with the email address: " + email_address + " does not exist."
      })
      return;
    }

    // TODO FIGURE OUT A WAY TO VERIFY USER

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await prisma.userInfo.update({
        where: {
            id: userInfo.id,
            email_address: email_address
        },
        data: {
            password_hash: hash,
            salt: salt
        }
    })

    res.status(200).send({
        code: "200 OK",
        message: "Password reset successful."
    })
});

export function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send({
            code: "401 UNAUTHORIZED",
            message: "Unauthorized access to resource. Session Id: " + req.sessionID
        });
    }
}

authRouter.get('/user_page', isAuthenticated, checkJWT, function(req, res) {
    let data = {};

    if (req.accessToken) {
      data += {
        accessToken: req.accessToken
      }
    }
  
    res.status(200).send({
      data: data,
    });
  });

authRouter.get('/session',(req, res) => {
    console.log("hi", req.session.id)

    if (req.session.user) {
        res.status(200).send({
            code: "200 OK",
            message: "Session is active."
        })
    } else {
        res.status(401).send({
            code: "401 UNAUTHORIZED",
            message: "Session is not active."
        })
    }
});

authRouter.post('/login', async (req, res) => {
    const {email_address, password} = req.body;

    if (email_address == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'email_address' field is required."
        })
        return;
    }

    if (password == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'password' field is required."
        })
        return;
    }

    const userInfo = await prisma.userInfo.findFirst({
        where: {
            email_address: email_address
        },
        select: {
            password_hash: true,
            id: true,
            refresh_token: {
                select: {
                    refresh_token: true
                }
            }
        }
    })

    if (userInfo) {
        if (await bcrypt.compare(password, await userInfo.password_hash)) {
            req.session.user = { user_email: email_address };
            req.session.refresh_token = await userInfo.refresh_token.refresh_token;
            console.log(req.session)

            res.status(200).send({
                code: "200 OK",
                message: "User logged in successfully.",
                access_token: jwt.sign({
                    sub: process.env.ORG,
                    scopes: "user",
                    userId: userInfo.id,
                    iat: timestamp.now(),
                    exp: timestamp.add(timestamp.now(), "+5m")
                }, process.env.SECRET_KEY)
            })
        } else {
            res.status(401).send({
                code: "401 UNAUTHORIZED",
                message: "Unauthorized access to resource."
            })
        }
    } else {
        res.status(404).send({
            code: "404 NOT FOUND",
            message: "The user with the email address: " + email_address + " does not exist."
        })
    }
});

authRouter.get('/restricted', isAuthenticated, checkJWT, (req, res) => {
    res.status(200).send({
        'messge': `is authenticated.`, 
        'access_token': req.newToken
    });
});

authRouter.get('/logout', (req, res) => {
    console.log(req.cookies);
    console.log(req.session);
    req.session.destroy();
    res.clearCookie('connect.sid')
    console.log(req.session)
    res.send('Logged out successfully.');
});

authRouter.post('/verifyEmail', async (req, res) => {
    const {email_address} = req.body;
    if (req.body.code == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'code' field is required."
        })
        return;
    }

    if (req.body.email_address == null) {
        res.send({
            code: "MISSING_FIELD_REQURED",
            message: "The 'email_address' field is required."
        })
        return;
    }

    const data = await prisma.userInfo.findFirst({
        where: {
            email_address: email_address
        },
        select: {
            id: true,
            email_verification: {
                select: {
                    expireTimestamp: true,
                    code: true
                }
            }
        }
    })


    const code = data.email_verification.code;
    const expired = new Date() >= new Date(data.email_verification.expireTimestamp);

    if ((req.body.code == code) && !expired) {
        req.session.user = { user_email: email_address };
        res.status(200).send({
            code: "200 OK",
            message: "Email verified successfully."
        })
        await prisma.email_verification.update({
            data: {
                verified: true
            },
            where: {
                id: data.id
            }
        })
    } else {
        res.status(401).send({
            code: "401 UNAUTHORIZED",
            message: "Unauthorized access to resource."
        })
    }
});

authRouter.get('/email_verification', async (req, res) => {
    const verification_code  = req.query?.code;
    const email = req.query?.email;

    if (!email || !verification_code) {
        res.status(500).send("Invalid request")
        return
    }

    let db_code = await prisma.userInfo.findFirst({
        where: {
            email_address: email
        },
        select: {
            email_verification: {
                select: {
                    code: true,
                    expireTimestamp: true,
                    id: true
                }
            }
        }
    })
    console.log(db_code)
    if (db_code == null) {
        res.send("Invalid email")
        return
    }

    let expires = await db_code.email_verification.expireTimestamp

    const code = await db_code.email_verification.code

    const expired = new Date() >= new Date(await expires);
    console.log(expired);

    if (expired) {
        res.send("Email verification code invalid. Please request new code.")
        return;
    }

    if (verification_code === code) {
        await prisma.email_verification.updateMany({
            where: {
                id: await db_code.email_verification.id
            },
            data: {
                verified: true
            }
        })
        res.sendFile(path.join(__dirname, 'src', 'email_verification.html'));
    } else {
        res.send("Unauthorized")
    }
});

authRouter.get('*', function(req, res){
    res.status(404);
});

export default authRouter;