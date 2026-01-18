const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main() {
    try {
        const models = await groq.models.list();
        console.log('Available models:');
        models.data.forEach(m => {
            console.log(`- ${m.id} (owned by ${m.owned_by})`);
        });
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

main();
