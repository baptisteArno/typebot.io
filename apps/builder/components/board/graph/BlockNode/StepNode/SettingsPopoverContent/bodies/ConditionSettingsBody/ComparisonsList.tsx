import { Button, Fade, Flex, IconButton, Stack } from '@chakra-ui/react'
import { PlusIcon, TrashIcon } from 'assets/icons'
import { DebouncedInput } from 'components/shared/DebouncedInput'
import { DropdownList } from 'components/shared/DropdownList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import {
  Comparison,
  ComparisonOperators,
  LogicalOperator,
  Table,
  Variable,
} from 'models'
import React, { useEffect, useState } from 'react'
import { generate } from 'short-uuid'
import { useImmer } from 'use-immer'

type Props = {
  initialComparisons: Table<Comparison>
  logicalOperator: LogicalOperator
  onLogicalOperatorChange: (logicalOperator: LogicalOperator) => void
  onComparisonsChange: (comparisons: Table<Comparison>) => void
}

export const ComparisonsList = ({
  initialComparisons,
  logicalOperator,
  onLogicalOperatorChange,
  onComparisonsChange,
}: Props) => {
  const [comparisons, setComparisons] = useImmer(initialComparisons)
  const [showDeleteId, setShowDeleteId] = useState<string | undefined>()

  useEffect(() => {
    onComparisonsChange(comparisons)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisons])

  const createComparison = () => {
    setComparisons((comparisons) => {
      const id = generate()
      comparisons.byId[id] = {
        id,
        comparisonOperator: ComparisonOperators.EQUAL,
      }
      comparisons.allIds.push(id)
    })
  }

  const updateComparison = (
    comparisonId: string,
    updates: Partial<Omit<Comparison, 'id'>>
  ) =>
    setComparisons((comparisons) => {
      comparisons.byId[comparisonId] = {
        ...comparisons.byId[comparisonId],
        ...updates,
      }
    })

  const deleteComparison = (comparisonId: string) => () => {
    setComparisons((comparisons) => {
      delete comparisons.byId[comparisonId]
      const index = comparisons.allIds.indexOf(comparisonId)
      if (index !== -1) comparisons.allIds.splice(index, 1)
    })
  }

  const handleVariableSelected =
    (comparisonId: string) => (variable: Variable) => {
      updateComparison(comparisonId, { variableId: variable.id })
    }

  const handleComparisonOperatorSelected =
    (comparisonId: string) => (dropdownItem: ComparisonOperators) =>
      updateComparison(comparisonId, {
        comparisonOperator: dropdownItem,
      })
  const handleLogicalOperatorSelected = (dropdownItem: LogicalOperator) =>
    onLogicalOperatorChange(dropdownItem)

  const handleValueChange = (comparisonId: string) => (value: string) =>
    updateComparison(comparisonId, { value })

  const handleMouseEnter = (comparisonId: string) => () => {
    setShowDeleteId(comparisonId)
  }

  const handleMouseLeave = () => setShowDeleteId(undefined)

  return (
    <Stack spacing="4" py="4">
      {comparisons.allIds.map((comparisonId, idx) => (
        <>
          {idx > 0 && (
            <Flex justify="center">
              <DropdownList<LogicalOperator>
                currentItem={logicalOperator}
                onItemSelect={handleLogicalOperatorSelected}
                items={Object.values(LogicalOperator)}
              />
            </Flex>
          )}
          <Flex
            pos="relative"
            onMouseEnter={handleMouseEnter(comparisonId)}
            onMouseLeave={handleMouseLeave}
          >
            <Stack
              key={comparisonId}
              p="4"
              rounded="md"
              flex="1"
              borderWidth="1px"
            >
              <VariableSearchInput
                initialVariableId={comparisons.byId[comparisonId].variableId}
                onSelectVariable={handleVariableSelected(comparisonId)}
                placeholder="Search for a variable"
              />
              <DropdownList<ComparisonOperators>
                currentItem={comparisons.byId[comparisonId].comparisonOperator}
                onItemSelect={handleComparisonOperatorSelected(comparisonId)}
                items={Object.values(ComparisonOperators)}
              />
              {comparisons.byId[comparisonId].comparisonOperator !==
                ComparisonOperators.IS_SET && (
                <DebouncedInput
                  delay={100}
                  initialValue={comparisons.byId[comparisonId].value ?? ''}
                  onChange={handleValueChange(comparisonId)}
                  placeholder="Type a value..."
                />
              )}
            </Stack>
            <Fade in={showDeleteId === comparisonId}>
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove comparison"
                onClick={deleteComparison(comparisonId)}
                pos="absolute"
                left="-15px"
                top="-15px"
                size="sm"
                shadow="md"
              />
            </Fade>
          </Flex>
        </>
      ))}
      <Button
        leftIcon={<PlusIcon />}
        onClick={createComparison}
        flexShrink={0}
        colorScheme="blue"
      >
        Add a comparison
      </Button>
    </Stack>
  )
}
