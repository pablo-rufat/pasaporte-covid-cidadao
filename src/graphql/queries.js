/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCidadao = /* GraphQL */ `
  query GetCidadao($id: ID!) {
    getCidadao(id: $id) {
      id
      address
      name
      cpf
      dataNascimento
      createdAt
      updatedAt
    }
  }
`;
export const listCidadaos = /* GraphQL */ `
  query ListCidadaos(
    $filter: ModelCidadaoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCidadaos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        address
        name
        cpf
        dataNascimento
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
