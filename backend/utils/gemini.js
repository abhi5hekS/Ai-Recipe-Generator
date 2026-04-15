const dotenv = require('dotenv');
const Groq = require('groq-sdk');
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (!process.env.GROQ_API_KEY) {
    console.error('WARNING: Groq API key is not set. AI features will not work.');
}


const generateRecipeAI = async ({
    ingredients,
    dietaryRestrictions = [],
    cuisineType = "any",
    servings = 4,
    cookingTime = "medium"
}) => {
    const dietaryInfo = dietaryRestrictions.length > 0
        ? `Dietary restrictions: ${dietaryRestrictions.join(", ")}`
        : "No dietary restrictions";

    const timeGuide = {
        quick: "under 30 minutes",
        medium: "30-60 minutes",
        long: "over 60 minutes"
    };

    const prompt = `Generate a detailed recipe with the following requirements:
        Ingredients available: ${ingredients.join(", ")}
        ${dietaryInfo}
        Cuisine type: ${cuisineType}
        Servings: ${servings}
        Cooking time: ${timeGuide[cookingTime] || "any"}

        Please provide a complete recipe in the following JSON format (return only valid JSON, no markdown):
        {
          "name": "Recipe name",
          "description": "Brief description of the dish",
          "cuisineType": "${cuisineType}",
          "difficulty": "easy|medium|hard",
          "prepTime": number,
          "cookTime": number,
          "servings": ${servings},
          "ingredients": [
            { "name": "ingredient name", "quantity": number, "unit": "unit" }
          ],
          "instructions": [
            "Step 1 description",
            "Step 2 description"
          ],
          "dietaryTags": ["vegetarian", "gluten-free"],
          "nutrition": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fats": number,
            "fiber": number
          },
          "cookingTips": ["Tip 1", "Tip 2"]
        }

        Make sure the recipe is creative, realistic, and uses the given ingredients effectively.
    `;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        let generatedText = response.choices[0].message.content.trim();

        if (generatedText.startsWith("```json")) {
            generatedText = generatedText.replace(/```json\n?/g, "").replace(/```/g, "");
        } else if (generatedText.startsWith("```")) {
            generatedText = generatedText.replace(/```\n?/g, "").replace(/```/g, "");
        }

        const recipe = JSON.parse(generatedText);
        return recipe;

    } catch (error) {
        console.error("Groq API error:", error.message);
        throw new Error("Failed to generate recipe. Please try again.");
    }
};


const generatePantrySuggestions = async (pantryItems, expiringItems = []) => {
    const ingredients = pantryItems.map(i => i.name).join(", ");

    const expiringText = expiringItems.length > 0
        ? `Priority ingredients (expiring soon): ${expiringItems.join(", ")}`
        : "";

    const prompt = `
Based on these ingredients:

${ingredients}
${expiringText}

Suggest 3 creative recipe ideas.

Return ONLY a JSON array:
["Recipe idea 1", "Recipe idea 2", "Recipe idea 3"]

Each suggestion should be short (1-2 sentences).
`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        let generatedText = response.choices[0].message.content.trim();

        if (generatedText.startsWith('```json')) {
            generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (generatedText.startsWith('```')) {
            generatedText = generatedText.replace(/```\n?/g, '');
        }

        const suggestions = JSON.parse(generatedText);
        return suggestions;

    } catch (error) {
        console.error("Pantry suggestion error:", error.message);
        throw new Error("Failed to generate suggestions");
    }
};


const generateCookingTips = async (recipe) => {
    const prompt = `
        For this recipe: "${recipe.name}"

        Ingredients: ${recipe.ingredients?.map(i => i.name).join(", ") || "N/A"}

        Provide 3-5 helpful cooking tips to make this recipe better.

        Return ONLY a JSON array of strings (no markdown):
        ["Tip 1", "Tip 2", "Tip 3"]
    `;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });

        let generatedText = response.choices[0].message.content.trim();

        if (generatedText.startsWith("```json")) {
            generatedText = generatedText.replace(/```json\n?/g, "").replace(/```/g, "");
        } else if (generatedText.startsWith("```")) {
            generatedText = generatedText.replace(/```\n?/g, "").replace(/```/g, "");
        }

        const tips = JSON.parse(generatedText);
        return tips;

    } catch (error) {
        console.error("Groq API error:", error.message);
        return [
            "Taste and adjust seasoning as you cook",
            "Use fresh ingredients for better flavor",
            "Don't overcook to retain nutrients"
        ];
    }
};

module.exports = {
    generateRecipeAI,
    generatePantrySuggestions,
    generateCookingTips
};