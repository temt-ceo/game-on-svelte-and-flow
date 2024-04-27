export type IngredientType = {
	name: string;
	amount: string;
};

export type DrinkType = {
	name: string;
	instructions: string;
	ingredients: IngredientType[];
	thumbUrl: string;
};

export type CardType = {
	bp: string;
	card_id: string;
	category: string;
	cost: string;
	name: string;
	skill: object;
	type: string;
};
