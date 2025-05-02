// Check Authorization
async function isLoggedIn() {
    const response = await fetch('api/fullname');
    if (response.status === 403) {
    window.location.href = '/error.html';
    }
}

// load all meals and favorite meals
async function loadRecipes() {
    const [mealsRes, favsRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/favorite')
    ]);
    if (!mealsRes.ok || !favsRes.ok) {
        console.error('Failed to fetch meals or favorites');
        return;
    }
    const meals = await mealsRes.json();
    const favIds = await favsRes.json();

    // containers
    const favSection = document.getElementById('favorites_container');
    const allSection = document.getElementById('meals_container');
    // clear everything except the header row
    favSection.querySelectorAll('div.meal_row:not(:first-child), hr')
        .forEach(el => el.remove());
    allSection.querySelectorAll('div.meal_row:not(:first-child), hr')
        .forEach(el => el.remove());

    for (const m of meals) {
        const container = favIds.includes(m.recipeid)
            ? favSection
            : allSection;

        const row = document.createElement('div');
        row.className = 'meal_row';
        [
            ['recipe_id', '🏷️', m.recipeid],
            ['recipe_name', '🍽️', m.recipename],
            ['calories', '🔥', m.totalcalories],
            ['protein', '🥩', m.totalprotein],
            ['carbs', '🍞', m.totalcarbs],
            ['fats', '🧈', m.totalfat]
        ].forEach(([cls, icon, val]) => {
            const p = document.createElement('p');
            p.className = cls;
            p.textContent = `${icon} ${val}`;
            row.appendChild(p);
        });

        container.appendChild(row);
        const hr = document.createElement('hr');
        hr.className = 'header_border';
        container.appendChild(hr);
    }
}

window.onload = () => {
    isLoggedIn();

    const logBtn = document.getElementById('log_meal_button');
    const favBtn = document.getElementById('favorite_meal_button');
    const idIn = document.getElementById('id_entry');
    const err = document.getElementById('error_label');

    // Log button
    logBtn.onclick = async () => {
        const recipeid = idIn.value.trim();
        const resp = await fetch('/api/logmeal', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({recipeid})
        });
        const body = await resp.json();
        if (body.success) {
            location.href = '/meals';
        } else {
            err.textContent = body.error || 'Failed to log';
        }
    };

    // Favorite/unfavorite toggle
    favBtn.onclick = async () => {
        const recipeid = idIn.value.trim();
        if (!recipeid) {
            err.textContent = 'Enter an ID to (un)favorite';
            return;
        }
        err.textContent = '';

        // fetch current favorites
        const favsRes = await fetch('/api/favorite');
        const favIds = favsRes.ok ? await favsRes.json() : [];

        // decide method
        const method = favIds.includes(Number(recipeid)) ? 'DELETE' : 'POST';
        const resp = await fetch('/api/favorite', {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({recipeid})
        });
        const body = await resp.json();
        if (!body.success) {
            err.textContent = body.error || 'Failed to update favorite';
            return;
        }
        // redraw sections
        loadRecipes();
    };

    // initial render
    loadRecipes();
};