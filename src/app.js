const AssistantV2 = require("ibm-watson/assistant/v2");
const { IamAuthenticator } = require("ibm-watson/auth");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const assistant = new AssistantV2({
  version: process.env.ASSISTANT_VERSION,
  authenticator: new IamAuthenticator({
    apikey: process.env.ASSISTANT_APIKEY,
  }),
  serviceUrl: process.env.ASSISTANT_URL,
});

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

function watsonResponse(ctx) {
  let userInput = ctx.update.message.text;

  assistant
    .messageStateless({
      assistantId: process.env.ASSISTANT_ID,
      input: {
        message_type: "text",
        text: userInput,
      },
    })
    .then((res) => {
      showMessage(ctx, res);
    });
}

function showMessage(ctx, res) {
  let response = res.result.output.generic[0];

  if(response.response_type === 'text'){

    let message = response.text;
    ctx.reply(message);
  }
  else if(response.response_type === 'option'){

    let message = response.title + "\n\n";

    for(let i = 0; i<(response.options).length; i++){
      message += `∘  ${response.options[i].label}\n`;
    }

    ctx.reply(message);
  }
}

bot.on("text", (ctx) => {
  watsonResponse(ctx);
});

bot.launch();