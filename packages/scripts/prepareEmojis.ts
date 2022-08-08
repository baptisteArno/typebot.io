import fs from 'fs'

export const prepareEmojis = () => {
  const emojiData = JSON.parse(fs.readFileSync('./emojiData.json', 'utf8'))
  const strippedEmojiData = {
    'Smileys & Emotion': emojiData['Smileys & Emotion'].map(
      (emoji: { emoji: any }) => emoji.emoji
    ),
    'People & Body': emojiData['People & Body'].map(
      (emoji: { emoji: any }) => emoji.emoji
    ),
    'Animals & Nature': emojiData['Animals & Nature'].map(
      (emoji: { emoji: any }) => emoji.emoji
    ),
    'Food & Drink': emojiData['Food & Drink'].map(
      (emoji: { emoji: any }) => emoji.emoji
    ),
    'Travel & Places': emojiData['Travel & Places'].map(
      (emoji: { emoji: any }) => emoji.emoji
    ),
    Activities: emojiData['Activities'].map(
      (emoji: { emoji: any }) => emoji.emoji
    ),
    Objects: emojiData['Objects'].map((emoji: { emoji: any }) => emoji.emoji),
    Symbols: emojiData['Symbols'].map((emoji: { emoji: any }) => emoji.emoji),
    Flags: emojiData['Flags'].map((emoji: { emoji: any }) => emoji.emoji),
  }
  fs.writeFileSync(
    'strippedEmojis.json',
    JSON.stringify(strippedEmojiData),
    'utf8'
  )
}
