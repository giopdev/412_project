CREATE TABLE IF NOT EXISTS "USER" (
    userId SERIAL PRIMARY KEY,
    fullName VARCHAR(50) NOT NULL,
    username VARCHAR(25) UNIQUE NOT NULL, -- unique to be used for salting passwords
    email VARCHAR(50) NOT NULL,
    userPassword VARCHAR(100) NOT NULL, -- big enough for hashes, 25 in current version
    profilePhoto BYTEA -- used to store the raw bytes of a .png file
);

CREATE TABLE IF NOT EXISTS GOAL (
    goalId SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES "USER"(userId),
    goalName VARCHAR(50) NOT NULL,
    goalDescription VARCHAR(150) NOT NULL,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER
);

CREATE TABLE IF NOT EXISTS RECIPE (
    recipeId SERIAL PRIMARY KEY,
    recipeName VARCHAR(50) NOT NULL,
    totalCalories INTEGER NOT NULL CHECK (totalCalories >= 0),
    totalProtein INTEGER NOT NULL CHECK (totalProtein >= 0),
    totalCarbs INTEGER NOT NULL CHECK (totalCarbs >= 0),
    totalFat INTEGER NOT NULL CHECK (totalFat >= 0),
    servingSize INTEGER NOT NULL CHECK (servingSize > 0) -- a serving size must be greater than 0
);

CREATE TABLE IF NOT EXISTS FAVORITES (
    userId INTEGER,
    recipeId INTEGER,
    PRIMARY KEY(userId, recipeId), -- any given user may favorite a recipe once
    dateSaved DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS INGREDIENT (
    ingredientId SERIAL PRIMARY KEY,
    ingredientName VARCHAR(50) NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein INTEGER NOT NULL CHECK (protein >= 0),
    carbs INTEGER NOT NULL CHECK (carbs >= 0),
    fat INTEGER NOT NULL CHECK (fat >= 0)
);

CREATE TABLE IF NOT EXISTS RECIPE_INGREDIENT (
    recipeId INTEGER,
    ingredientId INTEGER,
    PRIMARY KEY (recipeId, ingredientId), -- intended to connect recipes with ingredients
    amount REAL NOT NULL CHECK (amount >= 0) -- Real to allow more fine control over ingredient amouns, and thus calories
);

CREATE TABLE IF NOT EXISTS MEALLOG (
    recipeId INTEGER REFERENCES RECIPE(recipeId),
    userId INTEGER REFERENCES "USER"(userId),
    loggedTime TIME,
    loggedDate DATE,
    PRIMARY KEY (loggedTime, loggedDate) -- Since a user will only be able to log a meal at a time, this works to uniquely id tuples when paired with userId
);
