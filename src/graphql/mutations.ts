/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../lib/graphql-api";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createGameServerProcess = /* GraphQL */ `mutation CreateGameServerProcess(
  $input: CreateGameServerProcessInput!
  $condition: ModelGameServerProcessConditionInput
) {
  createGameServerProcess(input: $input, condition: $condition) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateGameServerProcessMutationVariables,
  APITypes.CreateGameServerProcessMutation
>;
export const updateGameServerProcess = /* GraphQL */ `mutation UpdateGameServerProcess(
  $input: UpdateGameServerProcessInput!
  $condition: ModelGameServerProcessConditionInput
) {
  updateGameServerProcess(input: $input, condition: $condition) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateGameServerProcessMutationVariables,
  APITypes.UpdateGameServerProcessMutation
>;
export const deleteGameServerProcess = /* GraphQL */ `mutation DeleteGameServerProcess(
  $input: DeleteGameServerProcessInput!
  $condition: ModelGameServerProcessConditionInput
) {
  deleteGameServerProcess(input: $input, condition: $condition) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteGameServerProcessMutationVariables,
  APITypes.DeleteGameServerProcessMutation
>;
