import { expect, it } from "vitest";
import { computeDeepKeysMappingSuggestionList } from "./computeDeepKeysMappingSuggestionList";

it("should return keys for a simple object", () => {
  const obj = {
    name: "John",
    age: 29,
    city: "New York",
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual(["name", "age", "city"]);
});

it("should return nested keys with dot notation", () => {
  const obj = {
    user: {
      name: "John",
      details: {
        age: 30,
      },
    },
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual(["user.name", "user.details.age"]);
});

it("should handle arrays with primitive values", () => {
  const obj = {
    tags: ["javascript", "typescript", "react"],
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual(["tags", "tags[0]", "tags[1]", "tags[2]"]);
});

it("should handle arrays with objects", () => {
  const obj = {
    users: [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
    ],
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual([
    "users.flatMap(item => item.name)",
    "users.flatMap(item => item.age)",
    "users[0].name",
    "users[0].age",
  ]);
});

it("should handle single object in array", () => {
  const obj = {
    user: [{ name: "John", age: 30 }],
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual(["user[0].name", "user[0].age"]);
});

it("should handle complex nested structure", () => {
  const obj = {
    data: {
      users: [
        {
          "full name": "John Doe",
          contacts: {
            email: "john@example.com",
            "phone-number": "+1234567890",
          },
        },
        {
          "full name": "Jane Doe",
          contacts: {
            email: "jane@example.com",
            "phone-number": "+1234567890",
          },
        },
      ],
      metadata: {
        count: 1,
        "last-updated": "2023-01-01",
      },
    },
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual([
    "data.users.flatMap(item => item['full name'])",
    "data.users.flatMap(item => item.contacts.email)",
    "data.users.flatMap(item => item.contacts['phone-number'])",
    "data.users[0]['full name']",
    "data.users[0].contacts.email",
    "data.users[0].contacts['phone-number']",
    "data.metadata.count",
    "data.metadata['last-updated']",
  ]);
});

it("should still return keys for null, undefined and empty arrays", () => {
  const obj = {
    nullValue: null,
    undefinedValue: undefined,
    emptyString: "",
    emptyArray: [],
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual([
    "nullValue",
    "undefinedValue",
    "emptyString",
    "emptyArray",
  ]);
});

it("should handle mixed array types", () => {
  const obj = {
    mixedArray: ["string", 123, { name: "object" }, null],
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual([
    "mixedArray[0]",
    "mixedArray[1]",
    "mixedArray[2]",
    "mixedArray[3]",
  ]);
});

it("should work with different object types in array", () => {
  const obj = {
    arrayDadosContato: [
      {
        name: "John",
      },
      {
        lastName: "Doe",
      },
    ],
  };

  const result = computeDeepKeysMappingSuggestionList(obj);
  expect(result).toEqual([
    "arrayDadosContato.flatMap(item => item.name)",
    "arrayDadosContato.flatMap(item => item.lastName)",
    "arrayDadosContato[0].name",
    "arrayDadosContato[0].lastName",
  ]);
});
