/*
* For loading user meals on page load
*/
async function loadMeals() {
  console.log('called loadmeals');
  const response = await fetch('/api/meallog');
  const meals = await response.json();

  const mealsContainer = document.getElementById('meals_container');

  /*
   * For each meal in the response, create a meal row and append to the container
   */
  for (const meal of meals) {
    const mealRow = document.createElement('div');
    mealRow.className = 'meal_row';
    /*
     * Create paragraphs for each element of a recipe and add it to the row
     */
    const nameCell = document.createElement('p');
    nameCell.className = 'recipe_name';
    nameCell.textContent = `🍽️ ${meal.recipename}`;
    mealRow.appendChild(nameCell);

    const servingsCell = document.createElement('p');
    servingsCell.className = 'servings';
    servingsCell.textContent = `🥄 ${meal.servingsize}`;
    mealRow.appendChild(servingsCell);

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
  loadMeals();

}
