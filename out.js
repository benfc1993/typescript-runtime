"use strict";
(() => {
  // parser/typeIsValid.ts
  function typeIsValid(input, validation) {
    if (!Object.keys(input).every((key) => validation.hasOwnProperty(key)))
      return false;
    for (const [key, type] of Object.entries(validation)) {
      const inputValue = input[key];
      if (typeof type === "object" && typeof inputValue === "object") {
        if (!typeIsValid(inputValue, validation[key]))
          return false;
      }
      if (type instanceof Object && typeof inputValue !== "object" || typeof type === "string" && typeof inputValue !== type)
        return false;
    }
    return true;
  }

  // other.ts
  function myOtherFunction(test2) {
    if (!typeIsValid(test2, { "a": "string", "someProp": { "b": "string", "c": { "d": { "e": "string" } } } }))
      throw new Error("invalid type passed");
    console.log(`I am ${test2.a} and I am ${test2.someProp.b} years old`);
  }

  // index.ts
  var myFunction = (num, testing) => {
    if (typeof num !== "number" || !typeIsValid(testing, { "a": "string", "someProp": { "b": "string", "c": { "d": { "e": "string" } } } }))
      throw new Error("invalid type passed");
    myOtherFunction(testing);
    return testing;
  };
  async function test() {
    myFunction(1, { a: "input", someProp: { b: "test", c: {
      d: {
        e: "hello"
      }
    } } });
  }
  test();
})();
