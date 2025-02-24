'use strict';
const searchBox = document.getElementById('search');
const submitBtn = document.getElementById('submit');
const randomBtn = document.getElementById('random');
const resultHeading = document.getElementById('result-heading');
const mealsEl = document.getElementById('meals');
const singleMealEl = document.getElementById('single-meal');

const getJSON = async function (url, errorMsg = 'Something went wrong') {
  return await fetch(url).then((response) => {
    if (!response.ok) {
      resultHeading.innerHTML = '<h2> Opps! There has been an error </h2>';
      throw new Error(`${errorMsg} (${response.status})`);
    }
    return response.json();
  });
};

// Add multiple meals to the DOM
const displayMeals = function (mealDataArr) {
  const innerHTML = [];
  mealDataArr.forEach((mealData) => {
    const string = mealData.meals
      .map(
        (meal) => `
  <div class="meal">
    <img src="${meal.strMealThumb}" alt=${meal.strMeal}>
    <div class="meal-info" data-mealID="${meal.idMeal}"> 
      <h3>${meal.strMeal}</h3>
    </div>
  </div>
  `
      )
      .join('');
    innerHTML.push(string);
  });
  mealsEl.innerHTML = innerHTML.join('');
};

// Search meals & fetch from API
const searchMeal = async function (e) {
  e.preventDefault();
  if (searchBox.value === '') {
    alert('Please enter a search term');
    return;
  }
  const term = searchBox.value;
  const mealsArr = [];
  try {
    // search meal by name
    const mealData = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
    );
    if (mealData.meals !== null) mealsArr.push(mealData);
    // search by main ingredient
    const mealData2 = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${term}`
    );
    if (mealData2.meals !== null) mealsArr.push(mealData2);
    // filter by category
    const mealData3 = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${term}`
    );
    if (mealData3.meals !== null) mealsArr.push(mealData3);
    // filter by region
    const mealData4 = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${term}`
    );
    if (mealData4.meals !== null) mealsArr.push(mealData4);

    resultHeading.innerHTML = `<h2> Search results for '${term}'</h2>`;
    if (mealsArr.length === 0) {
      resultHeading.innerHTML = `<p> No search results for '${term}'. Please try again!</p>`;
      mealsEl.innerHTML = '';
      if (term === 'desert')
        resultHeading.innerHTML = `<p> No search results for '${term}'. Try "dessert"!`;
      return;
    } else {
      // add data to DOM
      displayMeals(mealsArr);
    }
    searchBox.value = '';
  } catch (err) {
    alert(err.message);
  }
};

// Class to work with API format
class recipeItem {
  constructor(ingredient, quantity) {
    this.ingredient = ingredient;
    this.quantity = quantity;
  }
}

const addMealToDOM = function (meal) {
  const ingredients = [];
  const measurements = [];
  const recipeData = [];
  // API sends data in a goofy way
  for (let key in meal) {
    let word = key;
    if (word.includes('strIngredient') && meal[key] !== '') {
      ingredients.push(meal[key]);
    }
    if (word.includes('strMeasure') && meal[key] !== '') {
      measurements.push(meal[key]);
    }
  }
  for (let i = 0; i < ingredients.length; i++) {
    let recipe_item = new recipeItem(ingredients[i], measurements[i]);
    recipeData.push(recipe_item);
  }
  // add meal data to DOM
  singleMealEl.innerHTML = `
  <div class="single-meal">
    <h1>${meal.strMeal}</h1>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}"/>
    <div class="single-meal-info">
      ${meal.strCategory ? `<p>${meal.strCategory}</p>` : ''}
      ${meal.strCategory ? `<p><i>${meal.strArea}</i></p>` : ''}
    </div>
    <div class="main">
    ${meal.strYoutube ? `<h4>This recipe has a YouTube video! </h4>` : ''}
    ${
      meal.strYoutube
        ? `<div class="link"><a href=${meal.strYoutube}>YouTube</a></div>`
        : ''
    }
    ${meal.strInstructions
      .split(';')
      .map((item) => `<p>${item}.</p>`)
      .join('')}
    </div>
    <h2>Ingredients</h2>
    <ul>
    ${recipeData
      .map((item) => `<li>${item.ingredient}: ${item.quantity}</li>`)
      .join('')}
    </ul>
  </div>`;

  singleMealEl.scrollIntoView({ behavior: 'smooth' });
};

// Finds y value of given object
function findPos() {
  let curtop = 0;
  if (obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    return [curtop];
  }
}

// Fetch meal by ID
const getMealByID = async function (mealID) {
  // API ID lookup
  const data = await getJSON(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`
  );
  const meal = data.meals[0];
  addMealToDOM(meal);
};

// Fetch random meal
const getRandomMeal = async function () {
  mealsEl.innerHTML = '';
  resultHeading.innerHTML = '';
  const data = await getJSON(
    'https://www.themealdb.com/api/json/v1/1/random.php'
  );
  const meal = data.meals[0];
  addMealToDOM(meal);
};

// @Init
const init = async function () {
  const areas = ['French', 'American', 'British', 'Italian', 'Chinese'];
  const random = Math.floor(Math.random() * 5);
  let randomCuisine = areas[random];
  // filter meals by area
  const mealData = await getJSON(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${randomCuisine}`
  );
  resultHeading.innerHTML = `<h2> Search results for '${randomCuisine}'</h2>`;
  const meals = [mealData];
  displayMeals(meals);
};
init();

// Submit Form Click
submitBtn.addEventListener('submit', searchMeal);
// Random Meal Click
randomBtn.addEventListener('click', getRandomMeal);
// Get Recipe Click
mealsEl.addEventListener('click', (e) => {
  let path = e.path || (e.composedPath && e.composedPath());
  const mealInfo = path.find((item) => {
    if (item.classList) {
      return item.classList.contains('meal-info');
    } else {
      false;
    }
  });
  if (mealInfo) {
    const mealID = mealInfo.getAttribute('data-mealid');
    getMealByID(mealID);
  }
});
