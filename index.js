const fs = require('fs');
const { performance } = require('perf_hooks');
const puppeteer = require('puppeteer-core');
const axios = require('axios');
const dateFormat = require('dateformat');
const dotEnv = require('dotenv');

(async () => {
    dotEnv.config();

    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_DIR,
        headless: true,
        defaultViewport: null
    });

    const page = await browser.newPage();
    const fileName = "knownCommentsNumber.txt";
    const recheckIntervalInMinutes = 10; // Change here to set how often you want to recheck your game submission page

    const baseUrl = "https://itch.io";
    const itchioTimezoneOffset = "GMT-00:00";
    const gameJamPath = process.env.GAME_JAM_PATH;
    const gameId =  process.env.GAME_ID;

    const iftttPlaceholderUrl = "https://maker.ifttt.com/trigger/TASK/with/key/USER_KEY";
    const iftttTask = process.env.IFTTT_TASK;
    const iftttKey = process.env.IFTTT_KEY;

    function logger(logMessage) {
        let logDate = dateFormat(new Date(), "dd-mm-yyyy HH:MM:ss");
        console.log(`[${logDate}] ${logMessage}`);
    }

    async function loadPage(pageUrl) {
        await measureTime(["Loading", "Loaded"], "itch.io page", async () => {
            await page.goto(pageUrl, {waitUntil: 'networkidle2'});
        })
    }

    async function sendWebhookRequest(commentBodyString, commentDate, commentLinkString) {
        logger(`Comment message: "${commentBodyString}"`);
        logger(`Comment date: ${commentDate.toString()}`);
        logger(`Comment url: ${baseUrl + commentLinkString}`);

        let iftttUrl = iftttPlaceholderUrl
            .replace("TASK", iftttTask)
            .replace("USER_KEY", iftttKey);
        await measureTime(["Sending", "Sent"],"webhook request", async () => {
            await axios.post(iftttUrl, {
                value1: commentBodyString,
                value2: commentDate.toString(),
                value3: baseUrl + commentLinkString
            });
        });
    }

    async function measureTime(logJobActionsDescription, logJobName, callback) {
        logger(`${logJobActionsDescription[0]} ${logJobName}...`);

        let start = performance.now();
        await callback();
        let end = performance.now();

        logger(`${logJobActionsDescription[1]} ${logJobName} successfully. It took ${((end - start)/1000).toFixed(5)} seconds`);
    }

    (async function checkComments() {
        console.log(`\n==============================`);
        logger(`Checking for comments`);

        await loadPage(baseUrl + gameJamPath + gameId);

        try {
            let comments = (await page.$$(".community_post.sidebar_avatar")).reverse();
            let fileData = fs.readFileSync(fileName, 'utf8');
            let knownCommentsNumber = parseInt(fileData) || 0;

            if (comments.length > knownCommentsNumber) {
                fs.writeFileSync(fileName, comments.length);
                logger(`Updated '${fileName}' with number ${comments.length}`);

                for (let i = knownCommentsNumber; i < comments.length; i++) {
                    let commentDateElement = await comments[i].$(".post_date");
                    let commentLinkElement = await comments[i].$(".post_date a");
                    let commentBodyElement = await comments[i].$(".post_body");

                    let commentLinkString = await page.evaluate(element => element.getAttribute("href"), commentLinkElement);
                    let commentDateString = await page.evaluate(element => element.getAttribute("title"), commentDateElement);
                    let commentBodyString = await page.evaluate(element => element.textContent, commentBodyElement);

                    let commentDate = new Date(`${commentDateString} ${itchioTimezoneOffset}`);

                    logger(`Sending request for comment #${i+1}:`);
                    await sendWebhookRequest(commentBodyString, commentDate, commentLinkString);
                }
            } else {
                logger(`Already updated. Found ${comments.length} comments, you already known all of them.`);
                logger(`No webhook request sent`);
            }
        } catch (err) {
            console.error(err)
        }

        setTimeout(checkComments, recheckIntervalInMinutes * 60 * 1000);
    })();
})();