const fs = require('fs');
const { Client } = require('pg');
const { createTables } = require('./create_tables');

// read synthetic data from food.json
const foodData = JSON.parse(fs.readFileSync('./food.json', 'utf8'));

// read postgresql creds from file
const sql_credentials = JSON.parse(fs.readFileSync('./sql_credentials.json', 'utf8'))

const pgConnection = new Client({
  user: sql_credentials.user,
  host: sql_credentials.host,
  database: sql_credentials.database,
  password: sql_credentials.password,
  port: sql_credentials.port,
})

// insert goals
async function insertGoals() {
  const query = `
    INSERT INTO GOAL (userId, goalName, goalDescription, calories, protein, carbs, fat)
    VALUES ($1, $2, $3, $4, $5, $6, $7);
  `;
  for (const goal of foodData.goals) {
    await pgConnection.query(query, [
      goal.userId,
      goal.goalName,
      goal.goalDescription,
      goal.calories,
      goal.protein,
      goal.carbs,
      goal.fat
    ]);
  }
  console.log(`Inserted ${foodData.goals.length} goals`);
}

// insert recipes
async function insertRecipes() {
  const query = `
    INSERT INTO RECIPE (recipeId, recipeName, totalCalories, totalProtein, totalCarbs, totalFat, servingSize)
    VALUES ($1, $2, $3, $4, $5, $6, $7);
  `;
  for (const recipe of foodData.recipes) {
    await pgConnection.query(query, [
      recipe.recipeId,
      recipe.recipeName,
      recipe.totalCalories,
      recipe.totalProtein,
      recipe.totalCarbs,
      recipe.totalFat,
      recipe.servingSize
    ]);
  }
  console.log(`Inserted ${foodData.recipes.length} recipes`);
}

// insert ingredients
async function insertIngredients() {
  const query = `
    INSERT INTO INGREDIENT (ingredientId, ingredientName, calories, protein, carbs, fat)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;
  for (const ingredient of foodData.ingredients) {
    await pgConnection.query(query, [
      ingredient.ingredientId,
      ingredient.ingredientName,
      ingredient.calories,
      ingredient.protein,
      ingredient.carbs,
      ingredient.fat
    ]);
  }
  console.log(`Inserted ${foodData.ingredients.length} ingredients`);
}

// insert recipe ingredients
async function insertRecipeIngredients() {
  const query = `
    INSERT INTO RECIPE_INGREDIENT (recipeId, ingredientId, amount)
    VALUES ($1, $2, $3);
  `;
  for (const ri of foodData.recipeIngredients) {
    await pgConnection.query(query, [
      ri.recipeId,
      ri.ingredientId,
      ri.amount
    ]);
  }
  console.log(`Inserted ${foodData.recipeIngredients.length} recipe ingredients`);
}

// insert favorites
async function insertFavorites() {
  const query = `
    INSERT INTO FAVORITES (userId, recipeId, dateSaved)
    VALUES ($1, $2, $3);
  `;
  for (const fav of foodData.favorites) {
    await pgConnection.query(query, [
      fav.userId,
      fav.recipeId,
      fav.dateSaved
    ]);
  }
  console.log(`Inserted ${foodData.favorites.length} favorites`);
}

// insert meal logs
async function insertMealLogs() {
  const query = `
    INSERT INTO MEALLOG (recipeId, userId, loggedTime, loggedDate)
    VALUES ($1, $2, $3, $4);
  `;
  for (const log of foodData.mealLogs) {
    await pgConnection.query(query, [
      log.recipeId,
      log.userId,
      log.loggedTime,
      log.loggedDate
    ]);
  }
  console.log(`Inserted ${foodData.mealLogs.length} meal logs`);
}
async function main() {
  try {
    await pgConnection.connect();
    console.log("Connected to PostgreSQL");

    await createTables(pgConnection);
    await insertGoals();
    await insertRecipes();
    await insertIngredients();
    await insertRecipeIngredients();
    await insertFavorites();
    await insertMealLogs();

    await pgConnection.end();
    console.log("Disconnected from PostgreSQL");
  } catch (e) {
    console.error(e);
  }
}

main();
