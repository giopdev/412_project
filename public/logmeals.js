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
 * Script for add meal button to hit /meal_log endpoint and log a new meal for a given user
 */
window.onload = () => {
  document.getElementById('log_meal_button').onclick = async function() {
    const recipe_id_entered = id_entry.value;

    // Hit the /login endpoint with the user's information
    const response = await fetch('/api/logmeal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeid: recipe_id_entered }),
    });
    const responseBody = await response.json();

    // If endpoint responds with success, redirect user to the account page
    if (responseBody.success) { location.href = '/meals'; }
    else {
      // Else if the response errors, set the appropriate error_label text
      document.getElementById('error_label').textContent = responseBody.error;
    }
  }

  loadRecipes();
}
