# Sentiment Analysis Block

## Overview

The **Sentiment Analysis** block is a powerful AI-powered tool that allows your Typebot to understand the emotional tone behind the text it receives, typically from user inputs. It analyzes the provided text and determines whether the expressed sentiment is positive, negative, or neutral.

**Main Benefits:**

*   **Understand User Emotions:** Gain insights into how users are feeling during their interaction with your bot (e.g., happy, frustrated, satisfied).
*   **Tailor Responses Dynamically:** Adapt the bot's conversation flow and responses based on the detected sentiment. For example, offer empathetic messages to a user expressing negative sentiment or provide a more enthusiastic response to positive feedback.
*   **Improve User Experience:** Proactively address user concerns or route dissatisfied users to human support, leading to higher satisfaction.
*   **Gather Actionable Feedback:** Automatically categorize feedback based on sentiment to identify areas for improvement in your products, services, or bot design.
*   **Enhance Analytics:** Track overall user sentiment trends and identify patterns in user interactions.

## Adding and Configuring the Block

*(Screenshots will be added here in the final documentation to illustrate each step.)*

**1. Adding the Block:**

*   In the Typebot builder, open the block palette (usually by clicking the "+" button or searching for blocks).
*   Find the "Sentiment Analysis" block. It's typically located under the "AI & Integrations" or "AI & NLP" category.
*   Drag and drop the block onto your desired position in the flow.

**2. Configuration Panel:**

When you select the Sentiment Analysis block, its configuration panel will appear on the right-hand side. Here's how to configure each option:

*   **Input Text:**
    *   **Text to Analyze:** This is where you specify which text the block should analyze.
        *   **How to configure:** Click on the dropdown menu. You'll see a list of all available variables in your Typebot flow. Select the variable that contains the user input or text you wish to analyze (e.g., `{{@User Feedback}}`, `{{@lastReply}}`).
        *   You can also directly type a variable name using the `{{variableName}}` syntax.
        *   **Purpose:** This tells the block what content to process. It's crucial that this variable holds text data.

*   **Language:**
    *   **Language Detection Method:** This setting determines how the language of the input text is identified.
        *   **Auto-detect (Default):** The block will automatically attempt to identify the language of the text. This is recommended for most use cases as it's convenient and supports multiple languages without manual setup.
        *   **Specify Language:** If you know the language of the text beforehand, or if auto-detection isn't working reliably for your specific use case (e.g., very short texts, mixed-language inputs that confuse the detector), you can manually set the language.
    *   **Select Language (appears if "Specify Language" is chosen):**
        *   **How to configure:** If you selected "Specify Language," a new dropdown will appear. Click on it and choose the language from the provided list (e.g., "English (en)", "Spanish (es)").
        *   **Purpose:** Explicitly setting the language can sometimes improve the accuracy and performance of the sentiment analysis, especially if the underlying AI service can skip a language detection step.

## Output Variables

After the Sentiment Analysis block processes the input text, it makes the following information available through special output variables. You can use these variables in subsequent blocks (like "Condition" blocks) to make decisions or display information.

*   **`@sentiment.label`** (Text)
    *   **Description:** Represents the overall sentiment category detected in the text.
    *   **Possible Values:**
        *   `"positive"`: The text expresses a positive sentiment.
        *   `"negative"`: The text expresses a negative sentiment.
        *   `"neutral"`: The text does not express a strong positive or negative sentiment.
    *   **Example:** If a user types "I love your service!", `@sentiment.label` would likely be `"positive"`.

*   **`@sentiment.score`** (Number)
    *   **Description:** A numerical value indicating the intensity and direction of the sentiment. The range of this score depends on the underlying AI service being used (e.g., Google Cloud Natural Language API typically provides a score between -1.0 and 1.0).
        *   Scores closer to 1.0 (or a higher positive number) indicate strong positive sentiment.
        *   Scores closer to -1.0 (or a lower negative number) indicate strong negative sentiment.
        *   Scores around 0 indicate neutral sentiment.
    *   **Example:** "I love your service!" might have a score of `0.9`, while "This is terrible." might have a score of `-0.8`.

*   **`@sentiment.languageCode`** (Text)
    *   **Description:** If the "Language Detection Method" was set to "Auto-detect," this variable will contain the language code (e.g., `"en"` for English, `"es"` for Spanish) of the language that the AI service detected in the input text. If you specified the language manually, this variable might be empty or reflect the specified language.
    *   **Example:** If a user types "Merci beaucoup" and auto-detect is on, `@sentiment.languageCode` might be `"fr"`.

**Example: Using `@sentiment.label` in a "Condition" block:**

Let's say you want to route users to different parts of your flow based on their feedback sentiment.

1.  Add a "Text Input" block and ask for user feedback, saving the reply to a variable like `{{@userFeedback}}`.
2.  Add a "Sentiment Analysis" block immediately after.
    *   Configure its "Text to Analyze" option to use the `{{@userFeedback}}` variable.
3.  Add a "Condition" block after the Sentiment Analysis block.
4.  In the Condition block's settings:
    *   **If:** Select the `@sentiment.label` variable.
    *   **Condition:** Choose "is equal to".
    *   **Value:** Type `"negative"`.
5.  Connect the "true" path of this condition to a block that offers help or escalates to human support (e.g., a "Send Email" block or a "Chatwoot" integration).
6.  You can add another condition for `"positive"` sentiment to thank the user, or handle `"neutral"` sentiment differently.

*(A screenshot illustrating this Condition block setup would be included here.)*

## Use Cases

Here are a few practical examples of how the Sentiment Analysis block can enhance your Typebot:

1.  **Route Frustrated Users to Support:**
    *   After a user describes an issue, use Sentiment Analysis.
    *   If the sentiment is "negative" and the score is below a certain threshold (e.g., -0.5), automatically offer to connect them to a human agent or create a support ticket.

2.  **Personalize Thank You Messages:**
    *   When a user provides feedback or completes a survey within the bot.
    *   If sentiment is "positive," display an enthusiastic thank you message: "That's wonderful to hear! We're thrilled you had a great experience."
    *   If sentiment is "neutral" or "negative," use a more standard or empathetic thank you: "Thank you for your feedback. We'll use it to improve."

3.  **Identify High-Priority Leads or Issues:**
    *   If using Typebot for lead generation or initial customer contact.
    *   Analyze the user's initial messages. If they express strong positive sentiment about your product/service, you could flag this lead as "hot."
    *   Conversely, if a user expresses strong negative sentiment about a critical issue, you could prioritize this interaction for immediate attention.

4.  **Gather Product Feedback:**
    *   Ask users what they think about a new feature.
    *   Use sentiment analysis to categorize responses automatically.
    *   In your analytics, you can then see the overall sentiment distribution for that specific question.

## Viewing Sentiment in Results & Analytics

Sentiment data isn't just for real-time flow adjustments; it's also integrated into Typebot's results and analytics to give you broader insights.

**1. Individual Chat Results (Transcript View):**

*   When you view the transcript of an individual user's interaction with your bot, if a Sentiment Analysis block was triggered, you'll see an indicator of the detected sentiment.
*   This is usually a small icon (e.g., 🙂 for positive, 🙁 for negative, 😐 for neutral) displayed next to the user's message that was analyzed or near the representation of the Sentiment Analysis block in the transcript.
*   Hovering over or clicking this icon may reveal a tooltip or popover with more details like the exact label, score, and detected language.

*(A screenshot of the transcript view showing a sentiment icon would be included here.)*

**2. Aggregated Sentiment Analytics (Analytics Page):**

Typebot provides a dedicated section for sentiment analytics, usually found under a "Sentiment" tab or section within your Typebot's main "Analytics" page. This area gives you an aggregated view of sentiment across all relevant interactions.

*   **Overall Sentiment Distribution:**
    *   Typically displayed as a **pie chart** or bar chart.
    *   Shows the percentage and count of "positive," "negative," and "neutral" sentiments detected across all analyzed inputs for the selected Typebot and time period.
    *   Helps you quickly understand the general emotional tone of your users.
*   **Sentiment Trends Over Time:**
    *   Usually a **line chart**.
    *   Plots the number of positive, negative, and neutral sentiments detected over a selected period (e.g., daily, weekly, monthly).
    *   Allows you to see if user sentiment is improving, declining, or staying consistent over time, perhaps in response to changes you've made.
*   **Filters:**
    *   You can usually filter these charts by **date range**.
    *   Some analytics dashboards might also allow filtering by a specific **Sentiment Analysis block** in your flow if you have multiple.

*(Screenshots of the sentiment distribution pie chart and the trends line chart would be included here.)*

**3. Filtering Main Results List:**

*   On the main "Results" page where all individual chat sessions are listed, you can often filter the results based on the detected sentiment.
*   Look for a filter option labeled "Sentiment Label" (or similar).
*   You can then select one or more labels (e.g., show only "negative" interactions) to quickly find specific conversations.

## Configuration for Self-Hosters

If you are self-hosting Typebot and the Sentiment Analysis block utilizes a cloud-based AI service (like Google Cloud Natural Language API, Amazon Comprehend, or Azure AI Language), you will generally need to configure your own API credentials for the service to function.

*   **API Credentials:** You'll need an active account with the respective cloud provider and an API key (or service account credentials) with the necessary permissions for the sentiment analysis service.
*   **Setup:** These credentials need to be securely provided to your self-hosted Typebot instance, typically through environment variables or a specific section in your configuration files.

For detailed instructions on how to obtain and configure API keys for different providers, please refer to our **"API Key Management for Integrations"** guide or the **"Self-Hosting Configuration Details"** section in our main documentation. *(These are hypothetical document names; actual names may vary.)*

This ensures that your self-hosted instance can securely authenticate with and use the chosen sentiment analysis provider.
