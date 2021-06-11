/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCidadao = /* GraphQL */ `
  mutation CreateCidadao(
    $input: CreateCidadaoInput!
    $condition: ModelCidadaoConditionInput
  ) {
    createCidadao(input: $input, condition: $condition) {
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
export const updateCidadao = /* GraphQL */ `
  mutation UpdateCidadao(
    $input: UpdateCidadaoInput!
    $condition: ModelCidadaoConditionInput
  ) {
    updateCidadao(input: $input, condition: $condition) {
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
export const deleteCidadao = /* GraphQL */ `
  mutation DeleteCidadao(
    $input: DeleteCidadaoInput!
    $condition: ModelCidadaoConditionInput
  ) {
    deleteCidadao(input: $input, condition: $condition) {
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
