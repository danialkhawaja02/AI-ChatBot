import { useEffect, useRef, useState } from "react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from "@langchain/core/output_parsers";
import { retriever } from '../../utils/retriever';
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { ChatGroq } from "@langchain/groq";


const chatHistory = [];
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const apiKey1 = import.meta.env.VITE_GROQ_API_KEY;

/*
const llm = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: "gemini-1.5-flash",
});
*/

const llm = new ChatGroq({
    apiKey: apiKey1,
    model: "llama3-8b-8192",
    "top_p": 1,
    "stream": true,
    "stop": null
  });

function combineDocuments(docs) {
    return docs.map((doc) => doc.pageContent).join('\n\n');
}

const answerTemplate = `You are a friendly and enthusiastic support bot here to help answer any questions about Dot Labs. Always greet users warmly, especially if they are interacting with the chatbot for the first time. Only provide information when asked—do not overwhelm users with details they haven't requested. Use "We" instead of "They" to show that Dot Labs is directly responding. When answering, always look for answers in the provided context. If the information isn't available there, check the conversation history. If you don't know the answer, kindly respond with, "I'm sorry, I don't know the answer to that," and direct the user to contact us at contact@dotlabs.ai. Keep the tone friendly and conversational, like chatting with a friend. Your goal is to make users feel welcomed, informed, and supported. Always avoid sharing information that hasn’t been specifically requested.
context: {context}
conversation history: {conv_history}
question: {question}
answer:
`;
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:`;
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);

const standaloneQuestionChain = RunnableSequence.from([standaloneQuestionPrompt, llm, new StringOutputParser()]);
const retrieverChain = RunnableSequence.from([prevResult => prevResult.standalone_question, retriever, combineDocuments]);
const answerChain = RunnableSequence.from([answerPrompt, llm, new StringOutputParser()]);

const chain = RunnableSequence.from([
    {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough()
    },
    {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history
    },
    answerChain
]);

export default function Chatbot() {
    const [input, setInput] = useState("");
    const [conversationHistory, setConversationHistory] = useState([]);
    const chatHeight = useRef(null);
    const chatContainerHeight = useRef(null);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async () => {
        if (input) {
            const userQuestion = input;
            setInput("");

            const questionIndex = conversationHistory.length;
            setConversationHistory(prevHistory => [
                ...prevHistory,
                { question: userQuestion, answer: "Loading..." }
            ]);

            const response = await chain.invoke({
                question: userQuestion,
                conv_history: chatHistory.join('\n')
            });

            chatHistory.push(`User: ${userQuestion}`);
            chatHistory.push(`Bot: ${response}`);

            setConversationHistory(prevHistory =>
                prevHistory.map((conversation, index) =>
                    index === questionIndex ? { ...conversation, answer: response } : conversation
                )
            );
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    useEffect(() => {
        if (chatHeight.current != null) {
            const height = chatContainerHeight.current.offsetHeight;
            window.scrollTo(0, height);
        }
    }, [conversationHistory]);

    return (
        <>
            <div className="w-[600px] max-w-[600px] flex justify-center relative pb-20">
                <div className="w-full" ref={chatContainerHeight}>
                    {conversationHistory.map((conversation, index) => (
                        <div key={index} className="px-10 md:px-0 py-10 md:py-0" ref={chatHeight}>
                            <div className="flex flex-col items-end py-1">
                                You
                                <div className="bg-[#28292e] p-[10px] rounded-[5px]">
                                    {conversation.question}
                                </div>
                            </div>
                            <div className="flex flex-col items-start py-1">
                                ChatBot
                                <div className="bg-[#28292e] p-[10px] rounded-[5px]">
                                    {conversation.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 justify-center inputBox fixed">
                    <input
                        type="text"
                        placeholder="Write Your Query"
                        className="inputField"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={handleSubmit} className="btn">Submit</button>
                </div>
            </div>
        </>
    );
}
