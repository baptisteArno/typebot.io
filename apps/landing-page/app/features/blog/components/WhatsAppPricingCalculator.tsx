import { Card } from "@/components/Card";
import { NumberInput } from "@/components/NumberInput";
import { createListCollection } from "@ark-ui/react";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Select, SelectItem } from "@typebot.io/ui/components/Select";
import { useMemo, useState } from "react";
import { whatsAppPricingData } from "../data/whatsAppPricingData";

const countries = createListCollection({
  items: whatsAppPricingData.markets.map((market) => market.market),
});
const messageTypes = createListCollection({
  items: [
    { label: "Marketing", value: "marketing" },
    { label: "Utility", value: "utility" },
    { label: "Authentication", value: "authentication" },
    {
      label: "Authentication International",
      value: "authenticationInternational",
    },
    { label: "Service", value: "service" },
  ],
});

export const WhatsAppPricingCalculator = () => {
  const [selectedCountry, setSelectedCountry] = useState<
    (typeof whatsAppPricingData.markets)[number]["market"] | undefined
  >();
  const [selectedMessageType, setSelectedMessageType] = useState<
    (typeof messageTypes.items)[number]["value"] | undefined
  >();
  const [totalMessages, setTotalMessages] = useState<number | undefined>();

  const priceResult = useMemo(() => {
    if (!selectedCountry || !selectedMessageType || isNotDefined(totalMessages))
      return;

    const countryData = whatsAppPricingData.markets.find(
      (market) => market.market === selectedCountry,
    );
    if (!countryData) return;

    const typePrice =
      countryData[selectedMessageType as keyof typeof countryData];
    const price =
      typeof typePrice === "number" ? typePrice * totalMessages : undefined;
    if (isNotDefined(price)) return;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }, [selectedCountry, selectedMessageType, totalMessages]);

  return (
    <Card className="not-prose">
      <Select
        collection={countries}
        onValueChange={(e) => {
          setSelectedCountry(e.items[0]);
        }}
        label="Country"
        placeholder="Select a country"
      >
        {countries.items.map((country) => (
          <SelectItem key={country} item={country}>
            {country}
          </SelectItem>
        ))}
      </Select>
      <Select
        collection={messageTypes}
        label="Message type"
        placeholder="Select a type"
        onValueChange={(e) => {
          setSelectedMessageType(e.items[0].value);
        }}
      >
        {messageTypes.items.map((type) => (
          <SelectItem key={type.value} item={type}>
            {type.label}
          </SelectItem>
        ))}
      </Select>
      <NumberInput
        label="Total messages"
        min={0}
        max={50000}
        step={100}
        placeholder="0"
        onValueChange={(e) => {
          setTotalMessages(e.valueAsNumber);
        }}
      />
      {priceResult && (
        <p className="font-medium">
          Estimated Price: <span className="text-orange-10">{priceResult}</span>
        </p>
      )}
    </Card>
  );
};
