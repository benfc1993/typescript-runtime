import { OtherType } from "."

export type Test = {
  a: string
  someProp: OtherType
}

export const variable = 'c'

export function myOtherFunction(test: Test) {
  console.log(`I am ${test.a} and I am ${test.someProp.b} years old`)
}
