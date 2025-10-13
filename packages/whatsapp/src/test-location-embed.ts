import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { convertMessageToWhatsAppMessage } from "./convertMessageToWhatsAppMessage";

// Test function to verify location detection in embed URLs
async function testLocationEmbed() {
  console.log("Testing WhatsApp location detection from Embed bubbles...");
  
  // Test cases with different URL formats
  const testCases = [
    {
      name: "Google Maps URL with lat/lng parameters",
      url: "https://maps.google.com/?q=37.7749,-122.4194&z=15",
      expected: {
        type: "location",
        location: {
          latitude: 37.7749,
          longitude: -122.4194
        }
      }
    },
    {
      name: "Google Maps URL with explicit lat/lng parameters",
      url: "https://maps.google.com/?lat=37.7749&lng=-122.4194&name=San+Francisco",
      expected: {
        type: "location",
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          name: "San+Francisco"
        }
      }
    },
    {
      name: "Google Maps URL with address parameter",
      url: "https://maps.google.com/?lat=37.7749&lng=-122.4194&address=San+Francisco,+CA",
      expected: {
        type: "location",
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: "San+Francisco,+CA"
        }
      }
    },
    {
      name: "Regular URL (not a location)",
      url: "https://example.com",
      expected: {
        type: "text",
        text: {
          body: "https://example.com",
          preview_url: true
        }
      }
    }
  ];
  
  // Run tests
  for (const test of testCases) {
    console.log(`\nTest: ${test.name}`);
    console.log(`URL: ${test.url}`);
    
    const message = {
      id: "test-message-id",
      type: BubbleBlockType.EMBED,
      content: {
        url: test.url
      }
    };
    
    const result = await convertMessageToWhatsAppMessage({ message });
    console.log("Result:", JSON.stringify(result, null, 2));
    
    // Simple validation
    if (result?.type === test.expected.type) {
      console.log("✅ Type matches expected output");
      
      if (result.type === "location" && test.expected.type === "location") {
        const locationResult = result.location;
        const expectedLocation = test.expected.location;
        
        if (
          locationResult.latitude === expectedLocation.latitude &&
          locationResult.longitude === expectedLocation.longitude
        ) {
          console.log("✅ Location coordinates match expected output");
        } else {
          console.log("❌ Location coordinates don't match expected output");
        }
      }
    } else {
      console.log(`❌ Type mismatch: expected ${test.expected.type}, got ${result?.type}`);
    }
  }
}

// Run the test
testLocationEmbed().catch(console.error);