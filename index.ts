import { Test, myOtherFunction, variable } from "./other";
export interface OtherType {
  b: string,
  c: {
    d: 
    { e: string}
  }

}
const myFunction = (num: number, testing: Test) => {
  myOtherFunction(testing)
  
  return testing
}



async function test() {

    myFunction(1, {a:'input', someProp: { b: 'test', c: {
      d: {
         e: 'hello'
      }
    }} })
}

test()
