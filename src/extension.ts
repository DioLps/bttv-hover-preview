import * as vscode from "vscode";
import axios from "axios";

let bttvEmotes: any = null;

// Fetch BTTV emotes on extension activation
async function _fetchBttvEmotes() {
  try {
    const response = await axios.get(
      "https://api.betterttv.net/3/cached/users/twitch/121059319"
    );

    const emotes = [
      ...response.data.sharedEmotes,
      ...response.data.channelEmotes,
    ];

    bttvEmotes = emotes.reduce((acc: any, emote: any) => {
      acc[emote.code] = {
        url: `https://cdn.betterttv.net/emote/${emote.id}/2x`,
      };

      return acc;
    }, {});
    console.log("BTTV emotes loaded");
  } catch (err) {
    console.error("Error fetching BTTV emotes:", err);
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Load BTTV emotes when the extension is activated
  _fetchBttvEmotes();

  // Create hover provider for comments
  const hoverProvider = vscode.languages.registerHoverProvider(
    { scheme: "*", language: "*" },
    {
      provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position, /\/\/.*/);
        if (range) {
          const commentText = document.getText(range);

          // Check if the comment contains any BTTV emote name
          const emoteNameMatch = Object.keys(bttvEmotes).find((emote) =>
            commentText.includes(emote)
          );

          //   // You can customize the message shown in hover
          //   const hoverMessage = new vscode.MarkdownString(
          //     `Comment detected: ${commentText} - ${emoteNameMatch}`
          //   );
          //   return new vscode.Hover(hoverMessage);

          if (emoteNameMatch) {
            const emoteUrl = bttvEmotes[emoteNameMatch]?.url;
            const markdown = new vscode.MarkdownString(
              `![${emoteNameMatch}](${emoteUrl}) <br /><strong>${emoteNameMatch}</strong>`
            );
            markdown.supportHtml = true;
            markdown.isTrusted = true; // Allow image rendering in markdown
            return new vscode.Hover(markdown);
          }
        }
        return null;
      },
    }
  );

  context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
