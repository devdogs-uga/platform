// test env for functions/routes

import express from 'express';
var discordBot = express.Router();
import Prisma from '@prisma/client';
const prisma = new Prisma.PrismaClient();

export function isAuthenticated(req, res, next) {
    let token = req.headers['authorization']?.split(" ")[1] || null;
    if (token && token === process.env.API_KEY) {
        next();
    } else {
        res.status(401).send({
            code: "401 UNAUTHORIZED",
            message: "Unauthorized access to resource."
        });
    }
}

discordBot.get("/", isAuthenticated, async (req, res) => {
    const data = await prisma.unbound_data.findFirst({
        where: {
            uga_email: req.body.email || null
        },
        select: {
            preferred_first: true,
            legal_first: true
        }
    })

    let pref_first = data?.preferred_first || null;
    if (pref_first == null) {
        pref_first = data?.legal_first || null
    }

    if (pref_first) {
        res.status(200).send({
            code: "200 SUCCESS",
            data: {
                preferred_first: pref_first
            }
        })
    } else {
        res.status(500).send({
            code: "500 SERVER ERROR",
            message: "INCOMPLETE DATA ATTACHED"
        })
    }
    
});

discordBot.post("/uid", isAuthenticated, async (req, res) => {
    let discordUID = req.body.uid || null;
    let email = req.body.email || null;

    try {
        const data = await prisma.unbound_data.updateMany({
            where: {
                uga_email: email
            },
            data: {
                discord_uid: discordUID
            }
        })
        if (data.count === 0) {
            res.send({
                code: "500 SERVER ERROR",
                message: "No records updated."
            })
            return;
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({
            code: "500 SERVER ERROR"
        })
        return;
    }

    if (!discordUID || !email) {
        res.status(500).send({
            code: "500 SERVER ERROR",
            message: "INCOMPLETE DATA ATTACHED"
        })
        return;
    }

    res.status(200).send({
        code: "200 SUCCESS",
        message: "Operation completed successfully."
    })
})

discordBot.post("/profile", isAuthenticated, async (req, res) => {
    let discordUID = req.body.uid || null;
    let email = req.body.email || null;
    let pref_first = req.body.first_name || null;
    let last_name = req.body.last_name || null;

    try {
        await prisma.unbound_data.create({
            data: {
                uga_email: email,
                discord_uid: discordUID,
                preferred_first: pref_first,
                last_name: last_name
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).send({
            code: "500 SERVER ERROR"
        })
        return;
    }

    if (!discordUID || !email || !pref_first || !last_name) {
        res.status(500).send({
            code: "500 SERVER ERROR",
            message: "INCOMPLETE DATA ATTACHED"
        })
        return;
    }

    res.status(200).send({
        code: "200 SUCCESS",
        message: "Operation completed successfully."
    })
})

export default discordBot;