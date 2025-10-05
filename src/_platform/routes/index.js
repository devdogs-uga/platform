import express from 'express';
var indexRouter = express.Router();
import Prisma from '@prisma/client';
const client = new Prisma.PrismaClient();

/* GET home page. */
indexRouter.get('/', function(req, res) {
  console.log(req.body);
  res.send('Express API is running properly.');
});

indexRouter.get('/getLeaderBoard', async function(req, res) {
  try {
    let rawData = await client.points.findMany({
      select: {
        points: true,
        users: {
          select: {
            githubLogin: true,
            full_name: true,
            id: true,
          }
        }
      }
    });

    // Aggregate points by githubLogin and include fullName and paid status
    let aggregatedPoints = {};
    for (const item of rawData) {
      let login = item.users.githubLogin;
      let name  = item.users.full_name;
      let userId = item.users.id;

      // Fetch the paid status using the userId
      let userPage = await client.userInfo.findUnique({
        where: { user_id: userId },
        select: { 
          user_page: {
            select: {
              paid: true,
              pfp_link: true
            }
          },
          first_name: true,
          last_name: true,
         }
      });

      let pfp_link = userPage?.user_page?.pfp_link || null;

      let fullName = name;
      if (userPage?.first_name !== undefined && userPage?.last_name !== undefined) {
        fullName = userPage?.first_name + " " + userPage?.last_name;
      }

      let paid = userPage ? userPage.user_page.paid : false;

      if (!aggregatedPoints[login]) {
        aggregatedPoints[login] = { points: 0, fullName, paid, pfp_link };
      }
      aggregatedPoints[login].points += item.points;
    }

    // Convert to array and sort by points
    let sortedLeaderBoard = Object.entries(aggregatedPoints).map(([githubLogin, data]) => ({
      githubLogin,
      fullName: data.fullName,
      points: data.points,
      paid: data.paid,
      pfp_link: data.pfp_link
    })).sort((a, b) => b.points - a.points);

    res.json(sortedLeaderBoard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default indexRouter;
