import { createAction, option } from "@typebot.io/forge";
import { baseOptions } from "../baseOptions";

export const bookEvent = createAction({
  name: "Book event",
  baseOptions,
  options: option.object({
    link: option.string.layout({
      label: "Event link",
      placeholder: "https://cal.com/...",
    }),
    layout: option
      .enum(["Month", "Weekly", "Columns"])
      .layout({ label: "Layout:", defaultValue: "Month", direction: "row" }),
    name: option.string.layout({
      accordion: "Prefill information",
      label: "Name",
      placeholder: "John Doe",
    }),
    email: option.string.layout({
      accordion: "Prefill information",
      label: "Email",
      placeholder: "johndoe@gmail.com",
    }),
    additionalNotes: option.string.layout({
      accordion: "Prefill information",
      label: "Additional notes",
    }),
    phone: option.string.layout({
      accordion: "Prefill information",
      label: "Attendee Phone Number",
      moreInfoTooltip: "Will be used as meeting location",
      placeholder: "+919999999999",
    }),
    anyPrefilledInformations: option
      .array(
        option.object({
          questionId: option.string.layout({
            label: "Question Identifier",
          }),
          value: option.string.layout({
            label: "Value",
          }),
        }),
      )
      .layout({
        accordion: "Prefill information",
      }),
    saveBookedDateInVariableId: option.string.layout({
      label: "Save booked date",
      inputType: "variableDropdown",
    }),
  }),
  getSetVariableIds: ({ saveBookedDateInVariableId }) =>
    saveBookedDateInVariableId ? [saveBookedDateInVariableId] : [],
  getEmbedSaveVariableId: ({ saveBookedDateInVariableId }) =>
    saveBookedDateInVariableId,
});
