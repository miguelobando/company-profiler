import Groq from "groq-sdk";

export default async function resumeValues(data: string[]) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const responses = await informationScraper(data, groq);
  if (responses.length === 0) {
    return "No information available";
  }
  const finalResponse = await summarizeAnswers(responses, groq);
  return finalResponse;
}

const informationScraper = async (data: string[], groq: Groq) => {
  const answers: string[] = [];
  try {
    for (const value of data) {
      const prompt = `Based on this information ${value} 
              extract the following information if available:
              1. Company values
              2. Company mission
              3. Company culture
              No more than 280 characters or less thatn 100 words. If there is no information related, return "No information available `;

      const response = await groq.chat.completions.create({
        model: process.env.LLM_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
      });

      answers.push(response.choices[0].message.content || "");
    }
  } catch (error) {
    console.error("Error in informationScraper: ", error.message);
    return [];
  }

  return answers;
};

const summarizeAnswers = async (answers: string[], groq: Groq) => {
  const summary = answers.join("\n");
  const prompt = `Based on this information ${summary},
    summarize the information in a single paragraph. 
    No more than 100 words. Answer with just the paragraph and not information, 
    thill will be used in a report. do not introduce the information as AI generated.`;
  try {
    const finalResponse = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });
    return finalResponse.choices[0].message.content;
  } catch (error) {
    console.error("Error in summarizeAnswers: ", error.message);
    return "No information available";
  }
};
