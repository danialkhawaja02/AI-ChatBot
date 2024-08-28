import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from '@supabase/supabase-js'




const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const embeddings = new GoogleGenerativeAIEmbeddings({apiKey: apiKey, modelName: "embedding-001"})
const sbApiKey = import.meta.env.VITE_SUPABASE_KEY
const sbUrl = import.meta.env.VITE_SUPABASE_URL
const supabase = createClient(sbUrl, sbApiKey)


const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: 'documents',
    queryName: 'match_documents'
})

const retriever = vectorStore.asRetriever()


export { retriever }