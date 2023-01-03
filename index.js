// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import axios from 'axios';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='meal-finder'>
    <h2 class='title'>Meal Finder</h2>
    <div class='header'>
      <form data-form=''>
        <label>
          <input type='text' name='search' placeholder='Search for meals or keywords'/>
        </label>
        <button type='submit'>Submit</button>
      </form>

      <button class='button' data-random=''>${feather.icons['refresh-cw'].toSvg()}</button>
    </div>
    <div class='main hide'>
      <div class='heading' data-meal-heading=''></div>
      <ul class='list' data-meal-list=''></ul>
      <div class='single' data-meal-single=''></div>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      form: document.querySelector('[data-form]'),
      randomBtn: document.querySelector('[data-random]'),
      mealHeading: document.querySelector('[data-meal-heading]'),
      mealList: document.querySelector('[data-meal-list]'),
      mealSingle: document.querySelector('[data-meal-single]'),
    };

    this.DOM.form.addEventListener('submit', this.onSubmit);
    this.DOM.randomBtn.addEventListener('click', this.getRandom);
    this.DOM.mealList.addEventListener('click', this.onMealsClick);
  }

  /**
   * @function onSubmit - Form submit handler
   * @param event
   * @returns {Promise<void>}
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const { search } = Object.fromEntries(new FormData(form).entries());

    this.DOM.mealSingle.innerHTML = '';

    if (!search || search.trim().length === 0) {
      showNotification('warning', 'Please enter a search term');
      return;
    }

    try {
      const { data: { meals } } = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`);
      this.DOM.mealHeading.innerHTML = `<h4 class='title'>Search results for <span>'${search}'</span>:</h4>`;
      document.querySelector('.main').classList.remove('hide');
      form.querySelector('button').textContent = 'Loading...';

      if (meals === null) {
        this.DOM.mealHeading.innerHTML = this.DOM.mealList.innerHTML = '';
        showNotification('danger', 'There are no search results. Try again!');
      } else {
        this.DOM.mealList.innerHTML = meals.map(({ strMealThumb, idMeal, strMeal }) => `
          <li data-id='${idMeal}'>
            <img src='${strMealThumb}' alt='${strMeal}' />
            <h6>${strMeal}</h6>
          </li>
        `).join('');
      }

      form.querySelector('button').textContent = 'Submit';
      form.reset();
    } catch (e) {
      showNotification('danger', 'Something wrong, open console');
      document.querySelector('.main').classList.add('hide');
      form.querySelector('button').textContent = 'Submit';
      console.log(e);
    }

  };

  /**
   * @function getRandom - Get random meal
   */
  getRandom = async () => {
    try {
      document.querySelector('.main').classList.remove('hide');
      this.DOM.mealHeading.innerHTML = this.DOM.mealList.innerHTML = '';
      const { data: { meals } } = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
      this.renderHTML(meals[0]);
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      document.querySelector('.main').classList.add('hide');
      console.log(e);
    }
  };

  /**
   * @function renderHTML - Render data HTML
   * @param data
   */
  renderHTML = (data) => {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      if (data[`strIngredient${i}`]) {
        ingredients.push(`${data[`strIngredient${i}`]} - ${data[`strMeasure${i}`]}`);
      } else {
        break;
      }
    }

    const { strMeal, strMealThumb, strCategory, strArea, strInstructions } = data;

    this.DOM.mealSingle.innerHTML = `
      <h2>${strMeal}</h2>
      <img src='${strMealThumb}' alt='${strMeal}' />
      <div class='info'>
        ${strCategory ? `<p><span>Category:</span> ${strCategory}</p>` : ''}
        ${strArea ? `<p><span>Area:</span> ${strArea}</p>` : ''}
      </div>
      <div class='main'>
        <p>${strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>${ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
      </div>`;
  };

  /**
   * @function onMealsClick - Meals list click event handler
   * @param target
   * @returns {Promise<void>}
   */
  onMealsClick = async ({ target }) => {
    if (target.matches('[data-id]')) {
      console.log(1);
      try {
        const { data: { meals } } = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${target.dataset.id}`);
        this.renderHTML(meals[0]);
      } catch (e) {
        showNotification('danger', 'Something went wrong, open dev console.');
        document.querySelector('.main').classList.add('hide');
        console.log(e);
      }
    }
  };
}

// ⚡️Class instance
new App();
