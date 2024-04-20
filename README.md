# How to develop a game using GraphQL and Svelte

1. Install @onflow/fcl and @onflow/types.

```
npm install --save @onflow/fcl @onflow/types
```

2. Write below codes inside Svelte code.

```
<script lang="ts">
	import * as fcl from '@onflow/fcl';
	import * as types from '@onflow/types';

	fcl.config({
		'accessNode.api': 'https://rest-testnet.onflow.org',
		'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
		'app.detail.title': 'Sample App',
		'app.detail.icon': 'https://fcl-discovery.onflow.org/images/blocto.png',
		'0xCOF': '0x9e447fb949c3f1b6' // The account address where the smart contract lives
	});

	const handleOnClick = async () => {
		fcl.authenticate();
	};
</script>
```

That's it! Super simple and you can see below when you pushed the button

<img width="1117" alt="flow_wallet" src="https://github.com/temt-ceo/game-on-svelte-and-flow/assets/58613670/aaad67cc-e29c-48be-ad7b-7c622b067275">


## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
