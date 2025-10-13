// Simple test script to verify location URL parsing logic

// Mock the URL parsing logic from our implementation
function parseLocationFromUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    // Check for explicit lat/lng parameters
    let latitude = url.searchParams.get('lat') || url.searchParams.get('latitude');
    let longitude = url.searchParams.get('lng') || url.searchParams.get('longitude') || url.searchParams.get('lon');
    
    // Check for coordinates in q parameter (format: ?q=37.7749,-122.4194)
    if (!latitude && !longitude) {
      const qParam = url.searchParams.get('q');
      if (qParam) {
        const coordsMatch = qParam.match(/^(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)$/);
        if (coordsMatch) {
          latitude = coordsMatch[1];
          longitude = coordsMatch[3];
        }
      }
    }
    
    const name = url.searchParams.get('name') || url.searchParams.get('q');
    const address = url.searchParams.get('address');
    
    // If URL contains location parameters, it's a location
    if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      return {
        type: "location",
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          name: name || undefined,
          address: address || undefined,
        },
      };
    }
    
    // Default to text message with preview
    return {
      type: "text",
      text: {
        body: urlString,
        preview_url: true,
      },
    };
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

// Test cases
const testCases = [
  {
    name: "Google Maps URL with lat/lng parameters",
    url: "https://maps.google.com/?q=37.7749,-122.4194&z=15",
    expected: "location"
  },
  {
    name: "Google Maps URL with explicit lat/lng parameters",
    url: "https://maps.google.com/?lat=37.7749&lng=-122.4194&name=San+Francisco",
    expected: "location"
  },
  {
    name: "Google Maps URL with address parameter",
    url: "https://maps.google.com/?lat=37.7749&lng=-122.4194&address=San+Francisco,+CA",
    expected: "location"
  },
  {
    name: "Regular URL (not a location)",
    url: "https://example.com",
    expected: "text"
  },
  {
    name: "Google Maps URL with q parameter containing coordinates",
    url: "https://www.google.com/maps?q=37.7749,-122.4194",
    expected: "location" // Updated to match our implementation which correctly parses coordinates from q parameter
  },
  {
    name: "Google Maps URL with place name only",
    url: "https://maps.google.com/?q=San+Francisco",
    expected: "text" // This will fail as our implementation requires lat/lng
  }
];

// Run tests
console.log("Testing WhatsApp location detection from Embed bubble URLs...\n");

let passedTests = 0;
let failedTests = 0;

for (const test of testCases) {
  console.log(`Test: ${test.name}`);
  console.log(`URL: ${test.url}`);
  
  const result = parseLocationFromUrl(test.url);
  console.log("Result:", JSON.stringify(result, null, 2));
  
  if (result?.type === test.expected) {
    console.log("✅ PASS: Type matches expected output");
    passedTests++;
    
    if (result.type === "location") {
      console.log(`   Location data: ${result.location.latitude}, ${result.location.longitude}`);
      if (result.location.name) console.log(`   Name: ${result.location.name}`);
      if (result.location.address) console.log(`   Address: ${result.location.address}`);
    }
  } else {
    console.log(`❌ FAIL: Type mismatch: expected ${test.expected}, got ${result?.type}`);
    failedTests++;
  }
  console.log("\n-----------------------------------\n");
}

console.log(`Test Summary: ${passedTests} passed, ${failedTests} failed`);