<script lang="ts">
  export let drinkProp;
  let drinkState = drinkProp;

  const handleOnClick = async () => console.log('click!');
</script>

<div class="wrapper">
  <button on:click={handleOnClick}>Get new drink</button>
  <h2>Drink Name</h2>
  <img class="drink-thumb" src="https://kit.svelte.dev" alt="drink thuumb" />
  <p>Instructions</p>

  <p class="ingredient">Indigredients</p>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, Helvetica, sans-serif;
  }

  .drink-thumb {
    width: 300px;
    border-radius: 1rem;
  }

  p {
    max-width: 500px;
    text-align: center;
  }

  .ingredient {
    margin: 2px 0;
  }

</style>