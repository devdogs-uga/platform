import express from 'express';
import { isAuthenticated, checkJWT } from "./auth.js";
import { sessionObject } from "./auth.js";
var userRouter = express.Router();
import Prisma from '@prisma/client';
const prisma = new Prisma.PrismaClient();

userRouter.use(sessionObject);

/* GET users listing. */
userRouter.get('/user_page',isAuthenticated, checkJWT, async function(req, res) {
  let data = {};

  data.user_page = await prisma.user_page.findFirst({
    where: {
      id: req.user
    },
    select: {
      resume_link: true,
      linkedin_link: true,
      contact_email: true,
      github_link: true,
      instagram_link: true,
      personal_link: true,
      bio: true,
      paid: true,
      pfp_link: true,
      userInfo: {
        select: {
          first_name: true,
          last_name: true,
          email_address: true,
          users: {
            select: {
              githubLogin: true
            }
          },
          email_verification: {
            select: {
              verified: true
            }
          }
        }
      }
    }
  })

  if (req.newToken) {
    data.accessToken = req.newToken;
  }

  res.status(200).send({
    data: data,
  });
});

userRouter.patch('/user_page', isAuthenticated, checkJWT, async function(req, res) {
  let data = {};
  console.log(req.user)

  try {
    await prisma.user_page.update({
      where: {
        id: req.user
      },
      data: {
        resume_link: req.body.resume_link || null,
        linkedin_link: req.body.linkedin_link || null,
        contact_email: req.body.contact_email || null,
        github_link: req.body.github_link || null,
        instagram_link: req.body.instagram_link || null,
        personal_link: req.body.personal_link || null,
        bio: req.body.bio || null,
        pfp_link: req.body.pfp_link || null,
        userInfo: {
          update: {
            first_name: req.body.first_name || null,
            last_name: req.body.last_name || null,
          }
        }
      }
    })
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Error updating user page"
    });
    return;
  }

  if (req.newToken) {
    data.accessToken = req.newToken;
    res.status(200).send({
      data: data,
    });
    return;
  } else {
    res.status(200).send({
      data: "User page updated successfully",
    });
    return;
  }
  
});

userRouter.get('/issues', async function(req, res) {
  let data = {};

  let id_data = await prisma.users.findFirst({
    where: {
      githubLogin: req.query.github
    },
    select: {
      userInfo: {
        select: {
          id: true
        }
      }
    }
  });

  const id = await id_data?.userInfo.id

  const response = await prisma.userInfo.findFirst({
    where: {
      id: id,
    },
    select: {
      users: {
        select: {
          points: {
            select: {
              points: true,
              github_issues: {
                select: {
                  title: true,
                  designation: true,
                }
              }
            }
          }
        }
      }
    }
  })

  //turn response into array of objects with points and issue title
  const issues = response.users?.points.map((issue) => {
    return {
      points: issue.points,
      title: issue.github_issues.title,
      designation: issue.github_issues.designation
    }
  })

  data.issues = issues;

  if (req.newToken) {
    data.accessToken = req.newToken;
  }

  res.status(200).send({
    data: data,
  });
});

userRouter.get('/pages/', async function(req, res) {
  let data = {};
  console.log(req.query.github)

  try {
    let id_data = await prisma.users.findFirst({
      where: {
        githubLogin: req.query.github
      },
      select: {
        userInfo: {
          select: {
            id: true
          }
        }
      }
    });

    const id = await id_data?.userInfo.id
    console.log(id)
    data.user_page = await prisma.users.findFirst({
      where: {
        githubLogin: req.query.github
      },
      select: {
        userInfo: {
          select: {
            first_name: true,
            last_name: true,
            email_address: true,
            users: {
              select: {
                githubLogin: true
              }
            },
            user_page: {
              where: {
                id: id
              },
              select: {
                resume_link: true,
                linkedin_link: true,
                contact_email: true,
                github_link: true,
                instagram_link: true,
                personal_link: true,
                bio: true,
                pfp_link: true,
                paid: true,
              }
            }
          }
        }
      }
    });

    if (data.user_page) {
      res.send(data);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user page:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default userRouter;