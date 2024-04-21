/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../lib/graphql-api";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getGameServerProcess = /* GraphQL */ `query GetGameServerProcess($id: ID!) {
  getGameServerProcess(id: $id) {
    id
    type
    message
    playerId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetGameServerProcessQueryVariables,
  APITypes.GetGameServerProcessQuery
>;
export const listGameServerProcesses = /* GraphQL */ `query ListGameServerProcesses(
  $filter: ModelGameServerProcessFilterInput
  $limit: Int
  $nextToken: String
) {
  listGameServerProcesses(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      type
      message
      playerId
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListGameServerProcessesQueryVariables,
  APITypes.ListGameServerProcessesQuery
>;
