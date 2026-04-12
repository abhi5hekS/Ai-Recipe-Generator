const dotenv = require('dotenv');
const {GoogleGenAI} = require('@google/genai');
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if(!process.env.GEMINI_API_KEY){
    console.error('WARNING Gemini api key is not set. Ai features will not work.');
}


const generateRecipeAI = async ({
        ingredients,
        dietaryRestrictions = [],
        cuisineType = "any",
        servings = 4,
        cookingTime = "medium"
    }) => {
        const dietaryInfo = dietaryRestrictions.length > 0 ? `Dietary restrictions: ${dietaryRestrictions.join(", ")}` : "No dietary restrictions";

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

            Please provide a complete recipe in the following json format (return only valid JSON, no markdown)
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
                "protein": number (grams),
                "carbs": number (grams),
                "fats": number (grams),
                "fiber": number (grams)
              },
              "cookingTips": ["Tip 1", "Tip 2"]
            }

            Make sure the recipe is creative, realistic, and uses the given ingredients effectively.
        `;

    try {
        const model = genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
    });

    const generatedText = response.text.trim();

    let jsonText = generatedText;

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```/g, "");
    }

    const recipe = JSON.parse(jsonText);

    return recipe;

  } catch (error) {
    console.error("Gemini API error:", error.message);

    throw new Error("Failed to generate recipe. Please try again.");
  }
};


const generatePantrySuggestions = async (
  pantryItems,
  expiringItems = []
) => {
  const ingredients = pantryItems.map(i => i.name).join(", ");

  const expiringText =
    expiringItems.length > 0
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
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });

    let generatedText = response.text.trim();

    if(generatedText.startsWith('```json')){
      generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    }
    else if(generatedText.startsWith('```')){
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

        Ingredients: ${
            recipe.ingredients?.map(i => i.name).join(", ") || "N/A"
        }

        Provide 3-5 helpful cooking tips to make this recipe better.

        Return ONLY a JSON array of strings (no markdown):

        ["Tip 1", "Tip 2", "Tip 3"]
    `;

    try {
        const model = genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
    });

    let generatedText = response.text.trim();

    if (generatedText.startsWith("```json")) {
      generatedText = generatedText
        .replace(/```json\n?/g, "")
        .replace(/```/g, "");
    } else if (generatedText.startsWith("```")) {
      generatedText = generatedText
        .replace(/```\n?/g, "")
        .replace(/```/g, "");
    }

    const tips = JSON.parse(generatedText);

    return tips;

  } catch (error) {
    console.error("Gemini API error:", error.message);

    return [
      "Taste and adjust seasoning as you cook",
      "Use fresh ingredients for better flavor",
      "Don’t overcook to retain nutrients"
    ];
  }
};

module.exports = {
    generateRecipeAI,
    generatePantrySuggestions,
    generateCookingTips
}