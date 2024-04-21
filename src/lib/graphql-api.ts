/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateGameServerProcessInput = {
  id?: string | null,
  type: string,
  message: string,
  playerId: string,
};

export type ModelGameServerProcessConditionInput = {
  type?: ModelStringInput | null,
  message?: ModelStringInput | null,
  playerId?: ModelStringInput | null,
  and?: Array< ModelGameServerProcessConditionInput | null > | null,
  or?: Array< ModelGameServerProcessConditionInput | null > | null,
  not?: ModelGameServerProcessConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type GameServerProcess = {
  __typename: "GameServerProcess",
  id: string,
  type: string,
  message: string,
  playerId: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateGameServerProcessInput = {
  id: string,
  type?: string | null,
  message?: string | null,
  playerId?: string | null,
};

export type DeleteGameServerProcessInput = {
  id: string,
};

export type ModelGameServerProcessFilterInput = {
  id?: ModelIDInput | null,
  type?: ModelStringInput | null,
  message?: ModelStringInput | null,
  playerId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelGameServerProcessFilterInput | null > | null,
  or?: Array< ModelGameServerProcessFilterInput | null > | null,
  not?: ModelGameServerProcessFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelGameServerProcessConnection = {
  __typename: "ModelGameServerProcessConnection",
  items:  Array<GameServerProcess | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionGameServerProcessFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  type?: ModelSubscriptionStringInput | null,
  message?: ModelSubscriptionStringInput | null,
  playerId?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionGameServerProcessFilterInput | null > | null,
  or?: Array< ModelSubscriptionGameServerProcessFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type CreateGameServerProcessMutationVariables = {
  input: CreateGameServerProcessInput,
  condition?: ModelGameServerProcessConditionInput | null,
};

export type CreateGameServerProcessMutation = {
  createGameServerProcess?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateGameServerProcessMutationVariables = {
  input: UpdateGameServerProcessInput,
  condition?: ModelGameServerProcessConditionInput | null,
};

export type UpdateGameServerProcessMutation = {
  updateGameServerProcess?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteGameServerProcessMutationVariables = {
  input: DeleteGameServerProcessInput,
  condition?: ModelGameServerProcessConditionInput | null,
};

export type DeleteGameServerProcessMutation = {
  deleteGameServerProcess?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetGameServerProcessQueryVariables = {
  id: string,
};

export type GetGameServerProcessQuery = {
  getGameServerProcess?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListGameServerProcessesQueryVariables = {
  filter?: ModelGameServerProcessFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListGameServerProcessesQuery = {
  listGameServerProcesses?:  {
    __typename: "ModelGameServerProcessConnection",
    items:  Array< {
      __typename: "GameServerProcess",
      id: string,
      type: string,
      message: string,
      playerId: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateByPlayeridSubscriptionVariables = {
  playerId: string,
};

export type OnCreateByPlayeridSubscription = {
  onCreateByPlayerid?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateGameServerProcessSubscriptionVariables = {
  filter?: ModelSubscriptionGameServerProcessFilterInput | null,
};

export type OnCreateGameServerProcessSubscription = {
  onCreateGameServerProcess?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateGameServerProcessSubscriptionVariables = {
  filter?: ModelSubscriptionGameServerProcessFilterInput | null,
};

export type OnUpdateGameServerProcessSubscription = {
  onUpdateGameServerProcess?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteGameServerProcessSubscriptionVariables = {
  filter?: ModelSubscriptionGameServerProcessFilterInput | null,
};

export type OnDeleteGameServerProcessSubscription = {
  onDeleteGameServerProcess?:  {
    __typename: "GameServerProcess",
    id: string,
    type: string,
    message: string,
    playerId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};
