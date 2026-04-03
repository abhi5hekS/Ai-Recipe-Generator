const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/users.route');
const pantryRoutes = require('./routes/pantry.route');
const recipeRoutes = require('./routes/recipies.route');
const mealPlanRoutes = require('./routes/mealPlans.route');
const shoppingListRoutes = require('./routes/shoppingList.route');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

connectDB();

app.get('/', (req,res)=>{
    res.json({
        messsage: 'Ai recipe generator Api'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/recipies', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

app.listen(PORT,()=>console.log('Server is listening at port ',PORT));