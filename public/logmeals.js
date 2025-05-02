/*
* For loading user meals on page load
*/
async function loadRecipes() {
    console.log('called loadmeals');
    const response = await fetch('/api/recipes');
    const meals = await response.json();

    const mealsContainer = document.getElementById('meals_container');

    /*
     * For each meal in the response, create a meal row and append to the container
     */
    for (const meal of meals) {
        console.log(meal)
        const mealRow = document.createElement('div');
        mealRow.className = 'meal_row';
        /*
         * Create paragraphs for each element of a recipe and add it to the row
         */
        const pkCell = document.createElement('p');
        pkCell.className = 'recipe_id';
        pkCell.textContent = `🏷️ ${meal.recipeid}`;
        mealRow.appendChild(pkCell);

        const nameCell = document.createElement('p');
        nameCell.className = 'recipe_name';
        nameCell.textContent = `🍽️ ${meal.recipename}`;
        mealRow.appendChild(nameCell);

        const caloriesCell = document.createElement('p');
        caloriesCell.className = 'calories';
        caloriesCell.textContent = `🔥 ${meal.totalcalories}`;
        mealRow.appendChild(caloriesCell);

        const proteinCell = document.createElement('p');
        proteinCell.className = 'protein';
        proteinCell.textContent = `🥩 ${meal.totalprotein}`;
        mealRow.appendChild(proteinCell);

        const carbsCell = document.createElement('p');
        carbsCell.className = 'carbs';
        carbsCell.textContent = `🍞 ${meal.totalcarbs}`;
        mealRow.appendChild(carbsCell);

        const fatsCell = document.createElement('p');
        fatsCell.className = 'fats';
        fatsCell.textContent = `🧈 ${meal.totalfat}`;
        mealRow.appendChild(fatsCell);

        mealsContainer.appendChild(mealRow);
    }
}

/*
 * Script for add meal button to hit /api/logmeal endpoint and log a new meal for a given user
 * and ★ Favorite button to hit /api/favorite
 */
window.onload = () => {
    // Log-it button
    document.getElementById('log_meal_button').onclick = async function () {
        const recipe_id_entered = id_entry.value;

        const response = await fetch('/api/logmeal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeid: recipe_id_entered }),
        });
        const responseBody = await response.json();

        if (responseBody.success) {
            location.href = '/meals';
        } else {
            document.getElementById('error_label').textContent = responseBody.error;
        }
    };

    // Favorite button (new)
    document.getElementById('favorite_meal_button').onclick = async function () {
        const recipe_id_entered = id_entry.value;

        const response = await fetch('/api/favorite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeid: recipe_id_entered }),
        });
        const responseBody = await response.json();

        if (responseBody.success) {
            loadRecipes(); // refresh the lists here
        } else {
            document.getElementById('error_label').textContent = responseBody.error;
        }
    };

    // initial load
    loadRecipes();
};