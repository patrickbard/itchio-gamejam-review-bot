# itch.io Game Jam Review Bot

An IFTTT bot that sends a web request to a webhook whenever it found that someone commented on your game jam submission.

## Runing it

```
npm install
npm start
```

## Configuration

Copy or rename `.env.example` to `.env` and change the values

```
CHROME_DIR=<Your Chrome location, probably C:\Program Files (x86)\Google\Chrome\Application\chrome.exe>
GAME_JAM_PATH=<Your Game id>
GAME_ID=<Your Game id>
IFTTT_TASK=<Name of your IFTTT task>
IFTTT_KEY=<Your IFTTT key>
```
example:
```
CHROME_DIR=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
GAME_JAM_PATH=/jam/brackeys-6/rate/
GAME_ID=1177704
IFTTT_TASK=itchio-review
IFTTT_KEY=qweasdzxc
```

### Create a IFTTT trigger


First you need to get your API Key for using webhooks, for this visit https://ifttt.com/maker_webhooks and click on Documentation

![Webhook Doc](https://i.ibb.co/KL3Lj2W/Screenshot-2021-08-31-170007.jpg)

It will redirect you to a documentation page with your API Key, and allow you to test the requests.
Copy that text and change the value of `IFTTT_KEY`

![Webhook API Key](https://i.ibb.co/jMcv3tM/Screenshot-2021-08-31-170023.jpg)

Now, you should create a *Webhook-Discord* integration

![IFTTT Main](https://i.ibb.co/4mpGyB6/Screenshot-2021-08-31-165559.jpg)

On Webhook configuration page, just choose a name you want to call this event.

I called mine `itchio-review` but you can name it whatever you want, just remember that `IFTTT_TASK` should match this name

![Webhook Config](https://i.ibb.co/P4MYdN4/Screenshot-2021-08-31-165614.jpg)


On Discord configuration page, you will be asked to authenticate with Discord and select a Server where you have administrator privileges.
Once you did that, you can choose which channel you want your messages go to.

![Discord Config](https://i.ibb.co/2kzrdZk/Screenshot-2021-08-31-165702.jpg)

Where:
* Value1 = Review Text
* Value2 = Time when review was posted
* Value3 = Link to review

This will send a message like this to your desired Discord channel

![Discord message](https://i.ibb.co/G27KBQv/Screenshot-2021-08-31-172113.jpg)

With a link to the comment in order to make easier for you to respond.

![Comment Link](https://i.ibb.co/MsJQz1x/Screenshot-2021-08-31-172053.jpg)

## Extra

On `index.js` you can change  `recheckIntervalInMinutes` to set how often you want to check for new comments. Default value is 10 minutes.

With some coding skills you can easily change the values of the payload to send different information with want.
