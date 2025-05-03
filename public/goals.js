



async function loadGoals() {
    const goals = await fetch('/api/goals').then(response => response.json());

    if (Object.keys(goals).length === 0) {
        return;
    }

    document.getElementById('goal-name').innerHTML = goals.goalname;
    document.getElementById('goal-description').innerHTML = goals.goaldescription;
    document.getElementById('calories-goal').innerHTML = goals.calories;
    document.getElementById('protein-goal').innerHTML = goals.protein;
    document.getElementById('carbs-goal').innerHTML = goals.carbs;
    document.getElementById('fat-goal').innerHTML = goals.fat;    
}

async function updateGoalsButton() {
    document.getElementById('update-goals-button').onclick = async function() {
        try {
            const calories = document.getElementById('calories-goal').innerText;
            const protein = document.getElementById('protein-goal').innerText;
            const carbs = document.getElementById('carbs-goal').innerText;
            const fat = document.getElementById('fat-goal').innerText;

            if (!Number.isInteger(Number(calories)) || !Number.isInteger(Number(protein)) || 
                !Number.isInteger(Number(carbs)) || !Number.isInteger(Number(fat)) || 
                Number(calories) < 0 || Number(protein) < 0 || 
                Number(carbs) < 0 || Number(fat) < 0) {
                alert('Calories, protein, carbs, and fat must be non-negative integers.');
                return;
            }

            const goals = {
                goalname: document.getElementById('goal-name').innerText,
                goaldescription: document.getElementById('goal-description').innerText,
                calories: parseInt(calories, 10),
                protein: parseInt(protein, 10),
                carbs: parseInt(carbs, 10),
                fat: parseInt(fat, 10)
            };

            const response = await fetch('/api/update-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(goals)
            });
            if (response.ok) {
                alert('Goals updated successfully!');
            } else {
                alert('Failed to update goals. Please try again.');
            }
        } catch (err) {
            console.error('Error updating goals:', err);
            alert('An error occurred while updating goals. Please try again.');
        }
    };
}

window.onload = () => {
    updateGoalsButton();
    loadGoals();
}
