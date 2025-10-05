import express from 'express';
var sideQuestRouter = express.Router();
import Prisma from '@prisma/client';
const client = new Prisma.PrismaClient();
import { addGithubDataToDatabase, getGithubData } from '../controllers/githubData.controller.js';
import { waitUntil } from '@vercel/functions';

async function asyncFunction() {
    try {
        const response = await getGithubData(1);
        const resJson = await response.json();
        const arr = resJson.data.organization.projectV2.items.edges;
    
        // Use map instead of forEach to create an array of promises
        const promises = arr.map(async (element) => {
            let temp = {};
            element.node?.fieldValues.nodes.forEach((item) => {
                let arrAdd = item.name || item.number;
                if (arrAdd) {
                    temp[item.field.name] = arrAdd;
                }
            });
            temp['title'] = element.node.content.title;
            temp['id'] = element.node.content.id;
            temp['closed'] = element.node.content.closed;
            temp['closed_at'] = element.node.content.closedAt;
            temp['issue_num'] = element.node.content.number;
            temp.closed_by = element.node.content.timeline?.edges?.find((item) => item.node.__typename === 'ClosedEvent')?.node.actor.login;
            var assignees = element.node.fieldValues.nodes.find((item) => item.field?.name === 'Assignees');
            var tempUser = "";
            for (let i = 0; i < assignees?.users.nodes.length; i++) {
                tempUser += assignees.users.nodes[i].login;
                if (tempUser.length > 0 && i < assignees.users.nodes.length - 1) {
                    tempUser += ", ";
                }
            }
            temp['users'] = tempUser;
            if (temp.id) {
                await addGithubDataToDatabase(temp);
            }
        });
    
        // Wait for all promises to resolve
        await Promise.all(promises);
    
        // console.log(githubResponse);
        // res.status(200).send('Operation completed successfully');
        console.log("Operation completed successfully");
        return "Operation completed successfully";
    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        console.log("Internal Server Error")
        return "Internal Server Error"
    }
}

/* GET users listing. */
sideQuestRouter.get('/', async function(req, res, next) {
    res.send("Side Quest Router is working");

    waitUntil (
        asyncFunction()
    );
});

export default sideQuestRouter;
