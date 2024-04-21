/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../lib/graphql-api";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateByPlayerid = /* GraphQL */ `subscription OnCreateByPlayerid($playerId: String!) {
  onCreateByPlayerid(playerId: $playerId) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateByPlayeridSubscriptionVariables,
  APITypes.OnCreateByPlayeridSubscription
>;
export const onCreateGameServerProcess = /* GraphQL */ `subscription OnCreateGameServerProcess(
  $filter: ModelSubscriptionGameServerProcessFilterInput
) {
  onCreateGameServerProcess(filter: $filter) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateGameServerProcessSubscriptionVariables,
  APITypes.OnCreateGameServerProcessSubscription
>;
export const onUpdateGameServerProcess = /* GraphQL */ `subscription OnUpdateGameServerProcess(
  $filter: ModelSubscriptionGameServerProcessFilterInput
) {
  onUpdateGameServerProcess(filter: $filter) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateGameServerProcessSubscriptionVariables,
  APITypes.OnUpdateGameServerProcessSubscription
>;
export const onDeleteGameServerProcess = /* GraphQL */ `subscription OnDeleteGameServerProcess(
  $filter: ModelSubscriptionGameServerProcessFilterInput
) {
  onDeleteGameServerProcess(filter: $filter) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteGameServerProcessSubscriptionVariables,
  APITypes.OnDeleteGameServerProcessSubscription
>;
