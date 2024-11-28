"use client";

import { FormField, FormInput, FormSelect } from "@/components/form";
import { SelectItem } from "@/components/select";
import { Form, SelectProvider, useFormStore } from "@ariakit/react";
import { isNotDefined } from "@typebot.io/lib/utils";
import type React from "react";
import { type ChangeEvent, useState } from "react";
import { pricingData } from "./pricingData";

const messageTypes = [
  "Marketing",
  "Utility",
  "Authentication",
  "Service",
] as const;

export const WhatsAppPricingCalculator = () => {
  const form = useFormStore({
    defaultValues: { country: "", messageType: "", totalMessage: "" },
  });

  form.useSubmit(async (state) => {
    alert(JSON.stringify(state.values));
  });
  const [selectedCountry, setSelectedCountry] =
    useState<(typeof pricingData)["markets"][number]["market"]>();
  const [selectedMessageType, setSelectedMessageType] =
    useState<(typeof messageTypes)[number]>();
  const [messageCount, setMessageCount] = useState(1);
  const [price, setPrice] = useState<number>();

  const updatePrice = () => {
    if (isNotDefined(selectedCountry) || isNotDefined(selectedMessageType))
      return;

    const countryData = pricingData.markets.find(
      (market) => market.market === selectedCountry,
    );
    if (!countryData) return;

    const typePrice =
      countryData[
        selectedMessageType.toLowerCase() as keyof typeof countryData
      ];
    setPrice(
      typeof typePrice === "number" ? typePrice * messageCount : undefined,
    );
  };

  const updateCountry = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(
      event.target.value as (typeof pricingData)["markets"][number]["market"],
    );
    updatePrice();
  };

  const updateMessageType = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMessageType(event.target.value as (typeof messageTypes)[number]);
    updatePrice();
  };

  const updateMessageCount = (_: string, value: number) => {
    setMessageCount(Math.max(1, value));
    updatePrice();
  };

  return (
    <Form className="bg-gray-2 p-6 rounded-lg flex flex-col gap-4">
      <SelectProvider></SelectProvider>
      <FormField name={form.names.country} label="Country">
        <FormSelect name={form.names.country} required>
          <SelectItem value="">Select a country</SelectItem>
          {pricingData.markets.map((market) => (
            <SelectItem key={market.market} value={market.market} />
          ))}
        </FormSelect>
      </FormField>
      <FormField name={form.names.messageType} label="Message type">
        <FormSelect name={form.names.messageType} required>
          <SelectItem value="">Select a type</SelectItem>
          {messageTypes.map((type) => (
            <SelectItem key={type} value={type} />
          ))}
        </FormSelect>
      </FormField>
      <FormField name={form.names.totalMessage} label="Number of Messages">
        <FormInput
          name={form.names.totalMessage}
          type="number"
          min={1}
          step={100}
          required
          placeholder="1000"
        />
      </FormField>
      {price && (
        <div className="flex justify-between items-center">
          <p className="font-bold">Estimated Price:</p>
          <p className="text-xl font-bold text-blue-8">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            }).format(price)}
          </p>
        </div>
      )}
    </Form>
  );
};
