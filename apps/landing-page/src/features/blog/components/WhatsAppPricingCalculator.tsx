import { isNotDefined } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { Select } from "@typebot.io/ui/components/Select";
import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { NumberInput } from "@/components/NumberInput";
import { whatsAppPricingData } from "../data/whatsAppPricingData";

const countries = [
  { label: "Select a country", value: null },
  ...whatsAppPricingData.markets.map((market) => ({
    label: market.market,
    value: market.market,
  })),
];

const messageTypes = [
  { label: "Select a type", value: null },
  { label: "Marketing", value: "marketing" },
  { label: "Utility", value: "utility" },
  { label: "Authentication", value: "authentication" },
  {
    label: "Authentication International",
    value: "authenticationInternational",
  },
  { label: "Service", value: "service" },
];

export const WhatsAppPricingCalculator = () => {
  const [selectedCountry, setSelectedCountry] =
    useState<(typeof countries)[number]["value"]>(null);
  const [selectedMessageType, setSelectedMessageType] =
    useState<(typeof messageTypes)[number]["value"]>(null);
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
      <Field.Root>
        <Field.Label>Country</Field.Label>
        <Select.Root
          items={countries}
          value={selectedCountry}
          onValueChange={setSelectedCountry}
        >
          <Select.Trigger />
          <Select.Popup>
            {countries.map((country) => (
              <Select.Item key={country.value} value={country.value}>
                {country.label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Root>
      </Field.Root>
      <Field.Root>
        <Field.Label>Message type</Field.Label>
        <Select.Root
          items={messageTypes}
          onValueChange={setSelectedMessageType}
          value={selectedMessageType}
        >
          <Select.Trigger />
          <Select.Popup>
            {messageTypes.map((type) => (
              <Select.Item key={type.value} value={type.value}>
                {type.label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Root>
      </Field.Root>

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
