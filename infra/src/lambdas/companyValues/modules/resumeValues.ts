import Groq from "groq-sdk";

export default async function resumeValues(data: string[]) {
  const groq = new Groq({
    apiKey: "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",
  });

  const responses = await informationScraper(data, groq);
  const finalResponse = await summarizeAnswers(responses, groq);
  return finalResponse;
}

const informationScraper = async (data: string[], groq: Groq) => {
  const answers: string[] = [];
    for (const value of data) {
    const prompt = `Based on this information ${data} 
            extract the following information if available:
            1. Company values
            2. Company mission
            3. Company culture
            No more than 280 characters or less thatn 100 words. If there is no information related, return "No information available `;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    answers.push(response.choices[0].message.content || '');
    
  }
  return answers;
}

const summarizeAnswers = async (answers: string[], groq: Groq) => {
    const summary = answers.join("\n");
    const prompt = `Based on this information ${summary},
    summarize the information in a single paragraph. 
    No more than 100 words.`     
    const finalResponse = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });
    return finalResponse.choices[0].message.content;
};

