import Prisma from '@prisma/client';

const client = new Prisma.PrismaClient();

export async function getGithubData(projectNum) {
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            // eslint-disable-next-line no-undef
            'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
            query: `
            query DevDogs {
                organization(login: "DevDogs-UGA") {
                    projectV2(number: ${projectNum}) {
                        items(last: 100) {
                            totalCount
                            edges {
                                node {
                                    content {
                                        ... on Issue {
                                            title
                                            id
                                            closed
                                            closedAt
                                            number
                                            timeline(last: 100) {
                                                edges {
                                                    node {
                                                        __typename
                                                        ... on ClosedEvent {
                                                            actor {
                                                                login
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    fieldValues(first: 20) {
                                        nodes {
                                            ... on ProjectV2ItemFieldSingleSelectValue {
                                                name
                                                field {
                                                    ... on ProjectV2SingleSelectField {
                                                        name
                                                        updatedAt
                                                    }
                                                }
                                            }
                                            ... on ProjectV2ItemFieldNumberValue {
                                                number
                                                field {
                                                    ... on ProjectV2Field {
                                                        name
                                                    }
                                                }
                                            }
                                            ... on ProjectV2ItemFieldDateValue {
                                                field {
                                                    ... on ProjectV2Field {
                                                        name
                                                    }
                                                }
                                                date
                                            }
                                            ... on ProjectV2ItemFieldUserValue {
                                                field {
                                                    ... on ProjectV2FieldCommon {
                                                        name
                                                    }
                                                }
                                                users(first: 10) {
                                                    totalCount
                                                    nodes {
                                                        email
                                                        name
                                                        login
                                                    }
                                                }
                                            }
                                            ... on ProjectV2ItemFieldTextValue {
                                                field {
                                                    ... on ProjectV2Field {
                                                        name
                                                    }
                                                }
                                                text
                                            }
                                        }
                                        totalCount
                                    }
                                }
                            }
                        }
                    }
                }
            }
`,
        }),
    });

    return response;
}

const isTimestampInRange = (startTimestamp, endTimestamp, checkTimestamp) => {
    // Convert the timestamps to Date objects
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);
    const checkDate = new Date(checkTimestamp);
  
    // Check if the third timestamp is between the first two
    return checkDate >= startDate && checkDate <= endDate;
  };

async function confirmClosedBy(data, time) {
    try {
        const user = await client.admins.findFirst({
            where: {
                github_login: data
            }
        })

        // const user_term_end = user.term_end ? user.term_end : new Date('2025-12-31T23:59:59.999Z');
        
        if (user && isTimestampInRange(user.term_start, user.term_end, time)) {
            return true;
        } else {
            return false;
        }
        
    } catch (err) {
        console.log(err)
        return false;
    }
}
// only for DevDogs-website
export async function addGithubDataToDatabase(temp) {
    await addUsers(temp.users);
    await addUsers(temp.closed_by);

    await client.github_issues.upsert({
        where: { id: temp.id },
        update: {
            id: temp.id,
            user_id: temp.users,
            status: temp.Status,
            title: temp.title,
            complexity: parseInt(temp.Complexity?.toString().split('-')[0]),
            quality: parseInt(temp.Quality?.toString().split('-')[0]),
            priority: parseInt(temp.Priority?.toString().split('-')[0]),
            time_estimate: parseInt(temp['Time Estimate (Minutes)']),
            designation: temp.Designation,
            numberOfUsers: temp.users.split(", ")[0] === '' ? 0 : temp.users.split(", ").length,
            closed: temp.closed,
            closed_at: temp.closed_at,
            closed_by: temp.closed_by,
            issue_number: temp.issue_num
            
        },
        create: {
            id: temp.id,
            user_id: temp.users,
            status: temp.Status,
            title: temp.title,
            complexity: parseInt(temp.Complexity?.toString().split('-')[0]),
            quality: parseInt(temp.Quality?.toString().split('-')[0]),
            priority: parseInt(temp.Priority?.toString().split('-')[0]),
            time_estimate: parseInt(temp['Time Estimate (Minutes)']),
            designation: temp.Designation,
            numberOfUsers: temp.users.split(", ")[0] === '' ? 0 : temp.users.split(", ").length,
            closed: temp.closed,
            closed_at: temp.closed_at,
            closed_by: temp.closed_by,
            issue_number: temp.issue_num
        }
    })

    await calculatePoints(temp.id);
}

export async function deletePointsIfTakenOut(issue_id, data) {
    const pointsDbUser = await client.points.findMany({
        where: { issue_id: issue_id },
        select: { user_id: true }
    }).then((res) => res.map((item) => item.user_id));

    // userIds of the users associated with the issue (updated)
    const updatedUsers = data.user_id.split(", ");
    for (var i = 0; i < updatedUsers.length; i++) {
        updatedUsers[i] = await client.users.findFirst({ where: { githubLogin: updatedUsers[i] }, select: { id: true } }).then((res) => res.id);
    }
    
    for (const oldUser of pointsDbUser) {
        if (!updatedUsers.includes(oldUser)) {
            console.log(await client.points.deleteMany({
                where: {
                    issue_id: issue_id,
                    user_id: oldUser
                }
            }));
        }
    }
}

export async function calculatePoints(issue_id) {
    let points;

    const data = await client.github_issues.findFirst({ where: { id: issue_id } });

    if (data.closed === true && await confirmClosedBy(data.closed_by, data.closed_at)) {
        console.log('Issue is done');
        // formula to calculate points
        points = ((data.time_estimate / 60) * ((data.quality/3)*(50) + (data.priority/3)*(25) + (data.complexity/3)*(25))) || null;
        
        if (points && (data.numberOfUsers > 0)) {
            for (var i = 0; i < data.numberOfUsers; i++) {
                let github = data.user_id.split(", ")[i];
                let user = await client.users.findFirst({ where: { githubLogin: github }, select: { id: true } }).then((res) => res.id);
                let pointsExist = false;

                await deletePointsIfTakenOut(issue_id, data);

                try {
                    await client.points.findFirstOrThrow({ where: { issue_id: issue_id, user_id: user } })
                    pointsExist = true;
                // eslint-disable-next-line no-unused-vars
                } catch (error) {
                    // console.log('Points do not exist');
                }

                if (pointsExist) {
                    await client.points.updateMany({
                        where: { issue_id: issue_id, user_id: user },
                        data: {
                            issue_id: issue_id,
                            user_id: user,
                            points: points / data.numberOfUsers
                        }
                    });
                } else {
                    await client.points.create({
                        data: {
                            issue_id: issue_id,
                            user_id: user,
                            points: points/data.numberOfUsers
                        }
                    });
                }
            }
        } else {
            console.log('Points could not be calculated', issue_id);
        }
    } else {
        // console.log('Issue is not done');
        // if (await confirmClosedBy(data.closed_by)) {
        //     console.log('Issue closed by unauthorized user.');
        // }
    }
}

// function getPriority(priority) {
//     if (priority === 1) {
//         return 4;
//     } else if (priority === 2) {
//         return 3;
//     } else if (priority === 3) {
//         return 2;
//     } else if (priority === 4) {
//         return 1;
//     } else {
//         return null;
//     }
// }

export async function addUsers(temp_users) {
    let userArr;
    let data;
    try {
        userArr = temp_users.split(", ");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
        userArr = [];
    }
    // console.log(userArr);

    for (var j = 0; j < userArr.length; j++) {
        if (userArr[j] === '') {
            continue;
        } else {
            try {
                let url = `https://api.github.com/users/` + userArr[j];
                let full_name = await fetch(url, {
                    headers: {
                        // eslint-disable-next-line no-undef
                        'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
                    },
                })
                    .then((res) => res.json()).then((res) => res.name);
                
                    try {
                        data = await client.users.create({
                            data: {
                                githubLogin: userArr[j],
                                full_name: (await full_name) || userArr[j]
                            }
                        });
                    // eslint-disable-next-line no-unused-vars
                    } catch (err) {
                        // Do nothing
                    }
            } catch (error) {
                console.log(error);
            }
        }
    }

    if (data !== null) {
        return data;
    }
}

async function deleteDuplicatePoints(issue_id) {
    try {
        // Find all points for the given issue_id
        const points = await client.points.findMany({
            where: { issue_id: issue_id }
        });

        // Create a map to track unique user_ids
        const uniquePoints = new Map();

        for (const point of points) {
            const key = point.user_id; // Use user_id as the key
            if (!uniquePoints.has(key)) {
                uniquePoints.set(key, point.id); // Store the first occurrence
            } else {
                // If duplicate found, delete it
                await client.points.delete({
                    where: { id: point.id }
                });
                console.log(`Deleted duplicate point for user ${point.user_id} on issue ${issue_id}`);
            }
        }
    } catch (error) {
        console.error('Error deleting duplicate points:', error);
    }
}

// New function to delete duplicate points for all issues
export async function deleteAllDuplicatePoints() {
    try {
        // Fetch all issues from the github_issues table
        const issues = await client.github_issues.findMany({
            select: { id: true } // Only select the id field
        });

        // Iterate over each issue and call deleteDuplicatePoints
        for (const issue of issues) {
            await deleteDuplicatePoints(issue.id);
        }
    } catch (error) {
        console.error('Error deleting duplicate points for all issues:', error);
    }
}