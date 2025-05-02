async function loadMeals() {
    // fetch the logged‐meals
    const resp = await fetch('/api/meallog');
    if (!resp.ok) {
        console.error('Failed to fetch meallog');
        return;
    }
    const meals = await resp.json();

    // lear out the container
    const container = document.getElementById('meals_container');
    container.innerHTML = '';

    let lastDate = null;

    for (const meal of meals) {
        // normalize to YYYY-MM-DD
        const dateOnly = typeof meal.datesaved === 'string'
            ? meal.datesaved.split('T')[0]
            : new Date(meal.datesaved).toISOString().split('T')[0];

        //when the date changes, insert a header + column labels
        if (dateOnly !== lastDate) {
            lastDate = dateOnly;

            // date header
            const dateH2 = document.createElement('h2');
            dateH2.textContent = dateOnly;
            container.appendChild(dateH2);

            // column‐label row
            const headerRow = document.createElement('div');
            headerRow.className = 'meal_row';
            [
                ['recipe_name', '🍽️ Recipe Name'],
                ['calories', '🔥 Calories'],
                ['protein', '🥩 Protein'],
                ['carbs', '🍞 Carbs'],
                ['fats', '🧈 Fats']
            ].forEach(([cls, text]) => {
                const p = document.createElement('p');
                p.className = cls;
                p.textContent = text;
                headerRow.appendChild(p);
            });
            container.appendChild(headerRow);

            // separator
            const hr = document.createElement('hr');
            hr.className = 'header_border';
            container.appendChild(hr);
        }

        // render the actual meal row
        const row = document.createElement('div');
        row.className = 'meal_row';
        [
            ['recipe_name', meal.recipename],
            ['calories', meal.totalcalories],
            ['protein', meal.totalprotein],
            ['carbs', meal.totalcarbs],
            ['fats', meal.totalfat]
        ].forEach(([cls, val]) => {
            const p = document.createElement('p');
            p.className = cls;
            p.textContent = val;
            row.appendChild(p);
        });
        container.appendChild(row);

        // and a final separator
        const hr2 = document.createElement('hr');
        hr2.className = 'header_border';
        container.appendChild(hr2);
    }
}

// make sure to call it on load
window.onload = loadMeals;
