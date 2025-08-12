import { Seo } from "@/components/Seo";
import {
  CopyIcon,
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  UploadIcon,
} from "@/components/icons";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { headerHeight } from "@/features/editor/constants";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Input,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
} from "@typebot.io/lib/localization";
import { localizationService } from "@typebot.io/lib/localization";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { importTranslations } from "../helpers/importTranslations";
import { isLogicBlock } from "../helpers/logicBlockTypes";
import { useLocalization } from "../providers/LocalizationProvider";
import { validateImportedTranslations } from "../schemas/importValidation";
import { ContentRenderer } from "./ContentRenderer";
import { EditTranslationModal } from "./EditTranslationModal";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { TranslationStatusIndicator } from "./TranslationStatusIndicator";

interface TranslationTableRow {
  blockId: string;
  blockType: string;
  groupTitle: string;
  defaultContent: string;
  translations: Record<
    string,
    {
      content: string;
      completeness: number;
    }
  >;
}

export const TranslationManagementPage = () => {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { typebot, save } = useTypebot();
  const {
    availableLocales,
    currentLocale,
    setCurrentLocale,
    isLocalizationEnabled,
    fallbackLocale,
  } = useLocalization();

  const [filterBy, setFilterBy] = useState<"all" | "missing" | "incomplete">(
    "all",
  );
  const [isImporting, setIsImporting] = useState(false);
  const [importAlert, setImportAlert] = useState<{
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);
  const [editModalData, setEditModalData] = useState<{
    blockId: string;
    blockType: string;
    groupTitle: string;
    defaultContent: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.800");

  // Build translation table data
  const translationData = useMemo(() => {
    if (!typebot || !isLocalizationEnabled) return [];

    const rows: TranslationTableRow[] = [];

    typebot.groups?.forEach((group) => {
      group.blocks?.forEach((block) => {
        // Skip logic blocks - they contain technical configuration, not user-facing content
        if (isLogicBlock(block.type as string)) {
          return;
        }

        let defaultContent = "";
        let hasTranslatableContent = false;

        // Extract default content based on block type
        if ("content" in block && block.content) {
          hasTranslatableContent = true;
          const content = block.content as any;
          if (content.richText) {
            // For rich text, store the JSON structure so ContentRenderer can process it
            defaultContent = JSON.stringify(content.richText);
          } else if (content.html) {
            defaultContent = content.html;
          } else if (content.plainText) {
            defaultContent = content.plainText;
          } else if (content.url) {
            defaultContent = content.url;
          }
        }

        // Check for button/choice content
        if ("items" in block && block.items?.length) {
          hasTranslatableContent = true;
          defaultContent = (block.items as any[])
            .map((item) => item.content)
            .filter(Boolean)
            .join(", ");
        }

        // Check for input labels
        if ("options" in block && block.options?.labels) {
          hasTranslatableContent = true;
          const labels = (block.options as any).labels;

          // Handle rating input blocks differently
          if (block.type === "rating input") {
            defaultContent = [labels.left, labels.right, labels.button]
              .filter(Boolean)
              .join(" | ");
          } else {
            // Regular input blocks
            defaultContent = [labels.placeholder, labels.button]
              .filter(Boolean)
              .join(" / ");
          }
        }

        if (!hasTranslatableContent) return;

        // Calculate translations for each locale
        const translations: Record<
          string,
          { content: string; completeness: number }
        > = {};

        availableLocales.forEach((locale) => {
          if (locale === fallbackLocale) return;

          const completeness =
            localizationService.getBlockTranslationCompleteness(block, locale);

          let localizedContent = "";
          if ("content" in block && block.content) {
            const content = block.content as any;
            if (content.localizations?.[locale]) {
              const loc = content.localizations[locale];
              if (loc.richText) {
                localizedContent = JSON.stringify(loc.richText);
              } else {
                localizedContent = loc.plainText || loc.html || loc.url || "";
              }
            }
          }

          if (
            "items" in block &&
            block.items?.some((item: any) => item.localizations?.[locale])
          ) {
            const items = block.items as any[];
            localizedContent = items
              .map((item: any) => item.localizations?.[locale]?.content)
              .filter(Boolean)
              .join(", ");
          }

          // Handle rating input block localizations
          if (
            "options" in block &&
            block.options?.labels &&
            block.type === "rating input"
          ) {
            const options = block.options as any;
            if (options.localizations?.[locale]?.labels) {
              const loc = options.localizations[locale].labels;
              localizedContent = [loc.left, loc.right, loc.button]
                .filter(Boolean)
                .join(" | ");
            }
          }

          // Handle regular input block localizations (text, email, number, etc.)
          if (
            "options" in block &&
            block.options?.labels &&
            block.type !== "rating input" &&
            [
              "text input",
              "number input",
              "email input",
              "url input",
              "date input",
              "time input",
              "phone number input",
              "file input",
            ].includes(block.type)
          ) {
            const options = block.options as any;
            if (options.localizations?.[locale]?.labels) {
              const loc = options.localizations[locale].labels;
              localizedContent = [loc.placeholder, loc.button]
                .filter(Boolean)
                .join(" / ");
            }
          }

          translations[locale] = {
            content: localizedContent,
            completeness,
          };
        });

        rows.push({
          blockId: block.id,
          blockType: block.type,
          groupTitle: group.title || "Untitled Group",
          defaultContent: defaultContent,
          translations,
        });
      });
    });

    return rows;
  }, [typebot, availableLocales, fallbackLocale, isLocalizationEnabled]);

  // Filter data based on current filter
  const filteredData = useMemo(() => {
    return translationData.filter((row) => {
      switch (filterBy) {
        case "missing":
          return availableLocales.some(
            (locale) =>
              locale !== fallbackLocale &&
              row.translations[locale]?.completeness === 0,
          );
        case "incomplete":
          return availableLocales.some(
            (locale) =>
              locale !== fallbackLocale &&
              row.translations[locale]?.completeness > 0 &&
              row.translations[locale]?.completeness < 100,
          );
        default:
          return true;
      }
    });
  }, [translationData, filterBy, availableLocales, fallbackLocale]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    const total = translationData.length;
    const byLocale: Record<
      string,
      { complete: number; partial: number; missing: number }
    > = {};

    availableLocales.forEach((locale) => {
      if (locale === fallbackLocale) return;

      byLocale[locale] = {
        complete: 0,
        partial: 0,
        missing: 0,
      };

      translationData.forEach((row) => {
        const completeness = row.translations[locale]?.completeness || 0;
        if (completeness === 100) byLocale[locale].complete++;
        else if (completeness > 0) byLocale[locale].partial++;
        else byLocale[locale].missing++;
      });
    });

    return { total, byLocale };
  }, [translationData, availableLocales, fallbackLocale]);

  const handleExportTranslations = () => {
    // Export translations as JSON
    const exportData = {
      typebot: {
        id: typebot?.id,
        name: typebot?.name,
        defaultLocale: fallbackLocale,
        supportedLocales: availableLocales,
      },
      translations: translationData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${typebot?.name || "typebot"}-translations.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !typebot) return;

    setIsImporting(true);
    setImportAlert(null);

    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Parse JSON
      let jsonData;
      try {
        jsonData = JSON.parse(fileContent);
      } catch (error) {
        throw new Error("Invalid JSON file format");
      }

      // Validate import data
      const validation = validateImportedTranslations(jsonData);
      if (!validation.success) {
        throw new Error(validation.error);
      }

      // Import translations
      const importResult = importTranslations(typebot, validation.data);

      if (importResult.success) {
        // Save the typebot with imported translations
        await save();

        // Show success message
        setImportAlert({
          type: "success",
          title: "Import Successful",
          message: `Successfully imported translations for ${importResult.updatedBlocks} blocks. ${
            importResult.warnings.length > 0
              ? `\n\nWarnings:\n${importResult.warnings.join("\n")}`
              : ""
          }`,
        });

        toast({
          title: "Translations imported",
          description: `Updated ${importResult.updatedBlocks} blocks`,
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error(`Import failed: ${importResult.errors.join(", ")}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setImportAlert({
        type: "error",
        title: "Import Failed",
        message: errorMessage,
      });

      toast({
        title: "Import failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEditTranslations = (row: TranslationTableRow) => {
    setEditModalData({
      blockId: row.blockId,
      blockType: row.blockType,
      groupTitle: row.groupTitle,
      defaultContent: row.defaultContent,
    });
  };

  const handleCloseEditModal = () => {
    setEditModalData(null);
  };

  // Conditional rendering moved to the end after all hooks are called
  if (!isLocalizationEnabled) {
    return (
      <Flex overflow="hidden" h="100vh" flexDir="column">
        <Seo
          title={
            typebot?.name ? `${typebot.name} | Translations` : "Translations"
          }
        />
        <TypebotHeader />
        <Flex align="center" justify="center" flex="1">
          <VStack spacing={4} textAlign="center">
            <Text fontSize="xl" fontWeight="semibold">
              Localization Not Enabled
            </Text>
            <Text color="gray.600">
              Enable multilingual support in Settings to manage translations.
            </Text>
            <Button
              as="a"
              href={`/typebots/${typebot?.id}/settings`}
              leftIcon={<ExternalLinkIcon />}
            >
              Go to Settings
            </Button>
          </VStack>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo
        title={
          typebot?.name ? `${typebot.name} | Translations` : "Translations"
        }
      />
      <TypebotHeader />

      <Flex
        direction="column"
        height={`calc(100vh - ${headerHeight}px)`}
        overflow="hidden"
      >
        {/* Header with stats and controls */}
        <Box
          bg={bgColor}
          borderBottomWidth={1}
          borderColor={borderColor}
          px={6}
          py={4}
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">
                  Translation Management
                </Text>
                <Text color="gray.600">
                  Manage translations for {availableLocales.length - 1}{" "}
                  languages across {stats.total} blocks
                </Text>
              </VStack>

              <HStack spacing={2}>
                <LocaleSwitcher
                  currentLocale={currentLocale}
                  availableLocales={availableLocales}
                  onLocaleChange={setCurrentLocale}
                />

                <Button
                  leftIcon={<DownloadIcon />}
                  onClick={handleExportTranslations}
                  variant="outline"
                  size="sm"
                >
                  Export
                </Button>

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  display="none"
                />

                <Button
                  leftIcon={<UploadIcon />}
                  onClick={handleImportClick}
                  variant="outline"
                  size="sm"
                  isLoading={isImporting}
                  loadingText="Importing..."
                >
                  Import
                </Button>
              </HStack>
            </HStack>

            {/* Statistics */}
            <HStack spacing={6} flexWrap="wrap">
              {availableLocales
                .filter((locale) => locale !== fallbackLocale)
                .map((locale) => {
                  const localeStats = stats.byLocale[locale];
                  const completionPercentage =
                    stats.total > 0
                      ? Math.round((localeStats.complete / stats.total) * 100)
                      : 0;

                  return (
                    <VStack key={locale} spacing={1} align="center">
                      <HStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {getLocaleFlagEmoji(locale)}{" "}
                          {getLocaleDisplayName(locale)}
                        </Text>
                      </HStack>
                      <Progress
                        value={completionPercentage}
                        size="sm"
                        w="80px"
                        colorScheme={
                          completionPercentage >= 100
                            ? "green"
                            : completionPercentage >= 50
                              ? "yellow"
                              : "red"
                        }
                      />
                      <Text fontSize="xs" color="gray.500">
                        {completionPercentage}%
                      </Text>
                    </VStack>
                  );
                })}
            </HStack>

            {/* Import Alert */}
            <Collapse in={!!importAlert}>
              {importAlert && (
                <Alert
                  status={importAlert.type}
                  variant="left-accent"
                  flexDirection="column"
                  alignItems="flex-start"
                >
                  <Flex width="100%" alignItems="center">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>{importAlert.title}</AlertTitle>
                      <AlertDescription
                        whiteSpace="pre-line"
                        fontSize="sm"
                        mt={1}
                      >
                        {importAlert.message}
                      </AlertDescription>
                    </Box>
                    <CloseButton
                      position="absolute"
                      right="8px"
                      top="8px"
                      onClick={() => setImportAlert(null)}
                    />
                  </Flex>
                </Alert>
              )}
            </Collapse>

            {/* Filters */}
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="medium">
                Filter:
              </Text>
              {["all", "missing", "incomplete"].map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={filterBy === filter ? "solid" : "ghost"}
                  onClick={() => setFilterBy(filter as typeof filterBy)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </HStack>
          </VStack>
        </Box>

        {/* Translation table */}
        <Box flex="1" overflow="auto" bg={bgColor}>
          <Table variant="simple" size="sm">
            <Thead bg={tableHeaderBg} position="sticky" top={0}>
              <Tr>
                <Th>Block ID</Th>
                <Th>Group</Th>
                <Th>Block Content</Th>
                {availableLocales
                  .filter((locale) => locale !== fallbackLocale)
                  .map((locale) => (
                    <Th key={locale}>
                      {getLocaleFlagEmoji(locale)} {locale.toUpperCase()}
                    </Th>
                  ))}
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.blockId}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontFamily="mono">
                        {row.blockId}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm" noOfLines={1}>
                      {row.groupTitle}
                    </Text>
                  </Td>
                  <Td maxW="300px">
                    <ContentRenderer
                      content={row.defaultContent}
                      blockType={row.blockType}
                    />
                  </Td>
                  {availableLocales
                    .filter((locale) => locale !== fallbackLocale)
                    .map((locale) => (
                      <Td key={locale}>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <TranslationStatusIndicator
                              completeness={
                                row.translations[locale]?.completeness || 0
                              }
                              size="xs"
                            />
                            <Text fontSize="xs" color="gray.500">
                              {row.translations[locale]?.content &&
                              row.translations[locale].content.length > 0
                                ? "Localized"
                                : "No localization"}
                            </Text>
                          </HStack>
                        </VStack>
                      </Td>
                    ))}
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="Edit translations">
                        <IconButton
                          icon={<EditIcon />}
                          size="xs"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => handleEditTranslations(row)}
                        />
                      </Tooltip>
                      <Tooltip label="Copy default content">
                        <IconButton
                          icon={<CopyIcon />}
                          size="xs"
                          variant="ghost"
                          aria-label="Copy"
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {filteredData.length === 0 && (
            <Flex align="center" justify="center" py={10}>
              <VStack spacing={2}>
                <Text color="gray.500">
                  {filterBy === "all"
                    ? "No translatable content found"
                    : `No ${filterBy} translations found`}
                </Text>
                {filterBy !== "all" && (
                  <Button size="sm" onClick={() => setFilterBy("all")}>
                    Show All
                  </Button>
                )}
              </VStack>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* Edit Translation Modal */}
      <EditTranslationModal
        isOpen={!!editModalData}
        onClose={handleCloseEditModal}
        blockId={editModalData?.blockId || ""}
        blockType={editModalData?.blockType || ""}
        groupTitle={editModalData?.groupTitle || ""}
        defaultContent={editModalData?.defaultContent || ""}
      />
    </Flex>
  );
};
