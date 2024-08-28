import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from '@supabase/supabase-js'

// @supabase/supabase-js
try {
    const result = await fetch('/text.txt')
    const text = await result.text()
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
        separators: ['\n\n', '\n', ' ', ''] // default setting
    })
    
    const output = await splitter.createDocuments([text])

    console.log(output)
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const sbApiKey = import.meta.env.VITE_SUPABASE_KEY
    const sbUrl = import.meta.env.VITE_SUPABASE_URL
    
    const client = createClient(sbUrl, sbApiKey)
    
    await SupabaseVectorStore.fromDocuments(
        output,
        new GoogleGenerativeAIEmbeddings({apiKey: apiKey, modelName: "embedding-001"}),
        {
           client,
           tableName: 'documents',
        }
    )
    
} catch (err) {
    console.log(err)
}

export default function Upload() {
    return(
        <>
        </>
    )
}