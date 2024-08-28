import * as vscode from "vscode";
import axios from "axios";

let bttvEmotes: any = null;

// Fetch BTTV emotes on extension activation
async function _fetchBttvEmotes() {
  try {
    const response = await axios.get(
      "https://api.betterttv.net/3/emotes/shared/top?limit=100"
    );

    bttvEmotes = response.data.reduce((acc: any, { emote }: any) => {
      acc[emote.code.toLowerCase()] = {
        url: `https://cdn.betterttv.net/emote/${emote.id}/2x`,
      };
      return acc;
    }, {});
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
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /\/\/.*/);
        if (range) {
          const commentText = document.getText(range);

          // Check if the comment contains any BTTV emote name
          const emoteNameMatch = Object.keys(bttvEmotes).find((emote) =>
            commentText.toLowerCase().includes(emote)
          );

          if (emoteNameMatch) {
            const emoteUrl = bttvEmotes[emoteNameMatch]?.url;
            const markdown = new vscode.MarkdownString(
              `![${emoteNameMatch}](${emoteUrl}) <br /><strong>${emoteNameMatch.toUpperCase()}</strong>`
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
